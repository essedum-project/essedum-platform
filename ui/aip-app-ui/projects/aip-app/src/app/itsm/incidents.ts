// import { Project }from "projects/com-lib-util/src/public-api";

//
// Copyright © 2016-2017 Infosys Limited, Bangalore, India. All Rights Reserved.
// * Except for any open source software components embedded in this
// * Infosys proprietary software program (Program), this Program is protected
// * by copyright laws, international treaties and other pending or existing
// * intellectual property rights in India, the United States and other countries.
// * Except as expressly permitted, any unauthorized reproduction, storage,
// * transmission in any form or by any means (including without limitation
// * electronic, mechanical, printing, photocopying, recording or otherwise),
// * or any distribution of this Program, or any portion of it,
// * may result in severe civil and criminal penalties, and
// * will be prosecuted to the maximum extent possible under the law.
// Template pack-angular:web/src/app/base-entities/entity.ts.e.vm
//


export class Incidents {

    number: string;
    shortdescription: string;
    assignmentgroup: string;
    assignedto: string;
    caller: string;
    category: string;
    // projectid : Project;
    projectid: number;
    createdby: string;
    closecode: string;
    closedby: string;
    configurationitem: string;
    configurationItem: string;
    closenotes: string;
    closeddate: any;
    closedDate: any;
    comments: string;
    createddate: any;
    createdDate: any;
    duedate: any;
    description: string;
    duration: any;
    impact: string;
    incidentstate: string;
    madesla: boolean;
    openedDate: any;
    openedby: string;
    priority: string;
    resolved: boolean;
    resolvedby: string;
    resourcepath: string;
    resolvedDate: any;
    reopenedDate: any;
    state: string;
    severity: string;
    subcategory: string;
    sysid: string;
    sladueDate: any;
    timeworked: any;
    updatedby: string;
    updateddate: any;
    updatedDate: any;
    incidentsubstate: string;
    firstServiceCommunicationDate: string;
    assignedDate: string;
    resolutionCategory: string;
    resolutionsteps: string;
    resolutionSteps: string;
    additionalComments: string;
    resolveTime: string;
    businessRestoredUpdateMissingLT24Hrs: boolean;
    businessRestoredUpdateMissingGT24hoursLT48: boolean;
    slaabouttobreachinanother30mins: boolean;
    slaabouttobreachinanother60mins: boolean;
    incorrectQueueAssignmentResolved: boolean;
    incorrectPriorityAssignmentResolved: boolean;
    weekendticketsInflowART: boolean;
    weekendticketsOutflowART: boolean;
    abouttobreachModerateandHighSLAAlertL1Resolution: boolean;
    abouttobreachModerateandHighSLAAlertL2Resolution: boolean;
    abouttobreachLowSLAAlertL1Resolution: boolean;
    abouttobreachLowSLAAlertL2Resolution: boolean;
    slaBreachedfortheday: boolean;
    incorrectassignedQueue: boolean;
    agingModerateticketsGT2days: boolean;
    geographicalArea: string;
    inputJson: string;
    isActive: boolean;
    isProcessed: boolean;
    resolvedOutSideICAP: boolean;
    weekendticketsOutflowARF: boolean;
    weekendticketsInflowARF: boolean;
    escalationCount: number;
    hideDetails: boolean;
    // ticketType : string;

    // responseSLA : string;
    // resolutionSLA : string;
    taskType: string;
    lastupdated: any;
    // manualTag : string;
    // autoTag : string;
    icapStatus: any;
    shortdescriptionClusterName: string;
    shortdescriptionClusterManual: string;
    resolutionStepsClusterName: any;
    resolutionStepsClusterManual: any;
    type: string;
    crtype: string;
    risk: string;
    openedBy: string;
    requestedFor: string;
    requestState: string;
    dueDate: any;
    price: string;
    requestedBy: string;
    specialInstructions: string;
    problemType: any;
    sop: any;
    urgency: any;
    contactType: any;
    remshortdescription: string;
    clustername: string;
    remshortdescriptioncopy: string;
    remdescription: string;
    remdescriptioncopy: string;
    remresolutionsteps: string;
    remresolutionstepscopy: string;
    tags:any;
    // track : string;
    // pendingState : string;
    // ticketAge : number;
    // modifiedAge: number;
    // job : string;
    // resolutionSLALeft : number;
    // cluster_id : number;
    // cluster_name : string;
    // cluster_topicwords : string;
    // application : string;
    // durationl : number;
    // queue : string;
    // service : string;
    // duration_bigint : number;
    // responseSLA_date_time : any;
    // resolutionSLA_date_time : any;


    constructor(json?: any) {
        if (json != null) {
            this.number = json.number;
            this.shortdescription = json.shortdescription;
            this.assignmentgroup = json.assignmentgroup;
            this.assignedto = json.assignedto;
            this.caller = json.caller;
            this.category = json.category;
            this.createdby = json.createdby;
            this.closecode = json.closecode;
            this.closedby = json.closedby;
            this.configurationItem = json.configurationItem;
            this.configurationitem = json.configurationitem;
            this.closenotes = json.closenotes;
            this.closedDate = json.closeddate;
            this.closeddate = json.closeddate;
            this.comments = json.comments;
            this.createdDate = json.createddate;
            this.createddate = json.createddate;
            this.duedate = json.duedate;
            this.description = json.description;
            this.duration = json.duration;
            this.impact = json.impact;
            this.incidentstate = json.incidentstate;
            this.madesla = json.madesla;
            this.openedDate = json.openedDate;
            this.openedby = json.openedby;
            this.priority = json.priority;
            this.resolved = json.resolved;
            this.resolvedby = json.resolvedby;
            this.resourcepath = json.resourcepath;
            this.resolvedDate = json.resolvedDate;
            this.reopenedDate = json.reopenedDate;
            this.state = json.state;
            this.icapStatus = json.icap_status
            this.severity = json.severity;
            this.subcategory = json.subcategory;
            this.sysid = json.sysid;
            this.sladueDate = json.sladueDate;
            this.timeworked = json.timeworked;
            this.updatedby = json.updatedby;
            this.updatedDate = json.updatedDate;
            this.updateddate = json.updatedDate;
            this.incidentsubstate = json.incidentsubstate;
            this.firstServiceCommunicationDate = json.firstServiceCommunicationDate;
            this.assignedDate = json.assignedDate;
            this.resolutionCategory = json.resolutionCategory;
            this.resolutionsteps = json.resolutionsteps;
            this.resolutionSteps = json.resolutionSteps;
            this.additionalComments = json.additionalComments;
            this.resolveTime = json.resolveTime;
            this.businessRestoredUpdateMissingLT24Hrs = json.businessRestoredUpdateMissingLT24Hrs;
            this.businessRestoredUpdateMissingGT24hoursLT48 = json.businessRestoredUpdateMissingGT24hoursLT48;
            this.slaabouttobreachinanother30mins = json.slaabouttobreachinanother30mins;
            this.slaabouttobreachinanother60mins = json.slaabouttobreachinanother60mins;
            this.incorrectQueueAssignmentResolved = json.incorrectQueueAssignmentResolved;
            this.incorrectPriorityAssignmentResolved = json.incorrectPriorityAssignmentResolved;
            this.weekendticketsInflowART = json.weekendticketsInflowART;
            this.weekendticketsOutflowART = json.weekendticketsOutflowART;
            this.abouttobreachModerateandHighSLAAlertL1Resolution = json.abouttobreachModerateandHighSLAAlertL1Resolution;
            this.abouttobreachModerateandHighSLAAlertL2Resolution = json.abouttobreachModerateandHighSLAAlertL2Resolution;
            this.abouttobreachLowSLAAlertL1Resolution = json.abouttobreachLowSLAAlertL1Resolution;
            this.abouttobreachLowSLAAlertL2Resolution = json.abouttobreachLowSLAAlertL2Resolution;
            this.slaBreachedfortheday = json.slaBreachedfortheday;
            this.incorrectassignedQueue = json.incorrectassignedQueue;
            this.agingModerateticketsGT2days = json.agingModerateticketsGT2days;
            this.geographicalArea = json.geographicalArea;
            this.inputJson = json.inputJson;
            this.isActive = json.isActive;
            this.isProcessed = json.isProcessed;
            this.resolvedOutSideICAP = json.resolvedOutSideICAP;
            this.weekendticketsOutflowARF = json.weekendticketsOutflowARF;
            this.weekendticketsInflowARF = json.weekendticketsInflowARF;
            this.escalationCount = json.escalationCount;
            this.projectid = json.projectid;
            // this.responseSLA = json.responseSLA;
            // this.resolutionSLA = json.resolutionSLA;
            this.taskType = json.taskType;
            this.lastupdated = json.lastupdated;
            // this.manualTag = json.manualTag;
            // this.autoTag = json.autoTag;
            this.shortdescriptionClusterName = json.shortdescriptionClusterName;
            this.shortdescriptionClusterManual = json.shortdescriptionClusterManual;
            this.resolutionStepsClusterName = json.resolutionStepsClusterName;
            this.resolutionStepsClusterManual = json.resolutionStepsClusterManual;
            this.type = json.type;
            this.crtype = json.crtype;
            this.risk = json.risk;
            this.openedBy = json.openedBy;
            this.requestedFor = json.requestedFor;
            this.requestState = json.requestState;
            this.dueDate = json.dueDate;
            this.price = json.price;
            this.requestedBy = json.requestedBy;
            this.specialInstructions = json.specialInstructions;
            this.problemType = json.problemType;
            this.sop = json.sop;
            this.urgency = json.urgency;
            this.contactType = json.contactType;
            this.tags = json.tags;
            // this.businessService=json.businessService;
            // this.track = json.track;
            // this.pendingState = json.pendingState;
            // this.ticketAge = json.ticketAge;
            // this.modifiedAge= json.modifiedAge;
            // this.job = json.job;
            // this.resolutionSLALeft = json.resolutionSLALeft;
            // this.cluster_id = json.cluster_id;
            // this.cluster_name = json.cluster_name;
            // this.cluster_topicwords = json.cluster_topicwords;
            // this.application = json.application;
            // this.durationl = json.duationl;
            // this.queue = json.queue;
            // this.service = json.service;
            // this.duration_bigint = json.duration_bigint;
            // this.responseSLA_date_time = json.responseSLA_date_time;
            // this.resolutionSLA_date_time = json.resolutionSLA_date_time;
            //INC0015445
        }
    }

    // Utils

    static toArray(jsons: any[]): Incidents[] {
        let incidentss: Incidents[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                incidentss.push(new Incidents(json));
            }
        }
        return incidentss;
    }

    static toArrayJSON(jsons: any[]): Incidents[] {
        let incidentss: Incidents[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                incidentss.push(json);
            }
        }
        return incidentss;
    }
}
