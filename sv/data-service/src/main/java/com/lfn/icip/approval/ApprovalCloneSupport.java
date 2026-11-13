package com.lfn.icip.approval;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Naming / eligibility helpers shared by the pipeline, dataset and datasource
 * clone flows.
 *
 * A clone is a brand-new asset named {@code <base>-v<n>} that re-enters the
 * approval chain at DRAFT, leaving the already-approved original untouched.
 */
public final class ApprovalCloneSupport {

	/** Trailing {@code -v12} style suffix produced by previous clones. */
	private static final Pattern VERSION_SUFFIX = Pattern.compile("^(.*?)-v(\\d+)$");

	/** Statuses that make an asset visible in the catalog, and therefore cloneable. */
	private static final List<String> CLONEABLE_STATUSES = Arrays.asList(
			"PROJECT_APPROVED", "PENDING_ORG_APPROVAL", "ORG_APPROVED",
			"PENDING_PLATFORM_APPROVAL", "PUBLISHED");

	/** Upper bound on the version probe so a corrupt name can never spin forever. */
	private static final int MAX_VERSION = 999;

	private ApprovalCloneSupport() {
	}

	public static boolean isCloneable(String approvalStatus) {
		return approvalStatus != null && CLONEABLE_STATUSES.contains(approvalStatus);
	}

	/** Strips a trailing {@code -v<n>} so "orders-v3" and "orders" share a lineage. */
	public static String baseNameOf(String name) {
		if (name == null) {
			return "";
		}
		Matcher m = VERSION_SUFFIX.matcher(name);
		return m.matches() ? m.group(1) : name;
	}

	/** Returns {@code n} from a trailing {@code -v<n>}, or 1 when the name has no suffix. */
	public static int versionSuffixOf(String name) {
		if (name == null) {
			return 1;
		}
		Matcher m = VERSION_SUFFIX.matcher(name);
		if (!m.matches()) {
			return 1;
		}
		try {
			return Integer.parseInt(m.group(2));
		} catch (NumberFormatException e) {
			return 1;
		}
	}

	/**
	 * Returns the first free {@code <base>-v<n>} name, starting at v2.
	 *
	 * @param sourceName the name being cloned (with or without a version suffix)
	 * @param nameTaken  returns true when a name already exists in the target scope
	 */
	public static String nextVersionName(String sourceName, Predicate<String> nameTaken) {
		String base = baseNameOf(sourceName);
		for (int n = 2; n <= MAX_VERSION; n++) {
			String candidate = base + "-v" + n;
			if (!nameTaken.test(candidate)) {
				return candidate;
			}
		}
		throw new IllegalStateException("Could not allocate a clone name for '" + sourceName + "'");
	}

	/**
	 * Mirrors the name change onto the display alias so the clone is
	 * distinguishable in listings. Falls back to the new name when the original
	 * had no alias.
	 */
	public static String cloneAlias(String originalAlias, String originalName, String newName) {
		if (originalAlias == null || originalAlias.isEmpty()) {
			return newName;
		}
		return baseNameOf(originalAlias) + "-v" + versionSuffixOf(newName);
	}
}
