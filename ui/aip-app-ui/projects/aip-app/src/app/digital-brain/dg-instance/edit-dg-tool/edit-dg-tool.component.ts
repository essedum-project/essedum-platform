import { LocationStrategy } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsModalService } from 'leds-lib';
import { Services } from '../../../services/service';

@Component({
  selector: 'app-edit-dg-tool',
  templateUrl: './edit-dg-tool.component.html',
  styleUrls: ['./edit-dg-tool.component.scss']
})
export class EditDgToolComponent {
  data: any = {};
  keys: any;
  values: any;
  cardTitle = 'Edit Thoughts';
  capKeys: any;
  appId: any;
  appModifiedBy: any;
  showIcon:boolean = true;
  resizeing:boolean =true;
  loadScript: boolean = false;
  script: any[] = [];
  lang: string = "python";
  tooltipPoition: string='above';
  classNames = [];
  classRegex:any;
  fileType='Python';
  //updatedScript:any;
  constructor(
    private service: Services,
    private modalService: LedsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private location: LocationStrategy
  ) { }
  maximize() {
    this.resizeing=!this.resizeing;
    this.showIcon = !this.showIcon
  }
  minimize() {
    this.resizeing=!this.resizeing;
    this.showIcon = !this.showIcon
  }
  ngOnInit(): void {
    this.getData();
    let cards = this.location.getState();
    this.data = cards['card'];
    this.appId = this.data.appId;

    let data: any;
    data = sessionStorage.getItem('user');
    this.appModifiedBy = JSON.parse(data).user_f_name;
    this.data.modifiedBy = this.appModifiedBy;
    this.capKeys = [];
    console.log(this.data, 'data');
    this.keys = Object.keys(this.data);
    this.keys.forEach((element) => {
      element = element.split(/(?=[A-Z])/).join(' ');
      this.capKeys.push(element);
      //console.log(element, 'element');
    });
    this.values = Object.values(this.data);
    
  }
  routeBackToToolList() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
  onScriptChange($event) {
    this.script = $event;
    console.log('scriptChange', this.script);

  }
  getData() {
    this.service.loadFile().subscribe((res) => {
      console.log('code', res);
      const textEncoder = new TextEncoder();
      const data = textEncoder.encode(res.body);
      const textDecoder = new TextDecoder('utf-8');
      this.script = textDecoder.decode(data).split('\\r\\n');
      console.log('scrip', this.script);
      this.loadScript = true;
    })
  }


  updateDGTool() {
  //  this.updatedScript = this.script.join('\\r\\n');
  const formData :FormData = new FormData();
  let script = this.script.join('\n\r');
  let scriptFile = new Blob([script],{type:'text/plain'});
  formData.set('scriptFile',scriptFile);
    console.log('script',this.script);    
    this.data.keys = this.keys;
    this.modalService.dismissAll('close the modal');
    this.service.updateDgTool(this.data, formData,this.appId,this.fileType).subscribe(
      (resp) => {
        console.log(resp);
        this.service.messageService(resp, 'Done! Thoughts is updated.');
        this.routeBackToToolList();
      },
      (error) => {
        this.service.messageService(error);
      }
    );
  }


}
