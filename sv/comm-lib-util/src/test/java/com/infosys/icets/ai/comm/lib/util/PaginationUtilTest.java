/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
