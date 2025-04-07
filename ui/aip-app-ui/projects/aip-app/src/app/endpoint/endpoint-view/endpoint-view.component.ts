import { Component, Input } from '@angular/core';
import { LedsLibService } from 'leds-lib';
import { Services } from '../../services/service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Location } from '@angular/common';

@Component({
  selector: 'app-endpoint-view',
  templateUrl: './endpoint-view.component.html',
  styleUrls: ['./endpoint-view.component.scss'],
})
export class EndpointViewComponent {
  @Input() cardTitle: String = 'Endpoint';
  test: any;
  sourceType: any = {};
  SampleInput: any;
  ModelName: any;
  Description: any;
  EndpointId: any;
  EndpointName: any;
  Url: any;
  EndpointType: any;
  tryoutAvailable: boolean;
  tryoutUrl: any;
  fedId: any;
  adapterId: any;
  back='Return to Endpoints List';
  tooltipPoition: string = 'above';

  constructor(
    private ledsLibService: LedsLibService,
    private service: Services,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private location: Location
  ) {}
  ngOnInit(): void {
    setTimeout(() => {
     document.getElementById('nourl').style.display = 'none';
    
    }, 2000); 
    this.carddets();
    this.service.getEndpointById(this.fedId,this.adapterId).subscribe((res) => {
      this.test = res;
      this.tryoutAvailable = true;
      this.tryoutUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.test.application);
      console.log(this.test.application,"this.test.appApplication");
    });

    

  }
  carddets(){
    this.route.params.subscribe(event => {
      this.fedId = event.fedId;
      this.adapterId = event.adapterId;
     });
  }

  endpointback(){
    this.location.back()
  }
}
