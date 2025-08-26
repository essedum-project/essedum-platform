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

package com.infosys.icets.ai.comm.lib.util.service.impl;

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
public class EncryptionService{

	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(EncryptionService.class);
	
	/**
	 * Instantiates a new EncryptionService.
	 */
	private EncryptionService() {
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

