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

import { Project } from "com-lib-util";
import { Phase } from "./phase";
import { Process } from "./process";

export class Document {
 id: number;
 name: string;
 description: string;
 dataContentType?: string;
 data: any;
 phase_id: Phase;
 process_id: Process;
 project_id: Project;
 transition_id: any;
 filename: string;
 status: string;
 upload_err: string;
 upload_date: Date;
 constructor(json?: any) {
  if (json != null) {
   this.id = json.id;
   this.name = json.name;
   this.description = json.description;
   this.dataContentType = json.dataContentType;
   this.data = json.data;
   this.phase_id = json.phase_id;
   this.process_id = json.process_id;
   this.project_id = json.project_id;
   this.transition_id = json.transition_id;
   this.filename = json.filename;
   this.status = json.status;
   this.upload_date = json.upload_date;
   this.upload_err = json.upload_err;
  }
 }

 // Utils

 static toArray(jsons: any[]): Document[] {
  let documents: Document[] = [];
  if (jsons != null) {
   for (let json of jsons) {
    documents.push(new Document(json));
   }
  }
  return documents;
 }
}
