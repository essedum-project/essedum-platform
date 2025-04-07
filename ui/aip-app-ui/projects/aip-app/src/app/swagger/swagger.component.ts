import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';
import { SwaggerAPISpec } from '../DTO/swaggerapispec';
import { PipelineModelService } from '../pipeline-summary/pipeline-model/pipeline-model.service';
import SwaggerUI from 'swagger-ui';


@Component({
  selector: 'app-swagger',
  templateUrl: './swagger.component.html',
  styleUrls: ['./swagger.component.scss']
})
  export class SwaggerComponent implements OnInit, AfterViewInit {

    @Input() data: any;
    messageService: any;
    inpdata: any;
    showView: boolean;
  
    constructor(private el: ElementRef,
      private modelService: PipelineModelService
      ) {
    }
    swaggerapispec: SwaggerAPISpec = new SwaggerAPISpec();
  
    ngOnInit() {
      if(this.data.wkData.jsondata[this.data.wkJson.input.inp1].output){
      this.inpdata = this.data.wkData.jsondata[this.data.wkJson.input.inp1].output
  //console.log(this.inpdata)
      this.modelService.getModel(this.inpdata).subscribe(resp=>{
        this.data.apispec = resp.apispec
        this.resolveUrl()
        this.ngAfterViewInit()
      })
    }
    }
  
    ngAfterViewInit() {
      try{
        const ui = SwaggerUI({
          spec: JSON.parse(this.data.apispec),
          domNode: this.el.nativeElement.querySelector('.swagger-container'),
          deepLinking: true,
          presets: [
            SwaggerUI.presets.apis
          ],
          // click:this.run()
        });
      }
      catch(Exception){
      this.messageService.error("Some error occured", "Error")
      }
  
    // }
    }
      // )}
      resolveUrl() {
        let url = window.location.href;
        let start = url.indexOf("//") + 2;
        let urlpart = url.substring(start);
        let index = urlpart.indexOf("/");
        let finalurl = url.substring(0, start + index)
        let re = /@!url!@/gi;
        this.data.apispec = this.data.apispec.replace(re, finalurl);
      }
}
