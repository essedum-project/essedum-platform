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

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;

public class PageResponseTest {

	@Test
	public void TestPageResponse() {
		int totalPages=20;
		long totalElements=20;
		List<Serializable> content=new ArrayList();
		content.add(0);
		PageResponse<Serializable> p1=new PageResponse<>(totalPages,totalElements,content);
		assertEquals(p1.getTotalPages(), totalPages);
		assertEquals(p1.getTotalElements(),totalElements);
		assertEquals(p1.getContent().get(0),content.get(0));
		
	}
	
}
