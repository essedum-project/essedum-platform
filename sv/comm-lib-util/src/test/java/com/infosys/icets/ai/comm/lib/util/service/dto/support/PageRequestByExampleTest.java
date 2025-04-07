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

public class PageRequestByExampleTest {

	private static PageRequestByExample<String> pg;

	@BeforeAll
	static void setup() {
		pg = new PageRequestByExample<String>();
		pg.setExample("test");
		LazyLoadEvent lle = new LazyLoadEvent();
		lle.setFirst(0);
		lle.setRows(5);
		pg.setLazyLoadEvent(lle);

	}

	@Test
	public void testToPageable() {
		Pageable page = pg.toPageable();
		assertEquals(true, page.isPaged());
	}

	@Test
	public void testGetExample() {
		String example = pg.getExample();
		assertEquals("test", example);
	}

}
