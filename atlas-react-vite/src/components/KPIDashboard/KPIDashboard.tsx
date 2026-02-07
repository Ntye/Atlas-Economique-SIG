import { type FC, useEffect, useState } from 'react';
import { api } from '../../services/api';
import { formatNumber } from '../../utils/helpers';
import type { KPIData, KPIConfig, ActiveFilters } from '../../interfaces';

interface KPIDashboardProps {
  filters: Partial<ActiveFilters>;
}

const kpiConfig: KPIConfig[] = [
  { key: 'agriculture', label: 'Agriculture', icon: 'fas fa-seedling' },
  { key: 'elevage', label: 'Elevage', icon: 'fas fa-cow' },
  { key: 'peche', label: 'Peche', icon: 'fas fa-fish' },
  { key: 'valeur_economique', label: 'Valeur Eco.', icon: 'fas fa-chart-line' },
  { key: 'regions_actives', label: 'Regions', icon: 'fas fa-map-marked-alt' },
  { key: 'departements_actifs', label: 'Departements', icon: 'fas fa-layer-group' },
];

const KPIDashboard: FC<KPIDashboardProps> = ({ filters }) => {
  const [data, setData] = useState<KPIData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    api
      .getKPIs(filters)
      .then(setData)
      .catch(() => setError(true));
  }, [filters]);

  if (error) {
    return (
      <div className="kpi-dashboard">
        <div className="text-center text-muted p-4">Erreur de chargement des indicateurs</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="kpi-dashboard">
      {kpiConfig.map((kpi) => {
        const item = data[kpi.key] as { valeur: number } | undefined;
        if (!item || typeof item !== 'object') return null;

        return (
          <div className="kpi-card" key={kpi.key}>
            <div className="kpi-card__header">
              <span className="kpi-card__label">{kpi.label}</span>
              <i className={`kpi-card__icon ${kpi.icon}`} />
            </div>
            <div className="kpi-card__value">{formatNumber(item.valeur)}</div>
          </div>
        );
      })}
    </div>
  );
};

export default KPIDashboard;
