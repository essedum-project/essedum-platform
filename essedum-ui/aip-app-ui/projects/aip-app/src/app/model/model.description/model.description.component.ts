import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  OnInit,
} from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { Services } from '../../services/service';
import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
@Component({
  selector: 'app-model-description',
  templateUrl: './model.description.component.html',
  styleUrls: ['./model.description.component.scss'],
})
export class ModelDescriptionComponent implements OnInit {
  @Input() initiativeData: any;
  card: any;
  @Input() cardToggled: boolean = false;
  parentType: string = 'MODEL';
  cardCreator: string;
  avatar: string;
  addTags: string = 'Add Tags to Model';
  edit: string = 'Edit';
  delete: string = 'Delete';
  tooltipPoition: string = 'above';
  editAuth: boolean;
  modelUnlink: boolean;
  deleteAuth: boolean;
  back: string = 'Back';
  entity: string = 'model';
  relatedComponent: any;
  tagAuth: boolean;
  linkAuth: boolean;
  component: any = [];
  relatedloaded: boolean = false;
  organisation: string;
  initiativeView: boolean ;
  sourceName: string = this.route.snapshot.paramMap.get('name');
  constructor(
    private clipboard: Clipboard,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private service: Services,
    private location: Location,
    private cdRef: ChangeDetectorRef
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params['org']) {
        this.organisation = params['org'];
      } else {
        this.organisation = sessionStorage.getItem('organization');
      }
    });
  }
  calledRelatedComponent = false;

  @Output() newItemEvent = new EventEmitter<boolean>();
  copyModel(artifacts: any) {
    this.clipboard.copy(artifacts);
    alert('Model Path Copied to Clipboard');
  }

  reload($event: any) {
    if ($event) {
      this.ngOnInit();
    }
  }
  unlink(data: any) {
    let body = {};
    body['childId'] = data.id;
    body['childType'] = data.type;
    body['parentId'] = this.card.id;
    body['parentType'] = this.parentType;
    this.service.removelinkage(body).subscribe(
      (res) => {
        console.log(res + 'unlinkage done');
        if (res.status == 200) {
          this.ngOnInit();
        }
      },
      (error) => {}
    );
  }
  ngOnInit() {
    this.router.url.includes('initiative')?this.initiativeView=false:this.initiativeView=true;
    this.getpermissions();
    if(!this.sourceName){
      this.sourceName = this.initiativeData.sourceName;
    }
    let params: HttpParams = new HttpParams();
    params = params.set('fed_Name', this.sourceName);
    params = params.set('org', this.organisation);
    this.service.getModelBySourceId(params).subscribe((res) => {
      this.card = res[0];
      this.getRelatedComponent();
    });

 
    if (this.card.createdBy) {
      this.cardCreator = this.card.createdBy.split('@')[0];
      this.avatar = this.cardCreator.charAt(0).toUpperCase();
    }
  }
  getRelatedComponent() {
    this.component = [];
    this.service.getRelatedComponent(this.card.id, 'MODEL').subscribe({
      next: (res) => {
 
        this.relatedComponent = res[0];
        this.relatedComponent.data = JSON.parse(this.relatedComponent.data);
        this.component.push(this.relatedComponent);
        this.cdRef.detectChanges();


      },
      complete() {
        console.log('completed');
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getpermissions() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      if (cipAuthority.includes('model-tag')) this.tagAuth = true;
      if (cipAuthority.includes('model-edit')) this.editAuth = true;
      if (cipAuthority.includes('model-delete')) this.deleteAuth = true;
      if (cipAuthority.includes('link-component')) this.linkAuth = true;
      if (cipAuthority.includes('model-unlink')) this.modelUnlink = true;
    });
  }
  openModal(content: any): void {
       this.dialog.open(content, { width: '600px', disableClose: false });
  }
  navigateBack() {
    this.location.back();
  }

  getShortName(fullName: string) {
    return fullName.charAt(0).toUpperCase();
  }
  redirection(card: any, type: string) {
    this.router.navigate(['../../' + type + '/' + card.name], {
      state: {
        card,
      },
      relativeTo: this.route,
    });
  }
  deleteModel(card) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.service
          .deleteModels(card.sourceId, card.adapterId, card.version)
          .subscribe(
            (res) => {
              this.service.messageService(
                res,
                'Done!  Model deleted Successfully'
              );
      
            },
            (error) => {
              this.service.messageService(error);
            }
          );
      }
    });
  }
  open(content: any): void {
    this.dialog.open(content, { width: '600px', disableClose: false });
  }
  refeshrelated(event: any) {
    if (event == true) {
      this.relatedloaded = false;
      setTimeout(() => {
        this.ngOnInit();
      }, 2000);
    }
  }
}
