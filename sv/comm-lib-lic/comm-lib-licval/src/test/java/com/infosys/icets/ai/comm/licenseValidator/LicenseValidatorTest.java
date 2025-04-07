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
package com.infosys.icets.ai.comm.licenseValidator;

import static org.junit.jupiter.api.Assertions.*;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mockito;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author icets
 */
class LicenseValidatorTest {

	static LicenseValidator licval;

	private static final Logger log = LoggerFactory.getLogger(LicenseValidatorTest.class);

	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		try {
			licval = new LicenseValidator();

			License lic_mock = new License();
			lic_mock.setMacId("64-00-6A-09-1C-F6");
			lic_mock.setDurationDays("365");
			lic_mock.setStartDate("2020-05-11");

			Server server = Mockito.mock(Server.class);
			Mockito.when(server.isDormantLicense(lic_mock.getStartDate())).thenReturn(false);
			Mockito.when(server.isValidDateRange(lic_mock.getStartDate(), lic_mock.getDurationDays())).thenReturn(true);
		} catch (Exception e) {
			log.warn("Error while executing setup method");
		}
	}



	@Test
	void testDecrypt() {
		try {
			assertNotNull(licval.decrypt(
					"LYozC1v2C70vUqdkIYYIrqWNnB/kaUWQYltlRn2IKv2p0SvOrBsf5qUGqMZL0FaZ7SiVPnZ9oZXEeoNkxVLVodaLZyxY7rrBAp6dQka51GoPdzSoXDO86BAyo6DOMlEI+oN3mp5hLhgfMtmvQR4Fn+uIDiTW220vwzUU8u9e7VQ=",
					"MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAJOwswYaLB+8nfYfKHwjRabthXhBP1fiR1IyaPTHMjD/rIRoF8LX6uMG5oYU+FVj1zkJ8albUabhIjU5PwUGarTaxY36n2rovWkpzG8nNWi89jksvl7oP3j+YScJj1JCvKYTL+6/lvPLV8d/9lBWMLwyi8dcKmgNSpI0vUG52NfTAgMBAAECgYBDlpHXMRMQUxlXEVtNtDaj9f8m0XVTmtJY44j0vFRT6C3jSl/VY0qzKu1EX0Rmj5JnIA3gG1J6tH0bLl+QxSb/di6FUmiMxufDi2D8BBIGMoPHj6VZwD+FVUfpHLf3MNpsUsslfAU+RepQQgxUVxljokz5eEp40f/eTGeOUYanQQJBAPbbKAuU72teQQ4MjNzLbbwROy6pf9V08ytCltiCjaglbBfUWpCxdmRFzlHypXqymVJVRkq5URDO6hg6umGv3H0CQQCZKTC7XhHtDAh3Nm6BMfev5EqlrdFM5AN/BBUaTUOJ2N9SxFNR1cPHAWVORh9Sdt/s1yV0Au/SI/nyzl60pMaPAkEAuYftiQbfCutEKbL1C905FGg++ssZ8Ox89r6NcRxuKzo1C5PmnWlDegmdD6o3BQjGg0LkGbU+YEujVaKOAm2SYQJBAIdsRz10aM87E4Us6LptTv8EEQi7TtP4zCqTloEiDfSlgJjzJGS4aRnd3xA9qlZE66vDc8dHDXu1+bw5wr1g8HsCQA8ztFu2Oa4Ccc7QqJihKSO/rOaB69KL3d8/4GWYfTzeea5nxiIdxF0h32RooIkCVlZ0cddR7IG6z30+5CxOV5s="));
		} catch (Exception e) {
			log.warn("Error while executing testDecrypt test case");
		}
	}

	@Test
	void testParseLicenseContent() {
		assertNotNull(licval.parseLicenseContent("64-00-6A-09-1C-F6 2020-05-11 365"));
	}

	@Test
	void testReadLicenseFile(@TempDir File tempDir) {
		try {
			File file = new File(tempDir, "lic.txt");
			BufferedWriter writer = new BufferedWriter(new FileWriter(file.getPath()));
			writer.write(
					"LYozC1v2C70vUqdkIYYIrqWNnB/kaUWQYltlRn2IKv2p0SvOrBsf5qUGqMZL0FaZ7SiVPnZ9oZXEeoNkxVLVodaLZyxY7rrBAp6dQka51GoPdzSoXDO86BAyo6DOMlEI+oN3mp5hLhgfMtmvQR4Fn+uIDiTW220vwzUU8u9e7VQ=\n");
			writer.close();
			assertEquals(
					"LYozC1v2C70vUqdkIYYIrqWNnB/kaUWQYltlRn2IKv2p0SvOrBsf5qUGqMZL0FaZ7SiVPnZ9oZXEeoNkxVLVodaLZyxY7rrBAp6dQka51GoPdzSoXDO86BAyo6DOMlEI+oN3mp5hLhgfMtmvQR4Fn+uIDiTW220vwzUU8u9e7VQ=",
					licval.readLicenseFile(file.getPath()));
		} catch (Exception e) {
			log.warn("Error while executing testReadLicenseFile test case");
		}
	}

	@Test
	void testValidateLicense() {
		try {
			License lic = new License();
			lic.setMacId("64-00-6A-09-1C-F6");
			lic.setStartDate("2020-05-11");
			lic.setDurationDays("365");
			assertEquals(true, licval.validateLicense(lic));
		} catch (Exception e) {
			log.warn("Error while executing testValidateLicense test case");
		}
	}

	@Test
	void testDecryptAndValidateLicense(@TempDir File tempDir) {
		try {
			File file = new File(tempDir, "lic.txt");
			File file1 = new File(tempDir, "public.txt");
			BufferedWriter writer = new BufferedWriter(new FileWriter(file.getPath()));
			writer.write(
					"LYozC1v2C70vUqdkIYYIrqWNnB/kaUWQYltlRn2IKv2p0SvOrBsf5qUGqMZL0FaZ7SiVPnZ9oZXEeoNkxVLVodaLZyxY7rrBAp6dQka51GoPdzSoXDO86BAyo6DOMlEI+oN3mp5hLhgfMtmvQR4Fn+uIDiTW220vwzUU8u9e7VQ=");
			writer.close();
			assertEquals(true, licval.decryptAndValidateLicense(file.getPath(),file1.getPath()));
		} catch (Exception e) {
			log.warn("Error while executing testDecryptAndValidateLicense test case");
		}
	}

}