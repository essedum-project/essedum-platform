import { Component, Input } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdapterServices } from '../../sharedModule/services/adapter-service';
import { Services } from '../../services/service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { Location } from '@angular/common';
import { AipDeleteConfirmationComponent } from '../../sharedModule/aip-delete-confirmation/aip-delete-confirmation.component';

@Component({
  selector: 'app-instance-description',
  templateUrl: './instance-description.component.html',
  styleUrls: ['./instance-description.component.scss'],
})
export class InstanceDescriptionComponent {
  readonly CARD_TITLE = 'Instance';
  @Input() card: any;
  @Input() cardToggled: boolean = false;

  edit: string = 'Edit';
  delete: string = 'Delete';
  tooltipPosition: string = 'above';
  editAuth: boolean;
  deleteAuth: boolean;
  back: string = 'Back';
  isBackHovered: boolean = false;
  editAction: string = 'edit';
  basicReqTab: any = 'detailsTab';
  isAdapter: string = 'no';
  byroute: boolean = false;
  relatedInstancesList = [];
  similarInstances: OptionsDTO[] = [];
  relatedInstances: OptionsDTO[] = [];
  relatedSpecs: OptionsDTO[] = [];
  relatedChains: OptionsDTO[] = [];
  relatedAdapters: OptionsDTO[] = [];
  relatedConnections: OptionsDTO[] = [];
  showRelatedInstances: boolean = true;
  allChains: any;

  constructor(
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
        if (cipAuthority.includes('instance-edit')) {
          this.editAuth = true;
        }
        if (cipAuthority.includes('instance-delete')) {
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
      .getInstanceByNameAndOrganization(this.route.snapshot.params.instance)
      .subscribe((resp) => {
        this.card = resp;
        let timezoneOffset = new Date().getTimezoneOffset();
        this.card.createdon = new Date(
          new Date(this.card.createdon).getTime() - timezoneOffset * 60 * 1000
        );
        this.fethchRelatedInstances(this.card.adaptername);
        this.fetchRelatedConnections(this.card);
      });
  }

  fetchRelatedConnections(card: any) {
    this.relatedConnections.push(
      new OptionsDTO('Connection', card.connectionname)
    );
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

  deleteInstance(instanceName: string) {
    const dialogRef = this.dialog.open(AipDeleteConfirmationComponent, {
      width: '360px',
      panelClass: 'standard-dialog',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.adapterServices.deleteInstance(instanceName).subscribe(
          (res) => {
            if (res) {
              if (res.message == 'success')
                this.adapterServices.messageNotificaionService(
                  'success',
                  'Done!  Instance Deleted Successfully'
                );
              else
                this.adapterServices.messageNotificaionService(
                  'warning',
                  "Instance Can't be Deleted"
                );
            } else
              this.adapterServices.messageNotificaionService('error', 'Error');
            this.toggler();
          },
          (error) => {
            this.service.messageService(error);
          }
        );
      }
    });
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

  fethchRelatedInstances(adapterName) {
    this.adapterServices
      .getMlInstanceNamesByAdapterNameAndOrganization(adapterName)
      .subscribe((resp) => {
        this.relatedInstancesList = resp;
        const index = this.relatedInstancesList.indexOf(this.card.name);
        if (index !== -1) {
          this.relatedInstancesList.splice(index, 1);
        }
        this.relatedInstancesList.forEach((insName) => {
          this.similarInstances.push(new OptionsDTO('Instance', insName));
        });
        this.adapterServices
          .getMlInstanceNamesByOrganization()
          .subscribe((respMlIns: any) => {
            respMlIns.forEach((insName) => {
              if (
                !this.relatedInstancesList.includes(insName) &&
                insName != this.card.name
              )
                this.relatedInstances.push(new OptionsDTO('Instance', insName));
            });
          });
      });
    this.fethchAllSpecTemplateNamesByOrg();
    this.fethchAllAdapterNamesByOrg();
  }

  fethchAllSpecTemplateNamesByOrg() {
    this.adapterServices
      .getSpecTemplateNamesByOrganization()
      .subscribe((respSpec) => {
        if (respSpec) {
          respSpec.forEach((specName) => {
            if (specName === this.card.spectemplatedomainname)
              this.relatedSpecs.push(new OptionsDTO('Spec', specName));
          });
        }
      });
  }

  fethchAllAdapterNamesByOrg() {
    this.adapterServices
      .getAdapterNamesByOrganization()
      .subscribe((respAdp) => {
        if (respAdp) {
          respAdp.forEach((adpName) => {
            if (adpName === this.card.adaptername) {
              this.relatedAdapters.push(
                new OptionsDTO('Implementation', adpName)
              );
              this.adapterServices
                .getAdapteByNameAndOrganization(adpName)
                .subscribe((resp) => {
                  if (resp.isChain) {
                    this.filterChains(resp.chainName);
                  }
                });
            }
          });
        }
      });
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
