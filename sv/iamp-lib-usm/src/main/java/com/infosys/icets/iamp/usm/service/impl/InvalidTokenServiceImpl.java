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
package com.infosys.icets.iamp.usm.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.iamp.usm.domain.UsmAuthToken;
import com.infosys.icets.iamp.usm.repository.InvalidTokenRepository;
import com.infosys.icets.iamp.usm.service.InvalidTokenService;

@Service
@Transactional
@RefreshScope
public class InvalidTokenServiceImpl implements InvalidTokenService{

	private final Logger log = LoggerFactory.getLogger(InvalidTokenServiceImpl.class);

	private InvalidTokenRepository invalidTokenRepository;

	public InvalidTokenServiceImpl(InvalidTokenRepository jwtTokenRepository) {
		this.invalidTokenRepository=jwtTokenRepository;
	}

	@Override
	public void addInvalidToken(UsmAuthToken token) {	
		this.invalidTokenRepository.save(token); 


	}

	@Override
	public Boolean isInvalidToken(String token) {
		if(this.invalidTokenRepository.isInvalidToken(token)>0) return true;
		return false;

	}

	@Override
	public void deleteAll() {
		Long nowTime = new java.util.Date().getTime();
		this.invalidTokenRepository.deleteAll(nowTime);

}

}
