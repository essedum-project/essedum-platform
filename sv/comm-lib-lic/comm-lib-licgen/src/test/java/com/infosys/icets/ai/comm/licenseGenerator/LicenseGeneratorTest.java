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

import static org.junit.jupiter.api.Assertions.*;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
* @author icets
*/
class LicenseGeneratorTest {
	
	static LicenseGenerator gen;
	private static final Logger log = LoggerFactory.getLogger(LicenseGeneratorTest.class);
	
	@BeforeAll
	static void setup() {
		gen = new LicenseGenerator();
	}

	@Test
	void testGetPublicKey() {
		assertNotNull(gen.getPublicKey("MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCTsLMGGiwfvJ32Hyh8I0Wm7YV4QT9X4kdSMmj0xzIw/6yEaBfC1+rjBuaGFPhVY9c5CfGpW1Gm4SI1OT8FBmq02sWN+p9q6L1pKcxvJzVovPY5LL5e6D94/mEnCY9SQrymEy/uv5bzy1fHf/ZQVjC8MovHXCpoDUqSNL1BudjX0wIDAQAB"));
	}
	
	@Test
	void testEncrypt() throws InvalidKeyException, BadPaddingException, IllegalBlockSizeException, NoSuchPaddingException, NoSuchAlgorithmException, NoSuchProviderException, UnsupportedEncodingException, InvalidAlgorithmParameterException {
		assertNotNull(gen.encrypt("data", "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCTsLMGGiwfvJ32Hyh8I0Wm7YV4QT9X4kdSMmj0xzIw/6yEaBfC1+rjBuaGFPhVY9c5CfGpW1Gm4SI1OT8FBmq02sWN+p9q6L1pKcxvJzVovPY5LL5e6D94/mEnCY9SQrymEy/uv5bzy1fHf/ZQVjC8MovHXCpoDUqSNL1BudjX0wIDAQAB"));
	}

	@Test
	void testReadLicenseInput(@TempDir File tempDir) {
		File input = new File (tempDir, "input.txt");
		BufferedWriter bw;
		try {
			bw = new BufferedWriter(new FileWriter(input));
			bw.write("license");
			bw.close();
			
			assertEquals("license", gen.readLicenseInput(input.getPath()));
		} catch (IOException e) {
			log.error("Exception : {}", e.getMessage());
		}
	}
	
	@Test
	void testWriteToLicenseFile(@TempDir File tempDir) {
		
		try {
			File output = new File(tempDir, "output.txt");
			gen.writeToLicenseFile("license", output.getPath());
			BufferedReader br = new BufferedReader(new FileReader(output));
			assertEquals("license", br.readLine());
			br.close();
		} catch (Exception e) {
			log.error("Exception : {}", e.getMessage());
		}
	}
}
