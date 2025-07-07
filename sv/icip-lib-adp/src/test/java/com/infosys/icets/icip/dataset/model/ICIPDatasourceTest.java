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
package com.infosys.icets.icip.dataset.model;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeAll;

import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;

public class ICIPDatasourceTest {
	
	@InjectMocks
	ICIPDatasource datasource;
	ICIPDatasource datasource2;
	
	@BeforeAll
	void setUp() throws Exception {
		datasource2 = new ICIPDatasource();
		datasource = new ICIPDatasource();
	}
	
	@Test 
	void testhashCode() {
		assertEquals(datasource2.hashCode(),31);		
	}
	
	@Test 
	void testequals(){
		assertEquals(datasource2.equals(datasource),true);		
	}
	@Test 
	void testequalsNull(){
		assertEquals(datasource2.equals(null),false);		
	}
	@Test 
	void testequalsidNull(){
		datasource.setId(1);
		assertEquals(datasource2.equals(datasource),false);		
	}
	@Test 
	void testequalsnotNull(){
		datasource.setId(2);
		datasource2.setId(2);
		assertEquals(datasource2.equals(datasource),true);		
	}

}
