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
export class UsmPortfolio {
 id: number;
 portfolioName: string;
 description: string;
 last_updated: any;
 constructor(json?: any) {
  if (json != null) {
   this.id = json.id;
   this.portfolioName = json.portfolioName;
   this.description = json.description;
   this.last_updated = json.last_updated;
  }
 }

 // Utils

 static toArray(jsons: any[]): UsmPortfolio[] {
  let usm_portfolios: UsmPortfolio[] = [];
  if (jsons != null) {
   for (let json of jsons) {
    usm_portfolios.push(new UsmPortfolio(json));
   }
  }
  return usm_portfolios;
 }
}
