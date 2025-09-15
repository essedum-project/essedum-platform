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

package com.lfn.icip.dataset.model;

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
