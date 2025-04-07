import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { Subscription, interval,} from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DashConstantService, DashConstant } from "com-lib-util";
import { Services } from '../../services/service';

declare var Stomp:any;
// import * as SockJS from 'sockjs-client';

@Component({
  selector: 'app-log-viewer',
  templateUrl: './log-viewer.component.html',
  styleUrls: ['./log-viewer.component.css'],

})
export class LogViewerComponent implements OnInit {

  webSocketEndPoint: string = '/cip/ws';
  topic: string;
  stompClient: any;

  newData: any[] = [];
  pi: boolean = false;
  isChain: boolean = false;
  displayLogEnabled: boolean = false;
  displayLog = "";
  corelid;
  jobcollection = []
  logdetails;
  offset = 0;
  jobid;
  jobtype;
  status;
  linenumber;
  firstline = "";
  templog = "";
  read;
  loggingHttpEnabled;
  logContent: Map<string,string>;

  loadingSubscription: Subscription;
  busy: Subscription;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<LogViewerComponent>,
    private service: Services,
    private dashConstantService: DashConstantService
  ) {
    this.isChain = this.data.isChain;
    this.jobid = this.data.jobid;
    this.jobtype = this.data.jobtype;
    this.status = this.data.status;
    this.linenumber = (Number)(this.data.linenumber);
    let index = -1;
    let hashparams = "";
    let templog = "";
    let org = "";
    this.topic = "/topic/runningjob/" + this.jobtype;
    for (let i = 0, j = this.data.content.length; i < j; i++) {
      if (this.data.content[i] && this.data.content[i].name) {
        if (this.data.content[i].name.toLowerCase() == 'log') {
          index = i;
          this.logdetails = this.data.content[index];
          templog = this.logdetails.value;
          this.logdetails.value = "";
        }
        if (this.data.content[i].name.toLowerCase() == 'hashparams') {
          hashparams = this.data.content[i].value ? this.data.content[i].value : '';
        }
        if (this.data.content[i].name.toLowerCase() == 'organization') {
          org = this.data.content[i].value;
        }
      }
    }
    if (hashparams.indexOf("Downloading log file from fileserver") >= 0) {
      if (this.isChain) {
        this.logdetails.value = hashparams
      } else {
        this.displayLog = hashparams
      }
    }
    if (!this.isChain) {
      this.offset++;
    }
    if (index > -1) {
      this.data.content.splice(index, 1);
      if (this.isChain) {
        this.data.content.push(this.logdetails)
      }
    }
    this.deleteThisProperty('jobmetadata');
    this.deleteThisProperty('organization');
    this.deleteThisProperty('hashparams');
    this.deleteThisProperty('jobparam');
    this.deleteThisProperty('jobmetric');
    this.deleteThisProperty('jobhide');
  }

  ngOnInit() {
    this.logContent = new Map();
    if (Object.keys(this.data.content).length !== 0 && this.data.content.constructor === Object) {
      for (var i in this.data.content) {
            this.logContent.set(i,this.data.content[i]);
        }
      }
    console.log(this.logContent)
    this.read = false;
    if (this.isChain) {
      for (let i = 0, j = this.data.content.length; i < j; i++) {
        let element = this.data.content[i]
        if (element.name.toLowerCase() == "correlationid") {
          this.corelid = element.value
          break;
        }
      }
      this.service.findByCoreid(this.corelid).subscribe(res => {
        res.forEach(element => {
          this.jobcollection.push({ name: element.streamingService, id: element.jobId, runtime: element.runtime })
        });
      }, err => {
        this.service.message("Error", err)
      }, () => {
        if (this.jobcollection.length == 0) {
          this.templog = "Error in Chain Job. Please revalidate your job or contact application admin."
          this.unsubscribe()
        }
      })
    }
    try {
      // let projName = "Core";
      // let example: DashConstant = new DashConstant();
      // example.project_name = projName;
      // let lazyload = { first: 0, rows: 1, sortField: null, sortOrder: null, filters: null, multiSortMeta: null };
      // example.keys = "icip.logging.http.enabled";
      // this.busy = this.dashConstantService.findAll(example, lazyload)
      //   .subscribe(resp => {
      //     let res = resp.content.filter(res => res.project_name == projName)[0]
      //     this.loggingHttpEnabled = res.value;
      //     if (!this.isChain && this.loggingHttpEnabled != 'true') {
      //       this._connect()
      //     }
      //     if (this.loggingHttpEnabled == 'true') {
      //       this.subscribe()
      //     }
      //   },
      //     error => {
      //       this.service.message("Error in fetching configuration mapping", "Log Flag");

      //     })
    }
    catch (Exception) {
      this.service.message("Some error occured", "Error")
    }
  }

  getMoreLog(response?, id?) {
    if (this.linenumber < 0) {
      this.linenumber = 0;
    }
    if (this.jobtype != "chain") {
      if (this.loggingHttpEnabled != 'true') {
        if (this.jobtype == "pipeline") {
          if (response.log.toString().trim() != "") {
            if (this.isChain) {
              if (this.linenumber == 0 || this.firstline != response.hashparams) {
                this.displayLog = this.displayLog + (response.hashparams ? response.hashparams : '');
              }
              this.displayLog = this.displayLog + response.log;
            } else {
              if (this.linenumber == 0 || this.firstline != response.hashparams) {
                this.logdetails.value = this.logdetails.value + (response.hashparams ? response.hashparams : '');
              }
              this.logdetails.value = this.logdetails.value + response.log;
            }
            this.firstline = response.organization;

            if (this.offset >= 0) {
              this.offset = this.offset + Number(response.jobmetadata);
            }
            if (this.linenumber >= 0) {
              this.linenumber = this.linenumber + Number(response.jobmetadata);
            }
          } else {
            if (this.firstline != response.hashparams) {
              if (this.isChain) {
                this.displayLog = this.displayLog + (response.hashparams ? response.hashparams : '');
              } else {
                this.logdetails.value = this.logdetails.value + (response.hashparams ? response.hashparams : '');
              }
            }
            this.firstline = response.organization;
            //this.offset++;
            if (this.offset >= 0) {
              this.offset = this.offset + Number(response.jobmetadata);
            }
            if (response.hashparams.indexOf("Downloading log file from fileserver") < 0) {
              if (response.jobStatus.trim().toLowerCase() != "running") {
                this.read = true;
                this.linenumber = 0;
              }
            }
            if (this.read && response.jobStatus.trim().toLowerCase() != "running") {
              this.unsubscribe();
            }
          }
        } else {
          if (response.log.toString().trim() != "") {
            if (this.linenumber == 0 || this.firstline != response.hashparams) {
              this.logdetails.value = this.logdetails.value + (response.hashparams ? response.hashparams : '');
            }
            this.logdetails.value = this.logdetails.value + response.log;
            this.firstline = response.organization;
            //this.offset++;
            if (this.offset >= 0) {
              this.offset = this.offset + Number(response.jobmetadata);
            }
            if (this.linenumber >= 0) {
              this.linenumber = this.linenumber + Number(response.jobmetadata);
            }
          } else {
            if (this.firstline != response.hashparams) {
              this.logdetails.value = this.logdetails.value + (response.hashparams ? response.hashparams : '');
            }
            if (response.hashparams.indexOf("Downloading log file from fileserver") < 0) {
              if (response.jobStatus.trim().toLowerCase() != "running") {
                this.read = true;
                this.linenumber = 0;
              }
            }
            if (this.read && response.jobStatus.trim().toLowerCase() != "running") {
              this.unsubscribe();
            }
          }
        }
      } else {
        if (this.jobtype != "internal") {
          if (this.jobtype != "agent") {
            this.service.fetchSparkJob(id, this.linenumber, 'local', this.offset, this.status, this.read).subscribe(
              (response) => {
                if (response.log.toString().trim() != "") {
                  if (this.isChain) {
                    if (this.linenumber == 0 || this.firstline != response.hashparams) {
                      this.displayLog = this.displayLog + response.hashparams;
                    }
                    this.displayLog = this.displayLog + response.log;
                  } else {
                    if (this.linenumber == 0 || this.firstline != response.hashparams) {
                      this.logdetails.value = this.logdetails.value + response.hashparams;
                    }
                    this.logdetails.value = this.logdetails.value + response.log;
                  }
                  this.firstline = response.organization;
                  if (this.offset >= 0) {
                    this.offset = this.offset + Number(response.jobmetadata);
                  }
                  // this.offset++
                  if (this.linenumber >= 0) {
                    this.linenumber = this.linenumber + Number(response.jobmetadata);
                  }
                } else {
                  if (this.firstline != response.hashparams) {
                    if (this.isChain) {
                      this.displayLog = this.displayLog + response.hashparams ? response.hashparams : '';
                    } else {
                      this.logdetails.value = this.logdetails.value + response.hashparams ? response.hashparams : '';
                    }
                  }
                  this.firstline = response.organization;
                  if (this.offset >= 0) {
                    this.offset = this.offset + Number(response.jobmetadata);
                  }
                  // this.offset++
                  if (this.read && response.jobStatus.trim().toLowerCase() != "running") {
                    this.unsubscribe();
                  }
                  if (response.jobStatus.trim().toLowerCase() != "running") {
                    this.read = true;
                    this.linenumber = 0;
                  }
                }
              },
              (error) => {
                this.unsubscribe();
                this.service.message("Error", "Error in fetching")
              }
            );
          } else {
            this.service.fetchAgentJob(id, this.linenumber, this.offset, this.status, this.read).subscribe(
              (response) => {
                if (response.log.toString().trim() != "") {
                  if (this.linenumber == 0 || this.firstline != response.hashparams) {
                    this.logdetails.value = this.logdetails.value + response.hashparams ? response.hashparams : '';
                  }
                  this.logdetails.value = this.logdetails.value + response.log;
                  this.firstline = response.organization;
                  if (this.offset >= 0) {
                    this.offset = this.offset + Number(response.jobmetadata);
                  }
                  // this.offset++
                  if (this.linenumber >= 0) {
                    this.linenumber = this.linenumber + Number(response.jobmetadata);
                  }
                } else {
                  if (this.firstline != response.hashparams) {
                    this.logdetails.value = this.logdetails.value + response.hashparams ? response.hashparams : '';
                  }
                  if (this.read && response.jobStatus.trim().toLowerCase() != "running") {
                    this.unsubscribe();
                  }
                  if (response.jobStatus.trim().toLowerCase() != "running") {
                    this.read = true;
                    this.linenumber = 0;
                  }
                }
              },
              (error) => {
                this.unsubscribe();
                this.service.message("Error", "Error in fetching")
              }
            );
          }
        } else {
          this.service.fetchInternalJob(id, this.linenumber, this.offset, this.status).subscribe(
            (response) => {
              if (response.log.toString().trim() != "") {
                if (this.linenumber == 0 || this.firstline != response.hashparams) {
                  this.logdetails.value = this.logdetails.value + (response.hashparams ? response.hashparams : '');
                }
                this.logdetails.value = this.logdetails.value + response.log;
                this.firstline = response.organization;
                if (this.offset >= 0) {
                  this.offset = this.offset + Number(response.jobmetadata);
                }
                // this.offset++
                if (this.linenumber >= 0) {
                  this.linenumber = this.linenumber + Number(response.jobmetadata);
                }
              } else {
                if (this.firstline != response.hashparams) {
                  this.logdetails.value = this.logdetails.value + (response.hashparams ? response.hashparams : '');
                }
                if (response.jobStatus.trim().toLowerCase() != "running") {
                  this.unsubscribe();
                }         
              }
            },
            (error) => {
              this.unsubscribe();
              this.service.message("Error", "Error in fetching")
            }
          );
        }
      }
    }
  }

  showLog(id, runtime?) {
    if (this.loggingHttpEnabled != 'true') {
      this.displayLog = "";
      this.linenumber = 0;
      this.offset = 0;
      this.jobid = id;
      this.jobtype = "pipeline";
      this.read = false
      this.topic = "/topic/runningjob/" + this.jobtype;
      this.displayLogEnabled = true
      this.retry();
    } else {
      this.unsubscribe();
      this.displayLog = "";
      this.linenumber = this.status.trim().toLowerCase() == "running" ? 0 : -1;
      this.offset = 0;
      this.jobid = id;
      this.jobtype = "pipeline";
      this.read = false
      this.service.fetchSparkJob(id, this.linenumber, runtime, 0, this.status, this.read).subscribe(response => {
        this.displayLogEnabled = true
        if (response.log.toString().trim() != "") {
          if (this.linenumber == 0 || this.firstline != response.hashparams) {
            this.displayLog = this.displayLog + response.hashparams ? response.hashparams : '';
          }
          this.displayLog = this.displayLog + response.log;
          this.firstline = response.organization;
          if (this.offset >= 0) {
            this.offset = this.offset + Number(response.jobmetadata);
          }
          // this.offset++
          if (this.linenumber >= 0) {
            this.linenumber = this.linenumber + Number(response.jobmetadata);
          }
          this.subscribe();
        } else {
          if (this.firstline != response.hashparams) {
            this.displayLog = this.displayLog + response.hashparams ? response.hashparams : '';
          }
          if (this.read && response.jobStatus.trim().toLowerCase() != "running") {
            this.unsubscribe();
          }
          if (response.jobStatus.trim().toLowerCase() != "running") {
            this.read = true;
            this.linenumber = 0;
          }
        }
      }, err => {
        this.unsubscribe();
        this.displayLogEnabled = true
        this.displayLog = "error in fetching log"
        this.service.message("Error", err)
      })
    }

  }

  // _connect() {
  //   try{
  //     let ws = new SockJS(this.webSocketEndPoint);
  //     this.stompClient = Stomp.over(ws);
  //     const _this = this;
  //     _this.stompClient.connect({}, function (frame) {
  //       //send
  //       _this.loadingSubscription = interval(2000).subscribe((x => {
  //         let request = {
  //           jobid: _this.jobid,
  //           offset: _this.offset,
  //           linenumber: _this.linenumber,
  //           org: sessionStorage.getItem("organization"),
  //           status: _this.status
  //         }
  //         _this._send(JSON.stringify(request))
  //       }));
  //       //receive
  //       _this.stompClient.subscribe(_this.topic, function (sdkEvent) {
  //         _this.onMessageReceived(sdkEvent.body);
  //       });
  //     }, this.errorCallBack);

  //   }
  //   catch(Exception:any){
  //   this.service.message("Some error occured", Exception)
  //   }
   
  // };

  _disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
    let msg = "No logs found. Please check your script or contact application admin."
    if (!this.isChain) {
      if (!this.logdetails.value) {
        this.logdetails.value = msg
      }
    } else {
      if (!this.displayLog) {
        this.displayLog = msg
      }
    }
  }

  errorCallBack(error) {
    setTimeout(() => {
      // this._connect();
    }, 5000);
  }

  _send(message) {
    this.stompClient.send(this.webSocketEndPoint + "/read/runningjob/" + this.jobtype, {}, message);
  }

  onMessageReceived(message) {
    try{
      if (message) {
        this.getMoreLog(JSON.parse(message))
      }
    }
    catch(Exception){
    this.service.message("Some error occured", "Error")
    }   
  }

  deleteThisProperty(value) {
    let index = -1;
    for (let i = 0, j = this.data.content.length; i < j; i++) {
      if (this.data.content[i] && this.data.content[i].name) {
        if (this.data.content[i].name.toLowerCase() == value) {
          index = i;
          break;
        }
      }
    }
    if (index > -1) {
      this.data.content.splice(index, 1);
    }
  }

  isObject(val) {
    if (typeof val === 'object') {
      if (val != null) {
        if (Object.keys(val).length !== 0 && val.constructor === Object) {
          this.newData = [];
          for (const i in val) {
            let a = { name: i, data: val[i] };
            this.newData.push(a);
          }
        }
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  closeDialog() {
    // this.unsubscribe();
    this.dialogRef.close();
  }

  subscribe() {
    this.loadingSubscription = interval(2000).subscribe((x => {
      this.getMoreLog(undefined, this.jobid);
    }));
  }
  
  unsubscribe() {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
    this.loadingSubscription = undefined
    if (this.loggingHttpEnabled != 'true') {
      this._disconnect()
    }
  }

  _retryConnection() {
    let _this = this
    if (_this.stompClient) {
      _this.stompClient.disconnect(() => {
        // _this._connect()
      });
    } else {
      // _this._connect()
    }
  }

  retry() {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
    this.loadingSubscription = undefined
    this._retryConnection()
  }

  public copyText() {
    try{
      let textarea = null;
      textarea = document.createElement('textarea');
      textarea.style.height = '0px';
      textarea.style.left = '-100px';
      textarea.style.opacity = '0';
      textarea.style.position = 'fixed';
      textarea.style.top = '-100px';
      textarea.style.width = '0px';
      document.body.appendChild(textarea);
      // Set and select the value (creating an active Selection range).
      textarea.value = JSON.stringify(this.data.content);
      textarea.select();
  
      // Ask the browser to copy the current selection to the clipboard.
      const successful = document.execCommand('copy');
      if (successful) {
        // do something
      } else {
        // handle the error
      }
      if (textarea && textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
      this.pi = true;
    }
    catch(Exception){
    this.service.message("Some error occured", "Error")
    }
 
  }

}
