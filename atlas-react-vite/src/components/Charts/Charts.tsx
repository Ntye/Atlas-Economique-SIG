import { type FC, useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { api } from '../../services/api';
// import { formatNumber } from '../../utils/helpers';
import type { Top10Response, RegionProductionResponse, ActiveFilters } from '../../interfaces';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface ChartsProps {
  filters: ActiveFilters | null;
}
// src/components/Charts/Charts.tsx

// src/components/Charts/Charts.tsx

const Charts: FC<ChartsProps> = ({ filters }) => {
  const [top10Data, setTop10Data] = useState<Top10Response | null>(null);
  const [pieData, setPieData] = useState<RegionProductionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Déterminer le secteur (par défaut 'agriculture')
        const secteurToFetch = filters?.secteur && filters.secteur !== 'all'
            ? filters.secteur
            : 'agriculture';

        // 2. Déterminer le produit pour le Bar Chart
        let produitToFetch = filters?.produit;

        // Si le produit est 'all' ou non défini, on récupère le premier produit du secteur
        if (!produitToFetch || produitToFetch === 'all') {
          const productsBySector = await api.getProductsBySector(secteurToFetch);
          const productsList = productsBySector[secteurToFetch] || [];
          // On prend le premier de la liste, ou 'cacao' par défaut si la liste est vide
          produitToFetch = productsList.length > 0 ? productsList[0].id : 'cacao';
        }

        // 3. Appels API avec les valeurs calculées
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
  }, [filters]); // Se recharge dès que les filtres changent

  if (loading) return <div className="text-center p-4">Analyse des données...</div>;

  return (
      <div className="charts-wrapper">
        <div className="chart-container">
          <h4 className="chart-container__title">Top 10 : {top10Data?.produit}</h4>
          <div style={{ height: '220px' }}>
            {top10Data && (
                <Bar
                    data={{
                      labels: top10Data.data.map((d) => d.nom),
                      datasets: [{
                        label: 'Production',
                        data: top10Data.data.map((d) => d.valeur),
                        backgroundColor: '#3498db',
                        borderRadius: 4
                      }]
                    }}
                    options={{ indexAxis: 'y', maintainAspectRatio: false }}
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
                        backgroundColor: ['#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#34495e']
                      }]
                    }}
                    options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                />
            )}
          </div>
        </div>
      </div>
  );
};

// const Charts: FC<ChartsProps> = ({ filters }) => {
//   const [top10Data, setTop10Data] = useState<Top10Response | null>(null);
//   const [pieData, setPieData] = useState<RegionProductionResponse | null>(null);
//   const [loading, setLoading] = useState(false);
//
//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         // On détermine quel produit ou secteur charger
//         const produitToFetch = filters?.produit && filters.produit !== 'all' ? filters.produit : 'cacao';
//         const secteurToFetch = filters?.secteur && filters.secteur !== 'all' ? filters.secteur : 'agriculture';
//
//         const [top10, pie] = await Promise.all([
//           api.getTop10Producers(produitToFetch),
//           api.getProductionByRegion(secteurToFetch), // Statistique réelle basée sur le secteur filtré
//         ]);
//
//         setTop10Data(top10);
//         setPieData(pie);
//       } catch (error) {
//         console.error('Charts load error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     if (filters) loadData();
//   }, [filters]);
//
//   if (loading) return <div className="text-center p-4">Chargement des statistiques...</div>;
//
//   return (
//       <div className="charts-wrapper">
//         <div className="chart-container">
//           <h4 className="chart-container__title">Top 10 : {top10Data?.produit}</h4>
//           <div style={{ height: '220px' }}>
//             {top10Data && (
//                 <Bar
//                     data={{
//                       labels: top10Data.data.map((d) => d.nom),
//                       datasets: [{ label: 'Production', data: top10Data.data.map((d) => d.valeur), backgroundColor: '#3498db' }]
//                     }}
//                     options={{ indexAxis: 'y', maintainAspectRatio: false }}
//                 />
//             )}
//           </div>
//         </div>
//
//         <div className="chart-container">
//           <h4 className="chart-container__title">Répartition Régionale : {pieData?.secteur}</h4>
//           <div style={{ height: '220px' }}>
//             {pieData && (
//                 <Doughnut
//                     data={{
//                       labels: pieData.data.slice(0, 5).map((d) => d.nom),
//                       datasets: [{ data: pieData.data.slice(0, 5).map((d) => d.valeur), backgroundColor: ['#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#34495e'] }]
//                     }}
//                     options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
//                 />
//             )}
//           </div>
//         </div>
//       </div>
//   );
// };

export default Charts;