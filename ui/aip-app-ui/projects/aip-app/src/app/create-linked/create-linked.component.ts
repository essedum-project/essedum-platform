import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Services } from '../services/service';
import { LedsModalService } from 'leds-lib';
import { __values } from 'tslib';
import { LeapTelemetryService } from 'com-lib-util';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LedsLibService } from 'leds-lib';
import { RaiservicesService } from '../services/raiservices.service';

@Component({
  selector: 'app-create-linked',
  templateUrl: './create-linked.component.html',
  styleUrls: ['./create-linked.component.scss'],
})
export class CreateLinkedComponent implements OnInit, OnDestroy {
  @Input() data: any;
  @Input() type: any;
  @Input() component: any;
  @Output() refeshrelated = new EventEmitter<boolean>();
  size: number = 9;
  page: number = 0;
  search: any = '';
  showSpinner: boolean = false;
  linking: boolean = false;
  protected subscriptions: Subscription[] = [];
  cancelling: boolean;
  lastIndex: number;
  constructor(
    private telemetryService: LeapTelemetryService,
    private service: Services,
    private modalService: LedsModalService,
    private cdref: ChangeDetectorRef,
    private ledsLibService: LedsLibService,
    private raiservice:RaiservicesService
  ) {}
  resultObserver: any;
  selectedCards: any[] = [];
  groupData: { [key: string]: any[] } = {};
  relatedbody: any = [];
  added: boolean = false;
  groupkey: any[] = [];
  renderKey: any = 'MODEL';
  dismiss() {
    this.modalService.dismissAll('close the modal');
  }
  ngOnInit() {
    this.showSpinner = true;
    console.log(this.component);

    const subscription = this.service
      .getCommonSearchData(this.size, this.page, this.search)
      .subscribe({
        next: (val) => {
          this.resultObserver = val;
          if (this.resultObserver.length > 0) {
            if (!this.groupData[this.resultObserver[0].type]) {
              this.groupData[this.resultObserver[0].type] = [];
            }
            let relateddeifned = this.component.filter(
              (element: any) =>
                element.id == this.resultObserver[0].id &&
                element.type == this.resultObserver[0].type
            );
            if (
              this.resultObserver[0].id == this.data &&
              this.resultObserver[0].type == this.type
            ) {
              console.warn('same data');
            } else {
              if (relateddeifned.length > 0) {
                this.groupData[this.resultObserver[0].type].push({
                  data: this.resultObserver[0],
                  status: true,
                  linked: true,
                });
              } else {
                this.groupData[this.resultObserver[0].type].push({
                  data: this.resultObserver[0],
                  status: false,
                  linked: false,
                });
              }
            }
            // this.component.forEach((element:any) => {
            //   if(element.id==this.resultObserver[0].id && element.type==this.resultObserver[0].type){
            //     this.groupData[this.resultObserver[0].type].push(
            //       {data:this.resultObserver[0],status:true}
            //     );
            //   }else{
            //     this.groupData[this.resultObserver[0].type].push(
            //       {data:this.resultObserver[0],status:false}
            //     );
            //   }
            // });
            // this.groupData[this.resultObserver[0].type].push(
            //   {data:this.resultObserver[0],status:false}

            // );
            this.groupkey = Object.keys(this.groupData);
            this.cdref.detectChanges();
            // let datafiliter=this.groupData[this.type].filter((element:any)=>element.data.id==this.data.id);
            // this.selectedCards.push({data:this.resultObserver[0],status:false});
          }
        },
        error: (err) => {
          console.log(err);
        },
        complete: () => {
          console.log('complete');
          this.showSpinner = false;
        },
      });

    this.subscriptions.push(subscription);
  }
  render(keys: any) {
    this.renderKey = keys;
  }
  cancelAllRequests() {
    if (!this.subscriptions) {
      return;
    }
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.cancelling = false;
    this.subscriptions = [];
  }

  data_flux_type(type: any) {
    this.showSpinner = true;
    let page = Math.ceil(this.groupData[type].length / this.size + 1);
    this.service.commonSearchByType(type, this.size, page,this.search).subscribe({
      next: (val) => {
        if (this.resultObserver.length > 0) {
          this.resultObserver = val;
          this.groupData[this.resultObserver[0].type].push(
            // this.resultObserver[0]
            { data: this.resultObserver[0], status: false }
          );
        }
        this.cdref.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        console.log('complete');
        this.showSpinner = false;
        this.groupData[this.renderKey].forEach((element: any, index) => {
          if (element.data.id == null && element.data.alias == null) {
            this.lastIndex = index;
            console.log(this.lastIndex, 'this.lastIndex');
          }
        });
      },
    });
  }
  linked(result: any, key: any, i: any) {
    this.added = !this.added;
    this.groupData[key][i].status = !this.groupData[key][i].status;

    const index = this.selectedCards.indexOf(result.data);
    if (index == -1) {
      this.selectedCards.push(result.data);
    } else {
      this.selectedCards.splice(index, 1);
    }
    console.log(this.selectedCards, 'this.selectedCards');
  }
  createLinked() {
    this.linking = true;
    this.showSpinner = true;
    this.relatedbody = [];
    for (let i = 0; i < this.selectedCards.length; i++) {
      this.relatedbody.push({
        parentId: this.data,
        parentType: this.type,
        childId: this.selectedCards[i].id,
        childType: this.selectedCards[i].type,
      });
    }
    console.log(this.relatedbody, 'this.relatedbody');

    this.service.createlinkage(this.relatedbody).subscribe((val) => {
      this.showSpinner = false;
      console.log(Date.now(), val);
      // this.service.messageService(val, 'Relation Created.');
      if (val.status == 200) {
        this.service.message("Successful", 'success');
        this.modalService.dismissAll('close the modal');
      } else {
        this.service.message(val, 'error');
      }
      this.linking = false;
    });
    this.refeshrelated.emit(true);
    this.raiservice.changeData(true); 
  }
  changesOccur($event: any) {
    this.cancelling = true;

    this.page = 0;
    this.groupData = {};
    this.search = $event;
    this.groupData = {};
    this.search = $event;
    this.ngOnInit();
  }
  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
