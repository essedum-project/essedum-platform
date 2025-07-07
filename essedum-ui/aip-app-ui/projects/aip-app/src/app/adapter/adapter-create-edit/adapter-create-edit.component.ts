import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdapterServices } from '../adapter-service';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { Services } from '../../services/service';
import { PipelineService } from '../../services/pipeline.service';
import { Location } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-adapter-create-edit',
  templateUrl: './adapter-create-edit.component.html',
  styleUrls: ['./adapter-create-edit.component.scss'],
})
export class AdapterCreateEditComponent {
  @Output() triggereRefresh = new EventEmitter<any>();

  constructor(
    private dialogRef: MatDialogRef<AdapterCreateEditComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private adapterServices: AdapterServices,
    private service: Services,
    private location: Location,
    private pipelineService: PipelineService
  ) {}

  @Input('data') data: any;
  @Input('action') action: any;

  cardTitle: String = 'Implementation';
  createAuth = false;
  isBackHovered: boolean = false;
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
  specTemplates: any;
  mlAdapters: any;
  connectionOptions: OptionsDTO[] = [];
  specTemplatesOptions: OptionsDTO[] = [];
  errMsg: string = 'Name is required filed.';
  selectedConnection: any;
  routeToHome: boolean = false;
  connectionPromise: Promise<boolean>;
  org: any;

  ngOnInit(): void {
    this.org = sessionStorage.getItem('organization');
    this.authentications();
    this.findalldatasourcesForConnection();
    this.findAllSpecTemplates();

    if (!this.data) {
      this.routeToHome = true;
      this.action = 'create';
      this.findAllAdapters();
      this.data = {
        name: '',
        organization: sessionStorage.getItem('organization'),
        connectionname: '',
        connectionid: '',
        createdby: JSON.parse(sessionStorage.getItem('user')).user_email,
        spectemplatedomainname: '',
        description: '',
        category: 'DYNAMIC',
        apispec: '{}',
        executiontype: 'REST',
      };
    }
  }

  authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      if (cipAuthority.includes('adapter-create')) this.createAuth = true;
      else if (!this.data || this.routeToHome) this.routeBackToAdapters();
    });
  }

  createAdapter() {
    if (this.data.executiontype == 'REMOTE') {
      this.data.apispec = this.specTemplates.filter(
        (spec) => spec.domainname == this.data.spectemplatedomainname
      )[0].apispectemplate;
      this.data.category = 'REMOTE';
    }
    this.adapterServices.createAdapter(this.data).subscribe(
      (res) => {
        this.service.messageService(
          res,
          'Done!  Implementation Created Successfully'
        );
        this.routeBackToAdaptersAndRefresh();
      },
      (error) => {
        this.service.messageService(error);
      }
    );
  }

  updateAdapter() {
    delete this.data.createdon;
    delete this.data.lastmodifiedon;
    this.adapterServices.updateAdapter(this.data).subscribe(
      (res) => {
        this.service.messageService(
          res,
          'Done!  Implementation Updated Successfully'
        );
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

  routeBackToAdapters() {
    this.location.back();
  }

  routeBackToAdaptersAndRefresh() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  adapterNameChangesOccur(adpName: string) {
    this.errMsg = 'Name is required filed.';
    if (this.regexPatternObj.test(adpName)) {
      this.nameFlag = true;
      this.errMsgFlag = false;
    } else {
      this.nameFlag = false;
      this.errMsgFlag = true;
      if (adpName.length == 0) {
        this.errMsg = 'Name is required filed.';
      } else if (adpName.match(this.regexPatternForExistingNamesObj) == null) {
        this.errMsg = 'Name already exists';
      } else if (adpName.match(this.regexPatternForValidAlphabetsObj) == null) {
        this.errMsg =
          'Name should not contain special characters, accepted special characters are _ and -';
      }
    }
  }

  connectionNameSelectChange(connectionNameSelectd: any) {
    this.data.connectionname = connectionNameSelectd.value;
    this.selectedConnection = this.datasourcesForConnection.filter(
      (datasource) => datasource.alias == connectionNameSelectd.value
    )[0];
    this.data.connectionid = this.selectedConnection.name;
    if (this.selectedConnection.type == 'REST')
      this.data.executiontype = 'REST';
    else this.data.executiontype = 'REMOTE';
  }

  resolvePromise() {
    this.connectionPromise = Promise.resolve(true);
  }

  findalldatasourcesForConnection() {
    this.adapterServices.getDatasources().subscribe(
      (res) => {
        this.datasourcesForConnection = res;
        if (this.action == 'create')
          this.datasourcesForConnection = this.datasourcesForConnection.filter(
            (datasource) =>
              (datasource.interfacetype == null ||
                datasource.interfacetype != 'adapter') &&
              datasource.organization ==
                sessionStorage.getItem('organization') &&
              datasource.foradapter == '1'
          );
        else {
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
          else
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
        this.connectionPromise = Promise.resolve(true);
      },
      (err) => {
        console.log(err);
        this.connectionPromise = Promise.resolve(true);
      }
    );
  }

  findAllSpecTemplates() {
    this.adapterServices.getMlSpecTemplatesCards(this.org).subscribe((res) => {
      this.specTemplates = res;
      this.specTemplates.forEach((specTem) => {
        this.specTemplatesOptions.push(
          new OptionsDTO(specTem.domainname, specTem.domainname)
        );
      });
    });
  }

  findAllAdapters() {
    this.adapterServices.getAdapters(this.org).subscribe((res) => {
      this.mlAdapters = res;
      this.mlAdapters.forEach((adp) => {
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
}
