import { Component, OnInit, Output, EventEmitter, Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Services } from '../../services/service';
import { GitHubService } from '../../sharedModule/services/github.service';
import { BranchSelectionDialogComponent } from '../branch-selection-dialog/branch-selection-dialog.component';

// Custom validator for array fields to ensure at least one item is selected
function arrayNotEmptyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return { required: true };
    }
    return null;
  };
}

interface DeploymentFormData {
  overview: any;
  scope: any;
  approval: any;
  validation: any;
}

@Component({
  selector: 'app-deployment-form',
  templateUrl: './deployment-form.component.html',
  styleUrls: ['./deployment-form.component.scss']
})
export class DeploymentFormComponent implements OnInit {
  @Output() deploymentFinished = new EventEmitter<DeploymentFormData>();
 // @Output() deployClick = new EventEmitter<void>();
  @Input() cname: string = ''; // Container name from parent
  @Input() organisation: string = ''; // Organisation from parent
  @Input() isRunningAndDeploying: boolean = false;
  @Input() isCheckingDeploymentData: boolean = false;
  @Input() hasDeploymentFormData: boolean = false;
  @Input() deploymentEnvironment: string = '';

  selectedTabIndex = 0;
  
  // Form groups for each tab
  overviewForm: FormGroup;
  scopeForm: FormGroup;
  approvalForm: FormGroup;
  validationForm: FormGroup;

  // Hover states for buttons
  isFinishHovered = false;

  // Deployment ID for edit mode
  deploymentId: number | null = null;

  // Flag to track if deployment is finished and forms should be disabled
  isDeploymentFinished: boolean = false;

  isEditMode: boolean = false;

  // Static text constants - Labels
  readonly AGENT_NAME_LABEL = 'Agent Name';
  readonly AGENT_VERSION_LABEL = 'Agent Version';
  readonly DEPLOYMENT_ENVIRONMENT_LABEL = 'Deployment Environment';
  readonly DEPLOYMENT_DATETIME_LABEL = 'Deployment Date & Time';
  readonly BUILD_RELEASE_ID_LABEL = 'Build/Release ID';
  readonly AGENT_PACKAGE_LOCATION_LABEL = 'Agent Package Location';
  readonly HASH_CHECKSUM_LABEL = 'Hash/Checksum';
  readonly TARGET_NODES_LABEL = 'Target Nodes/Hosts';
  readonly IMPACTED_SERVICES_LABEL = 'Impacted Services';
  readonly DEPENDENCIES_LABEL = 'Dependencies (e.g., SDK, Runtime)';
  readonly HEALTH_CHECK_STATUS_LABEL = 'Health Check Status';
  readonly BACKUP_CONFIRMATION_LABEL = 'Backup Confirmation';
  readonly CHANGE_FREEZE_COMPLIANCE_LABEL = 'Change Freeze Compliance';
  readonly SECURITY_PATCH_VERIFICATION_LABEL = 'Security Patch Verification';
  readonly APPROVER_NAME_ROLE_LABEL = 'Approver Name & Role';
  readonly CAB_APPROVAL_REFERENCE_LABEL = 'CAB Approval Reference';
  readonly CHANGE_REQUEST_ID_LABEL = 'Change Request ID';
  readonly ROLLBACK_PROCEDURE_REFERENCE_LABEL = 'Rollback Procedure Reference';
  readonly PREVIOUS_STABLE_VERSION_LABEL = 'Previous Stable Agent Version';
  readonly SMOKE_TEST_STATUS_LABEL = 'Smoke Test Status';
  readonly PERFORMANCE_TEST_SUMMARY_LABEL = 'Performance Test Summary';
  readonly SSL_TLS_CERTIFICATE_CHECK_LABEL = 'SSL/TLS Certificate Check';
  readonly DR_READINESS_LABEL = 'DR Readiness';
  readonly DATA_RETENTION_CONFIRMATION_LABEL = 'Data Retention Confirmation';
  readonly ANTIVIRUS_PATCH_CONFIRMATION_LABEL = 'Anti-virus/Patch Confirmation';
  readonly DEPLOYMENT_OWNER_LABEL = 'Deployment Owner';
  readonly INFRA_SUPPORT_CONTACTS_LABEL = 'Infra & Support Contacts';
  readonly AUDIT_POC_DETAILS_LABEL = 'Audit POC Details';

  // Static text constants - Placeholders
  readonly AGENT_NAME_PLACEHOLDER = 'Enter Agent Name...';
  readonly AGENT_VERSION_PLACEHOLDER = 'e.g., 1.0.0';
  readonly DEPLOYMENT_ENVIRONMENT_PLACEHOLDER = 'Select Environment';
  readonly DEPLOYMENT_DATETIME_PLACEHOLDER = 'Select Date & Time';
  readonly BUILD_RELEASE_ID_PLACEHOLDER = 'Enter Build/Release ID...';
  readonly AGENT_PACKAGE_LOCATION_PLACEHOLDER = 'Enter Package Location URL...';
  readonly HASH_CHECKSUM_PLACEHOLDER = 'Enter Hash/Checksum...';
  readonly TARGET_NODES_PLACEHOLDER = 'Select Target Nodes';
  readonly IMPACTED_SERVICES_PLACEHOLDER = 'Select Impacted Services';
  readonly DEPENDENCIES_PLACEHOLDER = 'List All Dependencies...';
  readonly APPROVER_NAME_ROLE_PLACEHOLDER = 'Enter Approver Name & Role...';
  readonly CAB_APPROVAL_REFERENCE_PLACEHOLDER = 'Enter CAB Approval Reference...';
  readonly CHANGE_REQUEST_ID_PLACEHOLDER = 'Enter Change Request ID...';
  readonly ROLLBACK_PROCEDURE_REFERENCE_PLACEHOLDER = 'Enter Rollback Procedure Reference...';
  readonly PREVIOUS_STABLE_VERSION_PLACEHOLDER = 'e.g., 0.9.5';
  readonly PERFORMANCE_TEST_SUMMARY_PLACEHOLDER = 'Enter Performance Test Summary...';
  readonly DEPLOYMENT_OWNER_PLACEHOLDER = 'Enter Deployment Owner...';
  readonly INFRA_SUPPORT_CONTACTS_PLACEHOLDER = 'Enter Infrastructure & Support Contacts...';
  readonly AUDIT_POC_DETAILS_PLACEHOLDER = 'Enter Audit POC Details...';

  // Static text constants - Error messages
  readonly FIELD_REQUIRED_ERROR = 'This field is required';
  readonly HEALTH_CHECK_REQUIRED_ERROR = 'Health check status is required';
  readonly BACKUP_CONFIRMATION_REQUIRED_ERROR = 'Backup confirmation is required';
  readonly CHANGE_FREEZE_REQUIRED_ERROR = 'Change freeze compliance is required';
  readonly SECURITY_PATCH_REQUIRED_ERROR = 'Security patch verification is required';
  readonly SMOKE_TEST_REQUIRED_ERROR = 'Smoke test status is required';
  readonly SSL_TLS_REQUIRED_ERROR = 'SSL/TLS certificate check is required';
  readonly DR_READINESS_REQUIRED_ERROR = 'DR readiness is required';
  readonly DATA_RETENTION_REQUIRED_ERROR = 'Data retention confirmation is required';
  readonly ANTIVIRUS_PATCH_REQUIRED_ERROR = 'Anti-virus/patch confirmation is required';

  // Static text constants - Button labels
  readonly FINISH_BUTTON_LABEL = 'Finish';
  readonly SAVE_OVERVIEW_BUTTON_LABEL = 'Save Overview';
  readonly SAVE_SCOPE_BUTTON_LABEL = 'Save Scope & Pre-Checks';
  readonly SAVE_APPROVAL_BUTTON_LABEL = 'Save Approval & Rollback';
  readonly SAVE_VALIDATION_BUTTON_LABEL = 'Save Validation & Compliance';
  readonly UPDATE_BUTTON_LABEL = 'Update';

  // Static text constants - Messages
  readonly FINISH_NOTE_MESSAGE = 'Fill required fields to enable finish button: Agent Name, Agent Version, Deployment Date & Time, Target Nodes, Impacted Services, Approver Name & Role, CAB Approval Reference, Smoke Test Status, Deployment Owner';
  readonly OVERVIEW_SAVED_MESSAGE = 'Overview saved';
  readonly SCOPE_SAVED_MESSAGE = 'Scope & Pre-Checks saved';
  readonly APPROVAL_SAVED_MESSAGE = 'Approval & Rollback saved';
  readonly VALIDATION_SAVED_MESSAGE = 'Validation & Compliance saved';
  readonly FILL_REQUIRED_FIELDS_MESSAGE = 'Please fill all required fields';
  readonly FILL_REQUIRED_FIELDS_FINISH_MESSAGE = 'Please fill all required fields (Agent Name, Agent Version, Deployment Date & Time, Target Nodes, Impacted Services, Approver Name & Role, CAB Approval Reference, Smoke Test Status, Deployment Owner)';
  readonly DEPLOYMENT_SAVED_SUCCESS_MESSAGE = 'Deployment form saved successfully!';
  readonly DEPLOYMENT_SAVED_ERROR_MESSAGE = 'Error saving deployment form: ';
  readonly RAISE_PR = 'Raise Pull Request';
  readonly CREATE_PR = 'Create Pull Request';
  // Static text constants - Radio button values
  readonly RADIO_PASS_LABEL = 'Pass';
  readonly RADIO_FAIL_LABEL = 'Fail';

  // Dropdown options
  deploymentEnvironments = ['UAT', 'Staging', 'Production'];

  /**
   * Handle environment change - warn and prevent Production selection
   */
  onEnvironmentChange(event: any): void {
    const selectedValue = event.value;
  }
  
  // Multi-select options
  availableNodes = [
    'Node 1 - US-East',
    'Node 2 - US-West',
    'Node 3 - EU-Central',
    'Node 4 - APAC-Singapore'
  ];
  
  availableServices = [
    'API Gateway',
    'Authentication Service',
    'Data Processing Service',
    'Notification Service',
    'Storage Service'
  ];

  constructor(
    private fb: FormBuilder, 
    private service: Services,
    private dialog: MatDialog
  ) {
    // Initialize Overview Form - Only agentName, agentVersion, deploymentDateTime are required
    this.overviewForm = this.fb.group({
      agentName: ['', Validators.required],
      agentVersion: ['', Validators.required],
      deploymentEnvironment: [''],
      deploymentDateTime: [new Date(), Validators.required], // Set today's date as default
      buildReleaseId: [''],
      agentPackageLocation: [''],
      hashChecksum: ['']
    });

    // Initialize Scope & Pre-Checks Form - targetNodes and impactedServices are required
    this.scopeForm = this.fb.group({
      targetNodes: [[], [Validators.required, arrayNotEmptyValidator()]],
      impactedServices: [[], [Validators.required, arrayNotEmptyValidator()]],
      dependencies: [''],
      healthCheckStatus: [''],
      backupConfirmation: [false],
      changeFreezeCompliance: [false],
      securityPatchVerification: [false]
    });

    // Initialize Approval & Rollback Form - approverNameRole and cabApprovalReference are required
    this.approvalForm = this.fb.group({
      approverNameRole: ['', Validators.required],
      cabApprovalReference: ['', Validators.required],
      changeRequestId: [''],
      rollbackProcedureReference: [''],
      previousStableVersion: ['']
    });

    // Initialize Validation & Compliance Form - smokeTestStatus and deploymentOwner are required
    this.validationForm = this.fb.group({
      smokeTestStatus: ['', Validators.required],
      performanceTestSummary: [''],
      sslTlsCertificateCheck: [false],
      drReadiness: [false],
      dataRetentionConfirmation: [false],
      antivirusPatchConfirmation: [false],
      deploymentOwner: ['', Validators.required],
      infraSupportContacts: [''],
      auditPocDetails: ['']
    });
  }

  ngOnInit(): void {
    // Load deployment form data by cname and org if available
    if (this.cname && this.organisation) {
      this.loadDeploymentFormByCnameOrg(this.cname, this.organisation);
    } else if (this.deploymentId) {
      // Fallback to loading by ID if available (edit mode)
      this.loadDeploymentForm(this.deploymentId);
    }
  }

  /**
   * Load deployment form data by cname and org
   * @param cname - Customer name
   * @param org - Organization name
   */
  loadDeploymentFormByCnameOrg(cname: string, org: string): void {
    this.service.getDeploymentFormByCnameOrg(cname, org).subscribe(
      (response) => {
        if (response) {
          this.deploymentId = response.id;
          this.populateFormWithData(response);
          this.isDeploymentFinished = true;
          this.disableAllForms();
          console.log('Deployment form loaded successfully for cname:', cname, 'org:', org);
        }
      },
      (error) => {
        console.error('Error loading deployment form:', error);
        // If record not found, keep forms empty for new creation
        if (error.status === 404) {
          console.log('No existing deployment form found for cname and org, ready for new creation');
          this.deploymentId = null; // Reset to create mode
        }
      }
    );
  }

  /**
   * Load deployment form data by ID
   * @param id - Deployment form ID to load
   */
  loadDeploymentForm(id: number): void {
    this.service.getDeploymentFormById(id).subscribe(
      (response) => {
        if (response) {
          this.deploymentId = response.id;
          this.populateFormWithData(response);
          this.isDeploymentFinished = true;
          this.disableAllForms();
          this.service.message('Deployment form loaded successfully', 'success');
        }
      },
      (error) => {
        console.error('Error loading deployment form:', error);
        // If record not found, keep forms empty for new creation
        if (error.status === 404) {
          console.log('No existing deployment form found, ready for new creation');
          this.deploymentId = null; // Reset to create mode
        } else {
          this.service.message('Error loading deployment form', 'error');
        }
      }
    );
  }

  /**
   * Populate all form fields with fetched data
   * @param data - Deployment form data from API
   */
  private populateFormWithData(data: any): void {
    // Populate Overview Form
    this.overviewForm.patchValue({
      agentName: data.agent_name || '',
      agentVersion: data.agent_version || '',
      deploymentEnvironment: data.deployment_environment || '',
      deploymentDateTime: data.deployment_datetime || '',
      buildReleaseId: data.build_release_id || '',
      agentPackageLocation: data.agent_package_location || '',
      hashChecksum: data.hash_checksum || ''
    });

    // Populate Scope & Pre-Checks Form
    this.scopeForm.patchValue({
      targetNodes: data.target_nodes_hosts ? JSON.parse(data.target_nodes_hosts) : [],
      impactedServices: data.impacted_services ? JSON.parse(data.impacted_services) : [],
      dependencies: data.dependencies || '',
      healthCheckStatus: data.health_check_status || '',
      backupConfirmation: data.backup_confirmation || false,
      changeFreezeCompliance: data.change_freeze_compliance || false,
      securityPatchVerification: data.security_patch_verification || false
    });

    // Populate Approval & Rollback Form
    this.approvalForm.patchValue({
      approverNameRole: data.approver_name_role || '',
      cabApprovalReference: data.cab_approval_reference || '',
      changeRequestId: data.change_request_id || '',
      rollbackProcedureReference: data.rollback_procedure_reference || '',
      previousStableVersion: data.previous_stable_agent_version || ''
    });

    // Populate Validation & Compliance Form
    this.validationForm.patchValue({
      smokeTestStatus: data.smoke_test_status || '',
      performanceTestSummary: data.performance_test_summary || '',
      sslTlsCertificateCheck: data.ssl_tls_certificate_check || false,
      drReadiness: data.dr_readiness || false,
      dataRetentionConfirmation: data.data_retention_confirmation || false,
      antivirusPatchConfirmation: data.antivirus_patch_confirmation || false,
      deploymentOwner: data.deployment_owner || '',
      infraSupportContacts: data.infra_support_contacts || '',
      auditPocDetails: data.audit_poc_details || ''
    });

    console.log('Forms populated with data for deployment ID:', this.deploymentId);
  }

  /**
   * Save Overview - Calls the same API as finish button
   */
  saveOverview(): void {
    // Mark form as touched to show validation errors
    this.markFormGroupTouched(this.overviewForm);
    
    if (this.overviewForm.valid) {
      const deploymentData = this.buildDeploymentPayload();
      this.service.saveDeploymentForm(deploymentData).subscribe(
        (response) => {
          if (response && response.id) {
            this.deploymentId = response.id;
          }
          this.service.message(this.OVERVIEW_SAVED_MESSAGE, 'success');
          this.selectedTabIndex = 1;
        },
        (error) => {
          this.service.message(this.DEPLOYMENT_SAVED_ERROR_MESSAGE + (error.message || 'Unknown error'), 'error');
        }
      );
    } else {
      this.service.message('Please fill all required fields in Overview tab', 'error');
    }
  }

  /**
   * Save Scope - Calls the same API as finish button
   */
  saveScope(): void {
    // Mark form as touched to show validation errors
    this.markFormGroupTouched(this.scopeForm);
    
    if (this.scopeForm.valid) {
      const deploymentData = this.buildDeploymentPayload();
      this.service.saveDeploymentForm(deploymentData).subscribe(
        (response) => {
          if (response && response.id) {
            this.deploymentId = response.id;
          }
          this.service.message(this.SCOPE_SAVED_MESSAGE, 'success');
          this.selectedTabIndex = 2;
        },
        (error) => {
          this.service.message(this.DEPLOYMENT_SAVED_ERROR_MESSAGE + (error.message || 'Unknown error'), 'error');
        }
      );
    } else {
      this.service.message('Please fill all required fields in Scope & Pre-Checks tab', 'error');
    }
  }

  /**
   * Save Approval - Calls the same API as finish button
   */
  saveApproval(): void {
    // Mark form as touched to show validation errors
    this.markFormGroupTouched(this.approvalForm);
    
    if (this.approvalForm.valid) {
      const deploymentData = this.buildDeploymentPayload();
      this.service.saveDeploymentForm(deploymentData).subscribe(
        (response) => {
          if (response && response.id) {
            this.deploymentId = response.id;
          }
          this.service.message(this.APPROVAL_SAVED_MESSAGE, 'success');
          this.selectedTabIndex = 3;
        },
        (error) => {
          this.service.message(this.DEPLOYMENT_SAVED_ERROR_MESSAGE + (error.message || 'Unknown error'), 'error');
        }
      );
    } else {
      this.service.message('Please fill all required fields in Approval & Rollback tab', 'error');
    }
  }

  /**
   * Save Validation - Calls the same API as finish button
   */
  saveValidation(): void {
    // Mark form as touched to show validation errors
    this.markFormGroupTouched(this.validationForm);
    
    if (this.validationForm.valid) {
      const deploymentData = this.buildDeploymentPayload();
      this.service.saveDeploymentForm(deploymentData).subscribe(
        (response) => {
          if (response && response.id) {
            this.deploymentId = response.id;
          }
          this.service.message(this.VALIDATION_SAVED_MESSAGE, 'success');
        },
        (error) => {
          this.service.message(this.DEPLOYMENT_SAVED_ERROR_MESSAGE + (error.message || 'Unknown error'), 'error');
        }
      );
    } else {
      this.service.message('Please fill all required fields in Validation & Compliance tab', 'error');
    }
  }

  /**
   * Check if all required fields are filled to enable Finish button
   */
  isAllFormsValid(): boolean {
    // Check all required fields across all forms
    return this.overviewForm.valid && 
           this.scopeForm.valid && 
           this.approvalForm.valid && 
           this.validationForm.valid;
  }

  /**
   * Hover handler for finish button
   */
  hoverFinish(isHovered: boolean): void {
    this.isFinishHovered = isHovered;
  }

  /**
   * Mark all form controls as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Finish deployment - validate required fields and save complete form
   */
  finishDeployment(): void {
    // Mark all forms as touched to show validation errors
    this.markFormGroupTouched(this.overviewForm);
    this.markFormGroupTouched(this.scopeForm);
    this.markFormGroupTouched(this.approvalForm);
    this.markFormGroupTouched(this.validationForm);
    
    // Check if all required fields are filled
    if (!this.overviewForm.valid) {
      this.service.message(this.FILL_REQUIRED_FIELDS_FINISH_MESSAGE, 'error');
      this.selectedTabIndex = 0; // Navigate to Overview tab
      return;
    }
    
    if (!this.scopeForm.valid) {
      this.service.message(this.FILL_REQUIRED_FIELDS_FINISH_MESSAGE, 'error');
      this.selectedTabIndex = 1; // Navigate to Scope tab
      return;
    }
    
    if (!this.approvalForm.valid) {
      this.service.message(this.FILL_REQUIRED_FIELDS_FINISH_MESSAGE, 'error');
      this.selectedTabIndex = 2; // Navigate to Approval tab
      return;
    }
    
    if (!this.validationForm.valid) {
      this.service.message(this.FILL_REQUIRED_FIELDS_FINISH_MESSAGE, 'error');
      this.selectedTabIndex = 3; // Navigate to Validation tab
      return;
    }

    const deploymentData = this.buildDeploymentPayload();

    console.log('Deployment configuration finished:', deploymentData);
    
    // Call the save API
    this.service.saveDeploymentForm(deploymentData).subscribe(
      (response) => {
        if (response && response.id) {
          this.deploymentId = response.id;
        }
        this.service.message(this.DEPLOYMENT_SAVED_SUCCESS_MESSAGE, 'success');
        
        // Disable all forms after successful deployment
        this.isDeploymentFinished = true;
        this.isEditMode = false;
        this.disableAllForms();
        
        // Emit event to parent component
        this.deploymentFinished.emit(deploymentData);
      },
      (error) => {
        this.service.message(this.DEPLOYMENT_SAVED_ERROR_MESSAGE + (error.message || 'Unknown error'), 'error');
      }
    );
  }

  /**
   * Disable all form groups after successful deployment
   */
  private disableAllForms(): void {
    this.overviewForm.disable();
    this.scopeForm.disable();
    this.approvalForm.disable();
    this.validationForm.disable();
  }

  /**
   * Enable all form groups for editing
   */
  private enableAllForms(): void {
    this.overviewForm.enable();
    this.scopeForm.enable();
    this.approvalForm.enable();
    this.validationForm.enable();
  }

  getSaveButtonLabel(tabIndex: number = 0): string {
    if (tabIndex < 3) {
      return 'Next';
    }
    return this.isEditMode ? this.UPDATE_BUTTON_LABEL : 'Save';
  }

  /**
   * Build the complete deployment payload from all forms
   */
  private buildDeploymentPayload(): any {
    const payload: any = {
      cname: this.cname || '',
      org: this.organisation || '',
      agent_name: this.overviewForm.get('agentName')?.value,
      agent_version: this.overviewForm.get('agentVersion')?.value,
      deployment_environment: this.overviewForm.get('deploymentEnvironment')?.value,
      deployment_datetime: this.overviewForm.get('deploymentDateTime')?.value,
      build_release_id: this.overviewForm.get('buildReleaseId')?.value,
      agent_package_location: this.overviewForm.get('agentPackageLocation')?.value,
      hash_checksum: this.overviewForm.get('hashChecksum')?.value,
      
      target_nodes_hosts: JSON.stringify(this.scopeForm.get('targetNodes')?.value || []),
      impacted_services: JSON.stringify(this.scopeForm.get('impactedServices')?.value || []),
      dependencies: this.scopeForm.get('dependencies')?.value,
      health_check_status: this.scopeForm.get('healthCheckStatus')?.value,
      backup_confirmation: this.scopeForm.get('backupConfirmation')?.value || false,
      change_freeze_compliance: this.scopeForm.get('changeFreezeCompliance')?.value || false,
      security_patch_verification: this.scopeForm.get('securityPatchVerification')?.value || false,
      
      approver_name_role: this.approvalForm.get('approverNameRole')?.value,
      cab_approval_reference: this.approvalForm.get('cabApprovalReference')?.value,
      change_request_id: this.approvalForm.get('changeRequestId')?.value,
      rollback_procedure_reference: this.approvalForm.get('rollbackProcedureReference')?.value,
      previous_stable_agent_version: this.approvalForm.get('previousStableVersion')?.value,
      
      smoke_test_status: this.validationForm.get('smokeTestStatus')?.value,
      performance_test_summary: this.validationForm.get('performanceTestSummary')?.value,
      ssl_tls_certificate_check: this.validationForm.get('sslTlsCertificateCheck')?.value || false,
      dr_readiness: this.validationForm.get('drReadiness')?.value || false,
      data_retention_confirmation: this.validationForm.get('dataRetentionConfirmation')?.value || false,
      antivirus_patch_confirmation: this.validationForm.get('antivirusPatchConfirmation')?.value || false,
      deployment_owner: this.validationForm.get('deploymentOwner')?.value,
      infra_support_contacts: this.validationForm.get('infraSupportContacts')?.value,
      audit_poc_details: this.validationForm.get('auditPocDetails')?.value
    };

    // Add ID if in edit mode
    if (this.deploymentId) {
      payload.id = this.deploymentId;
    }

    return payload;
  }

  /**
   * Get deployment environment for display
   */
  getSelectedEnvironment(): string {
    return this.overviewForm.get('deploymentEnvironment')?.value || 'Production';
  }

  /**
   * Get dynamic deploy button text based on selected environment
   */
  getDeployButtonText(): string {
    const environment = this.overviewForm.get('deploymentEnvironment')?.value;
    if (this.isRunningAndDeploying) {
      return 'Deploying...';
    }
    if (environment) {
      return `Deploy to ${environment}`;
    }
    return 'Deploy';
  }

  /**
   * Handle Deploy button click - emit event to parent
   */
  onDeploy(): void {

  }

  /**
   * Enable editing of deployment details
   */
  editDeploymentDetails(): void {
    this.isEditMode = true;
    this.enableAllForms();
  }

   openBranchSelectionDialog(): void {
    this.openDialog(false);
  }

  openPullRequestDialog(): void {
    this.openDialog(true);
  }

  private openDialog(isDirectDeploy: boolean): void {
    const selectedEnvironment = this.overviewForm.get('deploymentEnvironment')?.value || '';
    const dialogRef = this.dialog.open(BranchSelectionDialogComponent, {
      width: '550px',
      maxWidth: '90vw',
      disableClose: true,
      panelClass: 'branch-deployment-dialog',
      data: {
        cname: this.cname,
        organisation: this.organisation,
        environment: selectedEnvironment,
        isDirectDeploy: isDirectDeploy
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Branch deployment result:', result);
        this.service.message('Branch deployment initiated successfully', 'success');
      }
    });
  }
}

