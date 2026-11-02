package com.lfn.iamp.usm.access;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.lfn.iamp.usm.audit.AuditService;
import com.lfn.iamp.usm.domain.Organisation;
import com.lfn.iamp.usm.domain.Project;
import com.lfn.iamp.usm.identity.IdentityProjectionService;
import com.lfn.iamp.usm.repository.OrganisationRepository;
import com.lfn.iamp.usm.repository.ProjectRepository;
import com.lfn.iamp.usm.repository.RoleRepository;
import com.lfn.iamp.usm.repository.UserProjectRoleRepository;
import com.lfn.iamp.usm.repository.UsersRepository;
import com.lfn.iamp.usm.repository.UsmRolePermissionsRepository;
import com.lfn.iamp.usm.repository.UsmPortfolioRepository;
import com.lfn.iamp.usm.service.UsmPermissionApiService;

/**
 * Visibility Resolver validation — §4: role x project-membership resolution
 * that {@code AccessContext} is built from. Covers the "Visibility Matrix"
 * scenarios: viewer/developer/project_admin/org_admin/platform_admin ranks,
 * project-scoped vs org-scoped grants, org-scope expansion to member
 * projects, and platform-wide reach for platform_admin.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Visibility resolver: role x project membership")
class AccessContextServiceVisibilityTest {

    private static final int VIEWER_ROLE = 1;
    private static final int DEVELOPER_ROLE = 2;
    private static final int PROJECT_ADMIN_ROLE = 3;
    private static final int ORG_ADMIN_ROLE = 4;
    private static final int PLATFORM_ADMIN_ROLE = 5;

    @Mock
    private RoleAssignmentRepository roleAssignmentRepository;
    @Mock
    private RbacRoleRepository rbacRoleRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private OrganisationRepository organisationRepository;
    @Mock
    private AuditService auditService;
    @Mock
    private IdentityProjectionService identityProjectionService;
    @Mock
    private UserProjectRoleRepository userProjectRoleRepository;
    @Mock
    private RoleRepository legacyRoleRepository;
    @Mock
    private UsersRepository usersRepository;
    @Mock
    private UsmRolePermissionsRepository usmRolePermissionsRepository;
    @Mock
    private UsmPermissionApiService usmPermissionApiService;
    @Mock
    private UsmPortfolioRepository usmPortfolioRepository;

    private AccessContextService service;

    @BeforeEach
    void setUp() {
        service = new AccessContextService(roleAssignmentRepository, rbacRoleRepository, projectRepository,
                organisationRepository, auditService, identityProjectionService, userProjectRoleRepository,
                legacyRoleRepository, usersRepository, usmRolePermissionsRepository, usmPermissionApiService,
                usmPortfolioRepository);

        mockRole(VIEWER_ROLE, "viewer", 0);
        mockRole(DEVELOPER_ROLE, "developer", 1);
        mockRole(PROJECT_ADMIN_ROLE, "project_admin", 2);
        mockRole(ORG_ADMIN_ROLE, "org_admin", 3);
        mockRole(PLATFORM_ADMIN_ROLE, "platform_admin", 4);
    }

    private void mockRole(int roleId, String name, int rank) {
        RbacRole role = new RbacRole();
        role.setId(roleId);
        role.setName(name);
        role.setRank(rank);
        when(rbacRoleRepository.findById(roleId)).thenReturn(Optional.of(role));
    }

    private RoleAssignment assignment(int userId, int roleId, Integer orgId, Integer projectId) {
        RoleAssignment a = new RoleAssignment();
        a.setUserId(userId);
        a.setRoleId(roleId);
        a.setOrganizationId(orgId);
        a.setProjectId(projectId);
        a.setGrantedAt(Instant.now());
        return a;
    }

    private Project project(int id, Integer orgId) {
        Project p = new Project();
        p.setId(id);
        p.setOrganisationId(orgId);
        return p;
    }

    @Nested
    @DisplayName("No active grants")
    class NoGrants {
        @Test
        @DisplayName("A user with zero role assignments has viewer rank and reaches nothing")
        void noAssignments_reachesNothing() {
            when(roleAssignmentRepository.findByUserIdAndRevokedAtIsNull(1)).thenReturn(Collections.emptyList());

            AccessContext ctx = service.resolve(1);

            assertThat(ctx.getHighestRank()).isZero();
            assertThat(ctx.getReachableProjectIds()).isEmpty();
            assertThat(ctx.getReachableOrganizationIds()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Project-scoped grants")
    class ProjectScopedGrants {
        @Test
        @DisplayName("Developer scoped to project 10 reaches only project 10")
        void developer_reachesOwnProjectOnly() {
            when(roleAssignmentRepository.findByUserIdAndRevokedAtIsNull(2))
                    .thenReturn(Collections.singletonList(assignment(2, DEVELOPER_ROLE, null, 10)));

            AccessContext ctx = service.resolve(2);

            assertThat(ctx.getHighestRank()).isEqualTo(1);
            assertThat(ctx.getReachableProjectIds()).containsExactly(10);
            assertThat(ctx.getReachableOrganizationIds()).isEmpty();
        }

        @Test
        @DisplayName("Project admin scoped to project 10 does not reach project 20 (isolation)")
        void projectAdmin_doesNotReachOtherProjects() {
            when(roleAssignmentRepository.findByUserIdAndRevokedAtIsNull(3))
                    .thenReturn(Collections.singletonList(assignment(3, PROJECT_ADMIN_ROLE, null, 10)));

            AccessContext ctx = service.resolve(3);

            assertThat(ctx.getReachableProjectIds()).containsExactly(10).doesNotContain(20);
        }

        @Test
        @DisplayName("Two project grants reach the union of both projects")
        void multipleProjectGrants_unionOfProjects() {
            when(roleAssignmentRepository.findByUserIdAndRevokedAtIsNull(4)).thenReturn(Arrays.asList(
                    assignment(4, DEVELOPER_ROLE, null, 10), assignment(4, DEVELOPER_ROLE, null, 11)));

            AccessContext ctx = service.resolve(4);

            assertThat(ctx.getReachableProjectIds()).containsExactlyInAnyOrder(10, 11);
        }

        @Test
        @DisplayName("Highest rank wins when a user holds grants of different rank")
        void highestRankAcrossGrants_wins() {
            when(roleAssignmentRepository.findByUserIdAndRevokedAtIsNull(5)).thenReturn(Arrays.asList(
                    assignment(5, DEVELOPER_ROLE, null, 10), assignment(5, PROJECT_ADMIN_ROLE, null, 11)));

            AccessContext ctx = service.resolve(5);

            assertThat(ctx.getHighestRank()).isEqualTo(2);
            assertThat(ctx.getReachableProjectIds()).containsExactlyInAnyOrder(10, 11);
        }
    }

    @Nested
    @DisplayName("Org-scoped grants expand to member projects")
    class OrgScopedGrants {
        @Test
        @DisplayName("Org admin on org 100 reaches every project under org 100, not projects in other orgs")
        void orgAdmin_reachesOnlyOwnOrgProjects() {
            when(roleAssignmentRepository.findByUserIdAndRevokedAtIsNull(6))
                    .thenReturn(Collections.singletonList(assignment(6, ORG_ADMIN_ROLE, 100, null)));
            when(projectRepository.findAll()).thenReturn(Arrays.asList(
                    project(10, 100), project(11, 100), project(20, 200)));

            AccessContext ctx = service.resolve(6);

            assertThat(ctx.getReachableProjectIds()).containsExactlyInAnyOrder(10, 11).doesNotContain(20);
            assertThat(ctx.getReachableOrganizationIds()).containsExactly(100);
        }
    }

    @Nested
    @DisplayName("Platform admin reaches everything")
    class PlatformAdminGrants {
        @Test
        @DisplayName("Platform admin reaches every project and every organization, unscoped")
        void platformAdmin_reachesAllProjectsAndOrgs() {
            when(roleAssignmentRepository.findByUserIdAndRevokedAtIsNull(7))
                    .thenReturn(Collections.singletonList(assignment(7, PLATFORM_ADMIN_ROLE, null, null)));
            when(projectRepository.findAll()).thenReturn(Arrays.asList(project(10, 100), project(20, 200)));
            when(organisationRepository.findAll())
                    .thenReturn(Arrays.asList(org(100), org(200)));

            AccessContext ctx = service.resolve(7);

            assertThat(ctx.getHighestRank()).isEqualTo(4);
            assertThat(ctx.getReachableProjectIds()).containsExactlyInAnyOrder(10, 20);
            assertThat(ctx.getReachableOrganizationIds()).containsExactlyInAnyOrder(100, 200);
        }
    }

    private Organisation org(int id) {
        Organisation o = new Organisation();
        o.setId(id);
        return o;
    }

    @Test
    @DisplayName("highestRank(userId) matches resolve(userId).getHighestRank()")
    void highestRank_delegatesToResolve() {
        when(roleAssignmentRepository.findByUserIdAndRevokedAtIsNull(8))
                .thenReturn(Collections.singletonList(assignment(8, PROJECT_ADMIN_ROLE, null, 10)));

        assertThat(service.highestRank(8)).isEqualTo(2);
    }

    @Test
    @DisplayName("rankOfRole is 0 for an unknown/null role id (fails closed, not open)")
    void rankOfRole_unknownRole_failsClosed() {
        when(rbacRoleRepository.findById(999)).thenReturn(Optional.empty());

        assertThat(service.rankOfRole(999)).isZero();
        assertThat(service.rankOfRole(null)).isZero();
    }
}
