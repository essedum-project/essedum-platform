export interface ExpBuilderOperator {
  name: string;
  code: string;
  dataTypes_1: string[];
  dataTypes_2?: string[];
  dataTypes_3?: string[];
  dataTypes_4?: string[];
  numberOfAttributes: number;
  parameters: string[];
  listOfModes: string[];
  tooltipMsg: string;
}
