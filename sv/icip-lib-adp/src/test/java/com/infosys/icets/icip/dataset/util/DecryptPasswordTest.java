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
package com.infosys.icets.icip.dataset.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;

public class DecryptPasswordTest {
	
	
	@InjectMocks
	DecryptPassword decryptPassword;
	String text;
	String password;
	String encText;
	String salt;
	String decrypted;
	@BeforeAll
	void setUp() throws Exception {
		text="test";
		password="test";
		encText="enctest";
		salt="test";
		decrypted = "test";
	}
	
	@Test
	void encrypt() {		
		assertEquals(DecryptPassword.encrypt(text, password).length,2);
	}
	
	@Test
	void decrypt() {		

		assertEquals(DecryptPassword.decrypt(encText, password,salt),null);
	}
}
