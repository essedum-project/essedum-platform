export class BaseEntity{
    type: string;
    id: string;
    alias: string;
    description: string;
    data: any;
    constructor(type, id, alias, description, data) { this.type = type; this.id = id; this.alias = alias; this.description = description; this.data = data; }
    getType(){return this.type;}
    getId(){return this.id;}
    getAlias(){return this.alias;}
    getDescription(){return this.description;}
    getData(){return JSON.parse(this.data);}
    setType(type){this.type=type;}
    setId(id){this.id=id;}
    setAlias(alias){this.alias=alias;}
    setDescription(description){this.description=description;}
    setData(data){this.data=data;}
    
}