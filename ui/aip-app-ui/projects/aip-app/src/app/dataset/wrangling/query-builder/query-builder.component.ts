import { Component, ElementRef, EventEmitter, Input, Output, SimpleChange, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import { AnimationEvent } from '@angular/animations';
import { PopoverModule, ButtonModule, LedsModalService } from 'leds-lib';
import { DEFAULT_OPERATOR_PACKS, EXCECPTION_PACKS, FUNCPATTERNREGEX, NO_ATTRIBUTE_FUNCTION, QUERY_OPERATOR_TABLE_HEADERS } from '../../datasets';
import { EXP_BUILDER } from '../wrangling-static-files/expression-builder-func';
import { QueryOperator } from '../wrangling-static-files/expression-query-operator';
import { OVERLAYANIMATION } from '../wrangling-static-files/annimations';
import { ExpressionBuilderUtilsService } from '../wranglingService/expression-builder-utils.service';
import { SAMEATTRIBUTEFUNCTIONS } from '../wrangling.ts/wrangling-constants';

@Component({
  selector: 'app-query-builder',
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.scss'],
  animations: OVERLAYANIMATION,
})
export class QueryBuilderComponent {
  @ViewChild('panel') listBox: ElementRef;
  @ViewChild('formulaInfo') formulaInfo: OverlayPanel;

  @Output() expressionSaved = new EventEmitter();
  controlValue = '';
  inputFieldValue = '';
  filteredResult: { name: string; dataType: string }[] = [];
  displayOverlay = false;
  focusInput: boolean;
  highlightOptionChanged: boolean;
  tooltipMessage: string;
  overlay: HTMLDivElement;
  dimensionText: string = 'Test';
  hideToolTip = false;
  lexerMethodErrorMessage: string;
  @Input() recipeName: any;
  @Input('datasetsCount') datasetsCount: any;
  helperText: { header: string; content: string[] };
  emptyExpText: string = 'Please start an expression => [newcol] = [existing_column] . functionName()';

  @Input() resetQuery: boolean;
  queryBuilderLbls = {
    title: 'Selected Operator Packs',
    noSel: 'No operator packs selected',
  };
  selectedOperators = DEFAULT_OPERATOR_PACKS;
  operatorListHeaders = QUERY_OPERATOR_TABLE_HEADERS;
  originalList = [];
  operatorsList = [];
  operatorRowIndex = {};
  operatorList: { pName: string, msg: string[] }[] = [];
  filteredOperatorsList: any;
  packFilteredList = [];
  selectedOperatorsList = [];
  selectedOp: any;
  allQueryOperators: QueryOperator[] = [];
  tokenizedArray: string[] = [];
  opAttributes: string[] = [];
  selectedFunc;
  selectedFuncObj;
  funcOperator;
  funcMode: string;
  highLightListOption: any;
  currentTargetAttribute: string[] = [];
  secondaryToken: string[] = [];
  inputKeyDown: boolean;
  attributeSearch: boolean;
  typeOfList: string;
  tokenSearchParam: string;
  columnWithTypesArray: { name: string; dataType: string; id: number }[] = [];
  @Input() columnDataTypes: any;
  sqBracCloseToken = ']';
  endDelimiter = ')';
  options=[];
  colName:any[]=[];
  //rowData:any;

  constructor(
    private modalService: LedsModalService,
    private expUtilsService: ExpressionBuilderUtilsService
  ) { }


  ngOnInit() {
    console.log('columnDataTypes',this.columnDataTypes);   
    this.getSelectedPacksOperators();
    this.originalList = EXP_BUILDER;
    //this.updateRowExpandableTable();
    //this.getPackName();
    this.updatedTable();
    console.log('queryrecipeName', this.recipeName);
    console.log('inputField',this.inputFieldValue);
    //this.getColumnNameDataTypes();
    

  }
  ngOnChanges(change: SimpleChange) {
    if (change['columnDataTypes'] && change['columnDataTypes'].currentValue) {
      this.getColumnNameDataTypes();
    }
    if (change['resetQuery'] && change['resetQuery'].currentValue === true) {
      this.clearQueryForm();
    }
  }
  checkPackSelected(packName: string): string {
    return this.selectedOperators.find((obj) => obj.pack === packName)
      ? '  (Selected)'
      : null;
  }
  checkSelectedOperator(packName: string) {
    console.log('selectedPack', packName);
    //  this.selectedOp = '(selected)';

    if (this.selectedOperatorsList.includes(packName)) {
      // Remove the packName if it already exists
      this.selectedOperatorsList = this.selectedOperatorsList.filter(op => op !== packName);
    } else {
      // Push the packName into the list
      this.selectedOperatorsList.push(packName);
    }

    console.log('selectedOpList', this.selectedOperatorsList);



  }
  getSelectedPacksOperators() {
    this.packFilteredList = Object.assign([]);
    this.allQueryOperators = [];
    const dataset = EXP_BUILDER;
    this.selectedOperators.forEach((eachOp) => {
      this.packFilteredList = [
        ...this.packFilteredList,
        ...dataset.filter((listObj) => listObj.pack === eachOp.pack),
      ];
    });

    const opList = Object.assign([], this.packFilteredList);
    this.allQueryOperators = this.expUtilsService.sortOpArray(opList);
    console.log('opList', opList);

  }
  findOptionIndex(option): number {
    let index = -1;
    if (this.filteredResult && option) {
      for (let i = 0; i < this.filteredResult.length; i++) {
        if (option.name === this.filteredResult[i].name) {
          index = i;
          break;
        }
      }
    }
    return index;
  }
  //   getPackName(){
  //     this.originalList.forEach((builder)=>{
  //       this.operatorsList.push(builder.pack);
  //       // if(){}
  //     });
  //     // Using Set to filter unique values
  // this.filteredOperatorsList = [...new Set(this.operatorsList)];
  // console.log('unique value',this.filteredOperatorsList);

  //   }
  updateRowExpandableTable() {
    for (let i = 0; i < this.originalList.length; i++) {
      const rowData = this.originalList[i];
      const packName = rowData.pack;
      //this.operatorList.push({pName:packName,msg:rowData.tooltipMsg})

      if (i === 0) {
        this.operatorRowIndex[packName] = { index: 0, size: 1, msg: rowData.tooltipMsg };
        this.operatorList.push({ pName: packName, msg: rowData.tooltipMsg })
      } else {
        const previousRowData = this.originalList[i - 1];
        const previousRowGroup = previousRowData.pack;
        if (packName === previousRowGroup) {
          this.operatorRowIndex[packName].size++;
          this.operatorList.push({ pName: packName, msg: rowData.tooltipMsg });

          //this.operatorRowIndex[packName].pName.push(rowData.tooltipMsg)
        } else {
          this.operatorRowIndex[packName] = { index: i, size: 1, msg: rowData.tooltipMsg };

          this.operatorList.push({ pName: packName, msg: rowData.tooltipMsg })
        }
      }
    }
    console.log('operatorIndex', this.operatorRowIndex);
    console.log('opertatorList', this.operatorList);


  }
  updatedTable() {

    const operatorDict: Record<string, { name: string; msg: string }[]> = {};

    for (const item of this.originalList) {
      const { pack, name, tooltipMsg } = item;
      if (!operatorDict[pack]) {
        operatorDict[pack] = [];
      }
      operatorDict[pack].push({ name, msg: tooltipMsg });
    }

    this.operatorsList = Object.entries(operatorDict).map(([pack, operator]) => ({
      pack,
      operator,
    }));

    console.log('outputArray', this.operatorsList);
  }

  saveQueryForm() {
    console.log('entered saveQueryForm');    
    if (this.lexerMethodErrorMessage === null) {
      this.lexerMethodErrorMessage = this.expUtilsService.validateSelectedColDataType(
        this.selectedFunc,
        this.opAttributes,
        this.columnWithTypesArray
      );
      if (this.lexerMethodErrorMessage === null) {
        const actionPerformed = this.expUtilsService.createExpressionObj(
          this.currentTargetAttribute,
          this.opAttributes,
          this.selectedFunc
        );
        this.lexerMethodErrorMessage = actionPerformed.msg;
        if (this.lexerMethodErrorMessage.length === 0) {
          console.log(this.selectedFunc);
          
          const expActionType = SAMEATTRIBUTEFUNCTIONS.includes(
            this.selectedFunc.name
          )
            ? 'Column'
            : 'Table';

          this.expressionSaved.emit({
            argument: actionPerformed.reqObj,
            function: this.selectedFunc.code,
            actionType: expActionType,
          });
          this.formulaInfo.hide();
        }
      }
    }
  }

  clearQueryForm() {
    // this.hasEqualsDelimiter = false;
    // this.hasOpenBrackets = false;
    // this.hasClosedBrackets = false;
    // this.finalFunctionObj = null;
    // this.operandAttributes = [];
    this.inputFieldValue = null;
    this.displayOverlay = false;
    this.tooltipMessage = null;
    this.helperText = null;
    this.selectedFuncObj = null;
    this.lexerMethodErrorMessage = null;
    this.funcOperator = null;
    this.opAttributes = [];
    this.selectedFunc = null;
    this.secondaryToken = null;
    this.hideToolTip = true;
    if (this.formulaInfo) {
      this.formulaInfo.hide();
    }
  }
    /**method to perform on backward key stroke */
  checkBackwardDelete(inputEvent) {
    if (inputEvent['inputType'] === 'deleteContentBackward') {
      this.lexerMethodErrorMessage = null;
      this.tokenizedArray = [];
      //check for operands
      this.opAttributes.forEach((singleOp, index) => {
        if (!this.inputFieldValue.includes(singleOp)) {
          this.opAttributes.splice(index, 1);
        }
      });
      if (
        this.selectedFunc &&
        !this.inputFieldValue.includes(this.selectedFunc['name'])
      ) {
        this.selectedFuncObj = [];
        this.funcOperator = null;
        this.tooltipMessage = null;
        this.helperText = null;
        this.funcMode = null;
        this.selectedFunc = null;
      } else if (!this.selectedFunc) {
        this.selectedFuncObj = [];
        this.funcOperator = null;
        this.tooltipMessage = null;
        this.helperText = null;
        this.funcMode = null;
        this.selectedFunc = null;
      }
      this.currentTargetAttribute.forEach((tar, index) => {
        if (!this.inputFieldValue.includes(tar)) {
          this.currentTargetAttribute.splice(index, 1);
        }
      });
      this.getTokenizedArray(this.inputFieldValue);
    }
  }
  displayOverlayItems() {
    //as per this logic always start with a target attribute
    if (this.tokenizedArray.length === 1) {
      const lastTokenIndex = this.tokenizedArray.length - 1;
      const lastToken = this.tokenizedArray[lastTokenIndex];

      //check token chars of first token
      if (
        lastToken.charAt(0) === '[' &&
        lastToken.charAt(lastToken.length - 1) !== ']' &&
        this.inputFieldValue
      ) {
        this.displayOverlay = true;
        this.highlightOptionChanged = true;
        this.attributeSearch = true;
        this.getTargetAttributeFilterList(this.tokenizedArray[lastTokenIndex]);
      } else {
        this.displayOverlay = false;
        this.attributeSearch = false;
      }
      //hide column list
      if (
        lastToken.charAt(lastToken.length - 1) === this.sqBracCloseToken ||
        lastToken.charAt(lastToken.length - 1) === this.endDelimiter
      ) {
        this.displayOverlay = false;
        this.attributeSearch = false;
      }
    } else if (this.tokenizedArray.length > 1) {
      //here we need to check total tokens greater than one
      //expression can start with attribute or funct name
      let lastItemInSubToken = null;
      const secTokenArrayCount = this.secondaryToken.length;
      const secLastToken = this.secondaryToken[secTokenArrayCount - 1];
      const tokenArryCount = this.tokenizedArray.length - 1; //2 items
      const primArryLastToken = this.tokenizedArray[tokenArryCount];
      const primLastChar = this.tokenizedArray[tokenArryCount].charAt(
        primArryLastToken.length - 1
      );
      //if period delimter is present then secondary Array length will be > 1
      const subTokens = this.getDynamicTokens(
        this.tokenizedArray[tokenArryCount],
        /[.]/
      );
      if (this.selectedFunc) {
        lastItemInSubToken = subTokens[subTokens.length - 1].substring(
          this.selectedFunc.name.length + 1
        );
      }
      if (
        secLastToken &&
        secLastToken.charAt(0) === '[' &&
        secLastToken.charAt(secLastToken.length - 1) !== ']' &&
        this.tokenizedArray[tokenArryCount].charAt(
          primArryLastToken.length - 1
        ) !== '('
      ) {
        this.displayOverlay = true;
        this.highlightOptionChanged = true;
        this.attributeSearch = true;
        this.getTargetAttributeFilterList(secLastToken);
      } else if (
        this.tokenizedArray[tokenArryCount].charAt(
          primArryLastToken.length - 1
        ) !== '(' &&
        this.tokenizedArray[tokenArryCount].charAt(
          primArryLastToken.length - 1
        ) !== ')' &&
        !lastItemInSubToken &&
        !this.funcOperator
      ) {
        this.displayOverlay = true;
        this.attributeSearch = false;
        this.getFucNameFilterList(secLastToken);
      } else if (
        secLastToken &&
        secLastToken.match(FUNCPATTERNREGEX) &&
        this.selectedFunc &&
        this.selectedFunc.listOfModes.length > 0 &&
        subTokens.length > 1 &&
        lastItemInSubToken.length > 0
      ) {
        this.attributeSearch = false;
        this.displayOverlay = true;
        this.getModesFilterList(lastItemInSubToken);
      } else if (
        this.tokenizedArray[tokenArryCount].charAt(
          primArryLastToken.length - 1
        ) === ')'
      ) {
        this.displayOverlay = false;
        this.attributeSearch = false;
        this.getTargetAndFunctionName();
      } else {
        this.displayOverlay = false;
      }
    } else {
      this.displayOverlay = false;
      this.attributeSearch = false;
    }
  }
  getFucNameFilterList(queryParamToken: string) {
    const filtered: any[] = [];
    const param = queryParamToken
      .substring(queryParamToken.indexOf('.') + 1)
      .trim();
    this.tokenSearchParam = param;
    this.typeOfList = 'funcName';
    if (!queryParamToken.substring(queryParamToken.indexOf('.') + 1)) {
      this.tooltipMessage = null;
      this.helperText = null;
    }
    if (this.attributeSearch === false && param.length > 0) {
      for (let i = 0; i < this.allQueryOperators.length; i++) {
        const methodObj = this.allQueryOperators[i];
        if (
          methodObj.name
            .toLowerCase()
            .indexOf(
              queryParamToken
                .substring(queryParamToken.indexOf('.') + 1)
                .toLowerCase()
            ) === 0
        ) {
          filtered.push(methodObj);
        }
        this.filteredResult = filtered;
        console.log('filteredResult inside FunName ',this.filteredResult);
        
        this.highLightListOption = this.filteredResult[0];
      }
    }
  }
  getModesFilterList(queryParamToken: string) {
    this.tokenSearchParam = queryParamToken;
    this.typeOfList = 'modes';
    const filtered: any[] = [];
    for (let i = 0; i < this.selectedFuncObj.length; i++) {
      const columnObj = this.selectedFuncObj[i];
      if (
        columnObj.name.toLowerCase().indexOf(queryParamToken.toLowerCase()) ===
        0
      ) {
        filtered.push(columnObj);
      }
      this.filteredResult = filtered;
      console.log('filteredResult inside MOdels Filter',this.filteredResult);
      
      this.highLightListOption = this.filteredResult[0];
    }
  }
  getColumnNameDataTypes() {
    this.columnWithTypesArray = [];
    Object.keys(this.columnDataTypes).map((columnObj, index) => {
      this.columnWithTypesArray.push({
        name: columnObj,
        dataType: this.columnDataTypes[columnObj],
        id: index + 1,
      });
    });
    this.filteredResult = this.columnWithTypesArray;
    this.filteredResult.forEach(option=>{
      const colValue = '['+option.name +']'
      this.colName.push(colValue);
    })
    this.options=this.colName
    console.log('colName',this.colName);
    console.log('filteredResult inside Column Name DataType',this.filteredResult);
  }
  getTargetAttributeFilterList(queryParamToken: string) {
    this.tokenSearchParam = queryParamToken;
    this.typeOfList = 'attrName';
    const filtered: any[] = [];
    this.colName=[];
    if (this.attributeSearch === true) {
      for (let i = 0; i < this.columnWithTypesArray.length; i++) {
        const columnObj = this.columnWithTypesArray[i];
        if (
          columnObj.name.toLowerCase().indexOf(
            queryParamToken
              .substring(queryParamToken.indexOf('[') + 1)
              .trim()
              .toLowerCase()
          ) === 0
        ) {
          filtered.push(columnObj);
        }
        this.filteredResult = filtered;
        //console.log('filteredResult inside target Arrtibute Filter',this.filteredResult);
        this.highLightListOption = this.filteredResult[0];
        console.log('highLightListOption',this.highLightListOption);
        
      }
    }
    this.filteredResult.forEach(option=>{
      const colValue = '['+option.name +']'
      this.colName.push(colValue);
    })
    this.options=this.colName
    console.log('colName',this.colName);
    
  }

  getDynamicTokens(dynamicString: string, exp: RegExp): string[] {
    return dynamicString
      .split(exp)
      .map((s) => s.trim())
      .filter((s) => s.length);
  }
  getTokenizedArray(inputTextValue: string) {
    if (inputTextValue) {
      this.tokenizedArray = this.getDynamicTokens(inputTextValue, /=(.+)/);
    }
    console.log('tokenizedArray',this.tokenizedArray);
    
  }
  checkSecondaryTokens() {
    //get secondary tokens
    if (this.tokenizedArray.length > 1) {
      this.secondaryToken = this.getDynamicTokens(
        this.tokenizedArray[1],
        /[?\(\).,\s]/
      );
    }
  }
  getInputCharacters(inputText: Event) {
    const inputTextValue = (inputText.srcElement as HTMLInputElement).value;
    this.lexerMethodErrorMessage = null;
  //  this.formulaInfo.hide();
    this.hideToolTip = false;
    //tokenize input
    this.getTokenizedArray(inputTextValue);
    this.checkBackwardDelete(inputText);
    //secondary token
    this.checkSecondaryTokens();
    this.displayOverlayItems();
   }
  textInputKeyPress(event) { 
    if (this.displayOverlay) {
      const highlightItemIndex = this.findOptionIndex(this.highLightListOption);
      const actualHeight = this.overlay
        ? parseInt(this.overlay.style.maxHeight, 10)
        : 200;
      switch (event.which) {
        //down
        case 40:
          if (highlightItemIndex !== -1) {
            const nextItemIndex = highlightItemIndex + 1;
            if (nextItemIndex !== this.filteredResult.length) {
              this.highLightListOption = this.filteredResult[nextItemIndex];
              this.highlightOptionChanged = true;
              if (25 * nextItemIndex >= actualHeight) {
                this.listBox.nativeElement.scrollTop =
                  this.listBox.nativeElement.scrollTop === 0
                    ? actualHeight + 24
                    : this.listBox.nativeElement.scrollTop + 24;
              }
            }
          } else {
            this.highLightListOption = this.filteredResult[0];
          }
          event.preventDefault();
          break;
        //up
        case 38:
          if (highlightItemIndex > 0) {
            const prevItemIndex = highlightItemIndex - 1;
            this.highLightListOption = this.filteredResult[prevItemIndex];
            this.highlightOptionChanged = true;
            if (25 * prevItemIndex >= actualHeight) {
              this.listBox.nativeElement.scrollTop =
                this.listBox.nativeElement.scrollTop === 0
                  ? actualHeight - 24
                  : this.listBox.nativeElement.scrollTop - 24;
            }
            if (prevItemIndex < 5) {
              this.listBox.nativeElement.scrollTop = 0;
            }
          }
          event.preventDefault();
          break;
        // enter
        case 13:
          if (this.highLightListOption) {
            this.selectListItem(this.highLightListOption, event);
            this.hide();
          }
          event.preventDefault();
          break;
        //escape
        case 27:
          this.hide();
          event.preventDefault();
          break;
        //tab
        case 9:
          if (this.highLightListOption) {
            this.selectListItem(this.highLightListOption, event);
            this.hide();
          }
          event.preventDefault();
          break;
      }
    } else if (event.which === 13) {
      this.saveQueryForm();
    }
    this.inputKeyDown = true;
  }
  selectListItem(option: any, event) {
    let newParameter = option.name;
    const focusInput = true;
    this.filteredResult = [];
    this.colName=[];
    this.getTokenizedArray(this.inputFieldValue);
    const funcObj = this.allQueryOperators.find(
      (operator) => operator.name === option.name
    );

    if (funcObj) {
      this.selectedFunc = funcObj;
      this.tooltipMessage = this.selectedFunc.tooltipMsg;
      this.helperText = this.selectedFunc.helpText;
      this.selectedFuncObj = this.selectedFunc.listOfModes;
      this.formulaInfo.show(event);
    }
    if (this.attributeSearch === true && this.typeOfList === 'attrName') {
      if (
        this.inputFieldValue.charAt(this.inputFieldValue.length - 1) === ')'
      ) {
        this.inputFieldValue = this.inputFieldValue.substr(
          0,
          this.inputFieldValue.length - 1
        );
      }
      newParameter = `[${option.name}]`;
    } else if (this.typeOfList === 'funcName') {
      newParameter = `${option.name}(`;
    } else if (this.typeOfList === 'modes') {
      this.funcMode = option.name;
      newParameter = `${option.name})`;
    }
    const lenAftrTrim = this.inputFieldValue.trim().length;
    if (this.tokenizedArray.length > 1) {
      this.secondaryToken.forEach((token) => {
        if (token === this.tokenSearchParam) {
          this.inputFieldValue = this.inputFieldValue
            .trim()
            .substring(0, lenAftrTrim - this.tokenSearchParam.length)
            .concat(newParameter);
        }
      });
    } else {
      this.tokenizedArray.forEach((token) => {
        if (token === this.tokenSearchParam) {
          this.inputFieldValue = this.inputFieldValue
            .trim()
            .substring(0, lenAftrTrim - this.tokenSearchParam.length)
            .concat(newParameter);
        }
      });
    }
    if (this.typeOfList === 'modes') {
      this.getTokenizedArray(this.inputFieldValue);
      this.getTargetAndFunctionName();
    }
    this.tokenSearchParam = null;
  }
  //Validate expression and get all parameters
  getTargetAndFunctionName() {
    this.currentTargetAttribute = [];
    this.opAttributes = [];
    this.lexerMethodErrorMessage = null;
    this.funcOperator = null;

    this.tokenizedArray.forEach((token, index) => {
      if (this.tokenizedArray.length > 0 && this.tokenizedArray.length <= 2) {
        //we get target attribute
        if (
          index === 0 &&
          token.charAt(0) === '[' &&
          token.charAt(token.length - 1) === ']'
        ) {
          this.currentTargetAttribute.push(token);
        } else {
          if (
            this.selectedFunc &&
            this.selectedFunc.name
            // &&
            // this.selectedFunc.listOfModes.length === 0
          ) {
            //we expect 2 ways of expression, like [att].func([attr], [attr]) and func([attr], [attr])
            if (
              token.charAt(0) === '[' &&
              token.charAt(token.length - 1) === ')'
            ) {
              //we need to split string using period delimiter
              const attrPart = token.substring(
                0,
                token.indexOf(this.selectedFunc.name) - 1
              );
              this.opAttributes = [...this.getDynamicTokens(attrPart, /[,]/)];

              //check valid function name/ expression name
              const isPeriod = token.substring(
                0,
                token.indexOf(this.selectedFunc.name)
              );
              if (isPeriod.charAt(isPeriod.length - 1) === '.') {
                const filterFuncName = token.substr(
                  attrPart.length + 1,
                  this.selectedFunc.name.length
                );
                this.funcOperator = this.allQueryOperators.find(
                  (col) => col.name === filterFuncName
                );
              }
              this.selectedFunc = this.funcOperator;
              if (this.selectedFunc) {
                const attrInBrackets = token
                  .split(this.selectedFunc.name + '(')
                  .pop();
                let newTokens = [];
                if (
                  this.selectedFunc.parameters.includes('value') ||
                  this.selectedFunc.parameters.includes('value1')
                ) {
                  newTokens = this.getDynamicTokens(
                    attrInBrackets,
                    /[\s,](?=(?:"[^\["]*"|[^"\]])*$)/
                  ); /**  /[\s,](?=(?:"[^"]*"|[^"])*$)/ correct exp */
                } else {
                  newTokens = this.getDynamicTokens(attrInBrackets, /[,]/);
                }
                this.opAttributes = [
                  ...this.opAttributes,
                  ...newTokens.filter((item) => item !== ')'),
                ];
              } else {
                this.opAttributes = [...this.opAttributes];
              }
            } else if (
              token.charAt(0).match(FUNCPATTERNREGEX) &&
              token.charAt(token.length - 1) === ')'
            ) {
              //get attr only string, so remove function name with '(' and ')'
              if (token.charAt(this.selectedFunc.name.length) === '(') {
                const attOnly = token.substring(
                  this.selectedFunc.name.length + 1,
                  token.length - 1
                );
                const newTokens = this.getDynamicTokens(attOnly, /[,]/);

                const filterFuncName = token.substr(
                  0,
                  this.selectedFunc.name.length
                );
                this.funcOperator = this.allQueryOperators.find(
                  (col) => col.name === filterFuncName
                );
                this.selectedFunc = this.funcOperator;
                this.opAttributes = newTokens;
              }
            } else if (EXCECPTION_PACKS.includes(this.selectedFunc.pack)) {
              // this.opAttributes = this.expUtilsService.getLogicalOpParameters(
              //   this.selectedFunc,
              //   token
              //);
              this.funcOperator = this.selectedFunc;
            } else if (this.selectedFunc.numberOfAttributes === 0) {
              this.opAttributes = null;
              this.funcOperator = this.selectedFunc;
            }
          } else if (
            !this.selectedFunc &&
            !this.funcOperator &&
            this.inputFieldValue
          ) {
            // copy and paste
            let replacedString = null;
            let stringToReplace = this.tokenizedArray[1];
            this.columnWithTypesArray.forEach((col) => {
              if (
                stringToReplace &&
                stringToReplace.includes('[' + col.name + ']')
              ) {
                const colText = `[${col.name}]`;
                replacedString = stringToReplace.split(colText).join('');
                stringToReplace = replacedString;
              }
            });
            if (replacedString) {
              const funcName = this.getDynamicTokens(replacedString, /[.\(\)]/);
              if (
                funcName.length === 1 &&
                funcName[0].match(FUNCPATTERNREGEX)
              ) {
                this.allQueryOperators.forEach((para) => {
                  if (para.name === funcName[0].toUpperCase()) {
                    this.selectedFunc = para;
                    this.selectedFuncObj = this.selectedFunc.listOfModes;
                    this.tooltipMessage = para.tooltipMsg;
                    this.helperText = para.helpText;
                  }
                });
              } else if (funcName.length > 1) {
                if (funcName[0].match(FUNCPATTERNREGEX)) {
                  this.allQueryOperators.forEach((para) => {
                    if (para.name === funcName[0].toUpperCase()) {
                      this.selectedFunc = para;
                      this.selectedFuncObj = this.selectedFunc.listOfModes;
                      this.tooltipMessage = para.tooltipMsg;
                      this.helperText = para.helpText;
                    }
                  });
                } else {
                  this.allQueryOperators.forEach((para) => {
                    if (
                      funcName.find((name) => name.toUpperCase() === para.name)
                    ) {
                      this.selectedFunc = para;
                      this.selectedFuncObj = this.selectedFunc.listOfModes;
                      this.tooltipMessage = para.tooltipMsg;
                      this.helperText = para.helpText;
                    }
                  });
                }
                if (funcName[1].match(FUNCPATTERNREGEX)) {
                  if (this.selectedFuncObj) {
                    this.selectedFuncObj.forEach((obj) => {
                      if (obj.name === funcName[1]) {
                        this.funcMode = obj.name;
                      }
                    });
                  }
                }
              }
            }
            if (this.selectedFunc) {
              this.getTargetAndFunctionName();
            } else {
              this.lexerMethodErrorMessage = 'Invalid expression';
            }
          } else if (
            this.tokenizedArray.length === 2 &&
            NO_ATTRIBUTE_FUNCTION.includes(
              this.tokenizedArray[1].replace(/[()]/g, '').toUpperCase()
            )
          ) {
            const fName = this.tokenizedArray[1].replace(/[()]/g, '');
            this.allQueryOperators.forEach((para) => {
              if (fName.toUpperCase() === para.name) {
                this.selectedFunc = para;
                this.selectedFuncObj = this.selectedFunc.listOfModes;
                this.tooltipMessage = para.tooltipMsg;
                this.helperText = para.helpText;
              }
            });
          } else if (this.tokenizedArray.length === 0) {
            this.displayOverlay = false;
            this.funcOperator = null;
            this.tooltipMessage = null;
            this.helperText = null;
          } else {
            this.displayOverlay = false;
            this.funcOperator = null;
            this.tooltipMessage = null;
            this.helperText = null;
            this.lexerMethodErrorMessage = 'Invalid expression';
          }
          this.splitInputParameters();
        }
      }
    });
  }
    //method to get final parameters
    splitInputParameters() {
      const actualAttri = [];
      this.opAttributes.forEach((singleop, index) => {
        let param = null;
        if (
          singleop.charAt(0) === '[' &&
          singleop.charAt(singleop.length - 1) === ']'
        ) {
          param = singleop.substring(1, singleop.length - 1);
        } else if (
          singleop.charAt(0) === '[' &&
          singleop.charAt(singleop.length - 1) === ')'
        ) {
          param = singleop.substring(1, singleop.length - 2);
        }
        this.columnWithTypesArray.forEach((col) => {
          if (col.name === param) {
            actualAttri.push(col);
          }
        });
      });
      this.setValidationErrorMessages(actualAttri);
    }
  
    setValidationErrorMessages(actualAttri) {
      if (this.inputFieldValue) {
        if (
          this.funcOperator &&
          this.funcOperator.name &&
          !this.allQueryOperators.find((op) => op.name === this.funcOperator.name)
        ) {
          //validate func name
          this.lexerMethodErrorMessage = 'Please enter valid function';
        } else if (
          this.selectedFuncObj &&
          this.selectedFuncObj.length > 0 &&
          !this.selectedFuncObj.find((op) => op.name === this.funcMode)
        ) {
          this.lexerMethodErrorMessage = 'Invalid function parameter';
        } else if (!this.funcOperator) {
          this.lexerMethodErrorMessage = 'Please enter a valid function';
        } else if (this.currentTargetAttribute.length === 0) {
          this.lexerMethodErrorMessage = 'Target parameter is missing';
        } else if (!this.funcOperator && actualAttri.length > 0) {
          this.lexerMethodErrorMessage = 'Please enter valid function';
        } else if (
          this.selectedFunc &&
          this.selectedFunc.listOfModes > 0 &&
          !this.funcMode
        ) {
          this.lexerMethodErrorMessage = 'Please select function mode';
        }
         else if (
          this.selectedFunc &&
          actualAttri.length !== this.selectedFunc.numberOfAttributes &&
          !this.expUtilsService.isDualParamFunction(this.selectedFunc)
        )
         {
          this.lexerMethodErrorMessage = 'Please check parameters/attributes';
  
          this.tooltipMessage = this.selectedFunc
            ? this.selectedFunc.tooltipMsg
            : null;
          this.helperText = this.selectedFunc ? this.selectedFunc.helpText : null;
        }
         else {
          this.lexerMethodErrorMessage = null;
        }
      } else {
        this.lexerMethodErrorMessage = null;
      }
    }
  



  
  inputFocus(event) {
    this.focusInput = true;
  }
  inputBlur(event) {
    this.focusInput = true;
    // this.displayOverlay = false;
    this.highlightOptionChanged = false;
  }
  inputChange(event) {
    this.focusInput = true;
  }
  onOverlayAnimationStart(event: AnimationEvent) {
    console.log('eniStary',event);
    
    switch (event.toState) {
      case 'visible':
        this.overlay = event.element;
        this.overlay.style.zIndex = '9999';
        break;

      case 'void':
        this.overlay = null;
        break;
    }
  }
  
  hide() {
    this.displayOverlay = false;
  }
  showFormulaInfo(content: any) {
    //this.selectedOperatorsList=[];
    this.modalService.openModal(content, 'standard');
  }
  onOverlayAnimationDone(event: AnimationEvent) {
    console.log('enia end',event);
    
    if (event.toState === 'void') {
      this.filteredResult = [];
    }
  }
  getPastedInputValue(event: ClipboardEvent) {
    this.textInputKeyPress(event);
    this.getTokenizedArray(this.inputFieldValue);
    this.getTargetAndFunctionName();

   }
   panelOpened($event){
    console.log('pannerOpend',$event);    
   }
   panelClosed($event){
    console.log('pannelClosed',$event);
    
   }


}
