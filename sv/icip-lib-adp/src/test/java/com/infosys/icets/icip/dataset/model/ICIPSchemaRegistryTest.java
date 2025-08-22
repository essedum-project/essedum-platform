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

package com.infosys.icets.icip.dataset.model;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeAll;

import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;

public class ICIPSchemaRegistryTest {
	@InjectMocks
	ICIPSchemaRegistry datasource;
	ICIPSchemaRegistry datasource2;
	
	@BeforeAll
	void setUp() throws Exception {
		datasource2 = new ICIPSchemaRegistry();
		datasource = new ICIPSchemaRegistry();
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
