package com.lfn.iamp.usm.publishing;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/** Gate name -> the AccessContext rank required to decide at that gate. §6. */
public final class PromotionGate {

	public static final String PROJECT_ADMIN = "project_admin";
	public static final String ORG_ADMIN = "org_admin";
	public static final String PLATFORM_ADMIN = "platform_admin";

	// §3 scope ladder — a version climbs these as it clears each gate.
	public static final String SCOPE_DRAFT = "draft";
	public static final String SCOPE_PROJECT = "project";
	public static final String SCOPE_ORGANIZATION = "organization";
	public static final String SCOPE_PUBLIC = "public";

	private static final Map<String, Integer> REQUIRED_RANK = new HashMap<>();
	static {
		REQUIRED_RANK.put(PROJECT_ADMIN, 2);
		REQUIRED_RANK.put(ORG_ADMIN, 3);
		REQUIRED_RANK.put(PLATFORM_ADMIN, 4);
	}

	// The scope an asset reaches once a version clears this gate. §5.
	private static final Map<String, String> SCOPE_FOR_GATE = new HashMap<>();
	static {
		SCOPE_FOR_GATE.put(PROJECT_ADMIN, SCOPE_PROJECT);
		SCOPE_FOR_GATE.put(ORG_ADMIN, SCOPE_ORGANIZATION);
		SCOPE_FOR_GATE.put(PLATFORM_ADMIN, SCOPE_PUBLIC);
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

	/** Draft → Project → Org → Public. The scope reached once {@code gate} approves. */
	public static String scopeForGate(String gate) {
		String scope = SCOPE_FOR_GATE.get(gate);
		if (scope == null) {
			throw new IllegalArgumentException("Unknown gate: " + gate);
		}
		return scope;
	}

	/**
	 * The gate a version at {@code currentScope} must clear next to climb one
	 * rung, or {@code null} once it is already public. §5 state machine.
	 */
	public static String nextGate(String currentScope) {
		if (currentScope == null || SCOPE_DRAFT.equals(currentScope)) {
			return PROJECT_ADMIN;
		}
		switch (currentScope) {
			case SCOPE_PROJECT:
				return ORG_ADMIN;
			case SCOPE_ORGANIZATION:
				return PLATFORM_ADMIN;
			case SCOPE_PUBLIC:
			default:
				return null;
		}
	}
}
