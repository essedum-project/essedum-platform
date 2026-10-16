import { Component, OnInit, ViewEncapsulation, ElementRef, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import { ThemeService } from '../../core/theme.service';
import { AuditEvent } from '../../core/api-models';

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
export class OverviewComponent implements OnInit {
  // `route` is a sibling segment, navigated relative to this route — the
  // remote is mounted under the host's /landing/admin-console/**, so an
  // absolute '/admin-console/...' link would not resolve.
  cards: StatCard[] = [
    { label: 'Organizations', count: 0, route: 'tenancy', accent: '#3b82f6', queryParams: { tab: 'organizations' } },
    { label: 'Projects', count: 0, route: 'tenancy', accent: '#06b6d4', queryParams: { tab: 'projects' } },
    { label: 'Members & Roles', count: 0, route: 'access', accent: '#8b5cf6' },
    { label: 'Pending Approvals', count: 0, route: 'approvals', accent: '#fb923c' },
    { label: 'Menu Items', count: 0, route: 'menu-configuration', accent: '#22c55e' },
  ];
  recentAudit: AuditEvent[] = [];
  readonly auditColumns = ['occurredAt', 'entity', 'action', 'actorName'];
  loading = true;

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

  ngOnInit(): void {
    const userId = this.userContext.userId$.value;
    forkJoin({
      orgs: this.api.getOrganisations().pipe(catchError(() => of([] as any[]))),
      projects: this.api.getProjects().pipe(catchError(() => of([] as any[]))),
      members: this.api.getRoleAssignments(userId).pipe(catchError(() => of([] as any[]))),
      approvals: this.api.getApprovals(userId).pipe(catchError(() => of([] as any[]))),
      menus: this.api.getMenuItems(userId).pipe(catchError(() => of([] as any[]))),
      audit: this.api.getAuditEvents(userId).pipe(catchError(() => of([] as AuditEvent[]))),
    }).subscribe(res => {
      this.cards[0].count = res.orgs.length;
      this.cards[1].count = res.projects.length;
      this.cards[2].count = res.members.length;
      this.cards[3].count = res.approvals.length;
      this.cards[4].count = res.menus.length;
      this.recentAudit = (res.audit || []).slice(0, 8);
      this.loading = false;
    });
  }

  open(card: StatCard): void {
    this.router.navigate(['..', card.route], { relativeTo: this.route, queryParams: card.queryParams });
  }
}
