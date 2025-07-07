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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.ai.comm.lib.util.RegularExpressionUtil;
import com.infosys.icets.iamp.usm.common.RoleMappedApiPermission;
import com.infosys.icets.iamp.usm.domain.UsmPermissionApi;
import com.infosys.icets.iamp.usm.dto.UsmPermissionApiDTO;
import com.infosys.icets.iamp.usm.repository.UsmPermissionApiRepository;
import com.infosys.icets.iamp.usm.service.UsmPermissionApiService;
import com.infosys.icets.iamp.usm.service.configApis.support.ConfigurationApisService;


/**
 * Service Implementation for managing UsmPermission.
 */

@Service
@Transactional
public class UsmPermissionApiServiceImpl  implements UsmPermissionApiService {


	 private final Logger log = LoggerFactory.getLogger(UsmPermissionApiServiceImpl.class);
	 
	 

	    /** The usm permissions repository. */
	    private final UsmPermissionApiRepository usm_permission_apiRepository;
	    
	    /** The usm permissions repository. */
	    private final ConfigurationApisService configurationApisService;

	    public UsmPermissionApiServiceImpl(UsmPermissionApiRepository usm_permission_apiRepository,ConfigurationApisService configurationApisService) {
	        this.usm_permission_apiRepository = usm_permission_apiRepository;
	        this.configurationApisService=configurationApisService;
   

	    }

    @Override
    @Transactional(readOnly = true)
	public Page<UsmPermissionApi> findAll(Pageable pageable) {

		return usm_permission_apiRepository.findAll(pageable);
	}



	@Override
	public UsmPermissionApi save(UsmPermissionApi usm_permission_api) {
		UsmPermissionApi usmPermissionApi =usm_permission_apiRepository.save(usm_permission_api);
		this.refreshConfigAPIsMap();
        return usmPermissionApi;
	}

	@Override
	public void delete(Integer id) {
		log.debug("Request to delete UsmPermissions : {}", id);
		 usm_permission_apiRepository.deleteById(id);
		 this.refreshConfigAPIsMap();

	}

	@Override
	public List<UsmPermissionApi> getPermissionApiByPermissionId(Integer permissionId){	
		log.debug("Request to delete UsmPermissions : {}", usm_permission_apiRepository.getPermissionApiByPermissionId(permissionId));
		return usm_permission_apiRepository.getPermissionApiByPermissionId(permissionId);

	}
	
	@Override
	public void deleteAll(Integer id) {
		log.debug("Request to delete UsmPermissions : {}", id);
		 usm_permission_apiRepository.deleteByPermissionId(id);

	}

	@Override
	public boolean verifyRegEx(String regex) throws Exception{
		return RegularExpressionUtil.verifyRegEx(regex);
	}
	
	
	
	
	@Override
    public List<UsmPermissionApi> searchUsmPermissionApi(UsmPermissionApiDTO usm_permission_api_dto){
		String type =usm_permission_api_dto.getType();
		String api =usm_permission_api_dto.getApi();
		if(type.isEmpty()||type.equalsIgnoreCase("null")||type.equalsIgnoreCase("undefined"))
    		return usm_permission_apiRepository.findByApiContainingIgnoreCase(api);
		if(api.isEmpty()||api.equalsIgnoreCase("null")||api.equalsIgnoreCase("undefined"))
			return usm_permission_apiRepository.findByTypeContainingIgnoreCase(type);
    	return usm_permission_apiRepository.findByApiContainingAndTypeContainingIgnoreCase(api,type);
    }

	/**
	 * its map of roleId to map of apiUri to list of method types example =>(1
	 * -->(/api/batch/job--> (Put,Get,Post)))
	 */

	@Override
	public Map<Integer, Map<String, List<String>>> getRoleMappedApi() {
		log.debug("Request to get all role mapped apis permission ");
		Map<Integer, Map<String, List<String>>> roleMappedApi = new HashMap<Integer, Map<String, List<String>>>();
		List<RoleMappedApiPermission> RoleMappedApiList = usm_permission_apiRepository.getRoleMappedApiList();
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
		return usm_permission_apiRepository.getWhiteListedApi();
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