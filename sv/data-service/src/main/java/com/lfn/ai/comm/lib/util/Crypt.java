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

package com.lfn.ai.comm.lib.util;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * AES-GCM based encryption/decryption helper.
 *
 * <p>
 * The {@code encrypt} and {@code decrypt} methods keep two checked exceptions in their throws
 * clauses for backward compatibility with existing callers' multi-catch blocks. After the
 * StandardCharsets migration those exceptions are no longer actually thrown, so rule S1130
 * ("exception cannot be thrown") is intentionally suppressed.
 */
@SuppressWarnings("java:S1130")
public class Crypt {
	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(Crypt.class);

	/** Reusable cryptographically strong random number generator. */
	private static final SecureRandom SECURE_RANDOM = new SecureRandom();

	private Crypt() {
	}

	public static String encrypt(String data, String secret) throws InvalidKeyException, NoSuchPaddingException,
			IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException,
			InvalidAlgorithmParameterException, UnsupportedEncodingException {

        // Generate random 12-byte IV
        byte[] iv = new byte[12];
        SECURE_RANDOM.nextBytes(iv);

		// Create AES-GCM cipher
		Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");

		// Generate AES key from the password
		SecretKeySpec skeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "AES");

		// Initialize cipher for encryption
		GCMParameterSpec parameterSpec = new GCMParameterSpec(128, iv);
		cipher.init(Cipher.ENCRYPT_MODE, skeySpec, parameterSpec);

		// Encrypt the plaintext
		byte[] encVal = cipher.doFinal(data.getBytes());
		String encryptedValue = Base64.getEncoder().encodeToString(encVal);
		String encodedIV = Base64.getEncoder().encodeToString(iv);

		JSONObject jsonObject = new JSONObject();
		jsonObject.put("ciphertext", encryptedValue);
		jsonObject.put("iv", encodedIV);
		return jsonObject.toString();
	}

	public static String decrypt(String strToDecrypt, String secret)
			throws InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException,
			UnsupportedEncodingException, InvalidAlgorithmParameterException {
		try {
			JSONObject jsonObject = new JSONObject(strToDecrypt);

			byte[] iv = Base64.getDecoder().decode(jsonObject.optString("iv"));
			// Create AES-GCM cipher
			Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");

			// Generate AES key from the password
			SecretKeySpec skeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "AES");

			// Initialize cipher for decryption
			GCMParameterSpec parameterSpec = new GCMParameterSpec(128, iv);
			cipher.init(Cipher.DECRYPT_MODE, skeySpec, parameterSpec);

			return new String(cipher.doFinal(Base64.getDecoder().decode(jsonObject.optString("ciphertext"))));
		} catch (NoSuchAlgorithmException e) {
			logger.error(e.getLocalizedMessage());
		}
		return null;
	}


	public static String decodeKey(String str) {
		byte[] decoded = Base64.getDecoder().decode(str.getBytes());
		return new String(decoded);
	}

	public static String encodeKey(String str) {
		byte[] encoded = Base64.getEncoder().encode(str.getBytes());
		return new String(encoded);
	}
}
