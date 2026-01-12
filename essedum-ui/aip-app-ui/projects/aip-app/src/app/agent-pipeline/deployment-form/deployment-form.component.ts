import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Services } from '../../services/service';

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

  selectedTabIndex = 0;
  
  // Form groups for each tab
  overviewForm: FormGroup;
  scopeForm: FormGroup;
  approvalForm: FormGroup;
  validationForm: FormGroup;

  // Hover states for buttons
  hoverSaveOverview = false;
  hoverSaveScope = false;
  hoverSaveApproval = false;
  hoverSaveValidation = false;
  isFinishHovered = false;

  // Track which forms have been saved
  overviewSaved = false;
  scopeSaved = false;
  approvalSaved = false;
  validationSaved = false;

  // Dropdown options
  deploymentEnvironments = ['Production', 'Staging', 'UAT'];
  
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

  constructor(private fb: FormBuilder, private service: Services) {
    // Initialize Overview Form
    this.overviewForm = this.fb.group({
      agentName: ['', Validators.required],
      agentVersion: ['', Validators.required],
      deploymentEnvironment: ['', Validators.required],
      deploymentDateTime: ['', Validators.required],
      buildReleaseId: ['', Validators.required],
      agentPackageLocation: ['', Validators.required],
      hashChecksum: ['', Validators.required]
    });

    // Initialize Scope & Pre-Checks Form
    this.scopeForm = this.fb.group({
      targetNodes: [[], Validators.required],
      impactedServices: [[], Validators.required],
      dependencies: ['', Validators.required],
      healthCheckStatus: ['', Validators.required],
      backupConfirmation: [false, Validators.requiredTrue],
      changeFreezeCompliance: [false, Validators.requiredTrue],
      securityPatchVerification: [false, Validators.requiredTrue]
    });

    // Initialize Approval & Rollback Form
    this.approvalForm = this.fb.group({
      approverNameRole: ['', Validators.required],
      cabApprovalReference: ['', Validators.required],
      changeRequestId: ['', Validators.required],
      rollbackProcedureReference: ['', Validators.required],
      previousStableVersion: ['', Validators.required]
    });

    // Initialize Validation & Compliance Form
    this.validationForm = this.fb.group({
      smokeTestStatus: ['', Validators.required],
      performanceTestSummary: ['', Validators.required],
      sslTlsCertificateCheck: [false, Validators.requiredTrue],
      drReadiness: [false, Validators.requiredTrue],
      dataRetentionConfirmation: [false, Validators.requiredTrue],
      antivirusPatchConfirmation: [false, Validators.requiredTrue],
      deploymentOwner: ['', Validators.required],
      infraSupportContacts: ['', Validators.required],
      auditPocDetails: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Initialize form with default values if needed
  }

  /**
   * Save Overview form
   */
  saveOverview(): void {
    if (this.overviewForm.valid) {
      console.log('Saving Overview form:', this.overviewForm.value);
      this.overviewSaved = true;
      // TODO: API integration
      this.service.message('Overview saved successfully!', 'success');
    } else {
      this.markFormGroupTouched(this.overviewForm);
      this.service.message('Please fill all required fields', 'error');
    }
  }

  /**
   * Save Scope & Pre-Checks form
   */
  saveScope(): void {
    if (this.scopeForm.valid) {
      console.log('Saving Scope & Pre-Checks form:', this.scopeForm.value);
      this.scopeSaved = true;
      // TODO: API integration
      this.service.message('Scope & Pre-Checks saved successfully!', 'success');
    } else {
      this.markFormGroupTouched(this.scopeForm);
      this.service.message('Please fill all required fields', 'error');
    }
  }

  /**
   * Save Approval & Rollback form
   */
  saveApproval(): void {
    if (this.approvalForm.valid) {
      console.log('Saving Approval & Rollback form:', this.approvalForm.value);
      this.approvalSaved = true;
      // TODO: API integration
      this.service.message('Approval & Rollback saved successfully!', 'success');
    } else {
      this.markFormGroupTouched(this.approvalForm);
      this.service.message('Please fill all required fields', 'error');
    }
  }

  /**
   * Save Validation & Compliance form
   */
  saveValidation(): void {
    if (this.validationForm.valid) {
      console.log('Saving Validation & Compliance form:', this.validationForm.value);
      this.validationSaved = true;
      // TODO: API integration
      this.service.message('Validation & Compliance saved successfully!', 'success');
    } else {
      this.markFormGroupTouched(this.validationForm);
      this.service.message('Please fill all required fields', 'error');
    }
  }

  /**
   * Check if all forms are valid and saved
   */
  isAllFormsValid(): boolean {
    return this.overviewSaved && this.scopeSaved && this.approvalSaved && this.validationSaved;
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
   * Finish deployment configuration and emit event
   */
  finishDeployment(): void {
    // Double-check all forms are saved
    if (!this.isAllFormsValid()) {
      this.service.message('Please complete and save all deployment forms before finishing', 'error');
      return;
    }

    const deploymentData: DeploymentFormData = {
      overview: this.overviewForm.value,
      scope: this.scopeForm.value,
      approval: this.approvalForm.value,
      validation: this.validationForm.value
    };

    console.log('Deployment configuration finished:', deploymentData);
    
    // Emit event to parent component
    this.deploymentFinished.emit(deploymentData);
  }

  /**
   * Get deployment environment for display
   */
  getSelectedEnvironment(): string {
    return this.overviewForm.get('deploymentEnvironment')?.value || 'Production';
  }
}
