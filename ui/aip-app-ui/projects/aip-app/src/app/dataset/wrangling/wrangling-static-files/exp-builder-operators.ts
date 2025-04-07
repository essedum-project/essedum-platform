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
  export interface ExpFunctionArguments {
    target_column_name: string;
    selected_column1: string;
    selected_column2: string;
    conditional_column: string;
    value: string;
    operation_symbol: string;
  }