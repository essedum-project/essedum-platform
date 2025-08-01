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

import { Project } from "./project";
import { UsmPortfolio } from "./usm-portfolio";

export class DashConstant {
 id: number;
 project_name: string;
 keys: string;
 value: string;
 project_id: Project;
 portfolio_id: UsmPortfolio;
 constructor(json?: any) {
  if (json != null) {
   this.id = json.id;
   this.project_name = json.project_name;
   this.keys = json.keys;
   this.value = json.value;
   this.project_id = json.project_id;
    this.portfolio_id = json.portfolio_id
  }
 }

 // Utils

 static toArray(jsons: any[]): DashConstant[] {
  let dash_constants: DashConstant[] = [];
  if (jsons != null) {
   for (let json of jsons) {
    dash_constants.push(new DashConstant(json));
   }
  }
  return dash_constants;
 }
}
