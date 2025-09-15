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

import com.lfn.ai.comm.lib.util.RegularExpressionUtil;
import com.lfn.iamp.usm.common.RoleMappedApiPermission;
import com.lfn.iamp.usm.domain.UsmPermissionApi;
import com.lfn.iamp.usm.dto.UsmPermissionApiDTO;
import com.lfn.iamp.usm.repository.UsmPermissionApiRepository;
import com.lfn.iamp.usm.service.UsmPermissionApiService;
import com.lfn.iamp.usm.service.configApis.support.ConfigurationApisService;


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