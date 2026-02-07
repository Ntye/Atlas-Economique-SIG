import { type FC, useEffect, useCallback } from 'react';
import { formatNumber, capitalize } from '../../utils/helpers';
import type {
  LocationDetails,
  ComparisonData,
  RegionDetails,
} from '../../interfaces';

interface ModalProps {
  isOpen: boolean;
  data: LocationDetails | null;
  comparisonData: ComparisonData | null;
  onClose: () => void;
  onAddToComparison: (data: { nom: string; type: string }) => void;
}

const Modal: FC<ModalProps> = ({ isOpen, data, comparisonData, onClose, onAddToComparison }) => {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const renderDetailContent = () => {
    if (!data) return null;

    const typeLabel = data.type === 'region' ? 'Region' : 'Departement';

    return (
      <>
        <div className="modal__header">
          <h2 className="modal__title">
            {data.nom} ({typeLabel})
          </h2>
          <button className="modal__close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal__body">
          {/* General Info */}
          <div className="modal__section">
            <h4 className="modal__section-title">Informations generales</h4>
            <div className="info-grid">
              {data.superficie && (
                <InfoItem label="Superficie" value={`${formatNumber(Math.round(data.superficie))} km²`} />
              )}
              {'population' in data && data.population && (
                <InfoItem label="Population" value={formatNumber(data.population)} />
              )}
              {'valeur_economique' in data && data.valeur_economique && (
                <InfoItem label="Valeur economique" value={`${formatNumber(data.valeur_economique)} FCFA`} />
              )}
              {'secteur_principal' in data && data.secteur_principal && (
                <InfoItem label="Secteur principal" value={data.secteur_principal} />
              )}
              {'region_parente' in data && data.region_parente && (
                <InfoItem label="Region" value={data.region_parente} />
              )}
            </div>
          </div>

          {/* Production */}
          {data.production && data.type === 'region' && renderRegionProduction(data as RegionDetails)}
          {data.production && data.type === 'departement' && renderDeptProduction()}

          {/* Departments list */}
          {'departements' in data && data.departements && data.departements.length > 0 && (
            <div className="modal__section">
              <h4 className="modal__section-title">Departements</h4>
              <ul className="modal__list">
                {data.departements.map((d) => (
                  <li key={d.nom}>
                    {d.nom}
                    {d.population ? ` - ${formatNumber(d.population)} hab.` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="modal__section">
            <small className="text-muted">Annee de reference: {data.annee || 2024}</small>
          </div>
        </div>
        <div className="modal__footer">
          <button
            className="btn btn-primary"
            onClick={() => {
              onAddToComparison({ nom: data.nom, type: data.type });
              onClose();
            }}
          >
            Ajouter a la comparaison
          </button>
          <button className="btn btn-danger" onClick={onClose}>
            Fermer
          </button>
        </div>
      </>
    );
  };

  const renderRegionProduction = (regionData: RegionDetails) => {
    if (!regionData.production) return null;

    return (['agriculture', 'elevage', 'peche'] as const).map((secteur) => {
      const sectorData = regionData.production?.[secteur];
      if (!sectorData || Object.keys(sectorData).length === 0) return null;

      return (
        <div className="modal__section" key={secteur}>
          <h4 className="modal__section-title">{capitalize(secteur)}</h4>
          <div className="info-grid">
            {Object.entries(sectorData).map(([nom, info]) => (
              <InfoItem
                key={nom}
                label={`${info.icone} ${nom}`}
                value={`${formatNumber(info.valeur)} ${info.unite || ''}`}
              />
            ))}
          </div>
        </div>
      );
    });
  };

  const renderDeptProduction = () => {
    if (!data || !data.production) return null;

    return (
      <div className="modal__section">
        <h4 className="modal__section-title">Production</h4>
        <div className="info-grid">
          {Object.entries(data.production).map(([produit, valeur]) => {
            if (typeof valeur !== 'number' || valeur <= 0) return null;
            return <InfoItem key={produit} label={produit} value={formatNumber(valeur)} />;
          })}
        </div>
      </div>
    );
  };

  const renderComparisonContent = () => {
    if (!comparisonData?.items) return null;

    return (
      <>
        <div className="modal__header">
          <h2 className="modal__title">Comparaison</h2>
          <button className="modal__close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal__body">
          <div className="modal__section">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Critere</th>
                  {comparisonData.items.map((item) => (
                    <th key={item.nom} style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {item.nom}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonData.produits.map((produit) => (
                  <tr key={produit}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{produit}</td>
                    {comparisonData.items.map((item) => {
                      const val =
                        (item.production as Record<string, number> | undefined)?.[produit] || 0;
                      return (
                        <td
                          key={item.nom}
                          style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}
                        >
                          {formatNumber(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn-danger" onClick={onClose}>
            Fermer
          </button>
        </div>
      </>
    );
  };

  return (
    <div
      className={`modal-overlay ${isOpen ? 'modal-overlay--active' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="modal">
        {comparisonData ? renderComparisonContent() : renderDetailContent()}
      </div>
    </div>
  );
};

const InfoItem: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="info-item">
    <div className="info-item__label">{label}</div>
    <div className="info-item__value">{value}</div>
  </div>
);

export default Modal;
