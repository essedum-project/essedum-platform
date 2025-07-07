export class App {
  id: Number;
  name: string;
  tryoutlink: string;
  status: string;
  type: string;
  organization: string;
  scope: string;
  file: string;
  jobName: string;
  videoFile: string;
  mfeAppName: string;

  constructor(json?: any) {
    if (json != null) {
      this.id = json.id;
      this.name = json.name;
      this.tryoutlink = json.tryoutlink;
      this.status = json.status;
      this.type = json.type;
      this.organization = json.organization;
      this.scope = json.scope;
      this.file = json.file;
      this.jobName = json.jobName;
      this.videoFile = json.videoFile;
      this.mfeAppName = json.mfeAppName;
    }
  }
}
