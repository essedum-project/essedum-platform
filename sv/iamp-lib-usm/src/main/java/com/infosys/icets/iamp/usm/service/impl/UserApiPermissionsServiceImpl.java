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

package com.infosys.icets.iamp.usm.service.impl;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.common.RoleMappedApiPermission;
import com.infosys.icets.iamp.usm.domain.UsmPermissionApi;
import com.infosys.icets.iamp.usm.repository.UsmPermissionApiRepository;
import com.infosys.icets.iamp.usm.service.UserApiPermissionsService;
import com.infosys.icets.iamp.usm.service.configApis.support.ConfigurationApisService;

// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing UserApiPermissions.
 */
/**
 * @author icets
 */
@Service
@Transactional
public class UserApiPermissionsServiceImpl implements UserApiPermissionsService {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(UserApiPermissionsServiceImpl.class);

	/** The user api permissions repository. */
	private final UsmPermissionApiRepository UsmPermissionApiRepository;
//	
//	@Autowired
//	private  UserApiPermissionsRepo userApiPermissionsRepo;
	
	private ConfigurationApisService configurationApisService;

	/**
	 * Instantiates a new user api permissions service impl.
	 *
	 * @param UsmPermissionApiRepository the user api permissions repository
	 */
	public UserApiPermissionsServiceImpl(UsmPermissionApiRepository UsmPermissionApiRepository,ConfigurationApisService configurationApisService) {
		this.UsmPermissionApiRepository = UsmPermissionApiRepository;
		this.configurationApisService=configurationApisService;
	}

	/**
	 * Save.
	 *
	 * @param userApiPermissions the user api permissions
	 * @return the user api permissions
	 * @throws SQLException the SQL exception
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.infosys.icets.iamp.usm.service.UserApiPermissionsService#save(com.infosys
	 * .icets.iamp.usm.domain.UserApiPermissions)
	 */
	@Override
	public UsmPermissionApi save(UsmPermissionApi userApiPermissions) throws SQLException {
		log.debug("Request to save userApiPermissions : {}", userApiPermissions);
		return UsmPermissionApiRepository.save(userApiPermissions);
	}

	/**
	 * Gets the one.
	 *
	 * @param id the id
	 * @return the one
	 * @throws SQLException the SQL exception
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.infosys.icets.iamp.usm.service.UserApiPermissionsService#getOne(java.lang
	 * .Integer)
	 */
	@Override
	public UsmPermissionApi getOne(Integer id) throws SQLException {
		log.debug("Request to get userApiPermissions : {}", id);
		Optional<UsmPermissionApi> uap = UsmPermissionApiRepository.findById(id);
		return uap.isPresent() ? uap.get() : null;
	}

	/**
	 * Gets the all.
	 *
	 * @param req the req
	 * @return the all
	 * @throws SQLException the SQL exception
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see com.infosys.icets.iamp.usm.service.UserApiPermissionsService#getAll(com.
	 * infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample)
	 */
	@Override
	public PageResponse<UsmPermissionApi> getAll(PageRequestByExample<UsmPermissionApi> req) throws SQLException {
		log.debug("Request to get all userApiPermissions");
		Example<UsmPermissionApi> example = null;
		UsmPermissionApi userApiPermissions = req.getExample();

		if (userApiPermissions != null) {
			ExampleMatcher matcher = ExampleMatcher.matching() //
			;

			example = Example.of(userApiPermissions, matcher);
		}

		Page<UsmPermissionApi> page;
		if (example != null) {
			page = UsmPermissionApiRepository.findAll(example, req.toPageable());
		} else {
			page = UsmPermissionApiRepository.findAll(req.toPageable());
		}

		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent());
	}

	/**
	 * Find all.
	 *
	 * @param pageable the pageable
	 * @return the page
	 * @throws SQLException the SQL exception
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.infosys.icets.iamp.usm.service.UserApiPermissionsService#findAll(org.
	 * springframework.data.domain.Pageable)
	 */
	@Override
	public Page<UsmPermissionApi> findAll(Pageable pageable) throws SQLException {
		log.debug("Request to get all userApiPermissionss");
		return UsmPermissionApiRepository.findAll(pageable);
	}

	/**
	 * Delete by id.
	 *
	 * @param id the id
	 * @throws SQLException the SQL exception
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.infosys.icets.iamp.usm.service.UserApiPermissionsService#deleteById(java.
	 * lang.Integer)
	 */
	@Override
	public void deleteById(Integer id) throws SQLException {
		log.debug("Request to deleteById userApiPermissions : {}", id);
		UsmPermissionApiRepository.deleteById(id);

	}
	/**
	 * its map of roleId to map of apiUri to list of method types example =>(1
	 * -->(/api/batch/job--> (Put,Get,Post)))
	 */

	@Override
	public Map<Integer, Map<String, List<String>>> getRoleMappedApi() {
		log.debug("Request to get all role mapped apis permission ");
		Map<Integer, Map<String, List<String>>> roleMappedApi = new HashMap<Integer, Map<String, List<String>>>();
		List<RoleMappedApiPermission> RoleMappedApiList = UsmPermissionApiRepository.getRoleMappedApiList();
		for (RoleMappedApiPermission roleMappedApiPermission : RoleMappedApiList) {
			if (roleMappedApi.containsKey(roleMappedApiPermission.getRoleId())) {
				Map<String, List<String>> apiMethodType = roleMappedApi.get(roleMappedApiPermission.getRoleId());
				if (apiMethodType.containsKey(roleMappedApiPermission.getPermissionApi())
						&& !apiMethodType.get(roleMappedApiPermission.getPermissionApi()).contains(roleMappedApiPermission.getPermissionApiMethodType())) {
					apiMethodType.get(roleMappedApiPermission.getPermissionApi()).add(roleMappedApiPermission.getPermissionApiMethodType());
				} else {
					List<String> methodList = new ArrayList<String>();
					methodList.add(roleMappedApiPermission.getPermissionApiMethodType());
					apiMethodType.put(roleMappedApiPermission.getPermissionApi(), methodList);
				}

			} else {
				Map<String, List<String>> apiMethodType = new HashMap<String, List<String>>();
				List<String> methodList = new ArrayList<String>();
				methodList.add(roleMappedApiPermission.getPermissionApiMethodType());
				apiMethodType.put(roleMappedApiPermission.getPermissionApi(), methodList);
				roleMappedApi.put(roleMappedApiPermission.getRoleId(), apiMethodType);
			}
		}

		return roleMappedApi;
	}
	
	
	@Override
	public List<String> getWhiteListedApi() {
		return UsmPermissionApiRepository.getWhiteListedApi();
	}
	

	@Override
	public void refreshConfigAPIsMap() {
		this.configurationApisService.refreshRoleMappedApi(this.getRoleMappedApi());
		this.refreshWhiteListedApi();
	}
	
	
	@Override
	public void refreshWhiteListedApi() {
		this.configurationApisService.refreshWhiteListedApi(this.getWhiteListedApi());
	}

	
}
