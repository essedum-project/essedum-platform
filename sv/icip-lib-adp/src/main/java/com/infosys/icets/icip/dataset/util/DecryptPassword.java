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

import java.nio.charset.StandardCharsets;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.InvalidParameterException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Base64;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class DecryptPassword.
 *
 * @author icets
 */
@Component
public class DecryptPassword {

	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(DecryptPassword.class);
	
	/**
	 * Instantiates a new decrypt password.
	 */
	private DecryptPassword() {
		// Avoid instantiation of the class since its a Utility class
	}

	/**
	 * Encrypt.
	 *
	 * @param text     the text
	 * @param password the password
	 * @return the string[]
	 */
	public static String[] encrypt(final String text, String password) {
		try {
			// GENERATE random salt (needed for PBKDF2)
			byte[] salt = new byte[64];
			SecureRandom random = SecureRandom.getInstanceStrong();
			random.nextBytes(salt);

			// DERIVE key (from pass-salt)
			SecretKeyFactory secretKeyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512");
			KeySpec passwordBasedEncryptionKeySpec = new PBEKeySpec(password.toCharArray(), salt, 1000000, 256);
			SecretKey secretKeyFromPBKDF2 = secretKeyFactory.generateSecret(passwordBasedEncryptionKeySpec);
			SecretKey key = new SecretKeySpec(secretKeyFromPBKDF2.getEncoded(), "AES");

			// ENCRYPTION
			Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
			GCMParameterSpec spec = new GCMParameterSpec(16 * 8, salt);
			cipher.init(Cipher.ENCRYPT_MODE, key, spec);

			byte[] cipherTextBytes = cipher.doFinal(text.getBytes(StandardCharsets.UTF_8));
			return new String[] { "enc" + Base64.getEncoder().encodeToString(cipherTextBytes),
					Base64.getEncoder().encodeToString(salt) };
		} catch (NoSuchAlgorithmException | NoSuchPaddingException | InvalidKeyException | IllegalBlockSizeException
				| BadPaddingException | InvalidParameterException | InvalidAlgorithmParameterException
				| InvalidKeySpecException e) {
			logger.error(e.getLocalizedMessage());
			return new String[] {};
		}

	}

	
	public static String[] encryptwithsalt(final String text, String password,byte[]salt) {
		try {
			// GENERATE random salt (needed for PBKDF2)
			
			

			// DERIVE key (from pass-salt)
			SecretKeyFactory secretKeyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512");
			KeySpec passwordBasedEncryptionKeySpec = new PBEKeySpec(password.toCharArray(), salt, 1000000, 256);
			SecretKey secretKeyFromPBKDF2 = secretKeyFactory.generateSecret(passwordBasedEncryptionKeySpec);
			SecretKey key = new SecretKeySpec(secretKeyFromPBKDF2.getEncoded(), "AES");

			// ENCRYPTION
			Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
			GCMParameterSpec spec = new GCMParameterSpec(16 * 8, salt);
			cipher.init(Cipher.ENCRYPT_MODE, key, spec);

			byte[] cipherTextBytes = cipher.doFinal(text.getBytes(StandardCharsets.UTF_8));
			return new String[] { "enc" + Base64.getEncoder().encodeToString(cipherTextBytes),
					Base64.getEncoder().encodeToString(salt) };
		} catch (NoSuchAlgorithmException | NoSuchPaddingException | InvalidKeyException | IllegalBlockSizeException
				| BadPaddingException | InvalidParameterException | InvalidAlgorithmParameterException
				| InvalidKeySpecException e) {
			logger.error(e.getLocalizedMessage());
			return new String[] {};
		}

	}

	/**
	 * Decrypt.
	 *
	 * @param encText  the enc text
	 * @param password the password
	 * @param salt     the salt
	 * @return the string
	 */
	public static String decrypt(final String encText, String password, String salt) {
		try {
			byte[] saltBytes = Base64.getDecoder().decode(salt);
			// DERIVE key (from pass-salt)
			SecretKeyFactory secretKeyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512");
			KeySpec passwordBasedEncryptionKeySpec = new PBEKeySpec(password.toCharArray(), saltBytes, 1000000, 256);
			SecretKey secretKeyFromPBKDF2 = secretKeyFactory.generateSecret(passwordBasedEncryptionKeySpec);
			SecretKey key = new SecretKeySpec(secretKeyFromPBKDF2.getEncoded(), "AES");

			// DECRYPTION
			Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
			GCMParameterSpec spec = new GCMParameterSpec(16 * 8, saltBytes);
			cipher.init(Cipher.DECRYPT_MODE, key, spec);

			byte[] decryptedCipherTextBytes = cipher.doFinal(Base64.getDecoder().decode(encText.substring(3)));
			return new String(decryptedCipherTextBytes, StandardCharsets.UTF_8);
		} catch (NoSuchAlgorithmException | NoSuchPaddingException | InvalidKeyException | IllegalBlockSizeException
				| BadPaddingException | InvalidParameterException | InvalidAlgorithmParameterException
				| InvalidKeySpecException  e) {
			logger.error("Decryption Error", e.getLocalizedMessage());
			return null;
		}
	}

	/**
	 * Gets the value.
	 *
	 * @param environment the environment
	 * @param key         the key
	 * @param source      the source
	 * @return the value
	 */
	public static Object[] getValue(Environment environment, String key, JSONObject source) {
		Object[] obj = new Object[2];
		String vaultKey = String.format("%s%s", key, "_vault");
		boolean flag = source.has(vaultKey) && source.getBoolean(vaultKey);
		obj[0] = flag ? environment.getProperty(source.optString(key), "") : source.optString(key);
		obj[1] = flag;
		return obj;
	}

}
