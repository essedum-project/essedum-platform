export class InitialConfig {
  pdata = {
    id: "dev.aip",
    ver: "3.0",
    pid: "",
  };
  uid = "value";
  authtoken = "";
  env = "value";
  channel = "web";
  batchsize = 1;
  host = "";
  endpoint = "/v1/telemetry";
  apislug = "";
}

export class TelemetryConfig {
  id: string = ''
  type: string = ''
  subtype: string = ''
  pageid: string = ''
  itype: string = ''
  stageto: string = ''
  extra: ParamConfig = new ParamConfig;
  state: string = ''
  prevstate: any;
  props: any;
}

class ParamConfig {
  pos!: [{ x: string; y: string; z: string; }];
  values: [] = [];
  tid: string = ''
  uri: string = ''
}
