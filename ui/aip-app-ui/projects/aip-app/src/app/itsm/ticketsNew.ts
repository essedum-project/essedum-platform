export class TicketsNew {

    ticketid: string;
    id: number;
    summary: string;
    creationdate: any;
    priority: string;
    group: string;
    resource: string;
    status: string;
    closeddate: any;
    user: any;
    responseDate: any;
    responsetime: any;
    isResponseDelayed: boolean;
    category: any;
    messageService: any;
    constructor(json?: any) {
        try{
            if (json != null) {
                this.ticketid = json.TicketID;
                this.id = json.ID.Pid;
                this.summary = json.Description;
                this.creationdate = new Date(json.createddate);
                this.priority = json.Priority;
                this.group = json.group;//old
                this.resource = json.resource;//old
                this.status = json.Status;
                this.closeddate = new Date(json.closeddate);
                this.user = json.UserID;
                this.responseDate = json.responseDate;//old
                this.responsetime = json.responsetime;//old
                this.isResponseDelayed = json.MetSLA;
                this.category = json.CategoryID;//old
            }
        }
        catch(Exception){
        this.messageService.error("Some error occured", "Error")
        }
      
    }

    // Utils

    static toArray(jsons: any[]): TicketsNew[] {
        let ticketss: TicketsNew[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                ticketss.push(new TicketsNew(json));
            }
        }
        return ticketss;
    }
}
export class TicketsNewArray {

    appdata: TicketsNew[];
    length: number;
    constructor(json?: any) {
        if (json != null) {
            this.appdata = [];
            if (JSON.parse(json.AppData) && JSON.parse(json.AppData).length > 0) {
                JSON.parse(json.AppData).forEach(element => {
                    element = new TicketsNew(element)
                    this.appdata.push(element);
                });
                this.length = JSON.parse(json.AppData).length;
            }
        }
    }
}