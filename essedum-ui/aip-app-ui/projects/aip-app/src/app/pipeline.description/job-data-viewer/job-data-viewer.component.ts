import { Component, OnInit, Inject } from '@angular/core';
import * as FileSaver from 'file-saver';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Subscription, interval} from 'rxjs';
import { Services } from '../../services/service';
declare var Stomp: any;

@Component({
  selector: 'app-job-data-viewer',
  templateUrl: './job-data-viewer.component.html',
  styleUrls: ['./job-data-viewer.component.scss']
})
export class JobDataViewerComponent implements OnInit {

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
  originalPipeline: any = [];
  logdetails;
  jobid;
  jobtype;
  status;
  templog = "";
  offset = 0;
  linenumber;
  firstline = "";
  read;
  loggingHttpEnabled;

  loadingSubscription: Subscription;
  busy: Subscription;

  eventSource;
  jobName: any;
  logContent: Map<string,string>;
  Logs: string;
  isRemoteLog: boolean=false;
  submittedOn: any;
  sequence: any = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<JobDataViewerComponent>,
    private service: Services,
  ) {
    this.isChain = this.data.isChain;
    this.isRemoteLog = this.data.isRemote;
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
    this.read = false;
    if (this.isChain) {
      this.sequence = this.data.sequence;
      this.corelid = this.data.content.correlationid;
      if (this.data?.content?.submittedOn)
        this.submittedOn = this.data.content.submittedOn;
      this.service.getPipelineNames(sessionStorage.getItem('organization')).subscribe((res) => {
        this.originalPipeline= res;
      });
      for (let i = 0, j = this.data.content.length; i < j; i++) {
        let element = this.data.content[i]
        if (element.name.toLowerCase() == "correlationid") {
          this.corelid = element.value
          break;
        }
        if (element.name.toLowerCase() == "jobname") {
          this.jobName = element.value
        }
      }
      if (this.isChain) {
      this.jobName = this.data.content.jobName;
      }
      this.service.findByCoreid(this.corelid).subscribe(res => {
        res.forEach(element => {
          const jobMetadata = JSON.parse(element.jobmetadata);
          const isChainTag = jobMetadata.tag == "CHAIN" && !jobMetadata.name;
          const isJobNameMatch = jobMetadata.name == this.jobName;
          const isSubmittedOnMatch = this.submittedOn == null || this.submittedOn === '' || this.submittedOn == element.submittedOn;
          if ((isChainTag || isJobNameMatch) && isSubmittedOnMatch) {
            this.jobcollection.push({ name: element.streamingService, id: element.jobId, runtime: element.runtime })
            this.jobcollection.sort((a, b) => this.sequence.indexOf(a.name) - this.sequence.indexOf(b.name))
          }
        });
      }, err => {
        this.service.message("Error", 'error')
      }, () => {
        if (this.jobcollection.length == 0) {
          this.templog = "Error in Chain Job. Please revalidate your job or contact application admin."
          this.unsubscribe()
        }
      })
    }
    this.generatingLogs();
  }

  getMoreLog(response?, id?) {
    if (this.linenumber < 0) {
      this.linenumber = 0;
    }
    if(this.jobtype != "chain") {
      if (this.loggingHttpEnabled != 'true') {
        if (this.jobtype == "pipeline") {
          if (response && response.log.toString().trim() != "") {
            if (this.isChain) {
              if (this.linenumber == 0 || (this.firstline !="" && this.firstline != response.hashparams)) {
                this.displayLog = this.displayLog + (response.hashparams ? response.hashparams : '');
              }
              this.displayLog = this.displayLog + response.log;
            } else {
              if (this.linenumber == 0 || (this.firstline !="" && this.firstline != response.hashparams)) {
                this.logdetails.value = this.logdetails.value + (response.hashparams ? response.hashparams : '');
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
          } else if(response && response.hashparams) {
            if (this.firstline !="" && this.firstline != response.hashparams) {
              if (this.isChain) {
                this.displayLog = this.displayLog + (response.hashparams ? response.hashparams : '');
              } else {
                this.logdetails.value = this.logdetails.value + (response.hashparams ? response.hashparams : '');
              }
            }
            this.firstline = response.organization;
            if (this.offset >= 0) {
              this.offset = this.offset + Number(response.jobmetadata);
            }
            // this.offset++
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
          if (response && response.log.toString().trim() != "") {
            if (this.linenumber == 0 || (this.firstline !="" && this.firstline != response.hashparams)) {
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
            if (this.firstline !="" && this.firstline != response.hashparams) {
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
            // this.service.fetchSparkJob(id, this.linenumber, 'local', this.offset, this.status, this.read).subscribe(
            this.service.fetchSparkJob(id, this.linenumber, 'local', 0 , this.status, this.read).subscribe(
              (response) => {
                if (response.log.toString().trim() != "") {
                  if (this.isChain) {
                    if (this.linenumber == 0 || (this.firstline !="" && this.firstline != response.hashparams)) {
                      this.displayLog = this.displayLog + response.hashparams;
                    }
                    this.displayLog = this.displayLog + response.log;
                  } else {
                    if (this.linenumber == 0 || (this.firstline !="" && this.firstline != response.hashparams)) {
                      this.logdetails.value = this.logdetails.value + response.hashparams;
                    }
                    this.logdetails.value = this.logdetails.value + response.log;
                  }
                  this.firstline = response.organization;
                  if (this.offset >= 0) {
                    this.offset = this.offset + Number(response.jobmetadata);
                  }
                  // this.offset++;
                  if (this.linenumber >= 0) {
                    this.linenumber = this.linenumber + Number(response.jobmetadata);
                  }
                } else {
                  // this.messageService.error("Log", "No new log found")
                  if (this.firstline !="" && this.firstline != response.hashparams) {
                    if (this.isChain) {
                      this.displayLog = this.displayLog + response.hashparams;
                    } else {
                      this.logdetails.value = this.logdetails.value + response.hashparams;
                    }
                  }
                  this.firstline = response.organization;
                  if (this.offset >= 0) {
                    this.offset = this.offset + Number(response.jobmetadata);
                  }
                  // this.offset++;
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
                this.service.message("Error in fetching",'error')
              }
            );
          } else {
            this.service.fetchAgentJob(id, this.linenumber, this.offset, this.status, this.read).subscribe(
              (response) => {
                if (response.log.toString().trim() != "") {
                  if (this.linenumber == 0 ||  (this.firstline !="" && this.firstline != response.hashparams)) {
                    this.logdetails.value = this.logdetails.value + response.hashparams;
                  }
                  this.logdetails.value = this.logdetails.value + response.log;
                  this.firstline = response.organization;
                  if (this.offset >= 0) {
                    this.offset = this.offset + Number(response.jobmetadata);
                  }
                  // this.offset++;
                  if (this.linenumber >= 0) {
                    this.linenumber = this.linenumber + Number(response.jobmetadata);
                  }
                } else {
                  // this.messageService.error("Log", "No new log found")
                  if (this.firstline !="" && this.firstline != response.hashparams) {
                    this.logdetails.value = this.logdetails.value + response.hashparams;
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
                this.service.message("Error in fetching","error")
              }
            );
          }
        } else {
          this.service.fetchInternalJob(id, this.linenumber, this.offset, this.status).subscribe(
            (response) => {
              if (response.log.toString().trim() != "") {
                if (this.linenumber == 0 || (this.firstline !="" && this.firstline != response.hashparams)) {
                  this.logdetails.value = this.logdetails.value + response.hashparams;
                }
                this.logdetails.value = this.logdetails.value + response.log;
                this.firstline = response.organization;
                if (this.offset >= 0) {
                  this.offset = this.offset + Number(response.jobmetadata);
                }
                // this.offset++;
                if (this.linenumber >= 0) {
                  this.linenumber = this.linenumber + Number(response.jobmetadata);
                }
              } else {
                // this.messageService.error("Log", "No new log found")
                if (this.firstline !="" && this.firstline != response.hashparams) {
                  this.logdetails.value = this.logdetails.value + response.hashparams;
                }
                if (response.jobStatus.trim().toLowerCase() != "running") {
                  this.unsubscribe();
                }
              }
            },
            (error) => {
              this.unsubscribe();
              this.service.message("Error in fetching","error")
            }
          );
        }
      }
    }  
  }

  showLog(id, runtime?) {
    // if (this.loggingHttpEnabled != 'true') {
    //   this.displayLog = "";
    //   this.linenumber = 0;
    //   this.offset = 0;
    //   this.jobid = id;
    //   this.jobtype = "pipeline";
    //   this.read = false
    //   this.topic = "/topic/runningjob/" + this.jobtype;
    //   this.displayLogEnabled = true
    //   this.retry();
    // } else {
      this.unsubscribe();
      this.displayLog = "";
      this.linenumber = this.status.trim().toLowerCase() == "running" ? 0 : -1;
      // this.linenumber = 0;
      this.offset = 0;
      this.jobid = id;
      this.jobtype = "pipeline";
      this.read = false
      this.service.fetchSparkJob(id, this.linenumber, runtime, 0, this.status, this.read).subscribe(response => {
        this.displayLogEnabled = true
        if (response && response.log.toString().trim() != "") {
          if (this.linenumber == 0 || (this.firstline !="" && this.firstline != response.hashparams)) {
            this.displayLog = this.displayLog + response.hashparams;
          }
          this.displayLog = this.displayLog + response.log;
          this.firstline = response.organization;
          if (this.offset >= 0) {
            this.offset = this.offset + Number(response.jobmetadata);
          }
          // this.offset++;
          if (this.linenumber >= 0) {
            this.linenumber = this.linenumber + Number(response.jobmetadata);
          }
          this.subscribe();
        } else if(response && response.hashparams) {
          // this.messageService.error("Log", "No new log found")
          if (this.firstline !="" && this.firstline != response.hashparams) {
            this.displayLog = this.displayLog + response.hashparams;
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
        this.service.message("Error", 'error')
      })
    // }
  }

 
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

  errorCallBack(_error) {
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
    catch(Exception:any){
    this.service.message("Some error occured", "error")
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

  closeDialog() {
    // this.unsubscribe();
    this.dialogRef.close();
  }

  downloadLog() {
    if (!this.isChain) {
      this.service.downloadPipelineLog(this.data.content[0]["value"])
        .subscribe(
          response => {
            FileSaver.saveAs(response, this.data.content[0]["value"] + ".log")
          },
          _error => { this.service.message("File Not Found","error") }
        )
    }
  }
  generatingLogs(){
    const hashparams = this.logContent.get('hashparams');
    const log = this.logContent.get('log');
    // this. Logs = [hashparams, ...log].join('');
    if(hashparams && hashparams.trim() != "" && hashparams != log.split('\r\n')[0])
      this.Logs = [hashparams, ...log].join('');
    else
      this. Logs = log;
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
      // textarea.value = JSON.stringify(this.logContent.get('hashparams')+this.logContent.get('log'));
      const hashparams = this.logContent.get('hashparams');
      const log = this.logContent.get('log');
      const logs = [hashparams, ...log].join('');
      textarea.value = logs;
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
    catch(Exception:any){
    this.service.message(Exception, "error")
    }

  }

  displayFn(name) {
    if (name) {
      let filteredarray = this.originalPipeline.filter(option => option.name.toLowerCase() == name.toLowerCase())
      let alias;
      if (filteredarray && filteredarray.length > 0) {
        alias = filteredarray[0]["alias"]
      }
      return alias ? alias : name
    }
    return name;
  }

}
