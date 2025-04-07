import { Injectable } from '@angular/core';
import { QueryOperator } from '../wrangling-static-files/expression-query-operator';
import { ExpBuilderOperator, ExpFunctionArguments } from '../wrangling-static-files/exp-builder-operators';
import { ALLOWEDSYMBOLS, DUALARGFUNCTIONS, LIST_VALUE_FUNCTIONS, SAMEATTRIBUTEFUNCTIONS } from '../wrangling.ts/wrangling-constants';

@Injectable({
  providedIn: 'root'
})
export class ExpressionBuilderUtilsService {
  errorMessage: string[];
  logicalOp1 = [];
  logicalOp2 = [];

  constructor() { }

  compareOpObjects(operatorObj1, operatorObj2) {
    return operatorObj1.name < operatorObj2.name
      ? -1
      : operatorObj1.name > operatorObj2.name
        ? 1
        : 0;
  }

  sortOpArray(operatorStaticData: QueryOperator[]): QueryOperator[] {
    return operatorStaticData.sort(this.compareOpObjects);
  }
  isDualParamFunction(funcParamObj): boolean {
    return DUALARGFUNCTIONS.includes(funcParamObj.name);
  }
  getTargetAttribute(targetColumn: string[]): string {
    let returnVal = null;
    if (targetColumn.length === 1) {
      returnVal = this.removeOuterBrackets(targetColumn[0]);
    } else {
      this.errorMessage.push('Single target attribute is allowed');
    }
    return returnVal;
  }
  getFirstAttribute(attributes, funObj): string {
    let returnVal = null;
    if (
      attributes.length > 0 &&
      funObj.parameters.includes('selected_column1')
    ) {
      returnVal = this.removeOuterBrackets(attributes[0]);
    } else if (
      funObj.numberOfAttributes === 0
    ) {
      returnVal = 'None';
    } else {
      this.errorMessage.push('Please select an existing attribute');
    }
    return returnVal;
  }

  getSecondAttribute(attributes, funObj): string {
    let returnVal = null;
    if (funObj.parameters.includes('selected_column2')) {
      if (attributes.length > 0 && attributes[1]) {
        returnVal = this.removeOuterBrackets(attributes[1]);
      } else {
        this.errorMessage.push('Please select another existing attribute');
      }
    }
    return returnVal;
  }

  getThirdAttribute(attributes, funObj): string {
    let returnVal = null;
    if (funObj.parameters.includes('selected_column3')) {
      if (attributes.length > 0 && attributes[2]) {
        returnVal = this.removeOuterBrackets(attributes[2]);
      } else {
        this.errorMessage.push('Please select another existing attribute');
      }
    }
    return returnVal;
  }

  getFourthAttribute(attributes, funObj): string {
    let returnVal = null;
    if (funObj.parameters.includes('selected_column4')) {
      if (attributes.length > 0 && attributes[3]) {
        returnVal = this.removeOuterBrackets(attributes[3]);
      } else {
        this.errorMessage.push('Please select another existing attribute');
      }
    }
    return returnVal;
  }
  removeLastSpecialChar(attributes, index) {
    return attributes[index - 1].charAt(attributes[index - 1].length - 1) ===
      ')'
      ? attributes[index - 1].substr(0, attributes[index - 1].length - 1)
      : attributes[index - 1];
  }
  getSymbolAttribute(attributes, funObj, symParamName): string {
    let symVal = null;
    funObj.parameters.forEach((paramName, index) => {
      if (paramName === symParamName) {
        if (ALLOWEDSYMBOLS.includes(attributes[index - 1])) {
          symVal = this.removeLastSpecialChar(attributes, index);
        } else {
          this.errorMessage.push('Please check comparison symbol');
        }
      }
    });
    return symVal;
  }
  removeOuterQuotes(value: string): string {
    if (!value) {
      return null;
    } else {
      let inputValue = null;
      if (value.charAt(0) === '"' && value.charAt(value.length - 1) === ')') {
        inputValue = value.substr(0, value.length - 1);
        value = inputValue;
      }
      if (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
        inputValue = value.slice(1, -1);
      }
      if (
        (value.charAt(0) === '"' && value.charAt(value.length - 1) !== '"') ||
        (value.charAt(0) !== '"' && value.charAt(value.length - 1) === '"')
      ) {
        inputValue = null;
        this.errorMessage.push('Operator value should be inside double quotes');
      }
      return inputValue;
    }
  }
  getMathValueAttribute(attributes, funObj): string {
    let symVal = 'None';
    funObj.parameters.forEach((paramName, index) => {
      if (paramName === 'value1') {
        if (
          attributes[index - 1] &&
          attributes[index - 1].charAt(0) === '"' &&
          attributes[index - 1].charAt(attributes[index - 1].length - 1) === ')'
        ) {
          symVal = this.removeOuterQuotes(
            this.removeLastSpecialChar(attributes, index)
          );
          if (funObj.valueType && funObj.valueType === 'numeric') {
            if (isNaN(Number(symVal))) {
              this.errorMessage.push('Please enter numeric value parameter');
            }
          }
        } else if (
          attributes[index - 1] &&
          funObj.valueType &&
          funObj.valueType === 'numeric' &&
          attributes[index - 1].charAt(0) !== '"'
        ) {
          symVal = this.removeLastSpecialChar(attributes, index);
          if (isNaN(Number(symVal))) {
            this.errorMessage.push('Please enter numeric value parameter');
          }
        } else if (
          attributes[index - 1] &&
          attributes[index - 1].charAt(0) !== '"' &&
          attributes[index - 1].charAt(attributes[index - 1].length - 1) === ')'
        ) {
          symVal = this.removeLastSpecialChar(attributes, index);
        } else {
          this.errorMessage.push('Please check value parameter');
        }
      }
    });
    return symVal.trim();
  }
  getMathAttribute(operandCols, funObj): string {
    let mathAtr = 'None';
    if (
      funObj.parameters.includes('selected_column2') &&
      operandCols[1] &&
      operandCols[1].charAt(0) === '[' &&
      operandCols[1].charAt(operandCols[1].length - 1) === ')'
    ) {
      mathAtr = this.removeOuterBrackets(operandCols[1]);
    }
    return mathAtr;
  }
  getMathValue(operandCols, funObj): string {
    let mathValue = 'None';
    if (
      funObj.parameters.includes('value1') &&
      operandCols[1] &&
      operandCols[1].charAt(operandCols[1].length - 1) === ')' &&
      funObj.valueType &&
      funObj.valueType === 'numeric'
    ) {
      if (operandCols[1].charAt(0) === '"') {
        mathValue = this.removeOuterQuotes(operandCols[1]);
        if (isNaN(Number(mathValue))) {
          this.errorMessage.push('Please enter numeric value parameter');
        }
      } else {
        if (operandCols[1].charAt(0) !== '[') {
          mathValue = operandCols[1].substr(0, operandCols[1].length - 1);
          if (isNaN(Number(mathValue))) {
            this.errorMessage.push('Please enter numeric value parameter');
          }
        }
      }
    }
    return mathValue;
  }
  getOldValueSubstitute(operandCols, funObj) {
    let mathValue1 = 'None';
    if (funObj.parameters.includes('value1') && operandCols[1]) {
      if (
        operandCols[1].charAt(0) === '"' &&
        operandCols[1].charAt(operandCols[1].length - 1) === '"'
      ) {
        mathValue1 = this.removeOuterQuotes(operandCols[1]);
      } else {
        mathValue1 = operandCols[1];
      }
    }
    return mathValue1;
  }
  getNewValueSubstitute(operandCols, funObj) {
    let mathValue2 = 'None';
    if (funObj.parameters.includes('value2') && operandCols[2]) {
      if (
        operandCols[2].charAt(0) === '"' &&
        operandCols[2].charAt(operandCols[2].length - 1) === ')'
      ) {
        mathValue2 = this.removeOuterQuotes(operandCols[2]);
      } else if (operandCols[2].charAt(operandCols[2].length - 1) === ')') {
        mathValue2 = operandCols[2].substr(0, operandCols[2].length - 1);
      }
    }
    return mathValue2;
  }

  getMathPackParams(
    targetCol: string[],
    funObj,
    operandCols: string[]
  ): { reqObj: any; msg: string[] } {
    let actionArgReqObj = [];
    if (
      operandCols.length === funObj.parameters.length - 1 &&
      !this.isDualParamFunction(funObj) &&
      funObj.name !== 'SUBT'
    ) {
      actionArgReqObj = [
        {
          target_column_name: this.getTargetAttribute(targetCol),
          selected_column1: this.getFirstAttribute(operandCols, funObj),
          selected_column2: this.getSecondAttribute(operandCols, funObj),
          operation_symbol: this.getSymbolAttribute(
            operandCols,
            funObj,
            'operation_symbol'
          ),
          value1: this.getMathValueAttribute(operandCols, funObj),
          value2: 'None',
        },
      ];
      return { reqObj: actionArgReqObj, msg: this.errorMessage };
      //for dual parameter functions
    } else if (this.isDualParamFunction(funObj) && operandCols.length < 3) {
      actionArgReqObj = [
        {
          target_column_name: this.getTargetAttribute(targetCol),
          selected_column1: this.getFirstAttribute(operandCols, funObj),
          selected_column2: this.getMathAttribute(operandCols, funObj),
          value1: this.getMathValue(operandCols, funObj),
          value2: 'None',
        },
      ];
      return { reqObj: actionArgReqObj, msg: this.errorMessage };
    } else if (funObj.name === 'SUBT') {
      if (operandCols.length < 3) {
        this.errorMessage.push('Substitution operator parameters not matching');
      } else {
        actionArgReqObj = [
          {
            target_column_name: this.getTargetAttribute(targetCol),
            selected_column1: this.getFirstAttribute(operandCols, funObj),
            selected_column2: 'None',
            value1: this.getOldValueSubstitute(operandCols, funObj),
            value2: this.getNewValueSubstitute(operandCols, funObj),
          },
        ];
      }
      return { reqObj: actionArgReqObj, msg: this.errorMessage };
    } else {
      this.errorMessage.push('Please check the expression');
      return { reqObj: actionArgReqObj, msg: this.errorMessage };
    }
  }
  getConditionalAttribute(attributes, funObj) {
    let returnVal = null;
    if (funObj.parameters.includes('conditional_column')) {
      if (attributes.length > 0 && attributes[1]) {
        returnVal = this.removeOuterBrackets(attributes[1]);
      } else {
        this.errorMessage.push('Please select conditional attribute');
      }
    }
    return returnVal;
  }
  getValueAttribute(attributes, funObj): string {
    let opVal = null;
    funObj.parameters.forEach((paramName, index) => {
      if (paramName === 'value') {
        if (
          attributes[index - 1] &&
          funObj.valueType &&
          funObj.valueType === 'numeric'
        ) {
          opVal = this.removeLastSpecialChar(attributes, index);
          if (isNaN(Number(opVal))) {
            this.errorMessage.push('Please enter numeric value parameter');
          }
        } else if (attributes[index - 1] && !funObj.valueType) {
          if (
            attributes[index - 1].charAt(0) === '"' &&
            attributes[index - 1].charAt(attributes[index - 1].length - 1) ===
            ')'
          ) {
            opVal = this.removeOuterQuotes(
              this.removeLastSpecialChar(attributes, index)
            );
          } else {
            opVal = this.removeLastSpecialChar(attributes, index);
          }
        } else {
          this.errorMessage.push('Please check value parameter');
        }
      }
    });
    return opVal;
  }

  getAggregatePackParams(targetCol, funObj, operandCols): any {
    const actionArgReqObj: ExpFunctionArguments[] = [
      {
        target_column_name: this.getTargetAttribute(targetCol),
        selected_column1: this.getFirstAttribute(operandCols, funObj),
        selected_column2: this.getSecondAttribute(operandCols, funObj),
        conditional_column: this.getConditionalAttribute(operandCols, funObj),
        value: this.getValueAttribute(operandCols, funObj),
        operation_symbol: this.getSymbolAttribute(
          operandCols,
          funObj,
          'operation_symbol'
        ),
      },
    ];
    return { reqObj: actionArgReqObj, msg: this.errorMessage };
  }

  getLogicalOpParameters(action, logicalQuery: string) {
    let opAttributes = [];
    this.logicalOp1 = [];
    this.logicalOp2 = [];
    const split = this.getDynamicTokens(logicalQuery, action.name);

    const firstExpression = this.getDynamicTokens(split[0], /\(([^)]+)\)/);
    this.logicalOp1 = firstExpression[0]
      ? this.getDynamicTokens(
        firstExpression[0],
        /[\s,](?=(?:"[^\["]*"|[^"\]])*$)/
      )
      : null;
    const secondExpression = this.getDynamicTokens(split[1], /\(([^)]+)\)/);
    this.logicalOp2 = secondExpression[0]
      ? this.getDynamicTokens(
        secondExpression[0],
        /[\s,](?=(?:"[^\["]*"|[^"\]])*$)/
      )
      : null;
    opAttributes.push(this.logicalOp1[0]);
    opAttributes = [...opAttributes, this.logicalOp2[0]];
    return opAttributes;
  }
  getDynamicTokens(dynamicString: string, exp: RegExp): string[] {
    return dynamicString
      .split(exp)
      .map((s) => s.trim())
      .filter((s) => s.length);
  }

  getLogicalPackParams(targetCol: string[], funObj, operandCols: string[]) {
    let actionArgReqObj = [];

    if (operandCols.length === funObj.numberOfAttributes) {
      actionArgReqObj = [
        {
          target_column_name: this.getTargetAttribute(targetCol),
          selected_column1: this.getFirstAttribute(operandCols, funObj),
          selected_column2: this.getSecondAttribute(operandCols, funObj),
          operation_symbol1: this.getLogicalSymbolAttribute(
            this.logicalOp1,
            funObj,
            'operation_symbol1'
          ),
          operation_symbol2: this.getLogicalSymbolAttribute(
            this.logicalOp2,
            funObj,
            'operation_symbol2'
          ),
          value1: this.getLogicalValueAttribute(this.logicalOp1, funObj),
          value2: this.getLogicalValueAttribute(this.logicalOp2, funObj),
        },
      ];
      return { reqObj: actionArgReqObj, msg: this.errorMessage };
    } else if (funObj.name === 'NOT') {
      this.logicalOp1 = [];
      this.logicalOp2 = [];
      actionArgReqObj = [
        {
          target_column_name: this.getTargetAttribute(targetCol),
          selected_column1: this.getFirstAttribute(operandCols, funObj),
          operation_symbol1: this.getSymbolAttribute(
            operandCols,
            funObj,
            'operation_symbol1'
          ),
          value1: this.getMathValueAttribute(operandCols, funObj),
        },
      ];
      return { reqObj: actionArgReqObj, msg: this.errorMessage };
    } else if (funObj.name === 'SWITCH') {
      this.logicalOp1 = [];
      this.logicalOp2 = [];
      actionArgReqObj = [
        {
          target_column_name: this.getTargetAttribute(targetCol),
          selected_column1: this.getFirstAttribute(operandCols, funObj),
          value1: this.getSwitchDefaultValue(operandCols),
          dict1: this.getDictValues(operandCols),
        },
      ];
      return { reqObj: actionArgReqObj, msg: this.errorMessage };
    } else {
      this.errorMessage.push('Please check the expression');
      return { reqObj: actionArgReqObj, msg: this.errorMessage };
    }
  }

  getDictValues(operandCols: string[]): any {
    let dictionaryList = {};
    operandCols.forEach((opVal) => {
      if (
        opVal.charAt(0) !== '[' &&
        opVal.charAt(opVal.length - 1) !== ']' &&
        opVal.charAt(opVal.length - 1) !== ')'
      ) {
        const dictParam = this.getDynamicTokens(opVal, /[:]/);
        if (dictParam) {
          dictionaryList = {
            ...dictionaryList,
            [dictParam[0].replace(/['"]+/g, '').trim()]: dictParam[1]
              .replace(/['"]+/g, '')
              .trim(),
          };
        } else {
          this.errorMessage.push('Please enter valid key value pairs');
        }
      }
    });
    if (Object.keys(dictionaryList).length === 0) {
      this.errorMessage.push('Please enter valid key value pairs');
    }
    return Object.keys(dictionaryList).length === 0 ? 'None' : dictionaryList;
  }

  getSwitchDefaultValue(operandCols) {
    let switchVal = 'None';
    if (
      operandCols[operandCols.length - 1].charAt(
        operandCols[operandCols.length - 1].length - 1
      ) === ')'
    ) {
      const val = operandCols[operandCols.length - 1].replace(/['"]+/g, '');
      switchVal =
        val.charAt(val.length - 1) === ')'
          ? val.substr(0, val.length - 1)
          : val;
    } else {
      this.errorMessage.push('Invalid expression');
    }
    return switchVal;
  }

  getLogicalSymbolAttribute(attributes, funObj, symParamName): string {
    let symVal = null;
    funObj.parameters.forEach((paramName) => {
      if (paramName === symParamName) {
        if (ALLOWEDSYMBOLS.some((sym) => attributes.includes(sym))) {
          symVal = ALLOWEDSYMBOLS.filter((sym) => attributes.includes(sym))[0];
        } else {
          this.errorMessage.push(
            'Please check comparison symbol, ' + symParamName
          );
        }
      }
    });
    return symVal;
  }

  getLogicalValueAttribute(attributes, funObj): string | number {
    let opVal: string | number = 'None';
    if (attributes[2] && !funObj.valueType) {
      if (isNaN(Number(attributes[2]))) {
        if (
          attributes[2].charAt(0) === '"' &&
          attributes[2].charAt(attributes[2].length - 1) === '"'
        ) {
          opVal = this.removeOuterQuotes(attributes[2]);
        } else {
          this.errorMessage.push('Please check value parameter');
        }
      } else {
        opVal = Number(attributes[2]);
      }
    } else {
      this.errorMessage.push('Please check value parameter');
    }
    return opVal;
  }
  getDateTimeAttribute(attributes, funObj, attIndex): string {
    let returnVal = null;
    if (funObj.parameters.includes('selected_column'+attIndex)) {
      if (attributes.length > 0 && attributes[attIndex-1]) {
        returnVal = this.removeOuterBrackets(attributes[attIndex-1]);
      } else {
        returnVal = 'None';
      }
    }
    return returnVal;
  }
  getDateTimePackParams(targetCol: string[], funObj, operandCols: string[]) {
    const actionArgReqObj = [
      {
        target_column_name: this.getTargetAttribute(targetCol),
        selected_column1: this.getFirstAttribute(operandCols, funObj),
        selected_column2: this.getSecondAttribute(operandCols, funObj),
        selected_column3: this.getDateTimeAttribute(operandCols, funObj,3),
        selected_column4: this.getDateTimeAttribute(operandCols, funObj,4),
        selected_column5: this.getDateTimeAttribute(operandCols, funObj,5),
        selected_column6: this.getDateTimeAttribute(operandCols, funObj,6),
        value1: this.getMathValueAttribute(operandCols, funObj),
      },
    ];
    return { reqObj: actionArgReqObj, msg: this.errorMessage };
  }

  getGroupbyPackParams(targetCol, funObj, operandCols): any {
    const actionArgReqObj: ExpFunctionArguments[] = [
      {
        target_column_name: this.getTargetAttribute(targetCol),
        selected_column1: this.getFirstAttribute(operandCols, funObj),
        selected_column2: this.getSecondAttribute(operandCols, funObj),
        conditional_column: this.getConditionalAttribute(operandCols, funObj),
        value: this.getValueAttribute(operandCols, funObj),
        operation_symbol: this.getSymbolAttribute(
          operandCols,
          funObj,
          'operation_symbol'
        ),
      },
    ];
    return { reqObj: actionArgReqObj, msg: this.errorMessage };
  }

  getTrigonometricPackParams(targetCol, funObj, operandCols): any {
    const actionArgReqObj = [
      {
        target_column_name: this.getTargetAttribute(targetCol),
        selected_column1: this.getFirstAttribute(operandCols, funObj),
        selected_column2: this.getSecondAttribute(operandCols, funObj),
      },
    ];
    return { reqObj: actionArgReqObj, msg: this.errorMessage };
  }

  getTypePackParams(targetCol, funObj, operandCols): any {
    const actionArgReqObj = [
      {
        target_column_name: this.getTargetAttribute(targetCol),
        selected_column1: this.getFirstAttribute(operandCols, funObj),
        value: this.getValueAttribute(operandCols, funObj),
      },
    ];
    return { reqObj: actionArgReqObj, msg: this.errorMessage };
  }

  getFinancePackPackParams(targetCol, funObj, operandCols): any {
    const actionArgReqObj = [
      {
        target_column_name: this.getTargetAttribute(targetCol),
        [funObj.attributes[0]]: this.getFirstAttribute(operandCols, funObj),
        [funObj.attributes[1]]: this.getSecondAttribute(operandCols, funObj),
        [funObj.attributes[2]]: this.getThirdAttribute(operandCols, funObj),
        [funObj.attributes[3]]: this.getFourthAttribute(operandCols, funObj),
        value: this.getValueAttribute(operandCols, funObj),
      },
    ];
    Object.keys(actionArgReqObj[0]).forEach(k =>
      (!actionArgReqObj[0][k] && actionArgReqObj[0][k] !== undefined) && delete actionArgReqObj[0][k]);
    return { reqObj: actionArgReqObj, msg: this.errorMessage };
  }

  validateSelectedColDataType(
    operatorObj: ExpBuilderOperator,
    selectedAttributes: string[],
    colDatatypes
  ): string {
    const colArray = [];

    selectedAttributes.forEach((attriName) => {
      const actualParam = this.removeOuterBrackets(attriName);
      colDatatypes.forEach((col) => {
        if (col.name === actualParam) {
          colArray.push(col);
        }
      });
    });

    if (operatorObj) {
      if (
        colArray[0] &&
        !operatorObj.dataTypes_1.includes(colArray[0].dataType)
      ) {
        return 'Cannot perform action due to datatype mismatch,the first_column in the formula should be ' + operatorObj.dataTypes_1;
      } else if (
        operatorObj.dataTypes_2 &&
        colArray[1] &&
        !operatorObj.dataTypes_2.includes(colArray[1].dataType)
      ) {
        return 'Cannot perform action due to datatype mismatch,the second_column in the formula should be ' + operatorObj.dataTypes_2;
      } else if (
        operatorObj.dataTypes_3 &&
        colArray[2] &&
        !operatorObj.dataTypes_3.includes(colArray[2].dataType)
      ) {
        return 'Cannot perform action due to datatype mismatch';
      } else if (
        operatorObj.dataTypes_4 &&
        colArray[1] &&
        !operatorObj.dataTypes_4.includes(colArray[3].dataType)
      ) {
        return 'Cannot perform action due to datatype mismatch';
      } else {
        return null;
      }
    }
  }
  removeOuterBrackets(columnName: string): string {
    if (!columnName) {
      return null;
    } else {
      let col = null;
      if (columnName.charAt(columnName.length - 1) === ')') {
        col = columnName.substr(0, columnName.length - 1).slice(1, -1);
      } else {
        col = columnName.slice(1, -1);
      }
      return col;
    }
  }
  getGeneralPackParams(targetCol: string[], funObj, operandCols: string[]) {
    let actionArgReqObj = [];
    if (
      operandCols.length === funObj.parameters.length - 1 &&
      !this.isDualParamFunction(funObj) &&
      funObj.name !== 'SUBT'
    ) {
      actionArgReqObj = [
        {
          target_column_name: this.getTargetAttribute(targetCol),
          selected_column1: this.getFirstAttribute(operandCols, funObj),
          selected_column2: this.getSecondAttribute(operandCols, funObj),
          operation_symbol: this.getSymbolAttribute(
            operandCols,
            funObj,
            'operation_symbol'
          ),
          value1: this.getMathValueAttribute(operandCols, funObj),
          value2: 'None',
        },
      ];
      if (SAMEATTRIBUTEFUNCTIONS.includes(funObj.name)) {
        if (
          actionArgReqObj[0].target_column_name ===
          actionArgReqObj[0].selected_column1
        ) {
          return { reqObj: actionArgReqObj, msg: this.errorMessage };
        } else {
          this.errorMessage.push(
            'Target and parameter attribute should be same.'
          );
          return { reqObj: actionArgReqObj, msg: this.errorMessage };
        }
      } else {
        return { reqObj: actionArgReqObj, msg: this.errorMessage };
      }
    } else {
      this.errorMessage.push('Please check the expression');
      return { reqObj: actionArgReqObj, msg: this.errorMessage };
    }
  }

  getComparisonPackParams(targetCol: string[], funObj, operandCols: string[]) {
    let actionArgReqObj = [];
    if (
      operandCols.length === funObj.parameters.length - 1 &&
      !this.isDualParamFunction(funObj) &&
      funObj.name !== 'SUBT'
    ) {
      actionArgReqObj = [
        {
          target_column_name: this.getTargetAttribute(targetCol),
          selected_column1: this.getFirstAttribute(operandCols, funObj),
          selected_column2: this.getSecondAttribute(operandCols, funObj),
          operation_symbol: this.getSymbolAttribute(
            operandCols,
            funObj,
            'operation_symbol'
          ),
          list1: this.getMathValueAttribute(operandCols, funObj),
          value2: 'None',
        },
      ];

      if (LIST_VALUE_FUNCTIONS.includes(funObj.name)) {
        actionArgReqObj[0].list1 = actionArgReqObj[0].list1
          .split(/[,"\[\]]/)
          .map((s) => s.trim())
          .filter((s) => s.length);
      }

      return { reqObj: actionArgReqObj, msg: this.errorMessage };
    } else {
      this.errorMessage.push('Please check the expression');
      return { reqObj: actionArgReqObj, msg: this.errorMessage };
    }
  }

  createExpressionObj(
    targetCol: string[],
    operandCols: string[],
    funObj
  ): { reqObj: any; msg: any } {
    this.errorMessage = Object.assign([]);
    if (
      funObj &&
      funObj.pack === 'aggregate' &&
      operandCols.length === funObj.parameters.length - 1
    ) {
      return this.getAggregatePackParams(targetCol, funObj, operandCols);
    } else if (funObj && funObj.pack === 'math') {
      return this.getMathPackParams(targetCol, funObj, operandCols);
    } else if (
      funObj &&
      funObj.pack === 'general' &&
      operandCols.length === funObj.parameters.length - 1
    ) {
      return this.getGeneralPackParams(targetCol, funObj, operandCols);
    } else if (
      funObj &&
      funObj.pack === 'comparison' &&
      operandCols.length === funObj.parameters.length - 1
    ) {
      return this.getComparisonPackParams(targetCol, funObj, operandCols);
    } else if (funObj && funObj.pack === 'logical') {
      return this.getLogicalPackParams(targetCol, funObj, operandCols);
    } else if (funObj && funObj.pack === 'groupby') {
      return this.getGroupbyPackParams(targetCol, funObj, operandCols);
    } else if (funObj && funObj.pack === 'datetime') {
      return this.getDateTimePackParams(targetCol, funObj, operandCols);
    } else if (funObj && funObj.pack === 'trigonometric') {
      return this.getTrigonometricPackParams(targetCol, funObj, operandCols);
    } else if (funObj && funObj.pack === 'type') {
      return this.getTypePackParams(targetCol, funObj, operandCols);
    } else if (funObj && funObj.pack === 'financepack') {
      return this.getFinancePackPackParams(targetCol, funObj, operandCols);
    } else {
      this.errorMessage.push('Invalid expression/parameters');
      return { reqObj: null, msg: this.errorMessage };
    }
  }

}
