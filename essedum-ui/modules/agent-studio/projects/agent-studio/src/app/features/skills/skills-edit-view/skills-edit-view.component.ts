import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Skill } from '../skills.component';

@Component({
  selector: 'app-skills-edit-view',
  templateUrl: './skills-edit-view.component.html',
  styleUrls: ['./skills-edit-view.component.scss'],
})
export class SkillsEditViewComponent implements OnInit {
  form!: FormGroup;
  isView = false;
  isEdit = false;
  showError = false;
  skill: Skill | null = null;

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
  readonly BTNCLOSE   = 'Close';
  readonly BTNUPDATE  = 'Update';
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
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  ngOnInit(): void {
    // Detect mode from first URL segment (edit or view)
    const urlSegments = this.route.snapshot.url;
    const mode = urlSegments.length > 0 ? urlSegments[0].path : 'edit';
    this.isView = mode === 'view';
    this.isEdit = mode === 'edit';

    // Retrieve skill passed via router navigation state
    this.skill = (window.history.state as any)?.skill ?? null;

    this.buildForm();

    if (this.isView) {
      this.form.disable();
    }
  }

  get pageTitle(): string {
    return this.isView ? 'View Skill' : 'Edit Skill';
  }

  buildForm(): void {
    const s = this.skill;
    this.form = this.fb.group({
      // Basic Information
      name:            [s?.name             ?? '', [Validators.required, Validators.maxLength(256)]],
      alias:           [s?.alias            ?? '', [Validators.maxLength(128)]],
      version:         [s?.version          ?? '1.0.0', [Validators.required, Validators.maxLength(20)]],
      skillType:       [s?.skillType        ?? '', [Validators.required]],
      category:        [s?.category         ?? '', [Validators.required]],
      subcategory:     [s?.subcategory      ?? ''],
      description:     [s?.description      ?? '', [Validators.required, Validators.maxLength(512)]],
      longDescription: [s?.longDescription  ?? ''],
      // Technical Details
      language:        [s?.language         ?? ''],
      framework:       [s?.framework        ?? '', [Validators.maxLength(128)]],
      runtime:         [s?.runtime          ?? ''],
      entrypoint:      [s?.entrypoint       ?? '', [Validators.maxLength(512)]],
      tags:            [s?.tags             ?? ''],
      triggerKeywords: [s?.triggerKeywords  ?? ''],
      inputSchema:     [s?.inputSchema      ?? ''],
      outputSchema:    [s?.outputSchema     ?? ''],
      // Availability & Access
      pipelineScope:   [s?.pipelineScope    ?? 'ALL',     [Validators.required]],
      status:          [s?.status           ?? 'ACTIVE',  [Validators.required]],
      visibility:      [s?.visibility       ?? 'PROJECT', [Validators.required]],
      organization:    [s?.organization     ?? '', [Validators.required, Validators.maxLength(256)]],
      projectId:       [s?.projectId        ?? null],
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
    // TODO: call service to update the skill
    this.goBack();
  }

  goBack(): void {
    this.location.back();
  }
}
