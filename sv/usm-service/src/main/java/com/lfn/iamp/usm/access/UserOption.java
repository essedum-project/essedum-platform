package com.lfn.iamp.usm.access;

/**
 * Minimal, non-sensitive user projection for the admin-console "Grant Role"
 * dropdown — avoids the legacy encrypted/paginated /userss/page endpoint.
 */
public class UserOption {

	private final Integer id;
	private final String name;

	public UserOption(Integer id, String name) {
		this.id = id;
		this.name = name;
	}

	public Integer getId() {
		return id;
	}

	public String getName() {
		return name;
	}
}
