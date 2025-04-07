export interface QueryOperator {
    name: string;
    code: string;
    pack: string;
    dataTypes_1: string[];
    dataTypes_2?: string[];
    dataTypes_3?: string[];
    dataTypes_4?: string[];
    parameters: string[];
    valueType?: string;
    numberOfAttributes: number;
    listOfModes: string[];
    tooltipMsg: string;
    helpText: {
      header: string;
      content: string[];
    };
  }