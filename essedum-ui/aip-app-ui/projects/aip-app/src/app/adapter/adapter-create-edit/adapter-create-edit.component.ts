import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit
} from '@angular/core';
import { NgModel, Validators, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdapterServices } from '../../sharedModule/services/adapter-service';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { Services } from '../../services/service';
import { Location } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// Interfaces for better type safety
interface AdapterData {
  name: string;
  organization: string;
  connectionname: string;
  connectionid: string;
  createdby: string;
  spectemplatedomainname: string;
  description: string;
  category: 'DYNAMIC' | 'REMOTE';
  apispec: string;
  executiontype: 'REST' | 'REMOTE';
  createdon?: Date;
  lastmodifiedon?: Date;
}

interface Datasource {
  interfacetype?: string;
  organization: string;
  foradapter: string;
  type: string;
  alias: string;
  name: string;
}

interface SpecTemplate {
  domainname: string;
  apispectemplate: string;
}

interface Adapter {
  name: string;
}

interface User {
  user_email: string;
}

@Component({
  selector: 'app-adapter-create-edit',
  templateUrl: './adapter-create-edit.component.html',
  styleUrls: ['./adapter-create-edit.component.scss'],
})
export class AdapterCreateEditComponent implements OnInit {
  @Input() data?: AdapterData;
  @Input() action?: 'create' | 'edit';
  @Output() triggereRefresh = new EventEmitter<boolean>();
  @ViewChild('nameRef') nameRef!: NgModel;

  readonly CARD_TITLE = 'Implementation ';
  readonly TOOLTIP_POSITION = 'above';

  // Flags and state
  createAuth = false;
  nameFlag = false;
  errMsgFlag = true;
  routeToHome = false;

  // Data arrays
  listOfNames: string[] = [];
  connectionOptions: OptionsDTO[] = [];
  specTemplatesOptions: OptionsDTO[] = [];

  // Regex patterns - using readonly for immutable patterns
  private readonly baseRegexPattern = '^(?!REX)[a-zA-Z0-9_-]+$';
  private readonly emptyNamesPattern = '^(?!www$)[a-zA-Z0-9_-]+$';
  private readonly existingNamesPattern = '^(?!REX).+$';
  private readonly validAlphabetsPattern = '^[a-zA-Z0-9_-]+$';

  // Dynamic regex objects
  regexPatternObj?: RegExp;
  regexPatternForExistingNamesObj?: RegExp;
  regexPatternForValidAlphabetsObj?: RegExp;
  nameValidator: ValidatorFn[] = [];

  // Working variables for regex construction
  private regString = '';
  private regexPatternString = '';
  private regexPatternForExistingNames = '';

  // Data objects
  datasourcesForConnection: Datasource[] = [];
  specTemplates: SpecTemplate[] = [];
  mlAdapters: Adapter[] = [];
  selectedConnection?: Datasource;

  // Error handling
  errMsg = 'Name is required field.';

  // Organization and promises
  org?: string;
  connectionPromise?: Promise<boolean>;

  constructor(
    private dialogRef: MatDialogRef<AdapterCreateEditComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private adapterServices: AdapterServices,
    private service: Services,
    private location: Location
  ) {
    this.initializeRegexObjects();
  }

  private initializeRegexObjects(): void {
    this.regexPatternForValidAlphabetsObj = new RegExp(this.validAlphabetsPattern, 'i');
  }

  ngOnInit(): void {
    this.org = this.getOrganization();
    this.loadInitialData();

    if (!this.data) {
      this.initializeForCreate();
    }
  }

  private getOrganization(): string {
    return sessionStorage.getItem('organization') || '';
  }

  private getUserEmail(): string {
    try {
      const user: User = JSON.parse(sessionStorage.getItem('user') || '{}');
      return user.user_email || '';
    } catch (error) {
      console.error('Error parsing user from session storage:', error);
      return '';
    }
  }

  private loadInitialData(): void {
    this.authentications();
    this.findAllDatasourcesForConnection();
    this.findAllSpecTemplates();
  }

  private initializeForCreate(): void {
    this.routeToHome = true;
    this.action = 'create';
    this.findAllAdapters();
    this.data = {
      name: '',
      organization: this.getOrganization(),
      connectionname: '',
      connectionid: '',
      createdby: this.getUserEmail(),
      spectemplatedomainname: '',
      description: '',
      category: 'DYNAMIC',
      apispec: '{}',
      executiontype: 'REST',
    };
  }

  private authentications(): void {
    this.service.getPermission('cip')
      .pipe(
        catchError((error) => {
          console.error('Error getting permissions:', error);
          return of([]);
        })
      )
      .subscribe((cipAuthority: string[]) => {
        this.createAuth = cipAuthority.includes('adapter-create');
        if (!this.createAuth && (!this.data || this.routeToHome)) {
          this.routeBackToAdapters();
        }
      });
  }

  private findAllDatasourcesForConnection(): void {
    this.adapterServices.getDatasources().pipe(
      catchError((error) => {
        console.error('Error fetching datasources:', error);
        this.connectionPromise = Promise.resolve(true);
        return of([]);
      })
    )
      .subscribe(
        (res) => {
          this.datasourcesForConnection = res;
          if (this.action == 'create')
            this.datasourcesForConnection = this.datasourcesForConnection.filter(
              (datasource) =>
                (datasource.interfacetype == null ||
                  datasource.interfacetype != 'adapter') &&
                datasource.organization ==
                sessionStorage.getItem('organization') &&
                datasource.foradapter == '1'
            );
          else {
            if (this.data.executiontype == 'REMOTE')
              this.datasourcesForConnection =
                this.datasourcesForConnection.filter(
                  (datasource) =>
                    datasource.interfacetype == null &&
                    datasource.interfacetype != 'adapter' &&
                    datasource.organization ==
                    sessionStorage.getItem('organization') &&
                    datasource.type != 'REST' &&
                    datasource.foradapter == '1'
                );
            else
              this.datasourcesForConnection =
                this.datasourcesForConnection.filter(
                  (datasource) =>
                    (datasource.interfacetype == null ||
                      datasource.interfacetype != 'adapter') &&
                    datasource.organization ==
                    sessionStorage.getItem('organization') &&
                    datasource.type == 'REST' &&
                    datasource.foradapter == '1'
                );
          }
          this.datasourcesForConnection.forEach((datasource) => {
            this.connectionOptions.push(
              new OptionsDTO(
                (datasource.type == 'REST' ? 'REST' : 'REMOTE').concat(
                  '-' + datasource.alias
                ),
                datasource.alias
              )
            );
          });
          this.connectionPromise = Promise.resolve(true);
        },
        (err) => {
          console.log(err);
          this.connectionPromise = Promise.resolve(true);
        }
      );
  }

  private findAllSpecTemplates(): void {
    if (!this.org) return;

    this.adapterServices.getMlSpecTemplatesCards(this.org)
      .pipe(
        catchError((error) => {
          console.error('Error fetching spec templates:', error);
          return of([]);
        })
      )
      .subscribe((templates: SpecTemplate[]) => {
        this.specTemplates = templates;
        this.specTemplatesOptions = templates.map(template =>
          new OptionsDTO(template.domainname, template.domainname)
        );
      });
  }

  private findAllAdapters(): void {
    if (!this.org) return;

    this.adapterServices.getAdapters(this.org)
      .pipe(
        catchError((error) => {
          console.error('Error fetching adapters:', error);
          return of([]);
        })
      )
      .subscribe((adapters: Adapter[]) => {
        this.mlAdapters = adapters;
        this.listOfNames = adapters.map(adapter => adapter.name);
        this.buildRegexPatterns();
      });
  }

  private buildRegexPatterns(): void {
    if (this.listOfNames.length > 0) {
      // Build regex string for existing names
      this.regString = this.listOfNames.map(name => `${name}$`).join('|');

      this.regexPatternString = this.baseRegexPattern.replace('REX', this.regString);
      this.regexPatternForExistingNames = this.existingNamesPattern.replace('REX', this.regString);
    } else {
      this.regexPatternString = this.emptyNamesPattern;
      this.regexPatternForExistingNames = this.existingNamesPattern;
    }

    // Create regex objects
    this.regexPatternObj = new RegExp(this.regexPatternString, 'i');
    this.regexPatternForExistingNamesObj = new RegExp(this.regexPatternForExistingNames, 'i');
    this.regexPatternForValidAlphabetsObj = new RegExp(this.validAlphabetsPattern, 'i');

    // Set up validators
    this.nameValidator = [
      Validators.required,
      Validators.pattern(this.regexPatternObj)
    ];
  }

  private routeBackToAdaptersAndRefresh(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  createAdapter(): void {
    if (!this.data) return;

    if (this.data.executiontype === 'REMOTE') {
      const selectedTemplate = this.specTemplates.find(
        spec => spec.domainname === this.data!.spectemplatedomainname
      );
      if (selectedTemplate) {
        this.data.apispec = selectedTemplate.apispectemplate || "{}";
        this.data.category = 'REMOTE';
      } else {
      this.data.apispec = "{}";
    }
      
  }

    this.adapterServices.createAdapter(this.data)
      .pipe(
        catchError((error) => {
          this.service.messageService(error);
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response) {
          this.service.messageService(response, 'Done! Implementation Created Successfully');
          this.routeBackToAdaptersAndRefresh();
        }
      });
  }

  updateAdapter(): void {
    if (!this.data) return;

    // Create a clean copy without timestamp fields
    const updateData = { ...this.data };
    delete updateData.createdon;
    delete updateData.lastmodifiedon;

    this.adapterServices.updateAdapter(updateData)
      .pipe(
        catchError((error) => {
          this.service.messageService(error);
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response) {
          this.service.messageService(response, 'Done! Implementation Updated Successfully');
          this.closeAdapterPopup();
        }
      });
  }

  closeAdapterPopup(): void {
    this.dialogRef.close();
    this.triggereRefresh.emit(true);
  }

  routeBackToAdapters(): void {
    this.location.back();
  }

  adapterNameChangesOccur(adpName: string): void {
    if (!this.regexPatternObj || !this.regexPatternForExistingNamesObj || !this.regexPatternForValidAlphabetsObj) {
      return;
    }

    const isValid = this.regexPatternObj.test(adpName);
    this.nameFlag = isValid;
    this.errMsgFlag = !isValid;

    if (isValid) {
      this.clearNameErrors();
    } else {
      this.setNameErrors(adpName);
    }
  }

  private clearNameErrors(): void {
    this.errMsg = '';
    if (this.nameRef?.control) {
      this.nameRef.control.setErrors(null);
    }
  }

  private setNameErrors(adpName: string): void {
    if (adpName.length === 0) {
      this.errMsg = 'Name is required field.';
    } else if (!this.regexPatternForExistingNamesObj!.test(adpName)) {
      this.errMsg = 'Name already exists';
    } else if (!this.regexPatternForValidAlphabetsObj!.test(adpName)) {
      this.errMsg = 'Name should not contain special characters, accepted special characters are _ and -';
    }

    if (this.nameRef?.control) {
      this.nameRef.control.setErrors({ custom: true });
    }
  }

  connectionNameSelectChange(connectionNameSelected: { value: string }): void {
    if (!this.data || !connectionNameSelected?.value) return;

    this.data.connectionname = connectionNameSelected.value;
    this.selectedConnection = this.datasourcesForConnection.find(
      datasource => datasource.alias === connectionNameSelected.value
    );

    if (this.selectedConnection) {
      this.data.connectionid = this.selectedConnection.name;
      this.data.executiontype = this.selectedConnection.type === 'REST' ? 'REST' : 'REMOTE';
    }
  }
}
