import { type FC, useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import ComparisonPanel from '../ComparisonPanel';
import type { FilterOptions, ActiveFilters, ComparisonItem, ComparisonData, Produit } from '../../interfaces';

interface SidebarProps {
  isOpen: boolean;
  onRegionChange: (region: string) => void;
  onDepartementChange: (dept: string) => void;
  onFiltersApply: (filters: ActiveFilters) => void;
  onFiltersReset: () => void;
  comparisonItems: ComparisonItem[];
  onComparisonRemove: (index: number) => void;
  onComparisonClear: () => void;
  onCompare: (data: ComparisonData) => void;
}

const Sidebar: FC<SidebarProps> = ({
  isOpen,
  onRegionChange,
  onDepartementChange,
  onFiltersApply,
  onFiltersReset,
  comparisonItems,
  onComparisonRemove,
  onComparisonClear,
  onCompare,
}) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [currentRegion, setCurrentRegion] = useState('all');
  const [currentDept, setCurrentDept] = useState('all');
  const [currentSecteur, setCurrentSecteur] = useState('all');
  const [currentProduit, setCurrentProduit] = useState('all');
  const [availableProduits, setAvailableProduits] = useState<Produit[]>([]);


  useEffect(() => {
    api
      .getFilters()
      .then(setFilterOptions)
      .catch((err) => console.error('Sidebar init error:', err));
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsBySector = await api.getProductsBySector(currentSecteur);
        let products: Produit[] = [];
        if (currentSecteur === 'all') {
          // Flatten all products if 'all' sectors are selected
          Object.values(productsBySector).forEach(prodArray => {
            products = products.concat(prodArray);
          });
        } else {
          products = productsBySector[currentSecteur] || [];
        }
        setAvailableProduits(products);
        setCurrentProduit('all'); // Reset product selection when sector changes
      } catch (error) {
        console.error('Error loading products by sector:', error);
        setAvailableProduits([]);
      }
    };

    loadProducts();
  }, [currentSecteur]);

  const handleRegionChange = useCallback(
    (region: string) => {
      setCurrentRegion(region);
      setCurrentDept('all');
      onRegionChange(region);
    },
    [onRegionChange]
  );

  const handleDeptChange = useCallback(
    (dept: string) => {
      setCurrentDept(dept);
      onDepartementChange(dept);
    },
    [onDepartementChange]
  );

  const applyFilters = () => {
    onFiltersApply({
      region: currentRegion,
      departement: currentDept,
      secteur: currentSecteur,
      produit: currentProduit,
    });
  };

  const resetFilters = () => {
    setCurrentRegion('all');
    setCurrentDept('all');
    setCurrentSecteur('all');
    setCurrentProduit('all');
    onFiltersReset();
  };

  const clearFilter = (type: string) => {
    switch (type) {
      case 'region':
        setCurrentRegion('all');
        setCurrentDept('all');
        onRegionChange('all');
        break;
      case 'dept':
        setCurrentDept('all');
        onDepartementChange('all');
        break;
      case 'secteur':
        setCurrentSecteur('all');
        break;
      case 'produit':
        setCurrentProduit('all');
        break;
    }
  };

  const departments =
    currentRegion !== 'all' && filterOptions
      ? filterOptions.departementsByRegion[currentRegion] || []
      : [];

  const activeChips: { type: string; label: string }[] = [];
  if (currentRegion !== 'all') activeChips.push({ type: 'region', label: `Region: ${currentRegion}` });
  if (currentDept !== 'all') activeChips.push({ type: 'dept', label: `Dept: ${currentDept}` });
  if (currentSecteur !== 'all') activeChips.push({ type: 'secteur', label: `Secteur: ${
    filterOptions?.secteurs.find(s => s.id === currentSecteur)?.label || currentSecteur
  }` });
  if (currentProduit !== 'all') activeChips.push({ type: 'produit', label: `Produit: ${
    availableProduits.find(p => p.id === currentProduit)?.nom || currentProduit
  }` });

  if (!filterOptions) return <aside className={`sidebar ${!isOpen ? 'sidebar--collapsed' : ''}`} />;

  return (
    <aside className={`sidebar ${!isOpen ? 'sidebar--collapsed' : ''}`}>
      {/* Filters Section */}
      <div className="sidebar__section">
        <h3 className="sidebar__section-title">Filtres</h3>

        <div className="sidebar__filter-group">
          <label>Region</label>
          <select value={currentRegion} onChange={(e) => handleRegionChange(e.target.value)}>
            <option value="all">Toutes les regions</option>
            {filterOptions.regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sidebar__filter-group">
          <label>Secteur d'activite</label>
          <select value={currentSecteur} onChange={(e) => setCurrentSecteur(e.target.value)}>
            <option value="all">Choisir</option>
            {filterOptions.secteurs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icone} {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sidebar__filter-group">
          <label>Departement</label>
          <select
            value={currentDept}
            onChange={(e) => handleDeptChange(e.target.value)}
            disabled={currentRegion === 'all'}
          >
            <option value="all">Choisir</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="sidebar__filter-group">
          <label>Produit</label>
          <select value={currentProduit} onChange={(e) => setCurrentProduit(e.target.value)}>
            <option value="all">Choisir</option>
            {availableProduits.map((p) => (
              <option key={p.id} value={p.id}>
                {p.icone} {p.nom}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary btn-block" onClick={applyFilters}>
          <i className="fas fa-filter" style={{ marginRight: '8px' }}></i>
          Appliquer les filtres
        </button>

        <button className="btn btn-danger btn-block" onClick={resetFilters} style={{ marginTop: '0.8rem' }}>
          <i className="fas fa-undo" style={{ marginRight: '8px' }}></i>
          Réinitialiser
        </button>

        {activeChips.length > 0 && (
          <div className="active-filters" style={{ marginTop: '0.75rem' }}>
            {activeChips.map((chip) => (
              <span className="chip" key={chip.type}>
                {chip.label}{' '}
                <span className="remove" onClick={() => clearFilter(chip.type)}>
                  &times;
                </span>
              </span>
            ))}
          </div>
        )}
      </div>


      {/* Comparison Panel */}
      <ComparisonPanel
        items={comparisonItems}
        onRemove={onComparisonRemove}
        onClear={onComparisonClear}
        onCompare={onCompare}
      />
    </aside>
  );
};

export default Sidebar;