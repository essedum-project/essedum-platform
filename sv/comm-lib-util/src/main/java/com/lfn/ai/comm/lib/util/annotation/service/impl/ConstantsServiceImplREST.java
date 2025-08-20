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

package com.lfn.ai.comm.lib.util.annotation.service.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.ai.comm.lib.util.RestClientUtil;
import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;

/**
 * Service Implementation for managing DashConstant.
 */
/**
 * @author essedum
 */
@Profile("restconstants")
@Service
@Transactional
public class ConstantsServiceImplREST  extends ConstantsServiceImplAbstract implements ConstantsService {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(ConstantsServiceImplREST.class);

	@Value("${commonAppUrl}")
	private String commonAppUrl;
	
	@Override
	public String findByKeys(String key, String project) {
		log.debug("Request to get dash-constants for essedumPropertyCache");
		String result="";
		try {
			result = RestClientUtil.getApiCall(commonAppUrl + "api/get-startup-constants/"+key+"/"+project,"");
		} catch (IOException e) {
			log.error(e.getMessage());
		}
		return result;
	}

	
	@Override
	public List<String> findByKeyArray(String key, String project) {
		List<String> result=new ArrayList<String>();
		try {
			result = Arrays.asList(RestClientUtil.getApiCall(commonAppUrl + "api/get-startup-constants/array/" + key+"/Core",""));
		} catch (Exception ex) {
			String error = String.format("%s : Key %s", "key does not exist in the constant DB.", key);
			log.error(error, ex);
		}
		return result;
	}
}