/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.ai.comm.lib.util.annotation.service.impl;

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

import com.infosys.icets.ai.comm.lib.util.RestClientUtil;
import com.infosys.icets.ai.comm.lib.util.annotation.service.ConstantsService;

/**
 * Service Implementation for managing DashConstant.
 */
/**
 * @author icets
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
		log.debug("Request to get dash-constants for leapPropertyCache");
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