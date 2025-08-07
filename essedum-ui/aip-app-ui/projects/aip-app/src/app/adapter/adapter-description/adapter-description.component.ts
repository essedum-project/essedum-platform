import { Component, Input } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AdapterServices } from '../../sharedModule/services/adapter-service';
import { Services } from '../../services/service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { Location } from '@angular/common';
import { AipDeleteConfirmationComponent } from '../../sharedModule/aip-delete-confirmation/aip-delete-confirmation.component';

@Component({
  selector: 'app-adapter-description',
  templateUrl: './adapter-description.component.html',
  styleUrls: ['./adapter-description.component.scss'],
})
export class AdapterDescriptionComponent {
  readonly CARD_TITLE = 'Implementation';

  @Input() card: any;
  @Input() cardToggled: boolean = false;

  edit: string = 'Edit';
  delete: string = 'Delete';
  isBackHovered: boolean = false;
  tooltipPosition: string = 'above';
  editAuth: boolean;
  deleteAuth: boolean;
  back: string = 'Back';
  entity: string = 'model';
  editAction: string = 'edit';
  basicReqTab: any = 'detailsTab';
  isAdapter: string = 'yes';
  byroute: boolean = false;
  relatedInstancesList = [];
  relatedInstances: OptionsDTO[] = [];
  nonrelatedInstances: OptionsDTO[] = [];
  relatedAdapters: OptionsDTO[] = [];
  relatedSpecs: OptionsDTO[] = [];
  relatedChains: OptionsDTO[] = [];
  relatedConnections: OptionsDTO[] = [];
  showRelatedInstances: boolean = true;
  allChains: any;

  constructor(
    private dialogRef: MatDialogRef<AdapterDescriptionComponent>,
    private dialog: MatDialog,
    private adapterServices: AdapterServices,
    private service: Services,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}
  @Output() newItemEvent = new EventEmitter<boolean>();

  ngOnInit() {
    this.service.getPermission('cip').subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes('adapter-edit')) {
          this.editAuth = true;
        }
        if (cipAuthority.includes('adapter-delete')) {
          this.deleteAuth = true;
        }
      },
      (error) => {
        console.log(
          `error when calling getPermission method. Error Details:${error}`
        );
      }
    );
    this.adapterServices
      .getAdapteByNameAndOrganization(this.route.snapshot.params.adapter)
      .subscribe((resp) => {
        this.card = resp;
        if (this.card.isChain) {
          this.filterChains(this.card.chainName);
        }
        let timezoneOffset = new Date().getTimezoneOffset();
        this.card.createdon = new Date(
          new Date(this.card.createdon).getTime() - timezoneOffset * 60 * 1000
        );
        this.fethchRelatedInstances(this.card.name);
        this.fetchRelatedConnections(this.card);
      });
  }

  fetchRelatedConnections(card: any) {
    this.relatedConnections.push(
      new OptionsDTO('Connection', card.connectionname)
    );
  }

  fethchRelatedInstances(adapterName) {
    this.adapterServices
      .getMlInstanceNamesByAdapterNameAndOrganization(adapterName)
      .subscribe((resp) => {
        if (resp) {
          this.relatedInstancesList = resp;
          resp.forEach((insName) => {
            this.relatedInstances.push(new OptionsDTO('Instance', insName));
          });
        }
      });
    this.fethchAllSpecTemplateNamesByOrg();
  }

  fethchAllSpecTemplateNamesByOrg() {
    this.adapterServices
      .getSpecTemplateNamesByOrganization()
      .subscribe((resp) => {
        if (resp) {
          resp.forEach((specName) => {
            if (specName === this.card.spectemplatedomainname)
              this.relatedSpecs.push(new OptionsDTO('Spec', specName));
          });
        }
      });
  }

  openModal(content: any): void {
    this.dialog.open(content, {
      width: '600px',
      panelClass: 'standard-dialog',
    });
  }

  toggler() {
    this.location.back();
  }

  getShortName(fullName: string) {
    return fullName?.charAt(0)?.toUpperCase();
  }

  deleteAdapter(adapterName: string) {
    const dialogRef = this.dialog.open(AipDeleteConfirmationComponent, {
      width: '360px',
      panelClass: 'standard-dialog',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.adapterServices.deleteAdapter(adapterName).subscribe(
          (res) => {
            if (res) {
              if (res.message == 'success') {
                this.adapterServices.messageNotificaionService(
                  'success',
                  'Done!  Implementation Deleted Successfully'
                );
                this.toggler();
              } else
                this.adapterServices.messageNotificaionService(
                  'warning',
                  "Implementation Can't be Deleted, It's being used by instance(s)"
                );
            } else
              this.adapterServices.messageNotificaionService('error', 'Error');
          },
          (error) => {
            this.service.messageService(error);
          }
        );
      }
    });
  }

  closeAdapterPopup() {
    this.dialogRef.close();
  }

  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = 'detailsTab';
        break;
      case 1:
        this.basicReqTab = 'swaggerTab';
        break;
    }
  }

  listToggle() {
    this.showRelatedInstances = !this.showRelatedInstances;
  }

  redirectToSelectedComponent(component: any) {
    if (component.viewValue == 'Instance')
      this.router.navigate(['../../instances/' + component.value], {
        relativeTo: this.route,
      });
    else if (component.viewValue == 'Spec')
      this.router.navigate(['../../specs/' + component.value], {
        relativeTo: this.route,
      });
    else if (component.viewValue == 'Chain') {
      this.allChains.forEach((chain) => {
        if (chain.alias === component.value) {
          var route = '../../chain-list/view/';
          if (chain.type !== 'NativeScript') {
            route += 'drgndrp/';
          }
          const navigationExtras: NavigationExtras = {
            state: {
              cardTitle: 'Pipeline',
              pipelineAlias: chain.alias,
              streamItem: chain,
              card: chain,
            },
            relativeTo: this.route,
          };
          this.router.navigate([route + chain.name], navigationExtras);
        }
      });
    } else if (component.viewValue == 'Connection') {
      this.router.navigate(
        ['../../connections/view/' + this.card.connectionid, true],
        { relativeTo: this.route }
      );
    } else
      this.router.navigate(['../../implementations/' + component.value], {
        relativeTo: this.route,
      });
  }

  fethchAllInstanceNamesByOrg() {
    this.adapterServices
      .getMlInstanceNamesByOrganization()
      .subscribe((respMlIns: any) => {
        respMlIns.forEach((insName) => {
          if (!this.relatedInstancesList.includes(insName))
            this.nonrelatedInstances.push(new OptionsDTO('Instance', insName));
        });
      });
  }

  fethchAllAdapterNamesByOrg() {
    this.adapterServices
      .getAdapterNamesByOrganization()
      .subscribe((respAdp) => {
        if (respAdp) {
          respAdp.forEach((adpName) => {
            if (adpName != this.card.name)
              this.relatedAdapters.push(
                new OptionsDTO('Implementation', adpName)
              );
          });
        }
      });
  }

  filterChains(chainName): void {
    this.service.getallPipelinesByOrg().subscribe((res) => {
      var chains = res;
      this.allChains = res;
      this.allChains.filter((chain) => chain.interfacetype === 'chain');
      chains.forEach((chain) => {
        if (chain.name === chainName) {
          console.log(chainName);
          this.relatedChains.push(new OptionsDTO('Chain', chain.alias));
        }
      });
    });
  }
}
