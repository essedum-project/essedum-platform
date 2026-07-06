import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-skills-add',
  templateUrl: './skills-add.component.html',
  styleUrls: ['./skills-add.component.scss'],
})
export class SkillsAddComponent implements OnInit {
  form!: FormGroup;
  showError = false;

  // Section collapse states
  sectionStates: Record<string, boolean> = {
    basic:        true,
    technical:    false,
    availability: true,
  };

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

  // ── Section headers ────────────────────────────────────────────────────
  readonly SECLBLBASIC   = 'Basic Information';
  readonly SECLBLTECH    = 'Technical Details';
  readonly SECLBLAVA     = 'Availability & Access';
  // ── Field labels ──────────────────────────────────────────────────────
  readonly LBLNAME         = 'Skill Name';
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
  readonly LBLORG          = 'Organization';
  readonly LBLPROJECTID    = 'Project ID';
  // ── Placeholders ──────────────────────────────────────────────────────
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
  readonly PHORG          = 'essedum';
  readonly PHPROJECTID    = '42';
  // ── Buttons ───────────────────────────────────────────────────────────
  readonly BTNCANCEL  = 'Cancel';
  readonly BTNSAVE    = 'Save';
  // ── Errors ────────────────────────────────────────────────────────────
  readonly ERRREQ        = 'This field is required';
  readonly ERRMAXNAME    = 'Max 256 characters';
  readonly ERRMAXALIAS   = 'Max 128 characters';
  readonly ERRMAXVERSION = 'Max 20 characters';
  readonly ERRMAXDESC    = 'Max 512 characters';
  readonly ERRMAXORG     = 'Max 256 characters';
  readonly ERRGLOBAL     = 'Please fill in all required fields.';

  constructor(
    private fb: FormBuilder,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      // Basic Information
      name:            ['', [Validators.required, Validators.maxLength(256)]],
      alias:           ['', [Validators.maxLength(128)]],
      version:         ['1.0.0', [Validators.required, Validators.maxLength(20)]],
      skillType:       ['', [Validators.required]],
      category:        ['', [Validators.required]],
      subcategory:     [''],
      description:     ['', [Validators.required, Validators.maxLength(512)]],
      longDescription: [''],
      // Technical Details
      language:        [''],
      framework:       ['', [Validators.maxLength(128)]],
      runtime:         [''],
      entrypoint:      ['', [Validators.maxLength(512)]],
      tags:            [''],
      triggerKeywords: [''],
      inputSchema:     [''],
      outputSchema:    [''],
      // Availability & Access
      pipelineScope:   ['ALL',     [Validators.required]],
      status:          ['ACTIVE',  [Validators.required]],
      visibility:      ['PROJECT', [Validators.required]],
      organization:    ['', [Validators.required, Validators.maxLength(256)]],
      projectId:       [null],
    });
  }

  toggleSection(key: string): void {
    this.sectionStates[key] = !this.sectionStates[key];
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.showError = true;
      this.form.markAllAsTouched();
      return;
    }
    this.showError = false;
    // TODO: call service to persist the new skill
    this.goBack();
  }

  goBack(): void {
    this.location.back();
  }
}
