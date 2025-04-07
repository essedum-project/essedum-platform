export interface ExpBuilderRequest {
  first_load: string;
  dataframe: string;
  function_name: string[];
  args: ExpFunctionArguments[];
  object_id: number;
  recipe_id: number;
  user_id: number;
  recipe_name: string;
  collection_id: number;
  connection_id: number;
  mode: string;
}
export interface ExpFunctionArguments {
  target_column_name: string;
  selected_column1: string;
  selected_column2: string;
  conditional_column: string;
  value: string;
  operation_symbol: string;
}
