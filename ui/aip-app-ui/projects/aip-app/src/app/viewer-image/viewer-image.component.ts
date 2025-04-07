import { Component, Input } from '@angular/core';
import { Services } from '../services/service';

@Component({
  selector: 'app-viewer-image',
  templateUrl: './viewer-image.component.html',
  styleUrls: ['./viewer-image.component.scss']
})
export class ViewerImageComponent {
  title = 'image_viewer';
  @Input() ResponseList = '';
  @Input() dsetName;
  dataset:any;
  views: any;
  datasetData: any;

  image:string;

  constructor(
    private service: Services,
  ) { }

  ngOnInit(): void {
    this.image = "data:image/jpeg;base64," + encodeURI(this.ResponseList);

    if (this.dsetName) {
      this.service.getDataset(this.dsetName).subscribe(resp => {
        this.dataset = resp;
        try {
          try {
            this.views = JSON.parse(this.dataset.views)
          }
          catch {
            this.views = this.dataset.views
          }
        }
        catch {
          this.views = this.dataset.views
        }
        if (this.dataset.views) {
          this.service.getDatasource(this.dataset.datasource).subscribe(resp => {
            this.dataset.datasource = resp;
            let params = { page: 0, size: 50 }
            this.service.getProxyDbDatasetDetails(
              this.dataset,
              this.dataset.datasource,
              params,
              this.dataset.organization,
              true
            ).subscribe(resp => {
              this.datasetData = Object.values(resp);
              this.image = "data:image/jpeg;base64," + encodeURI(this.datasetData);
            }, err => {
              console.log(err);
              this.datasetData = err.text;
            });
          }, err => { console.log(err) });

        }
      }, err => { console.log(err) });
    }
    
  }

  ngOnChanges() {
    this.image= "data:image/jpeg;base64," + encodeURI(this.ResponseList);
  }

}
