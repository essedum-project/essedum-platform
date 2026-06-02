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

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.iamp.usm.config.Constants;
import com.lfn.iamp.usm.domain.Users;
import com.lfn.iamp.usm.domain.UsmAccessTokens;
import com.lfn.iamp.usm.dto.UsmPersonalAccessTokensDTO;
import com.lfn.iamp.usm.repository.UsersRepository;
import com.lfn.iamp.usm.repository.UsmAccessTokensRepository;
import com.lfn.iamp.usm.service.UsmAccessTokensService;

/**
 * Service Implementation for managing UsmAccessTokensService.
 */

@Service
@Transactional
public class UsmAccessTokensServiceImpl implements UsmAccessTokensService {

	private final Logger logger = LoggerFactory.getLogger(UsmAccessTokensServiceImpl.class);

	private final UsmAccessTokensRepository usmAccessTokensRepository;

	private final UsersRepository usersRepository;

	public UsmAccessTokensServiceImpl(UsmAccessTokensRepository usmAccessTokensRepository,
			UsersRepository usersRepository) {
		this.usmAccessTokensRepository = usmAccessTokensRepository;
		this.usersRepository = usersRepository;

	}

	@Override
	public UsmAccessTokens findUsmAccessTokenByUserId(Integer user_id) {
		UsmAccessTokens usmAccessTokens = null;
		try {
			List<UsmAccessTokens> listUsmAccessTokens = usmAccessTokensRepository.findUsmAccessTokenByUserId(user_id);
			LocalDate today = LocalDate.now();
			for (UsmAccessTokens usmAccessTokensLoop : listUsmAccessTokens) {
				if (usmAccessTokensLoop.getExpires_on() == null) {
					usmAccessTokens = usmAccessTokensLoop;
					break;
				} else if (usmAccessTokensLoop.getExpires_on() != null) {
					LocalDate tokenExpiryDate = usmAccessTokensLoop.getExpires_on().toLocalDateTime().toLocalDate();
					if (tokenExpiryDate.equals(today) || tokenExpiryDate.isAfter(today)) {
						usmAccessTokens = usmAccessTokensLoop;
						break;
					}
				}
			}
		} catch (Exception e) {
			logger.error("Error because of:{} at class:{} and line:{}", e.getMessage(), e.getStackTrace()[0].getClass(),
					e.getStackTrace()[0].getLineNumber());
		}
		return usmAccessTokens;
	}

	@Override
	public UsmAccessTokens findUsmAccessTokenByAccessToken(String accessToken) {
		UsmAccessTokens usmAccessTokens = null;
		try {
			List<UsmAccessTokens> listUsmAccessTokens = usmAccessTokensRepository
					.findUsmAccessTokenByAccessToken(accessToken);
			LocalDate today = LocalDate.now();
			for (UsmAccessTokens usmAccessTokensLoop : listUsmAccessTokens) {
				if (usmAccessTokensLoop.getExpires_on() == null) {
					usmAccessTokens = usmAccessTokensLoop;
					break;
				} else if (usmAccessTokensLoop.getExpires_on() != null) {
					LocalDate tokenExpiryDate = usmAccessTokensLoop.getExpires_on().toLocalDateTime().toLocalDate();
					if (tokenExpiryDate.equals(today) || tokenExpiryDate.isAfter(today)) {
						usmAccessTokens = usmAccessTokensLoop;
						break;
					}
				}
			}
		} catch (Exception e) {
			logger.error("Error because of:{} at class:{} and line:{}", e.getMessage(), e.getStackTrace()[0].getClass(),
					e.getStackTrace()[0].getLineNumber());
		}
		return usmAccessTokens;
	}

	@Override
	public UsmAccessTokens generateUsmAccessTokenByUserId(UsmPersonalAccessTokensDTO requestBody) {
		UsmAccessTokens usmAccessTokens = new UsmAccessTokens();
		try {
			Integer userId = requestBody.getUserId();
			Optional<Users> users = usersRepository.findById(userId);
			Users user = users.get();
			String action = requestBody.getAction();
			if (Constants.ACTION_GENERATE_NEW_TOKEN.equalsIgnoreCase(action)) {
				String generatedPersonalAccessToken = generatePersonalAccessToken();
				usmAccessTokens.setAccess_token(generatedPersonalAccessToken);
				usmAccessTokens.setUser(user);
				if (!Constants.ACTION_NEVER.equalsIgnoreCase(requestBody.getExpire())
						&& requestBody.getDateOfExpiry() != null) {
					usmAccessTokens.setExpires_on(requestBody.getDateOfExpiry());
				} else {
					usmAccessTokens.setExpires_on(null);
				}
				usmAccessTokens.setCreated_on(Timestamp.from(Instant.now()));
				usmAccessTokens = usmAccessTokensRepository.save(usmAccessTokens);
			} else if (Constants.ACTION_CHANGE_EXPIRY_DATE.equalsIgnoreCase(action)) {

				usmAccessTokens = findUsmAccessTokenByUserId(user.getId());
				if (!Constants.ACTION_NEVER.equalsIgnoreCase(requestBody.getExpire())
						&& requestBody.getDateOfExpiry() != null) {
					usmAccessTokens.setExpires_on(requestBody.getDateOfExpiry());
				} else {
					usmAccessTokens.setExpires_on(null);
				}
				usmAccessTokens.setLast_modified_on(Timestamp.from(Instant.now()));
				usmAccessTokens = usmAccessTokensRepository.save(usmAccessTokens);
			} else {
				String generatedPersonalAccessToken = generatePersonalAccessToken();
				usmAccessTokens = findUsmAccessTokenByUserId(user.getId());
				usmAccessTokens.setAccess_token(generatedPersonalAccessToken);
				usmAccessTokens.setUser(user);
				usmAccessTokens.setLast_modified_on(Timestamp.from(Instant.now()));
				usmAccessTokens = usmAccessTokensRepository.save(usmAccessTokens);
			}

		} catch (Exception e) {
			logger.error("Error because of:{} at class:{} and line:{}", e.getMessage(), e.getStackTrace()[0].getClass(),
					e.getStackTrace()[0].getLineNumber());
		}

		return usmAccessTokens;
	}

	private String generatePersonalAccessToken() {
		Supplier<String> tokenSupplier = () -> {
			StringBuilder token = new StringBuilder();
			return token.append(UUID.randomUUID().toString()).toString();
		};
		return tokenSupplier.get();
	}

	@Override
	public Map<String, String> revokeUsmAccessTokenByUserId(Integer userId) {
		Map<String, String> responseOfRevoke = new HashMap<>();
		try {
			List<UsmAccessTokens> usmAccessTokensList = usmAccessTokensRepository.findUsmAccessTokenByUserId(userId);
			usmAccessTokensRepository.deleteAll(usmAccessTokensList);
			responseOfRevoke.put(Constants.STATUS_MSG, Constants.STATUS_MSG_REVOKED);
		} catch (Exception e) {
			logger.error("Error because of:{} at class:{} and line:{}", e.getMessage(), e.getStackTrace()[0].getClass(),
					e.getStackTrace()[0].getLineNumber());
		}
		return responseOfRevoke;
	}

	@Override
	public Boolean isPersonalAccessTokenValid(String accessToken) {
		Boolean isAccessTokenValid = false;
		try {
			List<UsmAccessTokens> listUsmAccessTokens = usmAccessTokensRepository
					.findUsmAccessTokenByAccessToken(accessToken);
			LocalDate today = LocalDate.now();
			for (UsmAccessTokens usmAccessTokensLoop : listUsmAccessTokens) {
				if (usmAccessTokensLoop.getExpires_on() == null) {
					isAccessTokenValid = true;
					MDC.put(usmAccessTokensLoop.getAccess_token(), usmAccessTokensLoop.getUser().getUser_email());
					break;
				} else if (usmAccessTokensLoop.getExpires_on() != null) {
					LocalDate tokenExpiryDate = usmAccessTokensLoop.getExpires_on().toLocalDateTime().toLocalDate();
					if (tokenExpiryDate.equals(today) || tokenExpiryDate.isAfter(today)) {
						isAccessTokenValid = true;
						MDC.put(usmAccessTokensLoop.getAccess_token(), usmAccessTokensLoop.getUser().getUser_email());
						break;
					}
				}
			}
		} catch (Exception e) {
			logger.error("Error because of:{} at class:{} and line:{}", e.getMessage(), e.getStackTrace()[0].getClass(),
					e.getStackTrace()[0].getLineNumber());
		}
		return isAccessTokenValid;
	}

}