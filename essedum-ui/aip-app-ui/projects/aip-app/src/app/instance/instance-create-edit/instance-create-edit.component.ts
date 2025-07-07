import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdapterServices } from '../../adapter/adapter-service';
import { Services } from '../../services/service';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { Validators } from '@angular/forms';
import { StreamingServices } from '../../streaming-services/streaming-service';
import { Location } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-instance-create-edit',
  templateUrl: './instance-create-edit.component.html',
  styleUrls: ['./instance-create-edit.component.scss'],
})
export class InstanceCreateEditComponent implements OnInit {
  @Output() triggereRefresh = new EventEmitter<any>();
  streamItem: StreamingServices;
  newCanvas: any;
  latest_job: boolean;
  chainName: any;
  runtimesForConnection: any;
  isBackHovered: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<InstanceCreateEditComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private adapterServices: AdapterServices,
    private service: Services
  ) {}

  @Input('data') data: any;
  @Input('action') action: any;

  cardTitle: String = 'Instances';
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
  errMsg: string = 'Name is required filed.';
  selectedConnection: any;
  routeToHome: boolean = false;
  isChain: boolean = false;
  connectionPromise: Promise<boolean>;
  org: any;
  runtimeAlias: any;

  ngOnInit(): void {
    if (this.data && this.data.adaptername) {
      this.adapterServices
        .getAdapteByNameAndOrganization(this.data.adaptername)
        .subscribe((resp) => {
          if (resp.isChain == true) {
            this.isChain = true;
          }
        });
    }
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

  authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      // instance-create permission
      if (cipAuthority.includes('instance-create')) this.createAuth = true;
      else if (!this.data || this.routeToHome) this.routeBackToAdapters();
    });
  }

  createInstance() {
    this.adapters.forEach((adp) => {
      if (this.data.adaptername === adp.name) {
        this.data.spectemplatedomainname = adp.spectemplatedomainname;
      }
    });
    if (this.isChain) {
      this.data.status = 'RUNNING';
    }
    this.adapterServices.createInstance(this.data).subscribe(
      (res) => {
        this.service.messageService(res, 'Instance Created Successfully');
        if (this.isChain) {
          this.startChain();
        }
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

  routeBackToAdapters() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  back() {
    this.location.back();
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
    //  this.adapterServices.getAdapteByNameAndOrganization(adpName).subscribe(resp=>{
    //   if(resp.isChain == true){
    //     this.isChain=true;
    //   }else{
    //     this.isChain=false;
    //   }
    //  });
  }

  implchangeoccur(adpName: any) {
    this.adapterServices
      .getAdapteByNameAndOrganization(adpName.value)
      .subscribe((resp) => {
        if (resp.isChain == true) {
          this.isChain = true;
        } else {
          this.isChain = false;
        }
      });
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

  runtimeNameSelectChange(runtimeNameSelectd: any) {
    this.data.runtimename = runtimeNameSelectd.value;
  }

  findalldatasourcesForConnection() {
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
        if (this.data.runtimename) {
          this.runtimeAlias = this.runtimesForConnection.filter(
            (datasource) => datasource.name == this.data.runtimename
          )[0].alias;
        }
        this.connectionPromise = Promise.resolve(true);
      },
      (err) => {
        console.log(err);
        this.connectionPromise = Promise.resolve(true);
      }
    );
  }

  findAllAdapters() {
    this.adapterServices.getAdapters(this.org).subscribe((res) => {
      this.adapters = res;
      this.adapters.forEach((adp) => {
        this.adaptersOptions.push(new OptionsDTO(adp.name, adp.name));
      });
    });
  }

  findAllInstances() {
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

  toggleChain() {
    this.data.isChain = this.isChain;
  }

  startChain() {
    this.adapterServices
      .getAdapteByNameAndOrganization(this.data.adaptername)
      .subscribe((resp) => {
        this.chainName = resp.chainName;
        this.service
          .getStreamingServicesByName(this.chainName, resp.organization)
          .subscribe((response) => {
            this.streamItem = response;
            this.service
              .savePipelineJSON(
                this.streamItem.name,
                this.streamItem.json_content
              )
              .subscribe(
                (res) => {
                  this.service.message('Saving Pipeline Json!', 'success');
                  this.triggerEvent(res.path);
                },
                (error) => {
                  this.service.message('Could not save the file', 'error');
                }
              );
          });
      });
  }

  triggerEvent(path) {
    let body = { pipelineName: this.streamItem.name, scriptPath: path[0] };
    this.service
      .triggerPostEvent('generateScript_' + this.streamItem.type, body, '')
      .subscribe(
        (resp) => {
          this.service.message('Generating Script!', 'success');
          this.service.getEventStatus(resp).subscribe((status) => {
            if (status == 'COMPLETED') this.runScript();
            else {
              this.service.message('Script is not generated.', 'error');
            }
          });
        },
        (error) => {
          this.service.message('Error! Could not generate script.', 'error');
        }
      );
  }

  runScript() {
    let passType = '';
    if (
      this.streamItem.type != 'Binary' &&
      this.streamItem.type != 'NativeScript'
    )
      passType = 'DragAndDrop';
    else passType = this.streamItem.type;
    // passType = this.type
    this.service
      .runPipeline(
        this.streamItem.alias ? this.streamItem.alias : this.streamItem.name,
        this.streamItem.name,
        passType,
        'REMOTE',
        this.data.runtimename,
        'generated'
      )
      .subscribe(
        (res) => {
          console.log('Pipeline Started!!!! ');
          this.service.message('Pipeline has been Started!', 'success');
          var jobData = JSON.parse(res);
          let job_id = jobData.jobId;
          this.data.jobid = job_id.replaceAll('-', '');
          this.data.status = jobData.status;
          this.updateInstance();
          this.service
            .getStreamingServicesByName(this.chainName, this.data.organization)
            .subscribe((response) => {
              this.newCanvas = JSON.parse(response.json_content);
              this.newCanvas['latest_jobid'] = job_id;
              response.json_content = JSON.stringify(this.newCanvas);
              this.service.update(response).subscribe((response) => {
                this.latest_job = true;
              });
            });
          // this.getStatus()
        },
        (error) => {
          this.service.message('Some error occured.', 'error');
        }
      );
    // }else{
    //   this.service.message('Please generate script to run pipeline.', 'error');
    // }
  }
}
