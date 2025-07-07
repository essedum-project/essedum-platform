/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.function.Executable;

import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;

public class CommonTest {
	static Common iamp;

	@BeforeAll
	static void setup() {
		iamp = new Common();
	}


	@Test
	public void testMultipartConfigElement() throws Exception {
		iamp.multipartConfigElement();
	}

	@Test
	public void testRestTemplate() throws Exception {
		iamp.restTemplate();
	}

	@Test
	public void testMain() throws Exception {
		Assertions.assertThrows(Exception.class, new Executable() {
			@Override
			public void execute() throws Throwable {
				iamp.main(new String[] {});
			}
		});
		
	}

}
