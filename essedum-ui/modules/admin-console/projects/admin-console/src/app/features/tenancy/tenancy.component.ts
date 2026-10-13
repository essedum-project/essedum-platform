import { Component, OnInit } from '@angular/core';
import { forkJoin, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { LegacyOrganisation, LegacyProject, RbacEnvironment } from '../../core/api-models';

interface EnvironmentRow extends RbacEnvironment {
  projectName: string;
}

@Component({
  selector: 'app-tenancy',
  templateUrl: './tenancy.component.html',
  styleUrls: ['./tenancy.component.scss'],
  standalone: false,
})
export class TenancyComponent implements OnInit {
  organizations: LegacyOrganisation[] = [];
  projects: LegacyProject[] = [];
  environmentRows: EnvironmentRow[] = [];

  readonly orgColumns = ['name', 'status'];
  readonly projectColumns = ['name', 'description'];
  readonly environmentColumns = ['name', 'projectName', 'configRef'];

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.api.getOrganisations().subscribe(orgs => (this.organizations = orgs));

    this.api
      .getProjects()
      .pipe(
        switchMap(projects => {
          this.projects = projects;
          if (projects.length === 0) {
            return of([] as EnvironmentRow[]);
          }
          return forkJoin(
            projects.map(project =>
              this.api.getEnvironments(project.id).pipe(
                switchMap(envs =>
                  of(envs.map(e => ({ ...e, projectName: project.name }))),
                ),
              ),
            ),
          ).pipe(switchMap(rows => of(rows.flat())));
        }),
      )
      .subscribe(rows => (this.environmentRows = rows));
  }
}
