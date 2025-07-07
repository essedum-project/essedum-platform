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
package com.infosys.icets.ai.comm.lib.util.service.impl;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.RestClientUtil;
import com.infosys.icets.ai.comm.lib.util.service.UsmService;
import com.infosys.icets.iamp.usm.domain.Users;

/**
 * Service Interface for managing DashConstant.
 */
/**
 * @author icets
 */
@Profile("restconstants")
@Service
@Transactional
public class UsmServiceImplREST implements UsmService {

	@Value("${commonAppUrl}")
	private String commonAppUrl;

	/**
	 * Find by user login.
	 *
	 * @param userLogin the user login
	 * @return the users
	 * @throws IOException
	 */
	public Users findByUserLogin(String userLogin, String token) throws IOException {
		ObjectMapper mapper = new ObjectMapper();
		Users users = mapper.readValue(
				RestClientUtil.getApiCall(commonAppUrl + "api/userss/get-user/" + ICIPUtils.getUser(userLogin), token),
				Users.class);
		return users;
	}
}
