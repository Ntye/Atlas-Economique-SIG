import { type FC } from 'react';
import { api } from '../../services/api';
import type { ComparisonItem, ComparisonData } from '../../interfaces';

interface ComparisonPanelProps {
  items: ComparisonItem[];
  onAdd?: (item: ComparisonItem) => void;
  onRemove: (index: number) => void;
  onClear: () => void;
  onCompare: (data: ComparisonData) => void;
}

const ComparisonPanel: FC<ComparisonPanelProps> = ({ items, onRemove, onClear, onCompare }) => {
  const handleCompare = async () => {
    if (items.length < 2) {
      alert('Selectionnez au moins 2 elements a comparer');
      return;
    }

    try {
      const ids = items.map((i) => i.nom);
      const type = items[0].type === 'region' ? 'region' : 'departement';
      const data = await api.compare(ids, type);
      onCompare(data);
    } catch (error) {
      console.error('Comparison error:', error);
      alert('Erreur lors de la comparaison');
    }
  };

  return (
    <div className={`comparison-panel ${items.length > 0 ? 'comparison-panel--active' : ''}`}>
      <h3 className="comparison-panel__title">Comparaison</h3>
      <div className="comparison-panel__selection">
        {items.map((item, index) => (
            // src/components/ComparisonPanel/ComparisonPanel.tsx (extrait du map)

            <div key={`${item.nom}-${index}`} className="comparison-panel__item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-location-dot" style={{ color: 'var(--color-secondary)', fontSize: '0.7rem' }}></i>
                <span style={{ fontWeight: 500 }}>{item.nom}</span>
              </div>
              <span className="remove" onClick={() => onRemove(index)} title="Supprimer">
                &times;
              </span>
            </div>
        ))}
      </div>
      <div className="comparison-panel__actions">
        <button className="btn btn-primary btn-sm" onClick={handleCompare}>
          Comparer
        </button>
        <button className="btn btn-danger btn-sm" onClick={onClear}>
          Effacer
        </button>
      </div>
    </div>
  );
};

export default ComparisonPanel;
