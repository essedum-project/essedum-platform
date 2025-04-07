export class InitialConfig {
  pdata = {
    id: "dev.leap",
    ver: "2.1",
    pid: "LEAP",
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
  id: string;
  type: string;
  subtype: string;
  pageid: string;
  itype: string;
  stageto: string;
  extra: ParamConfig;
  state: string;
  prevstate: any;
  props: any;
}

class ParamConfig {
  pos: [{ x: string; y: string; z: string }];
  values: [];
  tid: string;
  uri: string;
}
