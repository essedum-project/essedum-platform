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
