export class AgentDirectory {
  id: number;
  alias: string;
  name: string;
  type: string;
  description: string;
  connectionDetails: string;
  organization: string;
  lastmodifiedby: string;
  lastmodifieddate: any;
  category: string;
  extras_json: any;
  interfacetype: string;
  
  // OASF Required Fields
  version: string;
  cid: string;
  previous_record_cid: string; // Links to previous version
  
  // OASF Optional but Recommended Fields
  creator: string;
  
  // OASF Collections
  modules: Array<{ name: string }>;
  skills: Array<{ name: string }>;
  domains: Array<{ name: string; description: string }>;
  locators: Array<{ locator_type: string; url: string }>;
  syncs: Array<{ target: string; frequency: string; last_sync: string }>;
  publications: Array<{ channel: string; published_date: string; status: string }>;
  extensions: Array<{ ext_key: string; ext_value: string; description: string }>;
  selectors: Array<{ sel_key: string; sel_value: string }>;
  signatures: Array<{ algorithm: string; value: string; certificate: string }>;
  tools: Array<{ name: string; description: string; parameters: Array<{ name: string; param_type: string; description: string }> }>;
  resources: Array<{ name: string; description: string; url: string }>;
  prompts: Array<{ name: string; description: string }>;

  constructor(json?: any) {
    if (json != null) {
      this.initializeBasicFields(json);
      this.initializeOasfFields(json);
    }
  }

  private initializeBasicFields(json: any): void {
    this.id = json.id ? json.id : 0;
    this.alias = json.alias;
    this.name = json.name;
    this.type = json.type;
    this.description = json.description;
    this.connectionDetails = json.connectionDetails;
    this.organization = json.organization;
    this.lastmodifiedby = json.lastmodifiedby;
    this.lastmodifieddate = json.lastmodifieddate;
    this.category = json.category;
    this.extras_json = json.extras;
    this.interfacetype = json.interfacetype;
  }

  private initializeOasfFields(json: any): void {
    this.version = this.getValueOrDefault(json.version, '1.0.0');
    this.cid = this.getValueOrDefault(json.cid, '');
    this.previous_record_cid = this.getValueOrDefault(json.previous_record_cid, '');
    this.creator = this.getValueOrDefault(json.creator, '');
    
    const arrayFields = ['modules', 'skills', 'domains', 'locators', 'syncs', 
                         'publications', 'extensions', 'selectors', 'signatures', 
                         'tools', 'resources', 'prompts'];
    arrayFields.forEach(field => {
      this[field] = this.getValueOrDefault(json[field], []);
    });
  }

  private getValueOrDefault<T>(value: T, defaultValue: T): T {
    return value !== undefined && value !== null ? value : defaultValue;
  }

  // Utils

  static toArray(jsons: any[]): AgentDirectory[] {
    const agents: AgentDirectory[] = [];
    if (jsons != null) {
      for (const json of jsons) {
        agents.push(new AgentDirectory(json));
      }
    }
    return agents;
  }
}


