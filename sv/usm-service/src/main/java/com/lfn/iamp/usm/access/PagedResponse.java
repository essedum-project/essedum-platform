package com.lfn.iamp.usm.access;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** Minimal page envelope for the Members &amp; Roles list. */
@Getter
@AllArgsConstructor
public class PagedResponse<T> {
	private final List<T> content;
	private final int page;
	private final int size;
	private final long totalElements;
	private final int totalPages;
}
