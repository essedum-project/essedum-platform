export interface AttributeTypeList {
  attributeID: number;
  attributeType: string;
  attributes: AttributeObject[];
}

export interface AttributeObject {
  attributeName: string;
  attributeID: number;
  attributeDataType: string;
}
