import { RecipeObject } from "../wrangling.ts/recipe-object";


export interface DynamicTab {
  label: string;
  icon: string;
  close: boolean;
  tooltip: string;
  recipe: RecipeObject;
  colsMetaData: any;
  objDetails: any;
  actionsPerformed: any[];
  saveBtnLabel: string;
  selectedFunctions: any[];
  selectedArgs: any[];
  actionsAvailable: any[];
  selectedColumnActions: any[];
  selectedColumnsTableAction: any[];
  columnDataTypes: any;
  updatedRecipeActions: string[];
  rows: any[];
  columns: any[];
  values: any[];
  filter: any[];
  attributeList: any[];
}
