export interface PivotTableRequest {
  dataframe:string;
  rows: string[]|string;
  columns: string[]|string;
  values: any;
  filter: any;
  //object_id: number;
  //recipe_id: number;
  //user_id: number;
  //recipe_name: string;
  //collection_name: string[]|string;
  //connection_id: number;
}
