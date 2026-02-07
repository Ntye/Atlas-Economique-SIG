import { type FC, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../../services/api';
import { formatNumber, getProductionColor } from '../../utils/helpers';
import type {
  GeoJSONFeatureCollection,
  RegionProperties,
  DepartementProperties,
  FeatureProperties,
  ActiveFilters,
} from '../../interfaces';

interface MapViewProps {
  currentTheme: string;
  currentSecteur: string;
  selectedRegions: string[];
  selectedDepts: string[];
  filters: ActiveFilters | null;
  onFeatureClick: (properties: FeatureProperties) => void;
}

const SECTEUR_COLORS: Record<string, string> = {
  agriculture: '#4CAF50',
  elevage: '#FF9800',
  peche: '#2196F3',
};

const MAP_CONFIG = {
  center: [7.3697, 12.3547] as [number, number],
  zoom: 6,
};

const MapView: FC<MapViewProps> = ({
  currentTheme,
  currentSecteur,
  selectedRegions,
  selectedDepts,
  filters,
  onFeatureClick,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const layerRegionsRef = useRef<L.GeoJSON | null>(null);
  const layerDeptsRef = useRef<L.GeoJSON | null>(null);
  const dataRegionsRef = useRef<GeoJSONFeatureCollection<RegionProperties> | null>(null);
  const dataDeptsRef = useRef<GeoJSONFeatureCollection<DepartementProperties> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Store latest values in refs for callbacks
  const themeRef = useRef(currentTheme);
  const secteurRef = useRef(currentSecteur);
  const selectedRegionsRef = useRef(selectedRegions);
  const selectedDeptsRef = useRef(selectedDepts);
  const onFeatureClickRef = useRef(onFeatureClick);

  themeRef.current = currentTheme;
  secteurRef.current = currentSecteur;
  selectedRegionsRef.current = selectedRegions;
  selectedDeptsRef.current = selectedDepts;
  onFeatureClickRef.current = onFeatureClick;

  const getStyle = useCallback((feature: GeoJSON.Feature): L.PathOptions => {
    const prod = (feature.properties as FeatureProperties).production || {};
    const featureName = (feature.properties as FeatureProperties).nom;
    const theme = themeRef.current;
    const currentSect = secteurRef.current;

    let fillColor = '#2ecc71';
    let fillOpacity = 0.15;
    let weight = 1;
    let borderColor = '#27ae60';

    const isSelectedRegion = selectedRegionsRef.current.includes(featureName);
    const isSelectedDept = selectedDeptsRef.current.includes(featureName);
    const isSelected = isSelectedRegion || isSelectedDept;

    if (theme === 'tous') {
      if (currentSect !== 'all') {
        const secteurPrincipal = prod.secteur_principal as string | undefined;
        if (secteurPrincipal === currentSect) {
          fillColor = SECTEUR_COLORS[currentSect] || '#ccc';
          fillOpacity = isSelected ? 0.9 : 0.6;
        } else {
          fillColor = '#e0e0e0';
          fillOpacity = isSelected ? 0.5 : 0.2;
          borderColor = 'white';
        }
      } else {
        fillColor = '#2ecc71';
        fillOpacity = isSelected ? 0.6 : 0.2;
        borderColor = isSelected ? '#333' : '#27ae60';
      }
    } else {
      const prodValue = prod[theme];
      if (typeof prodValue === 'number' && prodValue > 0) {
        const colorInfo = getProductionColor(theme, prodValue);
        fillColor = colorInfo.fillColor;
        fillOpacity = isSelected ? 0.9 : colorInfo.fillOpacity;
        borderColor = 'white';
      }
    }

    if (isSelected) {
      weight = 2.5;
      borderColor = '#2c3e50';
    }

    return { fillColor, fillOpacity, weight, color: borderColor, opacity: 0.8 };
  }, []);

  const createPopupContent = useCallback((properties: FeatureProperties): string => {
    let content = `<b>${properties.nom}</b><br>`;
    content += `<small>${properties.type_admin === 'departement' ? 'Departement' : 'Region'}</small><br>`;

    if (properties.production) {
      const prods = Object.entries(properties.production)
        .filter(([k, v]) => typeof v === 'number' && v > 0 && k !== 'valeur_economique')
        .slice(0, 5);

      if (prods.length > 0) {
        content += '<hr style="margin: 5px 0;">';
        prods.forEach(([k, v]) => {
          content += `${k}: ${formatNumber(v as number)}<br>`;
        });
      }
    }

    return content;
  }, []);

  const onEachFeature = useCallback(
    (feature: GeoJSON.Feature, layer: L.Layer) => {
      const props = feature.properties as FeatureProperties;
      (layer as L.Path).bindPopup(createPopupContent(props));

      layer.on({
        mouseover: (e: L.LeafletMouseEvent) => {
          (e.target as L.Path).setStyle({ weight: 3, color: '#666' });
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          if (layerRegionsRef.current) layerRegionsRef.current.resetStyle(e.target as L.Path);
          if (layerDeptsRef.current) layerDeptsRef.current.resetStyle(e.target as L.Path);
        },
        click: () => {
          onFeatureClickRef.current(props);
        },
      });
    },
    [createPopupContent]
  );

  const displayRegions = useCallback(
    () => {
      const map = mapRef.current;
      if (!map || !dataRegionsRef.current) return;

      if (layerDeptsRef.current) {
        map.removeLayer(layerDeptsRef.current);
        layerDeptsRef.current = null;
      }
      if (layerRegionsRef.current) {
        map.removeLayer(layerRegionsRef.current);
      }

      layerRegionsRef.current = L.geoJSON(dataRegionsRef.current as unknown as GeoJSON.GeoJsonObject, {
        style: (f) => (f ? getStyle(f) : {}),
        onEachFeature,
      }).addTo(map);
    },
    [getStyle, onEachFeature]
  );

  const displayDepartements = useCallback(
    (regions?: string[]) => {
      const map = mapRef.current;
      if (!map || !dataDeptsRef.current) return;

      if (layerRegionsRef.current) {
        map.removeLayer(layerRegionsRef.current);
        layerRegionsRef.current = null;
      }
      if (layerDeptsRef.current) {
        map.removeLayer(layerDeptsRef.current);
      }

      let features = dataDeptsRef.current.features;
      if (regions && regions.length > 0) {
        features = features.filter((f) => regions.includes(f.properties.region_parente));
      }

      const fc = { type: 'FeatureCollection' as const, features };

      layerDeptsRef.current = L.geoJSON(fc as unknown as GeoJSON.GeoJsonObject, {
        style: (f) => (f ? getStyle(f) : {}),
        onEachFeature,
      }).addTo(map);

      if (layerDeptsRef.current.getBounds().isValid()) {
        map.fitBounds(layerDeptsRef.current.getBounds(), { padding: [20, 20] });
      }
    },
    [getStyle, onEachFeature]
  );

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    mapRef.current = map;

    // Load data
    const loadData = async () => {
      try {
        const [regions, depts] = await Promise.all([api.getRegions(), api.getDepartements()]);
        dataRegionsRef.current = regions;
        dataDeptsRef.current = depts;
        displayRegions();
      } catch (error) {
        console.error('Map data load error:', error);
      }
    };

    loadData();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update layers when theme/secteur/selection changes
  useEffect(() => {
    if (!mapRef.current || !dataRegionsRef.current) return;

    if (selectedRegions.length > 0) {
      displayDepartements(selectedRegions);
    } else {
      displayRegions();
    }
  }, [currentTheme, currentSecteur, selectedRegions, selectedDepts, displayRegions, displayDepartements]);

  // Apply filters
  useEffect(() => {
    if (!filters || !mapRef.current) return;

    if (filters.region && filters.region !== 'all') {
      displayDepartements([filters.region]);
    } else if (filters.secteur && filters.secteur !== 'all') {
      displayRegions();
    }
  }, [filters, displayRegions, displayDepartements]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      mapRef.current?.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div ref={containerRef} className="map" />;
};

export default MapView;
