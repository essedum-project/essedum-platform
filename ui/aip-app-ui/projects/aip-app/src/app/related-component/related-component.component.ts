import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LedsModalService } from 'leds-lib';
import { Services } from '../services/service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
@Component({
  selector: 'app-related-component',
  templateUrl: './related-component.component.html',
  styleUrls: ['./related-component.component.scss'],
})
export class RelatedComponentComponent implements OnInit {
  @Input() component: any;
  @Input() childId?: any;
  @Input() parentType: any;
  @Output() reload = new EventEmitter<boolean>();
  unlinkComponent: boolean = false;
  constructor(
    private modalService: LedsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private dialog: MatDialog
  ) { }
  ngOnInit(): void {
    console.log(this.component);

    this.service.getPermission("cip").subscribe((cipAuthority) => {
      if (
        cipAuthority.includes('unlink-component')
      )
        this.unlinkComponent = true;
    }, (error) => {
      console.log(`error when calling getPermission method. Error Details:${error}`);
    });
  }
  open(content: any): void {
    this.modalService.openModal(content, 'standard');
  }
  related(relatedData: any) {
    if (this.router.url.includes('preview')) {
      if (relatedData.type == 'PIPELINE') {
        this.service.getStreamingServices(relatedData.id).subscribe((res) => {
          let streamItem = res;
          const navigationExtras: NavigationExtras = {
            state: {
              cardTitle: 'Pipeline',
              pipelineAlias: streamItem.alias,
              streamItem: streamItem,
              card: relatedData,
            },
            relativeTo: this.route,
          };
          if (streamItem.type === 'NativeScript') {
            this.router.navigate(
              ['../../../pipelines/view' + '/' + streamItem.name],
              navigationExtras
            );
          } else {
            this.router.navigate(
              ['../../../pipelines/view/drgndrp' + '/' + streamItem.name],
              navigationExtras
            );
          }
        });
      } else if (relatedData.type == 'FEATURESTORE') {
        this.router.navigate(
          [
            '../../../' +
            relatedData.type.toLowerCase() +
            '/preview/' +
            relatedData.alias,

          ],
          {
            state: {
              relatedData,
            },
            relativeTo: this.route,
          }
        );
      }
      else {
        this.router.navigate(
          [
            '../../../' +
            relatedData.type.toLowerCase() +
            's/preview/' +
            relatedData.alias,
          ],
          {
            state: {
              relatedData,
            },
            relativeTo: this.route,
          }
        );
      }
    }
    else if (this.router.url.includes('app')) {
      if (relatedData.type == 'PIPELINE') {
        this.service.getStreamingServices(relatedData.id).subscribe((res) => {
          let streamItem = res;
          const navigationExtras: NavigationExtras = {
            state: {
              cardTitle: 'Pipeline',
              pipelineAlias: streamItem.alias,
              streamItem: streamItem,
              card: relatedData,
            },
            relativeTo: this.route,
          };
          if (streamItem.type === 'NativeScript') {
            this.router.navigate(
              ['../../../pipelines/view' + '/' + streamItem.name],
              navigationExtras
            );
          } else {
            this.router.navigate(
              ['../../../pipelines/view/drgndrp' + '/' + streamItem.name],
              navigationExtras
            );
          }
        });
      } else if (relatedData.type == 'FEATURESTORE') {
        this.router.navigate(
          [
            '../../../' +
            relatedData.type.toLowerCase() +
            '/preview/' +
            relatedData.alias,

          ],
          {
            state: {
              relatedData,
            },
            relativeTo: this.route,
          }
        );
      }
      else {
        this.router.navigate(
          [
            '../../../' +
            relatedData.type.toLowerCase() +
            's/preview/' +
            relatedData.alias,
          ],
          {
            state: {
              relatedData,
            },
            relativeTo: this.route,
          }
        );
      }
    }
    else if (this.router.url.includes('pipelines/view') || this.router.url.includes('chain-list')) {
      let viewType = "view";
      if (relatedData.type == 'MODEL' || relatedData.type == 'ENDPOINT' || relatedData.type == 'CONNECTION') {
        viewType = "preview";
      }
      else if (relatedData.data.type == 'DragNDropLite') {
        viewType += "/drgndrp";
      }
      if (!this.router.url.includes('drgndrp')) {

        this.router.navigate(
          [
            '../../../' +
            relatedData.type.toLowerCase() +
            's/' + viewType + '/' +
            relatedData.data.name,
          ],
          {
            state: {
              relatedData,
            },
            relativeTo: this.route,
          }
        );

      }
      else {
        this.router.navigate(
          [
            '../../../../' +
            relatedData.type.toLowerCase() +
            's/' + viewType + '/' +
            relatedData.data.name,
          ],
          {
            state: {
              relatedData,
            },
            relativeTo: this.route,
          }
        );
      }
    }

    else {
      this.router.navigate(
        [
          '../' +
          relatedData.type.toLowerCase() +
          's/preview/' +
          relatedData.alias,
        ],
        {
          state: {
            relatedData,
          },
          relativeTo: this.route,
        }
      );
    }
  }
  unlink(data: any) {
    let body = {};
    body['childId'] = data.id;
    body['childType'] = data.type;
    body['parentId'] = this.childId;
    body['parentType'] = this.parentType;
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.service.removelinkage(body).subscribe(
          (res) => {
            console.log(res + 'unlinkage done');
            if (res.status == 200) {
              this.reload.emit(true);
            }
          },
          (error) => {
            this.service.messageService(error);
          }
        );
      }
    });
  }
}
