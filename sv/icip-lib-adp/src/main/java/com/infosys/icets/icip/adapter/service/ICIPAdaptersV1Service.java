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
package com.infosys.icets.icip.adapter.service;

import java.io.IOException;
import java.net.URISyntaxException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.SQLException;
import java.util.Map;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;

import org.apache.commons.codec.DecoderException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

/**
 * The Interface ICIPAdaptersV1Service.
 *
 * @author icets
 */
public interface ICIPAdaptersV1Service {

	ResponseEntity<String> getData(String org, String specname, String methodname, Map<String, String> headers,
			Map<String, String> params) throws InvalidKeyException, KeyManagementException, NumberFormatException,
			NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeySpecException,
			InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException, KeyStoreException,
			ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException;

	ResponseEntity<String> getPostData(String org, String specname, String methodname, Map<String, String> headers,
			Map<String, String> params, String body)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException;

	ResponseEntity<String> deleteData(String org, String specname, String methodname, Map<String, String> headers,
			Map<String, String> params)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException;

	ResponseEntity<String> getPostDataForFile(String org, String specname, String methodname,
			Map<String, String> headers, Map<String, String> params, MultipartFile file)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException;

}
