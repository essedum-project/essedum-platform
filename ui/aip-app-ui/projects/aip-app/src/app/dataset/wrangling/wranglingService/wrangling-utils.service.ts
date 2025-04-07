import { Injectable } from '@angular/core';
import { ColumnMetaData } from '../wrangling-static-files/wrangling-col-metadata';
import ACTIONS from '../wrangling-static-files/actions-column.json';
import { COLUMNDATATYPES, TransformObject } from '../../datasets';
import { TRANSFORMATION_FUNCTIONS } from '../wrangling-static-files/wrangling-transform-labels';
import { TRANSNONCOLUMNACTIONS } from '../../staticfile/constant';

@Injectable({
  providedIn: 'root'
})
export class WranglingUtilsService {

  constructor() { }
  public getRangeColumns(
    selectedColumns: string[],
    colsMetaData: ColumnMetaData[]
  ): string[] {
    const rangeColumns = [];
    let startIndex = 0;
    let endIndex = 0;
    colsMetaData.map((metadata, index) => {
      if (selectedColumns[0] === metadata.header) {
        startIndex = index;
      }
      if (selectedColumns[1] === metadata.header) {
        endIndex = index;
      }
    });
    for (let i = startIndex; i <= endIndex; i++) {
      rangeColumns.push(colsMetaData[i].header);
    }
    return rangeColumns;
  }

  public getSingleColumnActions(dataTypes, selectedDatatype) {
    return ACTIONS.dynamic.filter(
      (action) =>
        action.availability.includes('single') &&
        action.dataTypes.includes(dataTypes[selectedDatatype.header])
    );
  }

  public getAdvisoryFunctions(actions) {
    const obj = [];
    const functionArray = [];
    const argsArray = [];
    const columnsArray = [];
    actions.forEach((element) => {
      functionArray.push(element.function);
      argsArray.push(element.argument);
      columnsArray.push(element.columns);
    });
    obj.push(functionArray);
    obj.push(argsArray);
    obj.push(columnsArray);
    return obj;
  }

  getSubFunction(functionName, args): string {
    let subFunction = '';
    switch (functionName) {
      case 'rounding_column_value': {
        subFunction =
          args['round_operations'] === 'Round'
            ? 'Precision(' + args['round_decimals'] + ')'
            : args['round_operations'];
        break;
      }
      case 'frame_sorter': {
        subFunction =
          args['sort_ascending'] === 'DESC' ? 'Descending' : 'Ascending';
        break;
      }
      case 'rename_column': {
        subFunction = 'New Col:' + args['new_column_name'];
        break;
      }
      case 'drop_missing_values': {
        const type = args['axis_value'] === 0 ? 'Row Level' : 'Column Level';
        subFunction = type;
        break;
      }
      case 'drop_missing_data_by_threshold_value': {
        const type = args['axis_value'] === 0 ? 'Row Level' : 'Column Level';
        subFunction = type + '(' + args['threshold_value'] + ')';
        break;
      }
      case 'remove_column_whitespace': {
        if (args['strip_type'] === 'strip') {
          subFunction = 'LTrim,RTrim';
        } else {
          subFunction = args['strip_type'] === 'lstrip' ? 'LTrim' : 'RTrim';
        }
        break;
      }
      case 'case_converter': {
        if (args['conv_case'] === 'INITCAP') {
          subFunction = 'Camelcase';
        } else {
          subFunction =
            args['conv_case'] === 'UPPER' ? 'Uppercase' : 'Lowercase';
        }
        break;
      }
      case 'find_and_update_column_data': {
        subFunction = args['char_to_remove'] + ' => ' + args['char_to_replace'];
        break;
      }
      case 'column_data_type_conversion': {
        if (typeof args === 'string') {
          subFunction = args;
        }
        break;
      }
    }
    return subFunction;
  }

  getActions(
    actionsPerformed,
    tempTransformObj: TransformObject,
    entityType: string,
    columnDataTypes,
    selectedColumns,
    selectedColHeader
  ): any[] {
    console.log(selectedColumns);   
    console.log(selectedColHeader);
    
    const tempArray = actionsPerformed;
    const functionName = tempTransformObj.function_name[0];
    const functionLabel = TRANSFORMATION_FUNCTIONS.find(
      (entity) => entity.name === functionName
    ).label;
    if (
      TRANSNONCOLUMNACTIONS.indexOf(functionName) > -1 ||
      entityType === 'Table'
    ) {
      tempArray.push({
        actionID: null,
        actionLabel: functionLabel,
        actionName: functionName,
        columns: 'NA',
        subFunc: this.getSubFunction(functionName, tempTransformObj.args[0]),
      });
    } else {
      if (functionName === 'column_data_type_conversion') {
        const oldDatatypeCode =
          columnDataTypes[tempTransformObj.args[0]['column_name'][0]];

        const oldDatatype = COLUMNDATATYPES.find(
          (entity) => entity.code === oldDatatypeCode
        ).name;
        const newDatatype = COLUMNDATATYPES.find(
          (entity) => entity.code === tempTransformObj.args[0]['column_dtype']
        ).name;
        tempArray.push({
          actionID: null,
          actionLabel: functionLabel,
          actionName: functionName,
          subFunc: this.getSubFunction(
            functionName,
            oldDatatype + ' => ' + newDatatype
          ),
          columns: selectedColumns,
          oldDataType: oldDatatypeCode,
        });
      } else {
        tempArray.push({
          actionID: null,
          actionLabel: functionLabel,
          actionName: functionName,
          columns:
            selectedColumns.length === 0
              ? selectedColHeader.header
              : selectedColumns,
          subFunc: this.getSubFunction(functionName, tempTransformObj.args[0]),
        });
      }
    }
    return tempArray;
  }
  createTransformObject(selectedRecipe): TransformObject {
    const transformObj: TransformObject = new TransformObject();
    transformObj.recipe_id = selectedRecipe.recipe_id;
    transformObj.recipe_name = selectedRecipe.recipe_name;
    transformObj.collection_name = selectedRecipe.collection_name 
      ? [...selectedRecipe.collection_name] : [];
    transformObj.connection_id = selectedRecipe.connection_id;
    transformObj.object_id = selectedRecipe.object_id;
    transformObj.first_load = selectedRecipe.first_load;
    transformObj.user_id = Number(localStorage.getItem('user_id'));
    transformObj.function_name = [];
    transformObj.args = [];
    transformObj.screen = 'wrangling';
    transformObj.dataset_type = selectedRecipe.dataset_type;
    return transformObj;
  }
}
