export class InitialConfig {
  pdata = {
    id: "dev.leap",
    ver: "1.3.7",
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
}

class ParamConfig {
  pos: [{ x: string; y: string; z: string }];
  values: [];
  tid: string;
  uri: string;
}
