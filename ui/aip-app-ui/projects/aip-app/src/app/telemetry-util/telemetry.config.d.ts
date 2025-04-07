export declare class InitialConfig {
    pdata: {
        id: string;
        ver: string;
        pid: string;
    };
    uid: string;
    authtoken: string;
    env: string;
    channel: string;
    batchsize: number;
    host: string;
    endpoint: string;
    apislug: string;
}
export declare class TelemetryConfig {
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
declare class ParamConfig {
    pos: [{
        x: string;
        y: string;
        z: string;
    }];
    values: [];
    tid: string;
    uri: string;
}
export {};
