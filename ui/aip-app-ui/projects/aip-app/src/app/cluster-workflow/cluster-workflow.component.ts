import { Component } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';



@Component({
  selector: 'app-cluster-workflow',
  templateUrl: './cluster-workflow.component.html',
  styleUrl: './cluster-workflow.component.scss'
})
export class ClusterWorkflowComponent {
  constructor(private dialog: MatDialog) { }
  selectedChart: any;
  showAllCharts: boolean = false;
  items: string[] = ['Item1', 'Item2', 'Item3', 'Item4', 'Item5'];
  selectedItems: string[] = [];

  chartData: { [key: string]: ChartData<'bar'> } = {
    ManualCluster: {
      labels: ['Cluster Name', 'Cluster Name ', 'Cluster Name', 'Cluster Name', 'Cluster Name', 'Cluster Name'],
      datasets: [
        {
          label: 'Tickets',
          data: [40, 60, 80, 20, 10, 50],
          backgroundColor: ' rgb(123, 57, 177)',
          borderWidth: 1,
        },
      ],
    },
    SoundexCluster: {
      labels: ['Cluster Name', 'Cluster Name ', 'Cluster Name', 'Cluster Name', 'Cluster Name', 'Cluster Name'],
      datasets: [
        {
          label: 'Tickets',
          data: [85, 72, 95, 62, 20, 30],
          backgroundColor: ' rgb(123, 57, 177)',
          borderWidth: 1,
        },
      ],
    },
    LDACluster: {
      labels: ['Cluster Name', 'Cluster Name ', 'Cluster Name', 'Cluster Name', 'Cluster Name', 'Cluster Name'],
      datasets: [
        {
          label: 'Tickets',
          data: [85, 72, 95, 62, 40, 20],
          backgroundColor: ' rgb(123, 57, 177)',
          borderWidth: 1,
        },
      ],
    },
    NGramCluster: {
      labels: ['Cluster Name', 'Cluster Name ', 'Cluster Name', 'Cluster Name', 'Cluster Name', 'Cluster Name'],
      datasets: [
        {
          label: 'Tickets',
          data: [85, 72, 95, 62, 10, 40],
          backgroundColor: ' rgb(123, 57, 177)',
          borderWidth: 1,
        },
      ],
    },
    KeyPhraseCluster: {
      labels: ['Cluster Name', 'Cluster Name ', 'Cluster Name', 'Cluster Name', 'Cluster Name', 'Cluster Name'],
      datasets: [
        {
          label: 'Tickets',
          data: [85, 72, 95, 62, 30, 50],
          backgroundColor: ' rgb(123, 57, 177)',
          borderWidth: 1,
        },
      ],
    },
  };

  chartOptions: ChartOptions = {
    responsive: true,
    indexAxis: 'y',
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true },
    },
  };

  // This method is called when a chip is clicked
  onChipClick(chartKey: string): void {
    this.selectedChart = this.chartData[chartKey];
    this.showAllCharts = false; // Ensure it's not showing all charts
  }

  // Method to show all charts together
  onShowAllChartsClick(): void {
    this.selectedChart = null; // No single chart selected
    this.showAllCharts = true; // Flag to show all charts together
  }

  ngOnInit(): void {
    // By default, show all charts on initialization
    this.showAllCharts = true;
  }
  
}
