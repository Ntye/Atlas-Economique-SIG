import { type FC, useEffect, useCallback } from 'react';
import { formatNumber, capitalize } from '../../utils/helpers';
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

    // 1. Helper pour extraire les valeurs de production (Régions vs Dépts)
    const getVal = (item: ComparisonItem, produitNom: string): number => {
      if (!item.production) return 0;

      if (item.type === 'region') {
        const prod = item.production as any;
        const secteurs = ['agriculture', 'elevage', 'peche'];
        for (const s of secteurs) {
          if (prod[s] && prod[s][produitNom]) {
            return prod[s][produitNom].valeur || 0;
          }
        }
      } else {
        return (item.production as Record<string, number>)[produitNom] || 0;
      }
      return 0;
    };

    // 2. Calculer si on doit afficher la ligne de Valeur Économique
    // On vérifie si au moins UN élément a une valeur > 0
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
                              {formatNumber(getVal(item, produit))}
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
          <div className="modal__footer">
            <button className="btn btn-danger" onClick={onClose}>
              Fermer
            </button>
          </div>
        </>
    );
  };
  // const renderComparisonContent = () => {
  //   if (!comparisonData?.items) return null;
  //
  //   // Fonction helper pour extraire la valeur numérique peu importe le type (Région ou Dépt)
  //   const getVal = (item: ComparisonItem, produitNom: string): number => {
  //     if (!item.production) return 0;
  //
  //     // Cas 1 : C'est un département (objet plat)
  //     if (item.type === 'departement') {
  //       return (item.production as Record<string, number>)[produitNom] || 0;
  //     }
  //
  //     // Cas 2 : C'est une région (objet imbriqué par secteurs : agriculture, elevage, peche)
  //     const prodReg = item.production as any;
  //     const secteurs = ['agriculture', 'elevage', 'peche'];
  //
  //     for (const s of secteurs) {
  //       if (prodReg[s] && prodReg[s][produitNom]) {
  //         return prodReg[s][produitNom].valeur || 0;
  //       }
  //     }
  //
  //     return 0;
  //   };
  //
  //   return (
  //       <>
  //         <div className="modal__header">
  //           <h2 className="modal__title">Comparaison {comparisonData.type === 'region' ? 'Régionale' : 'Départementale'}</h2>
  //           <button className="modal__close" onClick={onClose}>
  //             &times;
  //           </button>
  //         </div>
  //         <div className="modal__body">
  //           <div className="modal__section">
  //             <div style={{ overflowX: 'auto' }}>
  //               <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
  //                 <thead>
  //                 <tr style={{ background: 'var(--color-gray-100)' }}>
  //                   <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Produit / Critère</th>
  //                   {comparisonData.items.map((item) => (
  //                       <th key={item.nom} style={{ border: '1px solid #ddd', padding: '12px' }}>
  //                         {item.nom}
  //                       </th>
  //                   ))}
  //                 </tr>
  //                 </thead>
  //                 <tbody>
  //                 {comparisonData.produits.map((produit) => (
  //                     <tr key={produit}>
  //                       <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 500 }}>
  //                         {produit}
  //                       </td>
  //                       {comparisonData.items.map((item) => (
  //                           <td
  //                               key={item.nom}
  //                               style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}
  //                           >
  //                             {formatNumber(getVal(item, produit))}
  //                           </td>
  //                       ))}
  //                     </tr>
  //                 ))}
  //                 {/* Ajout de la valeur économique si disponible */}
  //                 <tr style={{ background: '#f9f9f9', fontWeight: 'bold' }}>
  //                   <td style={{ border: '1px solid #ddd', padding: '10px' }}>Valeur Éco. (FCFA)</td>
  //                   {comparisonData.items.map((item) => (
  //                       <td key={item.nom} style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right', color: 'var(--color-secondary)' }}>
  //                         {formatNumber(item.valeur_economique as number || 0)}
  //                       </td>
  //                   ))}
  //                 </tr>
  //                 </tbody>
  //               </table>
  //             </div>
  //           </div>
  //         </div>
  //         <div className="modal__footer">
  //           <button className="btn btn-danger" onClick={onClose}>
  //             Fermer
  //           </button>
  //         </div>
  //       </>
  //   );
  // };
  // const renderComparisonContent = () => {
  //   if (!comparisonData?.items) return null;
  //
  //   return (
  //     <>
  //       <div className="modal__header">
  //         <h2 className="modal__title">Comparaison</h2>
  //         <button className="modal__close" onClick={onClose}>
  //           &times;
  //         </button>
  //       </div>
  //       <div className="modal__body">
  //         <div className="modal__section">
  //           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
  //             <thead>
  //               <tr>
  //                 <th style={{ border: '1px solid #ddd', padding: '8px' }}>Critere</th>
  //                 {comparisonData.items.map((item) => (
  //                   <th key={item.nom} style={{ border: '1px solid #ddd', padding: '8px' }}>
  //                     {item.nom}
  //                   </th>
  //                 ))}
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {comparisonData.produits.map((produit) => (
  //                 <tr key={produit}>
  //                   <td style={{ border: '1px solid #ddd', padding: '8px' }}>{produit}</td>
  //                   {comparisonData.items.map((item) => {
  //                     const val =
  //                       (item.production as Record<string, number> | undefined)?.[produit] || 0;
  //                     return (
  //                       <td
  //                         key={item.nom}
  //                         style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}
  //                       >
  //                         {formatNumber(val)}
  //                       </td>
  //                     );
  //                   })}
  //                 </tr>
  //               ))}
  //             </tbody>
  //           </table>
  //         </div>
  //       </div>
  //       <div className="modal__footer">
  //         <button className="btn btn-danger" onClick={onClose}>
  //           Fermer
  //         </button>
  //       </div>
  //     </>
  //   );
  // };

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
