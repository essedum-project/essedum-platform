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

import org.mockito.InjectMocks;
import org.junit.jupiter.api.Test;
public class ICIPDataset2Test {

	@InjectMocks
	ICIPDataset2 dataset2;
	ICIPDataset2 dataset;
	@BeforeAll
	void setUp() throws Exception {
		dataset2 = new ICIPDataset2();
		dataset = new ICIPDataset2();
		dataset.setId(1);
		dataset.setAttributes("");
		dataset.setBackingDataset("");
		dataset.setSchema("");
		dataset.setDatasource("");
		dataset.setName("");
		dataset.setOrganization("");
		dataset.setDescription("");
	}
	
	
	@Test 
	void testgetters() {
		assertEquals((int)dataset.getId(),1);
		assertEquals(dataset.getAttributes(),"");
		assertEquals(dataset.getBackingDataset(),"");
		assertEquals(dataset.getSchema(),"");
		assertEquals(dataset.getDatasource(),"");
		assertEquals(dataset.getName(),"");
		assertEquals(dataset.getOrganization(),"");
		assertEquals(dataset.getDescription(),"");	
	}
	@Test 
	void testhashCode() {
		assertEquals(dataset2.hashCode(),31);		
	}
	
	@Test 
	void testequals(){
		assertEquals(dataset2.equals(dataset2),true);		
	}
	@Test 
	void testequalsNull(){
		assertEquals(dataset2.equals(null),false);		
	}
	@Test 
	void testequalsidNull(){
		dataset.setId(1);
		assertEquals(dataset2.equals(dataset),false);		
	}
	@Test 
	void testequalsnotNull(){
		dataset.setId(2);
		dataset2.setId(2);
		assertEquals(dataset2.equals(dataset),true);		
	}
	@Test 
	void testequalsnotNull2(){
		dataset.setId(22);
		dataset2.setId(2);
		assertEquals(dataset2.equals(dataset),false);		
	}
}
