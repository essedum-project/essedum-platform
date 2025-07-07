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

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

// 
/**
 * The Class LicenseGenerator.
 *
 * @author icets
 */
public class LicenseGenerator {
	
	/** The public key. */
	private String publicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCTsLMGGiwfvJ32Hyh8I0Wm7YV4QT9X4kdSMmj0xzIw/6yEaBfC1+rjBuaGFPhVY9c5CfGpW1Gm4SI1OT8FBmq02sWN+p9q6L1pKcxvJzVovPY5LL5e6D94/mEnCY9SQrymEy/uv5bzy1fHf/ZQVjC8MovHXCpoDUqSNL1BudjX0wIDAQAB";

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(LicenseGenerator.class);
	
	/**
	 * Gets the public key.
	 *
	 * @param base64PublicKey the base 64 public key
	 * @return the public key
	 */
	public PublicKey getPublicKey(String base64PublicKey) {
		PublicKey publicKey = null;
		try {
			X509EncodedKeySpec keySpec = new X509EncodedKeySpec(Base64.getDecoder().decode(base64PublicKey.getBytes()));
			KeyFactory keyFactory = KeyFactory.getInstance("RSA");
			publicKey = keyFactory.generatePublic(keySpec);
			return publicKey;
		} catch (NoSuchAlgorithmException e) {
			log.error("NoSuchAlgorithmException", e);
			return publicKey;
		} catch (InvalidKeySpecException e) {
			log.error("InvalidKeySpecException", e);
			return publicKey;
		}
		
	}

	/**
	 * Encrypt.
	 *
	 * @param data the data
	 * @param privateKey the private key
	 * @return the byte[]
	 * @throws BadPaddingException the bad padding exception
	 * @throws IllegalBlockSizeException the illegal block size exception
	 * @throws InvalidKeyException the invalid key exception
	 * @throws NoSuchPaddingException the no such padding exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws NoSuchProviderException 
	 * @throws UnsupportedEncodingException 
	 * @throws InvalidAlgorithmParameterException 
	 */
	public EncryptedValues encrypt(String Data, String secret) throws BadPaddingException, IllegalBlockSizeException,
			InvalidKeyException, NoSuchPaddingException, NoSuchAlgorithmException, NoSuchProviderException, UnsupportedEncodingException, InvalidAlgorithmParameterException {
		  // Generate random 12-byte IV
        byte[] iv = new byte[12];
        SecureRandom random = new SecureRandom();
        random.nextBytes(iv);

		// Create AES-GCM cipher
		Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");

		// Generate AES key from the password
		SecretKeySpec skeySpec = new SecretKeySpec(secret.getBytes("UTF-8"), "AES");

		// Initialize cipher for encryption
		GCMParameterSpec parameterSpec = new GCMParameterSpec(128, iv);
		cipher.init(Cipher.ENCRYPT_MODE, skeySpec, parameterSpec);

		EncryptedValues encryptedValues = new EncryptedValues();
		
		// Encrypt the plaintext
		byte[] encVal = cipher.doFinal(Data.getBytes());
		encryptedValues.encryptedValue = Base64.getEncoder().encodeToString(encVal);
		encryptedValues.publicKey = Base64.getEncoder().encodeToString(iv);
		
		return encryptedValues;
		
	}

	/**
	 * The main method.
	 *
	 * @param args the arguments
	 * @throws IllegalBlockSizeException the illegal block size exception
	 * @throws InvalidKeyException the invalid key exception
	 * @throws NoSuchPaddingException the no such padding exception
	 * @throws BadPaddingException the bad padding exception
	 * @throws IOException Signals that an I/O exception has occurred.
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws NoSuchProviderException 
	 * @throws InvalidAlgorithmParameterException 
	 */
	public static void main(String[] args) throws IllegalBlockSizeException, InvalidKeyException,
			NoSuchPaddingException, BadPaddingException, IOException, NoSuchAlgorithmException, NoSuchProviderException, InvalidAlgorithmParameterException {
	
			LicenseGenerator iampLicGen = new LicenseGenerator();
			String privateKeyPath = args[0];
			String dataFilePath = args[1];
			String licenseFilePath = args[2];
			String publicKeyFilePath = args[3];
			String privateKey = iampLicGen.readLicenseInput(privateKeyPath);				
			String data = iampLicGen.readLicenseInput(dataFilePath);	
			EncryptedValues encryptedValues = iampLicGen.encrypt(data, privateKey);			
			iampLicGen.writeToLicenseFile(encryptedValues.publicKey,publicKeyFilePath);
			iampLicGen.writeToLicenseFile(encryptedValues.encryptedValue,licenseFilePath);

	}

	/**
	 * Read license input.
	 *
	 * @param filePath the file path
	 * @return the string
	 */
	public String readLicenseInput(String filePath) {
		File file = new File(filePath);
		String strCurrentLine = null;
		try(BufferedReader br = new BufferedReader(new FileReader(file));) {			
			strCurrentLine = br.readLine();
			return strCurrentLine;
		} catch (IOException e) {
			log.error("IOException", e);
			return strCurrentLine;
		}
	}

	/**
	 * Write to license file.
	 *
	 * @param encryptedValue the encrypted value
	 * @param licenseFilePath the license file path
	 */
	public void writeToLicenseFile(String encryptedValue, String licenseFilePath) {
		try(BufferedWriter writer = new BufferedWriter(new FileWriter(licenseFilePath));) {			
			writer.write(encryptedValue);
			writer.close();
		} catch (IOException e) {
			log.error("IOException", e);
		}

	}
	
	class EncryptedValues{
		String encryptedValue;
		String publicKey;
	}

}
