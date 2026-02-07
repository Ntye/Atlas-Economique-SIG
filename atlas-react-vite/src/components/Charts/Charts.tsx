import { type FC, useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { api } from '../../services/api';
import { formatNumber } from '../../utils/helpers';
import type { Top10Response, RegionProductionResponse } from '../../interfaces';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const CHART_COLORS = [
  '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#34495e', '#16a085', '#c0392b',
];

interface ChartsProps {
  produit: string;
}

const Charts: FC<ChartsProps> = ({ produit }) => {
  const [top10Data, setTop10Data] = useState<Top10Response | null>(null);
  const [pieData, setPieData] = useState<RegionProductionResponse | null>(null);
  const barRef = useRef<ChartJS<'bar'>>(null);
  const pieRef = useRef<ChartJS<'doughnut'>>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [top10, pie] = await Promise.all([
          api.getTop10Producers(produit),
          api.getProductionByRegion('agriculture'),
        ]);
        setTop10Data(top10);
        setPieData(pie);
      } catch (error) {
        console.error('Charts load error:', error);
      }
    };
    loadData();
  }, [produit]);

  const barChartData = top10Data
    ? {
        labels: top10Data.data.map((d) => d.nom),
        datasets: [
          {
            label: top10Data.produit,
            data: top10Data.data.map((d) => d.valeur),
            backgroundColor: '#3498db',
            borderRadius: 4,
          },
        ],
      }
    : null;

  const barChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: { raw: unknown }) => formatNumber(context.raw as number),
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: (value: string | number) => formatNumber(value as number),
        },
      },
    },
  };

  const pieChartData = pieData
    ? {
        labels: pieData.data.slice(0, 8).map((d) => d.nom),
        datasets: [
          {
            data: pieData.data.slice(0, 8).map((d) => d.valeur),
            backgroundColor: CHART_COLORS,
          },
        ],
      }
    : null;

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          font: { size: 10 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: { label: string; raw: unknown }) => {
            const value = formatNumber(context.raw as number);
            return `${context.label}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <>
      <div className="chart-container">
        <h4 className="chart-container__title">Top Producteurs</h4>
        <div style={{ height: '250px' }}>
          {barChartData && <Bar ref={barRef} data={barChartData} options={barChartOptions} />}
        </div>
      </div>
      <div className="chart-container">
        <h4 className="chart-container__title">Repartition par Region</h4>
        <div style={{ height: '250px' }}>
          {pieChartData && <Doughnut ref={pieRef} data={pieChartData} options={pieChartOptions} />}
        </div>
      </div>
    </>
  );
};

export default Charts;
