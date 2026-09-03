import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '@essedum/shared-lib';
import { Services } from '@essedum/shared-lib';
import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
@Component({
    selector: 'app-model-description',
    templateUrl: './model.description.component.html',
    styleUrls: ['./model.description.component.scss'],
    standalone: false
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
  initiativeView: boolean;
  id: string = this.route.snapshot.paramMap.get('id');
  
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
      (error) => { }
    );
  }

  ngOnInit() {
    this.router.url.includes('initiative')
      ? (this.initiativeView = false)
      : (this.initiativeView = true);
    this.getpermissions();
    if (!this.id) {
      this.id = this.initiativeData.sourceName;
    }
    let params: HttpParams = new HttpParams();
    params = params.set('modelid', this.id);
    params = params.set('project', this.organisation);
    this.service.getModelBySourceId(params).subscribe((res) => {
      this.card = res;
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
              this.service.message(
                'Done!  Model deleted Successfully '
              );
            },
            (error) => {
              this.service.message('Error deleting model ' + error, 'error');
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

  downloadModel(card: any) {
    const attrs = typeof card.attributes === 'string' ? JSON.parse(card.attributes) : (card.attributes || {});
    const obj: string = attrs.object || '';
    const path: string = attrs.path || '';
    const extension = obj.split('.').pop() || '';
    // Backend fileData endpoint resolves against path/object inside the bucket, not just the
    // bare object name — sending only "mock_data.csv" makes it return `[null]`.
    const fileName = (path && obj) ? `${path}/${obj}` : obj;
    if (extension.match('mkv')) {
      this.service.messageService('This file cannot be downloaded currently');
      return;
    }
    this.service.messageNotificaionService('success', 'Download initiated');
    this.service
      .getModelFileData(card.modelName, `${fileName}`, card.organisation)
      .subscribe(async (blob: Blob) => {
        if (!blob || blob.size === 0) {
          this.service.message('Download Failed. File not found on the server.', 'error');
          return;
        }
        // Guard against the backend's "[null]" JSON-array-of-null response being wrapped as a blob.
        if (blob.size < 64) {
          try {
            const text = (await blob.text()).trim();
            if (!text || text === 'null' || text === '[null]' || text === '[]') {
              this.service.message('Download Failed. File not found on the server.', 'error');
              return;
            }
          } catch { /* fall through to actual download */ }
        }
        const linkA = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        linkA.href = url;
        linkA.download = obj || fileName;
        linkA.click();
        window.URL.revokeObjectURL(url);
      },
      err => {
        this.service.message('Download Failed. ' + (err?.message || 'Invalid Data'), 'error');
      });
  }

  getFormattedModelPath(card: any): string {
    try {
      if (card.attributes) {
        const attributes =
          typeof card.attributes === 'string'
            ? JSON.parse(card.attributes)
            : card.attributes;

        if (attributes.bucket && attributes.path && attributes.object) {
          return `${attributes.bucket}/${attributes.path}/${attributes.object}`;
        }
      }

      return card.artifacts || 'N/A';
    } catch (error) {
      console.error('Error parsing attributes:', error);
      return card.artifacts || 'N/A';
    }
  }

  editModel(card: any) {
    this.router.navigate(['/model/edit-model', card.id], {
      queryParams: { org: this.organisation }
    });
  }
}
