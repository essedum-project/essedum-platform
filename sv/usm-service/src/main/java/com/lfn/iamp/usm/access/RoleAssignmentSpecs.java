package com.lfn.iamp.usm.access;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;

/** Builds the DB-side filter for the paged Members &amp; Roles list. */
final class RoleAssignmentSpecs {

	private RoleAssignmentSpecs() {
	}

	/**
	 * One visibility rule derived from one of the actor's grants: rows inside these
	 * organisations or projects are visible, optionally only when their role is in roleIds.
	 *
	 * @param orgIds     organisations whose rows are covered (may be empty)
	 * @param projectIds projects whose rows are covered (may be empty)
	 * @param roleIds    null = any role; otherwise only rows with one of these role ids
	 */
	record RowScope(Set<Integer> orgIds, Set<Integer> projectIds, Set<Integer> roleIds) {
	}

	/**
	 * @param scopes     null = no scope restriction (platform admin); otherwise a row is visible if it
	 *                   belongs to ownUserId, or matches any scope
	 * @param ownUserId  the viewer; their own rows are always visible when scopes is non-null
	 */
	static Specification<RoleAssignment> build(List<RowScope> scopes, Integer ownUserId, Integer roleId,
			Integer projectId) {
		return (root, query, cb) -> {
			List<Predicate> and = new ArrayList<>();
			and.add(cb.isNull(root.get("revokedAt")));

			if (scopes != null) {
				List<Predicate> or = new ArrayList<>();
				if (ownUserId != null) {
					or.add(cb.equal(root.get("userId"), ownUserId));
				}
				for (RowScope s : scopes) {
					List<Predicate> location = new ArrayList<>();
					if (!s.orgIds().isEmpty()) {
						location.add(root.get("organizationId").in(s.orgIds()));
					}
					if (!s.projectIds().isEmpty()) {
						location.add(root.get("projectId").in(s.projectIds()));
					}
					if (location.isEmpty()) {
						continue;
					}
					Predicate match = cb.or(location.toArray(new Predicate[0]));
					if (s.roleIds() != null) {
						match = cb.and(match, s.roleIds().isEmpty()
								? cb.disjunction()
								: root.get("roleId").in(s.roleIds()));
					}
					or.add(match);
				}
				and.add(or.isEmpty() ? cb.disjunction() : cb.or(or.toArray(new Predicate[0])));
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
