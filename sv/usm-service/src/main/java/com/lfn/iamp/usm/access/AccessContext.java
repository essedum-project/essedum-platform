package com.lfn.iamp.usm.access;

import java.util.List;

/**
 * What a user can do, resolved once per request — consumed by menu
 * rendering, asset visibility, and API authorization alike. §4.
 */
public class AccessContext {

	private final Integer userId;
	private final Integer highestRank;
	private final List<Integer> reachableProjectIds;
	private final List<Integer> reachableOrganizationIds;
	/**
	 * Project IDs from direct project-scoped role_assignments only — no org
	 * expansion. Draft visibility is limited to this set: a pure-draft asset is
	 * shown only to users who are explicit members of that project, not to
	 * org-level admins who reach the project transitively through their org grant.
	 */
	private final List<Integer> directProjectIds;

	public AccessContext(Integer userId, Integer highestRank, List<Integer> reachableProjectIds,
			List<Integer> reachableOrganizationIds, List<Integer> directProjectIds) {
		this.userId = userId;
		this.highestRank = highestRank;
		this.reachableProjectIds = reachableProjectIds;
		this.reachableOrganizationIds = reachableOrganizationIds;
		this.directProjectIds = directProjectIds;
	}

	public Integer getUserId() {
		return userId;
	}

	public Integer getHighestRank() {
		return highestRank;
	}

	public List<Integer> getReachableProjectIds() {
		return reachableProjectIds;
	}

	public List<Integer> getReachableOrganizationIds() {
		return reachableOrganizationIds;
	}

	public List<Integer> getDirectProjectIds() {
		return directProjectIds;
	}
}
