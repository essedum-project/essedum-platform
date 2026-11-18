import { Component, OnInit, OnDestroy, ViewEncapsulation, ElementRef, effect, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, combineLatest, Subject, merge, fromEvent, Observable } from 'rxjs';
import { catchError, switchMap, map, takeUntil, take, filter } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import { ThemeService } from '../../core/theme.service';
import type { AuditEvent } from '../../core/api-models';


interface StatCard {
  label: string;
  count: number;
  route: string;
  accent: string;
  queryParams?: Record<string, string>;
}

// P1 VERSION: Admin landing overview with Shadow DOM encapsulation
// Admin landing overview (plan §10) — headline counts across the admin
// surfaces + a recent-activity feed, each card linking to its full screen.
@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
})
export class OverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  // `route` is a sibling segment, navigated relative to this route — the
  // remote is mounted under the host's /landing/admin-console/**, so an
  // absolute '/admin-console/...' link would not resolve.
  cards: StatCard[] = [
    { label: 'Organizations', count: 0, route: 'tenancy', accent: '#3b82f6', queryParams: { tab: 'organizations' } },
    { label: 'Projects', count: 0, route: 'tenancy', accent: '#06b6d4', queryParams: { tab: 'projects' } },
    { label: 'Members & Roles', count: 0, route: 'access', accent: '#8b5cf6' },
    { label: 'Pending Approvals', count: 0, route: 'approvals', accent: '#fb923c' },
  ];
  recentAudit = new MatTableDataSource<AuditEvent>([]);
  readonly auditColumns = ['occurredAt', 'entity', 'action', 'actorName', 'targetUserName', 'details', 'correlationId'];
  loading = true;

  // The paginator renders only once audit rows exist (*ngIf), so bind it when it appears.
  @ViewChild(MatPaginator) set paginator(p: MatPaginator | undefined) {
    if (p) this.recentAudit.paginator = p;
  }

  ngAfterViewInit(): void {}

  constructor(
    private readonly api: ApiService,
    private readonly userContext: UserContextService,
    private readonly themeService: ThemeService,
    private readonly elementRef: ElementRef,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    // Apply light-theme class when isDarkTheme is false
    effect(() => {
      const isDark = this.themeService.isDarkTheme();
      const hostElement = this.elementRef.nativeElement;
      if (isDark) {
        hostElement.classList.remove('light-theme');
      } else {
        hostElement.classList.add('light-theme');
      }
    });
  }

  // Timestamp of the last completed data load — used to skip the redundant
  // rbac-init-complete (2 s after role change) if rbac-context-ready already
  // triggered a fresh fetch.
  private lastLoadedAt = 0;
  private isPlatformAdminView = false;
  private scopedOrgId: number | null = null;

  ngOnInit(): void {
    console.log('[OVERVIEW] ngOnInit');

    // rbac-context-ready fires immediately when the shell has updated sessionStorage
    // (before the 2 s overlay timer). rbac-init-complete fires after 2 s.
    // of(null) handles the first render.
    // If rbac-context-ready already loaded within the last 3 s, skip rbac-init-complete.
    merge(
      of(null),
      fromEvent(window, 'rbac-context-ready'),
      fromEvent(window, 'rbac-init-complete').pipe(
        filter(() => {
          const skip = Date.now() - this.lastLoadedAt < 3000;
          console.log('[OVERVIEW] rbac-init-complete received —', skip ? 'skipping (already loaded recently)' : 'loading');
          return !skip;
        }),
      ),
    ).pipe(
      takeUntil(this.destroy$),
      switchMap(event => {
        console.log('[OVERVIEW] Load triggered by:', event === null ? 'initial' : (event as Event).type);
        this.loading = true;
        this.cards.forEach(c => c.count = 0);
        this.recentAudit.data = [];
        console.log('[OVERVIEW] Reading RBAC context...');
        return combineLatest([this.userContext.orgId$, this.userContext.projectId$, this.userContext.selectedRoleRank$]).pipe(
          take(1),
        );
      }),
      switchMap(([orgId, projectId, roleRank]) => {
          console.log('[OVERVIEW] Fetching data — orgId:', orgId, 'projectId:', projectId, 'roleRank:', roleRank);
          const userId = this.userContext.userId$.value;
          const isPlatformAdmin = roleRank != null && roleRank >= 4;
          this.isPlatformAdminView = isPlatformAdmin;
          this.scopedOrgId = orgId;
          const scopedOrgId     = isPlatformAdmin ? undefined : (orgId ?? undefined);
          const scopedProjectId = isPlatformAdmin ? undefined : (projectId ?? undefined);

          return forkJoin({
            orgs:          this.api.getOrganisations().pipe(catchError(() => of([] as any[]))),
            projects:      this.api.getProjects().pipe(catchError(() => of([] as any[]))),
            members:       this.api.getRoleAssignments(userId).pipe(catchError(() => of([] as any[]))),
            approvalsCount: this.countApprovals(orgId, projectId, roleRank).pipe(catchError(() => of(0))),
            audit:         this.api.getAuditEvents(userId, scopedOrgId, scopedProjectId).pipe(catchError(() => of([] as AuditEvent[]))),
          }).pipe(
            map(res => {
              const orgs = isPlatformAdmin
                ? res.orgs
                : res.orgs.filter((o: any) => orgId != null && Number(o.id) === Number(orgId));

              const projects = isPlatformAdmin
                ? res.projects
                : res.projects.filter((p: any) =>
                    orgId != null && (
                      (p.organisationId != null && Number(p.organisationId) === Number(orgId)) ||
                      (p.portfolioId?.id != null && Number(p.portfolioId.id) === Number(orgId))
                    )
                  );

              const members = isPlatformAdmin
                ? res.members
                : res.members.filter((m: any) =>
                    (orgId == null     || m.organizationId == null || Number(m.organizationId) === Number(orgId)) &&
                    (projectId == null || m.projectId == null      || Number(m.projectId)      === Number(projectId))
                  );

              return { orgs, projects, members, approvalsCount: res.approvalsCount, audit: res.audit };
            }),
            catchError(() => of(null)),
          );
        }),
      )
      .subscribe(data => {
        if (!data) { this.loading = false; return; }
        this.lastLoadedAt = Date.now();
        console.log('[OVERVIEW] Data loaded — orgs:', data.orgs.length, 'projects:', data.projects.length, 'members:', data.members.length, 'approvals:', data.approvalsCount);
        // Non-platform-admins are scoped to the one org selected in the thumbnail.
        this.cards[0].count = this.isPlatformAdminView ? data.orgs.length : (this.scopedOrgId != null ? 1 : data.orgs.length);
        this.cards[1].count = data.projects.length;
        this.cards[2].count = data.members.length;
        this.cards[3].count = data.approvalsCount;
        this.recentAudit.data = (data.audit || []).slice(0, 8);
        this.loading = false;
      });
  }

  private countApprovals(orgId: number | null, projectId: number | null, roleRank: number | null): Observable<number> {
    const rank = roleRank ?? -1;
    const toCount = (raw: any): number => {
      if (Array.isArray(raw)) return raw.length;
      if (typeof raw?.count === 'number') return raw.count;
      if (Array.isArray(raw?.data)) return raw.data.length;
      return 0;
    };
    const calls: Observable<any>[] = [
      projectId ? this.api.getProjectAdminApprovals(projectId).pipe(catchError(() => of([]))) : of([]),
      orgId     ? this.api.getOrgAdminApprovals(orgId).pipe(catchError(() => of([])))     : of([]),
      rank >= 4 ? this.api.getPlatformAdminApprovals().pipe(catchError(() => of([])))     : of([]),
      projectId ? this.api.getProjectAdminDatasetApprovals(projectId).pipe(catchError(() => of([])))   : of([]),
      orgId     ? this.api.getOrgAdminDatasetApprovals(orgId).pipe(catchError(() => of([])))           : of([]),
      rank >= 4 ? this.api.getPlatformAdminDatasetApprovals().pipe(catchError(() => of([])))           : of([]),
      projectId ? this.api.getProjectAdminDatasourceApprovals(projectId, 0, 1).pipe(catchError(() => of([]))) : of([]),
      orgId     ? this.api.getOrgAdminDatasourceApprovals(orgId, 0, 1).pipe(catchError(() => of([])))         : of([]),
      rank >= 4 ? this.api.getPlatformAdminDatasourceApprovals(0, 1).pipe(catchError(() => of([])))           : of([]),
      projectId ? this.api.getProjectAdminModelApprovals(projectId, 0, 1).pipe(catchError(() => of([]))) : of([]),
      orgId     ? this.api.getOrgAdminModelApprovals(orgId, 0, 1).pipe(catchError(() => of([])))         : of([]),
      rank >= 4 ? this.api.getPlatformAdminModelApprovals(0, 1).pipe(catchError(() => of([])))           : of([]),
    ];
    return forkJoin(calls).pipe(map(results => results.reduce((sum, r) => sum + toCount(r), 0)));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cleanDetails(details: string | null): string {
    if (!details) return '';
    return details
      .replace(/\s*\(org=\d+\)/g, '')
      .replace(/\s*\(project=\d+\)/g, '')
      .replace(/AI Client/g, 'AI Engineer')
      .replace(/'Admin'/g, "'AI Platform Admin'")
      .trim();
  }

  open(card: StatCard): void {
    this.router.navigate(['..', card.route], { relativeTo: this.route, queryParams: card.queryParams });
  }
}
