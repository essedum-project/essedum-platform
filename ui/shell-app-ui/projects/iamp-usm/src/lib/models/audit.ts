export class Audit {
    id: number;
    auditType: string;
    isAuditSuccess: boolean;
    auditMessage: string;
    auditTimestamp: Date;
    auditUser: string;
    auditRole: string;
    auditOrg: string;

    constructor(json?: any) {
        if (json != null) {
            this.id = json.id;
            this.auditType = json.auditType;
            this.isAuditSuccess = json.isAuditSuccess;
            this.auditMessage = json.auditMessage;
            this.auditTimestamp = json.auditTimestamp;
            this.auditUser = json.auditUser;
            this.auditRole = json.auditRole;
            this.auditOrg = json.auditOrg;
        }
    };
    static toArray(jsons: any[]): Audit[] {
        let audits: Audit[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                audits.push(new Audit(json));
            }
        }
        return audits;
    }
}
