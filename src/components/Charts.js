/**
 * Charts Component
 * Displays bar chart and pie chart using Chart.js
 */

import { api } from '../services/api.js';
import { formatNumber } from '../utils/helpers.js';

class Charts {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.chartTop10 = null;
    this.chartPie = null;
    this.currentProduit = 'cacao';

    // Chart colors
    this.colors = [
      '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
      '#1abc9c', '#e67e22', '#34495e', '#16a085', '#c0392b'
    ];
  }

  /**
   * Initialize charts
   */
  async init() {
    this.render();
    await this.loadData();
  }

  /**
   * Render chart containers
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="chart-container">
        <h4 class="chart-container__title">Top Producteurs</h4>
        <canvas id="chart-top10" class="chart-container__canvas"></canvas>
      </div>
      <div class="chart-container">
        <h4 class="chart-container__title">Répartition par Région</h4>
        <canvas id="chart-pie" class="chart-container__canvas"></canvas>
      </div>
    `;
  }

  /**
   * Load chart data
   */
  async loadData(produit = 'cacao') {
    this.currentProduit = produit;

    try {
      const [top10Data, pieData] = await Promise.all([
        api.getTop10Producers(produit),
        api.getProductionByRegion('agriculture')
      ]);

      this.renderTop10Chart(top10Data);
      this.renderPieChart(pieData);
    } catch (error) {
      console.error('Charts load error:', error);
    }
  }

  /**
   * Update charts with new product
   */
  async update(produit) {
    await this.loadData(produit);
  }

  /**
   * Render Top 10 bar chart
   */
  renderTop10Chart(data) {
    const ctx = document.getElementById('chart-top10');
    if (!ctx) return;

    // Destroy existing chart
    if (this.chartTop10) {
      this.chartTop10.destroy();
    }

    this.chartTop10 = new Chart(ctx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: data.data.map(d => d.nom),
        datasets: [{
          label: data.produit,
          data: data.data.map(d => d.valeur),
          backgroundColor: '#3498db',
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => formatNumber(context.raw)
            }
          }
        },
        scales: {
          x: {
            ticks: {
              callback: (value) => formatNumber(value)
            }
          }
        }
      }
    });
  }

  /**
   * Render pie/donut chart
   */
  renderPieChart(data) {
    const ctx = document.getElementById('chart-pie');
    if (!ctx) return;

    // Destroy existing chart
    if (this.chartPie) {
      this.chartPie.destroy();
    }

    const chartData = data.data.slice(0, 8);

    this.chartPie = new Chart(ctx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: chartData.map(d => d.nom),
        datasets: [{
          data: chartData.map(d => d.valeur),
          backgroundColor: this.colors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              font: { size: 10 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = formatNumber(context.raw);
                const percentage = context.parsed;
                return `${context.label}: ${value}`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Refresh charts
   */
  async refresh() {
    await this.loadData(this.currentProduit);
  }

  /**
   * Destroy charts
   */
  destroy() {
    if (this.chartTop10) {
      this.chartTop10.destroy();
      this.chartTop10 = null;
    }
    if (this.chartPie) {
      this.chartPie.destroy();
      this.chartPie = null;
    }
  }
}

export default Charts;
