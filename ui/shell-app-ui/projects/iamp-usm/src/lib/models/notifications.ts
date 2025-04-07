import { Role } from "com-lib-util";

/*CopyRight
* @ 2018 - 2019 Infosys Limited, Bangalore, India. All Rights Reserved.
* Version: 2.1
* Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
* this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
* rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
* transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
* recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
* criminal penalties, and will be prosecuted to the maximum extent possible under the law.
*/
export class Notifications {
    id: number;
    userId: string;
    severity: string;
    source: string;
    message: string;
    dateTime: Date;
    readFlag: boolean;
    crossOrigin: boolean;
    organisation: string;
    url: string;
    roleId: number;

    constructor(json?: any) {
        if (json != null) {
            this.id = json.id;
            this.userId = json.userId;
            this.severity = json.severity;
            this.source = json.source;
            this.message = json.message;
            this.dateTime = json.datetime;
            this.readFlag = json.readFlag;
            this.crossOrigin = json.crossOrigin;
            this.organisation = json.organisation;
            this.url = json.url;
            this.roleId = json.roleId;
        }
    }

    // Utils

    static toArray(jsons: any[]): Notifications[] {
        let notifications: Notifications[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                notifications.push(new Notifications(json));
            }
        }
        return notifications;
    }
}
