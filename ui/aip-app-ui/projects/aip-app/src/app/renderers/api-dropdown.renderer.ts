import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnInit,
  } from '@angular/core';
  import type { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
  import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
  import {
    Actions,
    composeWithUi,
    ControlElement,
    isBooleanControl,
    isEnumControl,
    OwnPropsOfControl,
    RankedTester,
    rankWith,
  } from '@jsonforms/core';
  import type { Observable } from 'rxjs';
  import { map, startWith } from 'rxjs/operators';
import { isApiControl } from '../testers/testers';
import { Services } from '../services/service';
  
  @Component({
    selector: 'ApiDropdownRenderer',
    template: `
      <mat-form-field fxFlex [fxHide]="hidden">
      <mat-label>{{ label }}</mat-label>
        <mat-select (selectionChange)="onSelect($event)">
            <mat-option *ngFor="let val of dropdownValues" [value]="val.alias">{{val.alias}}</mat-option>
        </mat-select>
      </mat-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class ApiDropdownRenderer
    extends JsonFormsControl
    implements OnInit
  {
    @Input() options: string[];
    dropdownValues
    filteredOptions: Observable<string[]>;
    shouldFilter: boolean;
    focused
  
    constructor(jsonformsService: JsonFormsAngularService, private service:Services) {
      super(jsonformsService);
    }
    override getEventValue = (event: any) => event.target.value;
  
    override ngOnInit() {
      super.ngOnInit();
      this.shouldFilter = false;
      console.log('options=',this.uischema.options.url)
      this.getData()
      
    }
  
    getData(){
        let url = this.uischema.options.url.replace("{org}",sessionStorage.getItem("organization"))
        this.service.callGetApi(url).subscribe(resp=>{
            this.dropdownValues = resp.body
        })
    }

    onSelect(ev: MatAutocompleteSelectedEvent) {
        const path = composeWithUi(this.uischema as ControlElement, this.path);
        this.shouldFilter = false;
        this.jsonFormsService.updateCore(
          Actions.update(path, () => ev['value'])
        );
        this.triggerValidation();
      }
    
   
  }
  
  export const apiControlTester: RankedTester = rankWith(2, isApiControl);