import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KPIDashboard from './components/KPIDashboard';
import MapView from './components/MapView';
import Legend from './components/Legend';
import Modal from './components/Modal';
import Footer from './components/Footer';
import { LoadingOverlay, ErrorMessage } from './components/LoadingOverlay';
import { api } from './services/api';
import type {
  ActiveFilters,
  SearchResult,
  FeatureProperties,
  ComparisonItem,
  ComparisonData,
  LocationDetails,
} from './interfaces';

import './styles/variables.css';
import './styles/main.css';
import './styles/components.css';

function App() {
  // Application state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('tous');
  const [currentSecteur, setCurrentSecteur] = useState('all');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [filters, setFilters] = useState<ActiveFilters | null>(null);
  const [kpiFilters, setKpiFilters] = useState<Partial<ActiveFilters>>({});

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<LocationDetails | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonData | null>(null);

  // Comparison items
  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);

  // Initialize application
  useEffect(() => {
    const init = async () => {
      try {
        await api.healthCheck();
        setIsLoading(false);
      } catch {
        setIsLoading(false);
        setError("Impossible de charger l'application. Verifiez que le serveur est demarre.");
      }
    };
    init();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
        setComparisonResult(null);
      }
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [isModalOpen]);

  // Event handlers
  const handleThemeChange = useCallback((theme: string) => {
    setCurrentTheme(theme);
    setCurrentSecteur('all');
  }, []);

  const handleMenuToggle = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleSearchSelect = useCallback((result: SearchResult) => {
    if (result.type === 'region') {
      setSelectedRegions([result.nom]);
      setSelectedDepts([]);
    } else if (result.region_parente) {
      setSelectedRegions([result.region_parente]);
      setSelectedDepts([result.nom]);
    }
  }, []);

  const handleRegionChange = useCallback((region: string) => {
    if (region === 'all') {
      setSelectedRegions([]);
      setSelectedDepts([]);
      setKpiFilters({});
    } else {
      setSelectedRegions([region]);
      setSelectedDepts([]);
      setKpiFilters({ region });
    }
  }, []);

  const handleDepartementChange = useCallback((dept: string) => {
    if (dept === 'all') {
      setSelectedDepts([]);
    } else {
      setSelectedDepts([dept]);
    }
  }, []);

  const handleFiltersApply = useCallback((newFilters: ActiveFilters) => {
    setFilters(newFilters);
    setKpiFilters(newFilters);

    if (newFilters.produit && newFilters.produit !== 'all') {
      setCurrentTheme(newFilters.produit);
    } else if (newFilters.secteur && newFilters.secteur !== 'all') {
      setCurrentTheme('tous');
      setCurrentSecteur(newFilters.secteur);
    }

    if (newFilters.region && newFilters.region !== 'all') {
      setSelectedRegions([newFilters.region]);
    }
    if (newFilters.departement && newFilters.departement !== 'all') {
      setSelectedDepts([newFilters.departement]);
    }
  }, []);

  const handleFiltersReset = useCallback(() => {
    setCurrentTheme('tous');
    setCurrentSecteur('all');
    setSelectedRegions([]);
    setSelectedDepts([]);
    setFilters(null);
    setKpiFilters({});
  }, []);

  const handleFeatureClick = useCallback(async (properties: FeatureProperties) => {
    try {
      let details: LocationDetails;
      if (properties.type_admin === 'region') {
        details = await api.getRegionDetails(properties.nom);
      } else {
        details = await api.getDepartementDetails(properties.nom);
      }
      setModalData(details);
      setComparisonResult(null);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Modal show error:', err);
    }
  }, []);

  const handleAddToComparison = useCallback(
    (data: { nom: string; type: string }) => {
      if (comparisonItems.find((i) => i.nom === data.nom)) return;
      if (comparisonItems.length >= 4) {
        alert('Maximum 4 elements pour la comparaison');
        return;
      }
      setComparisonItems((prev) => [...prev, { nom: data.nom, type: data.type }]);
    },
    [comparisonItems]
  );

  const handleCompare = useCallback((data: ComparisonData) => {
    setComparisonResult(data);
    setModalData(null);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setComparisonResult(null);
    setModalData(null);
  }, []);

  const handleRetry = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      await api.healthCheck();
      setIsLoading(false);
    } catch {
      setIsLoading(false);
      setError("Impossible de charger l'application. Verifiez que le serveur est demarre.");
    }
  }, []);

  return (
    <>
      <LoadingOverlay isVisible={isLoading} message="Chargement de l'application..." />

      <Header
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        onMenuToggle={handleMenuToggle}
        onSearchSelect={handleSearchSelect}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onRegionChange={handleRegionChange}
        onDepartementChange={handleDepartementChange}
        onFiltersApply={handleFiltersApply}
        onFiltersReset={handleFiltersReset}
        comparisonItems={comparisonItems}
        onComparisonRemove={(index) =>
          setComparisonItems((prev) => prev.filter((_, i) => i !== index))
        }
        onComparisonClear={() => setComparisonItems([])}
        onCompare={handleCompare}
      />

      <div id="kpi-container" className={!isSidebarOpen ? 'kpi-container--full' : ''}>
        <KPIDashboard filters={kpiFilters} />
      </div>

      <div className={`map-container ${!isSidebarOpen ? 'map-container--full' : ''}`}>
        <MapView
          currentTheme={currentTheme}
          currentSecteur={currentSecteur}
          selectedRegions={selectedRegions}
          selectedDepts={selectedDepts}
          filters={filters}
          onFeatureClick={handleFeatureClick}
        />
        <Legend theme={currentTheme} secteur={currentSecteur} />
        <ErrorMessage isVisible={!!error} message={error || ''} onRetry={handleRetry} />
      </div>

      <Modal
        isOpen={isModalOpen}
        data={modalData}
        comparisonData={comparisonResult}
        onClose={handleModalClose}
        onAddToComparison={handleAddToComparison}
      />

      <Footer isSidebarOpen={isSidebarOpen} />
    </>
  );
}

export default App;
