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

package com.lfn.iamp.usm.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.iamp.usm.domain.UsmAuthToken;
import com.lfn.iamp.usm.repository.InvalidTokenRepository;
import com.lfn.iamp.usm.service.InvalidTokenService;

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
