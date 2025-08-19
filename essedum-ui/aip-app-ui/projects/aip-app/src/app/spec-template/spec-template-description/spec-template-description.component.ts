import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { AdapterServices } from '../../sharedModule/services/adapter-service';
import { MatDialog } from '@angular/material/dialog';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { Services } from '../../services/service';
import { Location } from '@angular/common';
import { AipDeleteConfirmationComponent } from '../../sharedModule/aip-delete-confirmation/aip-delete-confirmation.component';

@Component({
  selector: 'app-spec-template-description',
  templateUrl: './spec-template-description.component.html',
  styleUrls: ['./spec-template-description.component.scss'],
})
export class SpecTemplateDescriptionComponent implements OnInit {
  @Input() cardTitle: String = 'Spec';
  @Input() cardToggled: boolean = false;
  @Input() domainName: string;
  @Input() card: any;
  editorOptions = new JsonEditorOptions();
  isAdapter = 'yes';
  edit: string = 'Edit';
  delete: string = 'Delete';
  expand: string = 'Expand';
  collapse: string = 'Collapse';
  isBackHovered: boolean = false;
  tooltipPosition: string = 'above';
  relatedAdapters: OptionsDTO[] = [];
  relatedAdaptersList = [];
  nonrelatedAdapters: OptionsDTO[] = [];
  relatedSpecs: OptionsDTO[] = [];
  relatedInstances: OptionsDTO[] = [];
  showRelatedAdapters: boolean = true;
  apispec: any;
  @ViewChild('formJsonEditor', { static: false })
  formJsonEditor: JsonEditorComponent;

  basicReqTab: any = 'detailsTab';
  editAuth: boolean;
  deleteAuth: boolean;
  byroute: boolean = false;
  priorityMapIns: { [name: string]: number } = {};
  nOfIns: number = 0;
  executionRequired: Boolean = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adapterService: AdapterServices,
    private dialog: MatDialog,
    private service: Services,
    private location: Location
  ) {}

  @Output() newItemEvent = new EventEmitter<boolean>();

  ngOnInit() {
    this.nOfIns = 0;
    this.executionRequired = false;
    this.relatedAdapters = [];
    this.relatedAdaptersList = [];
    this.relatedInstances = [];
    this.priorityMapIns = {};
    this.service.getPermission('cip').subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes('spectemplate-edit')) {
          this.editAuth = true;
        }
        if (cipAuthority.includes('spectemplate-delete')) {
          this.deleteAuth = true;
        }
      },
      (error) => {
        console.log(
          `error when calling getPermission method. Error Details:${error}`
        );
      }
    );
    this.editorOptions.modes = ['text', 'tree', 'view'];
    this.editorOptions.statusBar = true;
    this.editorOptions.enableSort = false;
    this.editorOptions.enableTransform = false;
    this.editorOptions.onChange = () => {
      this.apispec = this.formJsonEditor.get();
    };

    this.domainName = this.route.snapshot.params.cname;
    this.findRelatedAdapters(this.domainName);
    this.findRelatedInstances(this.domainName);
    this.adapterService
      .fetchApiSpecTemplate(
        this.route.snapshot.params.cname,
        sessionStorage.getItem('organization')
      )
      .subscribe((resp: any) => {
        this.card = resp;
        if (
          this.card &&
          this.card.apispectemplate &&
          this.card.apispectemplate.includes('adapters/v1')
        ) {
          this.executionRequired = true;
        }
        let timezoneOffset = new Date().getTimezoneOffset();
        this.card.createdon = new Date(
          new Date(this.card.createdon).getTime() - timezoneOffset * 60 * 1000
        );
      });
  }

  findRelatedAdapters(dName) {
    this.adapterService
      .getAdaptersBySpectempdomainname(dName)
      .subscribe((resp: any) => {
        resp.forEach((res) => {
          this.relatedAdapters.push(new OptionsDTO('Implementation', res.name));
          this.relatedAdaptersList.push(res.name);
        });
      });
  }

  findRelatedInstances(dName) {
    this.adapterService
      .getInstancesBySpectempdomainname(dName)
      .subscribe((resp: any) => {
        if (resp && typeof resp === 'object') {
          this.nOfIns = resp.length;
        }
        resp.forEach((res) => {
          this.relatedInstances.push(new OptionsDTO('Instance', res.name));
          this.priorityMapIns[res.name] = res.orderpriority;
        });
      });
  }

  openModal(content: any): void {
    this.dialog.open(content, {
      width: '600px',
      panelClass: 'standard-dialog',
    });
  }
  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = 'detailsTab';
        break;
      case 1:
        this.basicReqTab = 'swaggerViewTab';
        break;
    }
  }
  toggler() {
    // this.router.navigate(["../"], { relativeTo: this.route })
    this.location.back();
  }
  routeBackToModelList() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  redirectToEdit() {
    this.router.navigate(['../edit/' + this.domainName], {
      relativeTo: this.route,
    });
  }

  getShortName(fullName: string) {
    return fullName.charAt(0).toUpperCase();
  }

  redirectToSelectedComponent(component) {
    if (component.viewValue == 'Instance')
      this.router.navigate(['../../instances/' + component.value], {
        relativeTo: this.route,
      });
    else if (component.viewValue == 'Spec')
      this.router.navigate(['../../specs/' + component.value], {
        relativeTo: this.route,
      });
    else
      this.router.navigate(['../../implementations/' + component.value], {
        relativeTo: this.route,
      });
  }

  deleteSpecTemplate(domainName: any) {
    const dialogRef = this.dialog.open(AipDeleteConfirmationComponent, {
      width: '360px',
      panelClass: 'standard-dialog',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.adapterService
          .deleteApiSpecTemplate(
            domainName,
            sessionStorage.getItem('organization')
          )
          .subscribe(
            (res) => {
              this.adapterService.messageService(
                res,
                'Spec Deleted Successfully'
              );
              this.toggler();
            },
            (error) => {
              this.adapterService.messageService(error);
            }
          );
      }
    });
  }

  listToggle() {
    this.showRelatedAdapters = !this.showRelatedAdapters;
  }

  fethchAllAdapterNamesByOrg() {
    this.adapterService.getAdapterNamesByOrganization().subscribe((respAdp) => {
      if (respAdp) {
        respAdp.forEach((adpName) => {
          if (!this.relatedAdaptersList.includes(adpName))
            this.nonrelatedAdapters.push(
              new OptionsDTO('Implementation', adpName)
            );
        });
      }
    });
  }

  fethchAllSpecTemplateNamesByOrg() {
    this.adapterService
      .getSpecTemplateNamesByOrganization()
      .subscribe((respSpec) => {
        if (respSpec) {
          respSpec.forEach((specName) => {
            if (specName != this.domainName)
              this.relatedSpecs.push(new OptionsDTO('Spec', specName));
          });
        }
      });
  }

  fethchAllInstanceNamesByOrg() {
    this.adapterService
      .getMlInstanceNamesByOrganization()
      .subscribe((respMlIns: any) => {
        respMlIns.forEach((insName) => {
          this.relatedInstances.push(new OptionsDTO('Instance', insName));
        });
      });
  }

  setDefault(component) {
    this.adapterService
      .changePriorityBySpecTemDomNameAndInstancNameAndOrg(
        this.domainName,
        component.value,
        1,
        sessionStorage.getItem('organization')
      )
      .subscribe((resp: any) => {
        if (resp && typeof resp === 'object') {
          this.ngOnInit();
        }
      });
  }

  changePriority(event, component) {
    this.adapterService
      .changePriorityBySpecTemDomNameAndInstancNameAndOrg(
        this.domainName,
        component.value,
        event.target.value,
        sessionStorage.getItem('organization')
      )
      .subscribe((resp: any) => {
        if (resp && typeof resp === 'object') {
          this.ngOnInit();
        }
      });
  }
}
