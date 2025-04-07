/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.ai.comm.lib.util.service.dto.support;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;

public class LazyLoadEventTest {

	private static LazyLoadEvent obj;

	@BeforeAll
	static void setup() {
		obj = new LazyLoadEvent();
		obj.setFirst(0);
		obj.setRows(5);
	}

	@Test
	public void testToPageIndex() {
		int index = obj.toPageIndex();

		assertEquals(0, index);

	}

	@Test
	public void testToSortDirection() {
		Direction dir = obj.toSortDirection();

		assertEquals(false, dir.isAscending());
	}

	@Test
	public void testToPageable() {
		Pageable page = obj.toPageable();
		assertEquals(0, page.getPageNumber());

	}
}
