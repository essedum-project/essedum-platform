import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { Location } from '@angular/common';
import { Services } from '@essedum/shared-lib';
import {
  SkillCreateRequest,
  SkillsService,
  SkillsServiceMessages,
  SkillFormModel,
  SkillType,
  SkillCategory,
  SkillStatus,
  SkillVisibility,
  PipelineScope,
} from '../../services/skills.service';

@Component({
  standalone: false,
  selector: 'app-skills-add',
  templateUrl: './skills-add.component.html',
  styleUrls: ['./skills-add.component.scss'],
})
export class SkillsAddComponent {
  @ViewChild('skillForm', { static: false }) skillForm!: NgForm;
  @ViewChildren(NgModel) ngModels!: QueryList<NgModel>;

  skillModel: SkillFormModel = this.initializeSkillModel();
  showError = false;
  saving = false;
  missingFields: string[] = [];
  touchedFields: Set<string> = new Set();

  sectionStates: Record<string, boolean> = {
    basic:        true,
    technical:    true,
    availability: true,
  };

  readonly SkillType = SkillType;
  readonly SkillCategory = SkillCategory;
  readonly SkillStatus = SkillStatus;
  readonly SkillVisibility = SkillVisibility;
  readonly PipelineScope = PipelineScope;

  readonly skillTypeOptions = [
    { value: 'CODE_GENERATION', label: 'Code Generation' },
    { value: 'TEST_GENERATION', label: 'Test Generation' },
    { value: 'DEBUGGING',       label: 'Debugging' },
    { value: 'REFACTORING',     label: 'Refactoring' },
    { value: 'DOCUMENTATION',   label: 'Documentation' },
    { value: 'DEPLOYMENT',      label: 'Deployment' },
    { value: 'CODE_REVIEW',     label: 'Code Review' },
    { value: 'SECURITY_SCAN',   label: 'Security Scan' },
    { value: 'DATA_PIPELINE',   label: 'Data Pipeline' },
    { value: 'CUSTOM',          label: 'Custom' },
  ];

  readonly categoryOptions = [
    { value: 'Backend',  label: 'Backend' },
    { value: 'Frontend', label: 'Frontend' },
    { value: 'ML',       label: 'ML' },
    { value: 'DevOps',   label: 'DevOps' },
    { value: 'Data',     label: 'Data' },
  ];

  readonly subcategoryOptions = [
    { value: 'SpringBoot',  label: 'Spring Boot' },
    { value: 'FastAPI',     label: 'FastAPI' },
    { value: 'React',       label: 'React' },
    { value: 'Angular',     label: 'Angular' },
    { value: 'LangChain',   label: 'LangChain' },
    { value: 'Docker',      label: 'Docker' },
    { value: 'Kubernetes',  label: 'Kubernetes' },
    { value: 'Node',        label: 'Node.js' },
    { value: 'NextJS',      label: 'Next.js' },
    { value: 'Vue',         label: 'Vue' },
  ];

  readonly languageOptions = [
    { value: 'java',       label: 'Java' },
    { value: 'python',     label: 'Python' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'go',         label: 'Go' },
    { value: 'shell',      label: 'Shell' },
    { value: 'csharp',     label: 'C#' },
  ];

  readonly runtimeOptions = [
    { value: 'jdk21',      label: 'JDK 21' },
    { value: 'jdk17',      label: 'JDK 17' },
    { value: 'python3.11', label: 'Python 3.11' },
    { value: 'python3.10', label: 'Python 3.10' },
    { value: 'node18',     label: 'Node 18' },
    { value: 'node20',     label: 'Node 20' },
    { value: 'docker',     label: 'Docker' },
  ];

  readonly pipelineScopeOptions = [
    { value: 'ALL',      label: 'All Pipelines' },
    { value: 'SPECIFIC', label: 'Specific Pipelines' },
    { value: 'NONE',     label: 'None (Disabled)' },
  ];

  readonly statusOptions = [
    { value: 'ACTIVE',     label: 'Active' },
    { value: 'INACTIVE',   label: 'Inactive' },
    { value: 'DEPRECATED', label: 'Deprecated' },
  ];

  readonly visibilityOptions = [
    { value: 'GLOBAL',  label: 'Global' },
    { value: 'ORG',     label: 'Organization' },
    { value: 'PROJECT', label: 'Project' },
    { value: 'PRIVATE', label: 'Private' },
  ];

  readonly PAGETITLE = 'Create Skill';
  readonly SECLBLBASIC   = 'Basic Information';
  readonly SECLBLTECH    = 'Technical Details';
  readonly SECLBLAVA     = 'Availability & Access';
  readonly LBLNAME         = 'Skill Name....';
  readonly LBLALIAS        = 'Alias';
  readonly LBLVERSION      = 'Version';
  readonly LBLTYPE         = 'Skill Type';
  readonly LBLCATEGORY     = 'Category';
  readonly LBLSUBCATEGORY  = 'Sub-Category';
  readonly LBLDESC         = 'Description';
  readonly LBLLONGDESC     = 'Long Description';
  readonly LBLLANGUAGE     = 'Language';
  readonly LBLFRAMEWORK    = 'Framework';
  readonly LBLRUNTIME      = 'Runtime';
  readonly LBLENTRYPOINT   = 'Entrypoint';
  readonly LBLTAGS         = 'Tags';
  readonly LBLTRIGKEYWORDS = 'Trigger Keywords';
  readonly LBLINPUTSCHEMA  = 'Input Schema (JSON)';
  readonly LBLOUTPUTSCHEMA = 'Output Schema (JSON)';
  readonly LBLPIPESCOPE    = 'Pipeline Scope';
  readonly LBLSTATUS       = 'Status';
  readonly LBLVISIBILITY   = 'Visibility';
  readonly PHNAME         = 'Java REST Code Generator';
  readonly PHALIAS        = 'java-rest-gen';
  readonly PHVERSION      = '1.0.0';
  readonly PHDESC         = 'Brief description (max 512 chars)…';
  readonly PHLONGDESC     = 'Full markdown description…';
  readonly PHFRAMEWORK    = 'SpringBoot, LangChain';
  readonly PHENTRYPOINT   = 'com.example.Main';
  readonly PHTAGS         = 'Comma-separated: java, rest, spring';
  readonly PHTRIGKW       = 'Comma-separated: generate class, create endpoint';
  readonly PHINPUTSCHEMA  = '{"type":"object","properties":{...}}';
  readonly PHOUTPUTSCHEMA = '{"type":"object","properties":{...}}';
  readonly BTNCANCEL  = 'Cancel';
  readonly BTNSAVE    = 'Save';
  readonly ERRREQ        = 'This field is required';
  readonly ERRMAXNAME    = 'Max 256 characters';
  readonly ERRMAXALIAS   = 'Max 128 characters';
  readonly ERRMAXVERSION = 'Max 20 characters';
  readonly ERRMAXDESC    = 'Max 512 characters';
  readonly ERRGLOBAL     = 'Please fill in all required fields.';

  constructor(
    private location: Location,
    private skillsService: SkillsService,
    private service: Services,
  ) {}

  toggleSection(key: string): void {
    this.sectionStates[key] = !this.sectionStates[key];
  }

  markFieldTouched(fieldName: string): void {
    this.touchedFields.add(fieldName);
  }

  isFieldInvalid(fieldName: string): boolean {
    return this.touchedFields.has(fieldName);
  }

  private readonly REQUIRED_FIELDS = ['skillName', 'skillVersion', 'skillType', 'skillCategory', 'description', 'pipelineScope', 'status', 'visibility'];

  private readonly FIELD_LABELS: Record<string, string> = {
    skillName:     'Skill Name',
    skillVersion:  'Version',
    skillType:     'Skill Type',
    skillCategory: 'Category',
    description:   'Description',
    pipelineScope: 'Pipeline Scope',
    status:        'Status',
    visibility:    'Visibility',
  };

  isFieldRequired(fieldName: string): boolean {
    return this.REQUIRED_FIELDS.includes(fieldName);
  }

  validateField(fieldName: string, value: string): boolean {
    if (this.isFieldRequired(fieldName) && !value?.trim()) return false;

    const maxLengths: Record<string, number> = {
      skillName: 256,
      skillAlias: 128,
      skillVersion: 20,
      description: 512,
      framework: 128,
      entrypoint: 512,
    };

    if (maxLengths[fieldName] && value?.length > maxLengths[fieldName]) return false;
    return true;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showError = true;
      this.REQUIRED_FIELDS.forEach(f => this.touchedFields.add(f));
      this.ngModels?.forEach(m => m.control.markAsTouched());
      return;
    }
    this.showError = false;
    this.saving = true;

    const org = sessionStorage.getItem('organization') || 'infosys';
    const projectId = JSON.parse(sessionStorage.getItem('project') || '{}')?.id || 101;

    const body: SkillCreateRequest = {
      skillName: this.skillModel.skillName!,
      skillVersion: this.skillModel.skillVersion!,
      skillType: this.skillModel.skillType!,
      skillCategory: this.skillModel.skillCategory!,
      description: this.skillModel.description!,
      pipelineScope: this.skillModel.pipelineScope!,
      status: this.skillModel.status!,
      visibility: this.skillModel.visibility!,
      ...(this.skillModel.skillAlias && { skillAlias: this.skillModel.skillAlias }),
      ...(this.skillModel.skillSubcategory && { skillSubcategory: this.skillModel.skillSubcategory }),
      ...(this.skillModel.tags && { tags: this.skillModel.tags }),
      ...(this.skillModel.triggerKeywords && { triggerKeywords: this.skillModel.triggerKeywords }),
      ...(this.skillModel.language && { language: this.skillModel.language }),
      ...(this.skillModel.framework && { framework: this.skillModel.framework }),
      ...(this.skillModel.runtime && { runtime: this.skillModel.runtime }),
      ...(this.skillModel.entrypoint && { entrypoint: this.skillModel.entrypoint }),
      ...(this.skillModel.inputSchema && { inputSchema: this.skillModel.inputSchema }),
      ...(this.skillModel.outputSchema && { outputSchema: this.skillModel.outputSchema }),
    };

    this.skillsService.createSkill(org, projectId, body).subscribe({
      next: () => {
        this.saving = false;
        this.service.message(SkillsServiceMessages.CREATE_SUCCESS, 'success');
        this.skillsService.triggerListRefresh();
        this.goBack();
      },
      error: () => {
        this.saving = false;
        this.service.message(SkillsServiceMessages.CREATE_ERROR, 'error');
      },
    });
  }

  private isFormValid(): boolean {
    this.missingFields = [];
    for (const field of this.REQUIRED_FIELDS) {
      const value = (this.skillModel as any)[field];
      const isEmpty = !value || (typeof value === 'string' && !value.trim());
      if (isEmpty || !this.validateField(field, value)) {
        this.missingFields.push(this.FIELD_LABELS[field] ?? field);
      }
    }
    return this.missingFields.length === 0;
  }

  private initializeSkillModel(): SkillFormModel {
    return {
      skillName: '',
      skillAlias: '',
      skillVersion: '1.0.0',
      skillType: '',
      skillCategory: '',
      skillSubcategory: '',
      tags: '',
      triggerKeywords: '',
      description: '',
      language: '',
      framework: '',
      runtime: '',
      entrypoint: '',
      inputSchema: '',
      outputSchema: '',
      pipelineScope: PipelineScope.ALL,
      status: SkillStatus.ACTIVE,
      visibility: SkillVisibility.PROJECT,
    };
  }

  goBack(): void {
    this.location.back();
  }
}
