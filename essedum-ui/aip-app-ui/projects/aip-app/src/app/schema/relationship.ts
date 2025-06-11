//
//  @ 2018 Infosys Limited, Bangalore, India. All Rights Reserved.
//  Version: 1.0
//  Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
//  this Program is protected by copyright laws, international treaties and  other pending or existing intellectual property
//  rights in India, the United States, and other countries. Except as expressly permitted, any unauthorized reproduction, storage,
//  transmission in any form or by any means(including without limitation electronic, mechanical, printing, photocopying,
//  recording, or otherwise), or any distribution of this program, or any portion of it, may result in severe civil and
//  criminal penalties, and will be prosecuted to the maximum extent possible under the law.
//

export class Relationship {
  id: number;
  name: string;
  organization: string;
  schema_relation: string;
  schemaA: string;
  schemaB: string;
  relationship_template?: string;

  constructor(json?: any) {
    if (json != null) {
      this.id = json.id;
      this.name = json.name;
      this.schemaA = json.schemaA;
      this.schemaB = json.schemaB;
      this.organization = json.organization;
      this.schema_relation = json.schema_relation;
      this.relationship_template = json.relationship_template;
    }
  }

  // Utils

  static toArray(jsons: any[]): Relationship[] {
    const rel: Relationship[] = [];
    if (jsons != null) {
      for (const json of jsons) {
        rel.push(new Relationship(json));
      }
    }
    return rel;
  }
}
