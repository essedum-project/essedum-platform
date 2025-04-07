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
package com.infosys.icets.ai.comm.lib.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Iterator;
import java.util.List;
import java.util.function.Function;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;

public class PaginationUtilTest {

	private Page page = new Page() {

		@Override
		public int getNumber() {
			return 0;
		}

		@Override
		public int getSize() {
			return 0;
		}

		@Override
		public int getNumberOfElements() {
			return 0;
		}

		@Override
		public List getContent() {
			return null;
		}

		@Override
		public boolean hasContent() {
			return false;
		}

		@Override
		public Sort getSort() {
			return null;
		}

		@Override
		public boolean isFirst() {
			return false;
		}

		@Override
		public boolean isLast() {
			return false;
		}

		@Override
		public boolean hasNext() {
			return false;
		}

		@Override
		public boolean hasPrevious() {
			return false;
		}

		@Override
		public Pageable nextPageable() {
			return null;
		}

		@Override
		public Pageable previousPageable() {
			return null;
		}

		@Override
		public Iterator iterator() {
			return null;
		}

		@Override
		public int getTotalPages() {
			return 0;
		}

		@Override
		public long getTotalElements() {
			return 0;
		}

		@Override
		public Page map(Function converter) {
			return null;
		}
	};

	@Test
	public void testGeneratePaginationHttpHeaders() {

		String baseUrl = "http://test.com";

		HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, baseUrl);
		assertEquals(headers.get("X-Total-Count").get(0), "0");

	}

}
