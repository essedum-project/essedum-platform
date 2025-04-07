import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-time-series',
  templateUrl: './time-series.component.html',
  styleUrls: ['./time-series.component.scss']
})
  export class TimeSeriesComponent implements OnInit {

    @Input() inpData: any[];
    @Input() outData: any[];
    @Input() inpDataset: any;
    @Input() outDataset: any;
    @Input() xAxis;
    @Input() yAxis;

    public series: any;
    public series1: any;
    public chart: any;
    public dataLabels: any;
    public markers: any;
    public title: any;
    public fill: any;
    public yaxis: any;
    public xaxis: any;
    public xaxis1: any;
    public tooltip: any;

    constructor() {
        // this.initChartData();
    }

    ngOnInit(): void {
        
        if (this.inpData && this.outData) {
            this.initInpChartData();
            this.initOutChartData();
        }
    }

    public initInpChartData(): void {
        let dates = [];
        let xaxis = this.xAxis
        // let yaxis = this.yAxis
        this.inpData = this.inpData.sort(function(a, b) {
            var x = a[xaxis]; var y = b[xaxis];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
        for (let i = 0; i < this.inpData.length; i++) {
            let serObj = {}
            serObj['x'] = this.inpData[i][this.xAxis]
            serObj['y'] = this.inpData[i][this.yAxis]
            dates.push(serObj)
        }
        this.series = [
            {
                name: this.xAxis,
                data: dates,
                color: "var(--base-color)"
            }
        ];
        this.chart = {
            type: "line",
            stacked: false,
            height: 350,
            zoom: {
                type: "x",
                enabled: true,
                autoScaleYaxis: true
            },
            toolbar: {
                autoSelected: "zoom"
            }
        };
        this.dataLabels = {
            enabled: false
        };
        this.markers = {
            size: 0
        };
        this.yaxis = {
            labels: {
                formatter: function (val) {
                    return val.toString()
                }
            },
            title: {
                text: this.yAxis
            }
        };
        this.xaxis = {
            type: "category",
            labels: {
                show: true
            },
            title: {
                text: this.xAxis
            }
        };
        this.tooltip = {
            shared: false,
            y: {
                formatter: function (val) {
                    return val.toString()
                }
            }
        };
        console.log("inpData=", this.series)
    }

    public initOutChartData(): void {
        let dates1 = [];
        for (let i = 0; i < this.outData.length; i++) {
            let serObj = {}
            serObj['x'] = this.outData[i][this.xAxis]
            serObj['y'] = this.outData[i][this.yAxis]
            dates1.push(serObj)
        }
        this.series1 = [
            {
                name: this.xAxis,
                data: dates1,
                color: "var(--base-color)"
            }
        ];
        this.xaxis1 = {
            type: "category",
            labels: {
                show: true
            },
            title: {
                text: this.xAxis
            }
        };

    }
}
