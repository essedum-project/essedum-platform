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

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.nio.file.Paths;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.LinkedList;
import java.util.StringTokenizer;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.io.FilenameUtils;
import org.hibernate.internal.build.AllowSysOut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.infosys.icets.ai.comm.licenseValidator.exception.InvalidLicenseException;
import com.infosys.icets.ai.comm.licenseValidator.exception.LicenceLengthException;
import com.infosys.icets.ai.comm.licenseValidator.exception.LicenseDormantException;
import com.infosys.icets.ai.comm.licenseValidator.exception.LicenseExpiredException;

// 
/**
 * The Class LicenseValidator.
 *
 * @author icets
 */
public class LicenseValidator {

	/** The private key. */
	private static String privateKey = "leapsecretk12345";
	private static String publicKey = "2QAu0PJz44KHFQkD";

	/** The log. */
	private static final Logger log = LoggerFactory.getLogger(LicenseValidator.class);

	public static License license;

	public static void main(String[] args)
			throws IllegalBlockSizeException, InvalidKeyException, NoSuchPaddingException, BadPaddingException,
			IOException, NoSuchAlgorithmException, NoSuchProviderException, InvalidAlgorithmParameterException {
		String licenseFilePath = args[0];
		String publicKeyFilePath = args[1];
		log.debug(String.valueOf(decryptAndValidateLicense(licenseFilePath,publicKeyFilePath)));

	}

	/**
	 * Decrypt.
	 *
	 * @param data       the data
	 * @param privateKey the private key
	 * @return the string
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws NoSuchProviderException
	 * @throws UnsupportedEncodingException
	 * @throws InvalidAlgorithmParameterException
	 */
	public static String decrypt(String secret) throws NoSuchPaddingException, NoSuchAlgorithmException,
			InvalidKeyException, BadPaddingException, IllegalBlockSizeException, NoSuchProviderException,
			UnsupportedEncodingException, InvalidAlgorithmParameterException {
		byte[] iv = Base64.getDecoder().decode(publicKey);
		// Create AES-GCM cipher
		Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");

		// Generate AES key from the password
		SecretKeySpec skeySpec = new SecretKeySpec(privateKey.getBytes("UTF-8"), "AES");

		// Initialize cipher for decryption
		GCMParameterSpec parameterSpec = new GCMParameterSpec(128, iv);
		cipher.init(Cipher.DECRYPT_MODE, skeySpec, parameterSpec);

		return new String(cipher.doFinal(Base64.getDecoder().decode(secret)));
	}

	/**
	 * Decrypt.
	 *
	 * @param data             the data
	 * @param base64PrivateKey the base 64 private key
	 * @return the string
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws NoSuchProviderException
	 * @throws InvalidAlgorithmParameterException
	 * @throws UnsupportedEncodingException
	 */
	public static String decrypt(String data, String base64PrivateKey) throws IllegalBlockSizeException,
			InvalidKeyException, BadPaddingException, NoSuchAlgorithmException, NoSuchPaddingException,
			NoSuchProviderException, UnsupportedEncodingException, InvalidAlgorithmParameterException {
		return decrypt(data);
	}

	/**
	 * Decrypt and validate license.
	 *
	 * @param licenseFilePath the license file path
	 * @return true, if successful
	 * @throws InvalidAlgorithmParameterException
	 */
	public static boolean decryptAndValidateLicense(String licenseContent, String publicKeyFileContent) throws InvalidAlgorithmParameterException {
		if (!LicenseValidator.validatePath(licenseContent)) {
			throw new IllegalArgumentException(
					"License file not found..Please provide the license file path as an argument.. ");
		}
		boolean isValid = false;
		String licenseFileContent = licenseContent;
		String publicKeyContent = publicKeyFileContent;
		publicKey = publicKeyContent;
		String decryptedString = null;
		try {

			decryptedString = LicenseValidator.decrypt(licenseFileContent);
			License lic = LicenseValidator.parseLicenseContent(decryptedString);			
			lic.setValidLicense(LicenseValidator.validateLicense(lic));
			log.debug(lic.toString());
			return lic.isValidLicense();

		} catch (InvalidKeyException | IllegalBlockSizeException | BadPaddingException | NoSuchAlgorithmException
				| NoSuchPaddingException e) {
			log.error(
					"InvalidKeyException or IllegalBlockSizeException or BadPaddingException or NoSuchAlgorithmException",
					e);
			return isValid;
		} catch (UnknownHostException e) {
			log.error("UnknownHostException", e);
			return isValid;
		} catch (SocketException e) {
			log.error("SocketException", e);
			return isValid;
		} catch (IOException e) {
			log.error("IOException", e);
			return isValid;
		} catch (InvalidLicenseException e) {
			log.error("InvalidLicenseException", e);
			return isValid;
		} catch (LicenseDormantException e) {
			log.error("LicenseDormantException", e);
			return isValid;
		} catch (LicenseExpiredException e) {
			log.error("LicenseExpiredException", e);
			return isValid;
		} catch (NoSuchProviderException e) {
			log.error("NoSuchProviderException", e);
			return isValid;
		}

	}

	/**
	 * Parses the license content.
	 *
	 * @param licenseFileContent the license file content
	 * @return the license
	 */
	public static License parseLicenseContent(String licenseFileContent) {
		StringTokenizer st = new StringTokenizer(licenseFileContent, " "); // Space as delimiter

		LinkedList lst = new LinkedList();
		while (st.hasMoreTokens()) {
			lst.add(st.nextToken());
		}
		License lic = new License();
		lic.setMacId(lst.get(0).toString());
		LocalDate licenseStartDate = LocalDate.parse(lst.get(1).toString(), DateTimeFormatter.ISO_DATE).minusDays(1);
		lic.setStartDate(licenseStartDate.toString());
		lic.setDurationDays(lst.get(2).toString());
		if (lst.size() > 3)
			lic.setNoOfUsers(lst.get(3).toString());
		license = lic;
		return lic;

	}

	/**
	 * Read license file.
	 *
	 * @param licenseFilePath the license file path
	 * @return the string
	 */
	public static String readLicenseFile(String licenseFilePath) {
		String path = FilenameUtils.normalize(licenseFilePath);
		File file = Paths.get(path).toFile();
		String licenseFileContent = null;
		int intc;
		StringBuffer sb = new StringBuffer();
		int max_str_len = 200;
		try (BufferedReader br = new BufferedReader(new FileReader(file));) {
			while ((intc = br.read()) != -1) {
				char c = (char) intc;
				if (c == '\n') {
					break;
				}
				if (sb.length() >= max_str_len) {
					throw new LicenceLengthException();
				}
				sb.append(c);
			}
			licenseFileContent = sb.toString();
			return licenseFileContent;

		} catch (LicenceLengthException e) {
			log.error("Licence length is more than expected.", e);
			return licenseFileContent;

		} catch (IOException e) {
			log.error("IOException", e);
			return licenseFileContent;

		}
	}
	
	
	public static String readPublicKeyFile(String publicKeyFilePath) {
		String path = FilenameUtils.normalize(publicKeyFilePath);
		File file = Paths.get(path).toFile();
		String publicKeyContent = null;
		int intc;
		StringBuffer sb = new StringBuffer();
		int max_str_len = 200;
		try (BufferedReader br = new BufferedReader(new FileReader(file));) {
			while ((intc = br.read()) != -1) {
				char c = (char) intc;
				if (c == '\n') {
					break;
				}
				if (sb.length() >= max_str_len) {
					throw new LicenceLengthException();
				}
				sb.append(c);
			}
			publicKeyContent = sb.toString();
			return publicKeyContent;

		} catch (LicenceLengthException e) {
			log.error("PublicKey length is more than expected.", e);
			return publicKeyContent;

		} catch (IOException e) {
			log.error("IOException", e);
			return publicKeyContent;

		}
	}

	/**
	 * Validate license.
	 *
	 * @param lic the lic
	 * @return true, if successful
	 * @throws InvalidLicenseException the invalid license exception
	 * @throws UnknownHostException    the unknown host exception
	 * @throws SocketException         the socket exception
	 * @throws LicenseDormantException the license dormant exception
	 * @throws LicenseExpiredException the license expired exception
	 * @throws IOException             Signals that an I/O exception has occurred.
	 */
	public static boolean validateLicense(License lic) throws InvalidLicenseException, UnknownHostException,
			SocketException, LicenseDormantException, LicenseExpiredException, IOException {
		boolean isLicenseValidated = false;
		Server server = new Server();

		if (server.isDormantLicense(lic.getStartDate())) {
			throw new LicenseDormantException();
		}

		if (!server.isValidDateRange(lic.getStartDate(), lic.getDurationDays())) {
			throw new LicenseExpiredException();
		}

		isLicenseValidated = true;

		return isLicenseValidated;
	}

	public static boolean validatePath(String file) {
		String path = FilenameUtils.normalize(file);
		File f = new File(path);
		try {
			f.getCanonicalPath();
			return true;
		} catch (IOException e) {
			return false;
		}
	}

	public static License getLicenseDetails(String licenseFilePath)
			throws UnsupportedEncodingException, InvalidAlgorithmParameterException {
		if (!LicenseValidator.validatePath(licenseFilePath)) {
			throw new IllegalArgumentException(
					"License file not found..Please provide the license file path as an argument.. ");
		}
		String licenseFileContent = LicenseValidator.readLicenseFile(licenseFilePath);
		String decryptedString = null;
		License lic = new License();
		try {

			decryptedString = LicenseValidator.decrypt(licenseFileContent);
			lic = LicenseValidator.parseLicenseContent(decryptedString);
			return lic;

		} catch (InvalidKeyException | IllegalBlockSizeException | BadPaddingException | NoSuchAlgorithmException
				| NoSuchPaddingException e) {
			log.error(
					"InvalidKeyException or IllegalBlockSizeException or BadPaddingException or NoSuchAlgorithmException",
					e);
			return lic;
		} catch (NoSuchProviderException e) {
			log.error("NoSuchProviderException", e);
			return lic;
		}
	}
}
