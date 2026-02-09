import { type FC, useEffect, useState, useCallback } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { api } from '../../services/api';
import type {
  Top10Response,
  RegionProductionResponse,
  ActiveFilters,
  LocationDetails,
  RegionDetails,
  DepartementDetails
} from '../../interfaces';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface ChartsProps {
  filters: ActiveFilters | null;
}

const Charts: FC<ChartsProps> = ({ filters }) => {
  const [top10Data, setTop10Data] = useState<Top10Response | null>(null);
  const [pieData, setPieData] = useState<RegionProductionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const secteurToFetch = filters?.secteur && filters.secteur !== 'all'
            ? filters.secteur
            : 'agriculture';

        let produitToFetch = filters?.produit;

        if (!produitToFetch || produitToFetch === 'all') {
          const productsBySector = await api.getProductsBySector(secteurToFetch);
          const productsList = productsBySector[secteurToFetch] || [];
          produitToFetch = productsList.length > 0 ? productsList[0].id : 'cacao';
        }

        const [top10, pie] = await Promise.all([
          api.getTop10Producers(produitToFetch),
          api.getProductionByRegion(secteurToFetch),
        ]);

        setTop10Data(top10);
        setPieData(pie);
      } catch (error) {
        console.error('Charts load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  // --- FONCTION DE TÉLÉCHARGEMENT JSON ---
  const handleDownloadJson = useCallback(async () => {
    if (!top10Data && !pieData) return;
    setExporting(true);

    try {
      // 1. Récupération des détails spécifiques si une zone est sélectionnée
      let zoneDetails: LocationDetails | null = null;
      let zoneType = "National";
      let zoneNom = "Cameroun";

      if (filters?.departement && filters.departement !== 'all') {
        zoneType = "Département";
        zoneNom = filters.departement;
        try {
          zoneDetails = await api.getDepartementDetails(filters.departement);
        } catch (e) { console.error("Erreur récup détails dept", e); }
      }
      else if (filters?.region && filters.region !== 'all') {
        zoneType = "Région";
        zoneNom = filters.region;
        try {
          zoneDetails = await api.getRegionDetails(filters.region);
        } catch (e) { console.error("Erreur récup détails région", e); }
      }

      // 2. Filtrage des données de production
      // CORRECTION TS: On type explicitement en 'any' pour accepter la structure complexe ou plate
      let productionZoneSelect: any = {};
      const secteurActuel = filters?.secteur || 'agriculture';
      let valeurEconomique: number | undefined = 0;

      if (zoneDetails) {
        // Gestion VALEUR ECONOMIQUE (Différente selon le type)
        if (zoneDetails.type === 'region') {
          valeurEconomique = (zoneDetails as RegionDetails).valeur_economique;

          // Gestion PRODUCTION (Structure imbriquée pour Région)
          const prodRegion = (zoneDetails as RegionDetails).production;
          if (prodRegion) {
            if (secteurActuel !== 'all' && prodRegion[secteurActuel as keyof typeof prodRegion]) {
              productionZoneSelect = prodRegion[secteurActuel as keyof typeof prodRegion];
            } else {
              productionZoneSelect = prodRegion;
            }
          }
        } else {
          // Cas DÉPARTEMENT
          const deptDetails = zoneDetails as DepartementDetails;
          // La valeur éco est souvent dans la production pour les départements
          valeurEconomique = deptDetails.production?.valeur_economique;

          // Structure plate pour Département
          productionZoneSelect = deptDetails.production || {};
        }
      }

      // 3. Construction de l'objet final
      const exportData = {
        metadata: {
          titre: "Export Statistiques Atlas Économique Cameroun",
          date_export: new Date().toISOString(),
          auteur: "Projet 5GI",
          version_api: "1.0.0"
        },
        contexte_selection: {
          zone_type: zoneType,
          zone_nom: zoneNom,
          secteur_cible: secteurActuel,
          produit_cible: filters?.produit || "Tous",
          filtres_complets: filters
        },
        details_zone: zoneDetails ? {
          nom: zoneDetails.nom,
          superficie: zoneDetails.superficie,
          // CORRECTION TS: cast as any pour accéder à population si elle existe
          population: (zoneDetails as any).population || null,
          valeur_economique_totale: valeurEconomique,
          donnees_production_secteur: productionZoneSelect
        } : "Aucune zone spécifique sélectionnée (Vue Nationale)",
        resultats_graphiques: {
          top_10_producteurs: {
            produit: top10Data?.produit,
            data: top10Data?.data
          },
          repartition_regionale: {
            secteur: pieData?.secteur,
            data: pieData?.data
          }
        }
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      const safeZoneName = zoneNom.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `stats_${safeZoneName}_${secteurActuel}_${new Date().toISOString().slice(0, 10)}.json`;
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Erreur lors de l'export", err);
      alert("Erreur lors de la génération de l'export.");
    } finally {
      setExporting(false);
    }
  }, [top10Data, pieData, filters]);

  if (loading) return <div className="text-center p-4">Analyse des données...</div>;

  return (
      <div className="charts-wrapper">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button
              className="btn btn-sm btn-outline"
              onClick={handleDownloadJson}
              title="Télécharger les données complètes (Zone + Graphiques)"
              disabled={(!top10Data && !pieData) || exporting}
          >
            {exporting ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i>
                  Génération...
                </>
            ) : (
                <>
                  <i className="fas fa-file-download" style={{ marginRight: '6px' }}></i>
                  Exporter JSON
                </>
            )}
          </button>
        </div>

        <div className="chart-container">
          <h4 className="chart-container__title">Top 10 Producteurs : {top10Data?.produit}</h4>
          <div style={{ height: '220px' }}>
            {top10Data && (
                <Bar
                    data={{
                      labels: top10Data.data.map((d) => d.nom),
                      datasets: [{
                        label: 'Production (tonnes/têtes)',
                        data: top10Data.data.map((d) => d.valeur),
                        backgroundColor: '#3498db',
                        borderRadius: 4
                      }]
                    }}
                    options={{
                      indexAxis: 'y',
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                />
            )}
          </div>
        </div>

        <div className="chart-container">
          <h4 className="chart-container__title">Répartition par Région ({pieData?.secteur})</h4>
          <div style={{ height: '220px' }}>
            {pieData && (
                <Doughnut
                    data={{
                      labels: pieData.data.slice(0, 5).map((d) => d.nom),
                      datasets: [{
                        data: pieData.data.slice(0, 5).map((d) => d.valeur),
                        backgroundColor: ['#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#34495e'],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
                      }
                    }}
                />
            )}
          </div>
        </div>
      </div>
  );
};

export default Charts;