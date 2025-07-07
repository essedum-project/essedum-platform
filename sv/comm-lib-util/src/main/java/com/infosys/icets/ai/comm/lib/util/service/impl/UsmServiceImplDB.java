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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.ai.comm.lib.util.service.UsmService;
import com.infosys.icets.iamp.usm.domain.Users;
import com.infosys.icets.iamp.usm.repository.UsersRepository;

/**
 * Service Interface for managing DashConstant.
 */
/**
 * @author icets
 */
@Profile("dbconstants")
@Service
@Transactional
public class UsmServiceImplDB implements UsmService {

	@Autowired
	private UsersRepository usersRepository;

	/**
	 * Find by user login.
	 *
	 * @param userLogin the user login
	 * @return the users
	 */
	public Users findByUserLogin(String userLogin, String token) {
		return this.usersRepository.findByUserLogin(userLogin);
	}
}
