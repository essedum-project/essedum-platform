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

package com.infosys.icets.icip.adapter.rest;

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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.infosys.icets.ai.comm.lib.util.exceptions.ApiError;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.infosys.icets.icip.adapter.service.ICIPAdaptersV1Service;
import io.micrometer.core.annotation.Timed;

/**
 * The Class ICIPAdaptersV1Controller.
 *
 * @author icets
 */
@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/adapters/v1")
@RefreshScope
public class ICIPAdaptersV1Controller {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPAdaptersV1Controller.class);

	@Autowired
	private ICIPAdaptersV1Service iCIPAdaptersV1Service;

	@GetMapping(path = "/{org}/{specname}/{methodname}")
	public ResponseEntity<String> getData(@PathVariable(name = "specname") String specname,
			@PathVariable(name = "methodname") String methodname, @PathVariable(name = "org") String org,
			@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> params)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		return iCIPAdaptersV1Service.getData(org, specname, methodname, headers, params);
	}

	@PostMapping(path = "/{org}/{specname}/{methodname}")
	public ResponseEntity<String> getPostData(@PathVariable(name = "specname") String specname,
			@PathVariable(name = "methodname") String methodname, @PathVariable(name = "org") String org,
			@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> params,
			@RequestBody String body)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		return iCIPAdaptersV1Service.getPostData(org, specname, methodname, headers, params, body);
	}

	@DeleteMapping(path = "/{org}/{specname}/{methodname}")
	public ResponseEntity<String> deleteData(@PathVariable(name = "specname") String specname,
			@PathVariable(name = "methodname") String methodname, @PathVariable(name = "org") String org,
			@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> params)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		return iCIPAdaptersV1Service.deleteData(org, specname, methodname, headers, params);
	}

	@PostMapping(path = "/{org}/{specname}/{methodname}/file")
	public ResponseEntity<String> getPostDataForFile(@PathVariable(name = "specname") String specname,
			@PathVariable(name = "methodname") String methodname, @PathVariable(name = "org") String org,
			@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> params,
			@RequestParam("file") MultipartFile file)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		return iCIPAdaptersV1Service.getPostDataForFile(org, specname, methodname, headers, params, file);
	}

	/**
	 * Handle all.
	 *
	 * @param ex the ex
	 * @return the response entity
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Object> handleAll(Exception ex) {
		logger.error(ex.getMessage(), ex);
		Throwable rootcause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred");
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

}