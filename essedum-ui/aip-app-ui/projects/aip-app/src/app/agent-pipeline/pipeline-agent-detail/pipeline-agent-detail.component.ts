import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../../services/service';
import { DynamicParamsGrid, DynamicSecretsGrid } from '../../pipeline.description/pipeline.description.component';
import { HttpParams } from '@angular/common/http';
import { StreamingServices } from '../../streaming-services/streaming-service';
import { Location } from '@angular/common';
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';

@Component({
  selector: 'app-pipeline-agent-detail',
  templateUrl: './pipeline-agent-detail.component.html',
  styleUrl: './pipeline-agent-detail.component.scss'
})
export class PipelineAgentDetailComponent implements OnInit {
  
      @Input() streamItem: StreamingServices;
        @Input() pipelineAlias: String;
    
  organisation:any;
  data: any = {
    filetype: 'json',
    files: [],
    arguments: []   
  };
   // Selected file content for editor
  selectedFileContent = '';
  selectedFileName = '';
  fileExtension = 'py';
   cardName: any;
  script: any[] = [];
  lang: string;
  loadScript: boolean = false;
   dynamicEnvArray: Array<DynamicParamsGrid> = [];
    changeLang(type) {
    switch (type) {
      case 'Python2':
      case 'Python3':
      case 'Jython':
        this.lang = 'python';
        break;
      case 'JavaScript':
        this.lang = 'javascript';
        break;
      default:
        this.lang = undefined;
    }
  }
 uploader: FileUploader;
  // Portfolio ID from session storage
  portfolioId: number | null = null;

  
  
  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
   
    private service: Services,
       @Inject('envi') private baseUrl: string,
  )   {
    this.route.queryParams.subscribe((params) => {
      if (params['org']) {
        this.organisation = params['org'];
      } else {
        this.organisation = sessionStorage.getItem('organization');
      }
    });
  }


  ngOnInit(): void {

   this.route.params.subscribe((params) => {
      if (params['cname']) {
        this.cardName = params['cname'];
      } else {
        this.cardName = this.streamItem?.name;
      }
    });

    const portfoliodata = sessionStorage.getItem('portfoliodata');  
    const portfolioId = portfoliodata ? JSON.parse(String(portfoliodata)).id : undefined;
    this.portfolioId = portfolioId;
    
    // Call all required methods in sequence
    this.getStreamService();
    this.getAgentPipelineByName();
  }


  
  getAgentPipelineByName() {
    let params: HttpParams = new HttpParams();
    params = params.set('name', this.cardName);
    params = params.set('org', this.organisation);
    this.service.getPipelineByName(params).subscribe({
      next: (res) => {
        console.log('Pipeline fetch response:', res);
        if (res && res.length > 0) {
          // this.card = res[0];
          console.log('Pipeline data loaded successfully');
        }
      },
      error: (err) => {
        console.error('Error fetching pipeline:', err);
        this.service.message('Error! While fetching pipeline', 'error');
      },
      complete: () => {
        console.log('getPipelineByName observable completed');
      }
    });
  }


   getStreamService() {
      this.service.getStreamingServicesByName(this.cardName).subscribe({
        next: (res) => {
          this.streamItem = res;
          this.pipelineAlias = res.alias;
    
          if (this.router.url.includes('preview')) {
            this.pipelineAlias = this.streamItem.alias;
          }
          
          this.uploader = new FileUploader({
            url:
              this.baseUrl +
              '/file/pipeline/native/upload/' +
              this.streamItem.name +
              '/' +
              this.streamItem.organization,
          });
          
          try {
            if (this.router.url.includes('native')) {
              this.data = JSON.parse(
                this.streamItem.jsonContent
              ).elements[0].attributes;
              this.dynamicEnvArray = JSON.parse(this.streamItem.jsonContent).environment;
            } else {
              if (this.streamItem.json_content) {
                this.dynamicEnvArray = JSON.parse(this.streamItem.json_content).environment;
              }
              this.data = JSON.parse(
                this.streamItem.json_content
              ).elements[0].attributes;
              this.dynamicEnvArray = JSON.parse(this.streamItem.json_content).environment;
            }
            
            if (this.data.dataset) {
              this.data.dataset.forEach((data) => {
                if (data.datasource) {
                  this.service
                    .getDatasource(data.datasource.name)
                    .subscribe((resp) => {
                      data.datasource = resp;
                    });
                }
              });
            }
            
            if (this.data.filetype == 'Python') {
              this.data.filetype = 'Python3';
            }
            
            if (this.data.filetype) {
              this.changeLang(this.data.filetype);
            }
         
            if (this.data.arguments) {
              this.refreshTree();
            }
            
            if (this.data.files && this.data.files.length > 0) {
              this.readFile(this.data.files[0]);
            }
         
            if (this.data.files == null || this.data.files == undefined) {
              this.data['files'] = [];
              this.loadScript = true;
            }
         
          } catch (e) {
            this.loadScript = true;
            console.error('no attribute found in json[element0]', e);
          }
          
          this.uploader.onErrorItem = (item, response, status, headers) =>
            this.onErrorItem(item, response, status, headers);
          this.uploader.onSuccessItem = (item, response, status, headers) =>
            this.onSuccessItem(item, response, status, headers);
          this.getRelatedComponent();
        },
        error: (err) => {
          console.error('Error fetching streaming service:', err);
          this.service.message('Error! While fetching streaming service', 'error');
        },
        complete: () => {
          console.log('getStreamingServicesByName observable completed');
        }
      });
    }

 getRelatedComponent() {
    if (this.streamItem && this.streamItem.cid) {
      this.service
        .getRelatedComponent(this.streamItem.cid, 'PIPELINE')
        .subscribe({
          next: (res) => {
            if (res && res.length > 0) {
              console.log('Related components loaded:', res);
              // Handle related components if needed
            }
          },
          error: (err) => {
            console.error('Error fetching related components:', err);
          },
          complete: () => {
            console.log('getRelatedComponent observable completed');
          }
        });
    }
  }

   refreshTree() {
    // Implementation for tree refresh if needed
    console.log('Tree refreshed');
  }
    
  onSuccessItem(
    item: FileItem,
    response: string,
    status: number,
    headers: ParsedResponseHeaders
  ): any {
   
  }

  onErrorItem(
    item: FileItem,
    response: string,
    status: number,
    headers: ParsedResponseHeaders
  ): any {
    
  }
    

    readFile(filename: string) {
    this.service
      .readNativeFile(
        this.streamItem.name,
        this.streamItem.organization,
        filename
      )
      .subscribe({
        next: (resp) => {
          // script file to list
          console.log('File read response:', resp);
            this.service.message('Reading file done', resp);
          try {
            const textDecoder = new TextDecoder('utf-8');
            this.script = textDecoder.decode(resp).split('\n');
            this.loadScript = true;
          } catch (e) {
            console.error('Error decoding file:', e);
            this.service.message('Error decoding file', 'error');
          }
        },
        error: (err) => {
          console.error('Error while reading file:', err);
          this.service.message('Error! While reading file', 'error');
        },
        complete: () => {
          console.log('readNativeFile observable completed');
        }
      });
  }

  navigateBack(): void {

      this.location.back();
    
  }
}
