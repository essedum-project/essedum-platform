import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdapterServices } from '../../sharedModule/services/adapter-service';
import { Services } from '../../services/service';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { NgModel, Validators } from '@angular/forms';
import { StreamingServices } from '../../streaming-services/streaming-service';
import { Location } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-instance-create-edit',
  templateUrl: './instance-create-edit.component.html',
  styleUrls: ['./instance-create-edit.component.scss'],
})
export class InstanceCreateEditComponent implements OnInit {
  readonly CARD_TITLE = 'Instances';
  @Input('data') data: any;
  @Input('action') action: any;
  @Output() triggereRefresh = new EventEmitter<any>();
  @ViewChild('nameRef') nameRef: NgModel;

  streamItem: StreamingServices;
  newCanvas: any;
  latest_job: boolean;
  chainName: any;
  runtimesForConnection: any;
  createAuth = false;
  listOfNames: string[] = [];
  regexPattern = `^(?!REX)[a-zA-Z0-9\_\-]+$`;
  regexPatterForEmptyNames = `^(?!www$)[a-zA-Z0-9\_\-]+$`;
  regexPatternString: any;
  regexPatternObj: any;
  nameValidator: any;
  regString: string = '';
  regexPatternForExistingNames = `^(?!REX).+$`;
  regexPatternForValidAlphabets = `^[a-zA-Z0-9\_\-]+$`;
  regexPatternForExistingNamesObj: any;
  regexPatternForValidAlphabetsObj: any;
  nameFlag: boolean = false;
  errMsgFlag: boolean = true;
  datasourcesForConnection: any;
  adapters: any;
  mlInstances: any;
  connectionOptions: OptionsDTO[] = [];
  adaptersOptions: OptionsDTO[] = [];
  runtimeOptions: OptionsDTO[] = [];
  errMsg: string = 'Name is required field.';
  selectedConnection: any;
  routeToHome: boolean = false;
  connectionPromise: Promise<boolean>;
  org: any;

  constructor(
    private dialogRef: MatDialogRef<InstanceCreateEditComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private adapterServices: AdapterServices,
    private service: Services
  ) { }

  ngOnInit(): void {
    this.org = sessionStorage.getItem('organization');
    this.authentications();
    this.findAllAdapters();
    this.findalldatasourcesForConnection();
    this.findAllInstances();
    if (!this.data) {
      this.action = 'create';
      this.routeToHome = true;
      this.findAllInstances();
      this.data = {
        name: '',
        organization: sessionStorage.getItem('organization'),
        connectionname: '',
        connectionid: '',
        createdby: JSON.parse(sessionStorage.getItem('user')).user_email,
        adaptername: '',
        adapterid: '',
        description: '',
        category: 'DYNAMIC',
        apispec: '{}',
        executiontype: 'REST',
      };
    }
  }

  private authentications(): void {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      // instance-create permission
      if (cipAuthority.includes('instance-create')) this.createAuth = true;
      else if (!this.data || this.routeToHome) this.routeBackToAdapters();
    });
  }

  private findalldatasourcesForConnection(): void {
    this.adapterServices.getDatasources().subscribe(
      (res) => {
        this.datasourcesForConnection = res;
        if (this.action == 'create') {
          this.runtimesForConnection = this.datasourcesForConnection.filter(
            (datasource) =>
              datasource.organization ==
              sessionStorage.getItem('organization') &&
              datasource.type != 'REST' &&
              datasource.forruntime == '1'
          );
          this.datasourcesForConnection = this.datasourcesForConnection.filter(
            (datasource) =>
              (datasource.interfacetype == null ||
                datasource.interfacetype != 'adapter') &&
              datasource.organization ==
              sessionStorage.getItem('organization') &&
              datasource.foradapter == '1'
          );
        } else {
          if (this.data.executiontype == 'REMOTE')
            this.datasourcesForConnection =
              this.datasourcesForConnection.filter(
                (datasource) =>
                  datasource.interfacetype == null &&
                  datasource.interfacetype != 'adapter' &&
                  datasource.organization ==
                  sessionStorage.getItem('organization') &&
                  datasource.type != 'REST' &&
                  datasource.foradapter == '1'
              );
          else {
            this.runtimesForConnection = this.datasourcesForConnection.filter(
              (datasource) =>
                datasource.organization ==
                sessionStorage.getItem('organization') &&
                datasource.type != 'REST' &&
                datasource.forruntime == '1'
            );
            this.datasourcesForConnection =
              this.datasourcesForConnection.filter(
                (datasource) =>
                  (datasource.interfacetype == null ||
                    datasource.interfacetype != 'adapter') &&
                  datasource.organization ==
                  sessionStorage.getItem('organization') &&
                  datasource.type == 'REST' &&
                  datasource.foradapter == '1'
              );
          }
        }
        this.datasourcesForConnection.forEach((datasource) => {
          this.connectionOptions.push(
            new OptionsDTO(
              (datasource.type == 'REST' ? 'REST' : 'REMOTE').concat(
                '-' + datasource.alias
              ),
              datasource.alias
            )
          );
        });
        this.runtimesForConnection.forEach((runtime) => {
          this.runtimeOptions.push(
            new OptionsDTO('REMOTE'.concat('-' + runtime.alias), runtime.name)
          );
        });

        this.connectionPromise = Promise.resolve(true);
      },
      (err) => {
        console.log(err);
        this.connectionPromise = Promise.resolve(true);
      }
    );
  }

  private findAllAdapters(): void {
    this.adapterServices.getAdapters(this.org).subscribe((res) => {
      this.adapters = res;
      this.adapters.forEach((adp) => {
        this.adaptersOptions.push(new OptionsDTO(adp.name, adp.name));
      });
    });
  }

  private findAllInstances(): void {
    this.adapterServices.getInstances(this.org).subscribe((res) => {
      this.mlInstances = res;
      this.mlInstances.forEach((adp) => {
        this.listOfNames.push(adp.name);
      });

      if (this.listOfNames.length > 0) {
        for (let i = 0; i < this.listOfNames.length; i++) {
          if (i != this.listOfNames.length - 1)
            this.regString = this.regString.concat(
              this.listOfNames[i].concat('$|')
            );
          else
            this.regString = this.regString.concat(
              this.listOfNames[i].concat('$')
            );
        }
        this.regexPatternString = this.regexPattern.replace(
          'REX',
          this.regString
        );
        this.regexPatternForExistingNames =
          this.regexPatternForExistingNames.replace('REX', this.regString);
      } else {
        this.regexPatternString = this.regexPatterForEmptyNames;
      }
      this.regexPatternObj = new RegExp(this.regexPatternString, 'i');
      this.regexPatternForExistingNamesObj = new RegExp(
        this.regexPatternForExistingNames,
        'i'
      );
      this.regexPatternForValidAlphabetsObj = new RegExp(
        this.regexPatternForValidAlphabets,
        'i'
      );

      this.nameValidator = [
        Validators.required,
        Validators.pattern(this.regexPatternObj),
      ];
    });
  }

  private routeBackToAdapters(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  createInstance() {
    this.adapters.forEach((adp) => {
      if (this.data.adaptername === adp.name) {
        this.data.spectemplatedomainname = adp.spectemplatedomainname;
      }
    });

    this.adapterServices.createInstance(this.data).subscribe(
      (res) => {
        this.service.messageService(res, 'Instance Created Successfully');

        this.routeBackToAdapters();
      },
      (error) => {
        this.service.messageService(error);
      }
    );
  }

  updateInstance() {
    delete this.data.createdon;
    delete this.data.lastmodifiedon;
    this.adapterServices.updateInstance(this.data).subscribe(
      (res) => {
        this.service.messageService(res, 'Instance Updated Successfully');
        this.closeAdapterPopup();
      },
      (error) => {
        this.service.messageService(error);
      }
    );
  }

  closeAdapterPopup() {
    this.dialogRef.close();
    this.triggereRefresh.emit(true);
  }

  navigateBack() {
    this.location.back();
  }

  adapterNameChangesOccur(adpName: string) {
    if (this.regexPatternObj.test(adpName)) {
      this.nameFlag = true;
      this.errMsgFlag = false;
      if (this.nameRef && this.nameRef.control) {
        this.nameRef.control.setErrors(null);
      }
    } else {
      this.nameFlag = false;
      this.errMsgFlag = true;
      if (adpName.length == 0) {
        this.errMsg = 'Name is required field.';
      } else if (adpName.match(this.regexPatternForExistingNamesObj) == null) {
        this.errMsg = 'Name already exists';
      } else if (adpName.match(this.regexPatternForValidAlphabetsObj) == null) {
        this.errMsg =
          'Name should not contain special characters, accepted special characters are _ and -';
        console.log(this.errMsg);
      }
      if (this.nameRef && this.nameRef.control) {
        this.nameRef.control.setErrors({ custom: true });
      }
    }
  }

  connectionNameSelectChange(connectionNameSelectd: any) {
    this.data.connectionid = connectionNameSelectd.value;
    this.selectedConnection = this.datasourcesForConnection.filter(
      (datasource) => datasource.alias == connectionNameSelectd.value
    )[0];
    this.data.connectionid = this.selectedConnection?.name;
    if (this.selectedConnection?.type == 'REST')
      this.data.executiontype = 'REST';
    else this.data.executiontype = 'REMOTE';
  }
}
