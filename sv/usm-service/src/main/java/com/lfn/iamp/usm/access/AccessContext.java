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

	public AccessContext(Integer userId, Integer highestRank, List<Integer> reachableProjectIds,
			List<Integer> reachableOrganizationIds) {
		this.userId = userId;
		this.highestRank = highestRank;
		this.reachableProjectIds = reachableProjectIds;
		this.reachableOrganizationIds = reachableOrganizationIds;
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
}
