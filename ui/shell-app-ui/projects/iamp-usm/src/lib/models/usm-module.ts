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
export class UsmModule {
    id: number;
    name: string;
    display_name: string;
    descriptions: string;
    module_type: string;
    url: any;
    users_count: number;
    constructor(json?: any) {
     if (json != null) {
      this.id = json.id;
      this.name = json.name;
      this.display_name = json.display_name;
      this.descriptions = json.descriptions;
      this.module_type = json.module_type;
      this.url = json.url;
      this.users_count = json.users_count;
     }
    }
   
    // Utils
   
    static toArray(jsons: any[]): UsmModule[] {
     let usm_modules: UsmModule[] = [];
     if (jsons != null) {
      for (let json of jsons) {
       usm_modules.push(new UsmModule(json));
      }
     }
     return usm_modules;
    }
   }
   