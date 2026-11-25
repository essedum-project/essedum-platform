package com.lfn.iamp.usm.access;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;

/** Builds the DB-side filter for the paged Members &amp; Roles list. */
final class RoleAssignmentSpecs {

	private RoleAssignmentSpecs() {
	}

	/**
	 * @param allowedRoleIds  null = no role restriction (platform admin); otherwise rows must have one of these role ids
	 * @param scopeUserId     non-null = row must be this user's own, or inside the reachable projects/orgs (non platform admin)
	 */
	static Specification<RoleAssignment> build(Collection<Integer> allowedRoleIds, Integer scopeUserId,
			Collection<Integer> reachableProjectIds, Collection<Integer> reachableOrgIds, Integer roleId,
			Integer projectId) {
		return (root, query, cb) -> {
			List<Predicate> and = new ArrayList<>();
			and.add(cb.isNull(root.get("revokedAt")));

			if (allowedRoleIds != null) {
				if (allowedRoleIds.isEmpty()) {
					and.add(cb.disjunction());
				} else {
					and.add(root.get("roleId").in(allowedRoleIds));
				}
			}
			if (scopeUserId != null) {
				List<Predicate> or = new ArrayList<>();
				or.add(cb.equal(root.get("userId"), scopeUserId));
				if (!reachableProjectIds.isEmpty()) {
					or.add(root.get("projectId").in(reachableProjectIds));
				}
				if (!reachableOrgIds.isEmpty()) {
					or.add(root.get("organizationId").in(reachableOrgIds));
				}
				and.add(cb.or(or.toArray(new Predicate[0])));
			}
			if (roleId != null) {
				and.add(cb.equal(root.get("roleId"), roleId));
			}
			if (projectId != null) {
				and.add(cb.equal(root.get("projectId"), projectId));
			}
			return cb.and(and.toArray(new Predicate[0]));
		};
	}
}
