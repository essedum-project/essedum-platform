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
package com.infosys.icets.ai.comm.licenseGenerator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
* @author icets
*/
public class RSAKeyPairGeneratorTest {

	private final static Logger log = LoggerFactory.getLogger(RSAKeyPairGeneratorTest.class);
	static RSAKeyPairGenerator keyGen;
	
	@BeforeAll
	static void setup() throws NoSuchAlgorithmException {
		keyGen = new RSAKeyPairGenerator();
	}
	
	@Test
	void testWriteToFile(@TempDir File tempDir) {
		try {
			File output = new File(tempDir, "file.txt");
			keyGen.writeToFile(output.getPath(), "key".getBytes());
			BufferedReader br = new BufferedReader(new FileReader(output));
			assertEquals("key", br.readLine());
			br.close();
		} catch (IOException e) {
			log.error("Exception : {}", e.getMessage());
		}
		
	}
	
	@Test
	void testGetPrivateKey() {
		assertNotNull(keyGen.getPrivateKey());
	}
	
	@Test
	void testGetPublicKey() {
		assertNotNull(keyGen.getPublicKey());
	}
	
}
