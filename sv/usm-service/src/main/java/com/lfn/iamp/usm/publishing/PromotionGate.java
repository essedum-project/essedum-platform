package com.lfn.iamp.usm.publishing;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/** Gate name -> the AccessContext rank required to decide at that gate. §6. */
public final class PromotionGate {

	public static final String PROJECT_ADMIN = "project_admin";
	public static final String ORG_ADMIN = "org_admin";
	public static final String PLATFORM_ADMIN = "platform_admin";

	private static final Map<String, Integer> REQUIRED_RANK = new HashMap<>();
	static {
		REQUIRED_RANK.put(PROJECT_ADMIN, 2);
		REQUIRED_RANK.put(ORG_ADMIN, 3);
		REQUIRED_RANK.put(PLATFORM_ADMIN, 4);
	}

	private PromotionGate() {
	}

	public static int requiredRank(String gate) {
		Integer rank = REQUIRED_RANK.get(gate);
		if (rank == null) {
			throw new IllegalArgumentException("Unknown gate: " + gate);
		}
		return rank;
	}

	public static Iterable<String> all() {
		return Arrays.asList(PROJECT_ADMIN, ORG_ADMIN, PLATFORM_ADMIN);
	}
}
