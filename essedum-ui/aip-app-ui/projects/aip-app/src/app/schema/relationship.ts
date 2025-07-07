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
