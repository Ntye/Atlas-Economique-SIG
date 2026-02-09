import { formatNumber, capitalize } from '../../utils/helpers';
import { type FC, useEffect, useCallback } from 'react';
import type {
  LocationDetails,
  ComparisonData,
  RegionDetails, ComparisonItem,
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

  // --- HELPER : Extraction des valeurs pour la comparaison ---
  // Déplacé ici pour être accessible par le render et l'export
  const getComparisonValue = (item: ComparisonItem, produitNom: string): number => {
    if (!item.production) return 0;

    // Cas 1 : Région (structure imbriquée par secteur)
    if (item.type === 'region') {
      const prod = item.production as any;
      const secteurs = ['agriculture', 'elevage', 'peche'];
      for (const s of secteurs) {
        if (prod[s] && prod[s][produitNom]) {
          return prod[s][produitNom].valeur || 0;
        }
      }
    }
    // Cas 2 : Département (structure plate)
    else {
      return (item.production as Record<string, number>)[produitNom] || 0;
    }
    return 0;
  };

  // --- FONCTION D'EXPORT JSON POUR LA COMPARAISON ---
  const handleDownloadComparison = () => {
    if (!comparisonData || !comparisonData.items) return;

    const itemsNames = comparisonData.items.map(i => i.nom);
    const typeComparaison = comparisonData.type === 'region' ? 'Régionale' : 'Départementale';

    // Construction des lignes de données (identique au tableau visuel)
    const lignesDonnees = comparisonData.produits.map(produit => {
      const ligne: Record<string, any> = { produit_indicateur: produit };
      comparisonData.items.forEach(item => {
        ligne[item.nom] = getComparisonValue(item, produit);
      });
      return ligne;
    });

    // Ajout Valeur Économique
    const ligneEco: Record<string, any> = { produit_indicateur: "Valeur Économique (FCFA)" };
    comparisonData.items.forEach(item => {
      const valEco = (item.valeur_economique as number) ||
          ((item.production as any)?.valeur_economique as number) || 0;
      ligneEco[item.nom] = valEco;
    });
    lignesDonnees.push(ligneEco);

    const exportData = {
      metadata: {
        titre: `Comparaison ${typeComparaison} - Atlas Économique`,
        date_export: new Date().toISOString(),
        auteur: "Projet 5GI"
      },
      contexte: {
        type: comparisonData.type,
        annee: comparisonData.annee || 2024,
        entites_comparees: itemsNames
      },
      donnees_tableau: lignesDonnees
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    const filename = `comparaison_${comparisonData.type}_${new Date().toISOString().slice(0, 10)}.json`;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

    // Calculer si on doit afficher la ligne de Valeur Économique
    const hasAnyEconomicValue = comparisonData.items.some(item => {
      const val = (item.valeur_economique as number) ||
          ((item.production as any)?.valeur_economique as number) || 0;
      return val > 0;
    });

    return (
        <>
          <div className="modal__header">
            <h2 className="modal__title">
              Comparaison {comparisonData.type === 'region' ? 'Régionale' : 'Départementale'}
            </h2>
            <button className="modal__close" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="modal__body">
            <div className="modal__section">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '450px' }}>
                  <thead>
                  <tr style={{ background: 'var(--color-gray-100)' }}>
                    <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Produit / Indicateur</th>
                    {comparisonData.items.map((item) => (
                        <th key={item.nom} style={{ border: '1px solid #ddd', padding: '12px' }}>
                          {item.nom}
                        </th>
                    ))}
                  </tr>
                  </thead>
                  <tbody>
                  {/* Lignes de produits (Cacao, Café, etc.) */}
                  {comparisonData.produits.map((produit) => (
                      <tr key={produit}>
                        <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 500 }}>
                          {produit}
                        </td>
                        {comparisonData.items.map((item) => (
                            <td
                                key={item.nom}
                                style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}
                            >
                              {formatNumber(getComparisonValue(item, produit))}
                            </td>
                        ))}
                      </tr>
                  ))}

                  {/* Ligne Valeur Économique - AFFICHÉE UNIQUEMENT SI VALEUR > 0 */}
                  {hasAnyEconomicValue && (
                      <tr style={{ background: '#f0f7ff', fontWeight: 'bold' }}>
                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>Valeur Éco. (FCFA)</td>
                        {comparisonData.items.map((item) => {
                          const valEco = (item.valeur_economique as number) ||
                              ((item.production as any)?.valeur_economique as number) || 0;
                          return (
                              <td key={item.nom} style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right', color: 'var(--color-secondary)' }}>
                                {formatNumber(valEco)}
                              </td>
                          );
                        })}
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="modal__footer" style={{ justifyContent: 'space-between' }}>
            <button
                className="btn btn-primary"
                onClick={handleDownloadComparison}
                title="Télécharger le tableau de comparaison"
            >
              <i className="fas fa-file-download" style={{ marginRight: '6px' }}></i>
              Exporter JSON
            </button>

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