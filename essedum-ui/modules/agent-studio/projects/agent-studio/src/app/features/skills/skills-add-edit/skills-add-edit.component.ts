import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Skill } from '../skills.component';

export interface SkillsDialogData {
  mode: 'add' | 'edit' | 'view';
  skill: Skill | null;
}

@Component({
  selector: 'app-skills-add-edit',
  templateUrl: './skills-add-edit.component.html',
  styleUrls: ['./skills-add-edit.component.scss'],
})
export class SkillsAddEditComponent implements OnInit {
  form!: FormGroup;
  isView = false;
  isEdit = false;
  isAdd  = false;
  isBackHovered = false;
  showError = false;

  // section collapse states
  sectionStates: Record<string, boolean> = {
    basic: true,
    details: true,
  };

  sectionHoverStates: Record<string, boolean> = {
    basic: false,
    details: false,
  };

  readonly typeOptions = [
    { value: 'nlp',    label: 'NLP' },
    { value: 'code',   label: 'Code' },
    { value: 'data',   label: 'Data' },
    { value: 'vision', label: 'Vision' },
  ];

  readonly TITLES = {
    add:  'Create Skill',
    edit: 'Edit Skill',
    view: 'View Skill',
  };

  // ── Field labels & placeholders ──────────────────────────────
  readonly LBLSKILLNAME  = 'Skill Name';
  readonly LBLTYPE       = 'Type';
  readonly LBLDESC       = 'Description';
  readonly PHSKILLNAME   = 'Enter skill name…';
  readonly PHTYPE        = 'Select Type';
  readonly PHDESC        = 'Brief description of what this skill does…';
  readonly BTNCANCEL     = 'Cancel';
  readonly BTNSAVE       = 'Save';
  readonly BTNUPDATE     = 'Update';
  readonly ERRREQ        = 'This field is required';
  readonly ERRMAXNAME    = 'Max 100 characters';
  readonly ERRMAXDESC    = 'Max 500 characters';
  readonly ERRGLOBAL     = 'Please fill in all required fields.';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SkillsAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SkillsDialogData,
  ) {}

  ngOnInit(): void {
    this.isView = this.data.mode === 'view';
    this.isEdit = this.data.mode === 'edit';
    this.isAdd  = this.data.mode === 'add';

    this.form = this.fb.group({
      name:        [this.data.skill?.name        ?? '', [Validators.required, Validators.maxLength(100)]],
      description: [this.data.skill?.description ?? '', [Validators.required, Validators.maxLength(500)]],
      type:        [this.data.skill?.type        ?? 'nlp', [Validators.required]],
    });

    if (this.isView) {
      this.form.disable();
    }
  }

  get title(): string { return this.TITLES[this.data.mode]; }

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
    const val = this.form.getRawValue();
    const result: Skill = {
      id:          this.data.skill?.id ?? String(Date.now()),
      name:        val.name.trim(),
      description: val.description.trim(),
      type:        val.type,
      createdBy:   this.data.skill?.createdBy ?? 'admin',
      createdAt:   this.data.skill?.createdAt ?? new Date().toISOString(),
    };
    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
