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

package com.infosys.icets.iamp.usm.service;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.iamp.usm.domain.UsmPermissionApi;
import com.infosys.icets.iamp.usm.dto.UsmPermissionApiDTO;


public interface UsmPermissionApiService {

	/**
     *  Get all the usm_permissionss.
     *  @param pageable the pagination information
     *  @return the list of entities
     */
    Page<UsmPermissionApi> findAll(Pageable pageable);

    /**
     *  save all the usm_permissionss.
     *  @param UsmPermissionApi the usmPermissionApi
     *  
     */
    
    UsmPermissionApi save(UsmPermissionApi usmPermissionApi);
    
    /**
     *  get all the usm_permissionss by permissionId.
     *  @param usmPermissionId the usmPermissionId 
     */
    List<UsmPermissionApi> getPermissionApiByPermissionId(Integer permissionId);

    /**
     *  delete  usm_permissionss by permissionId.
     *  @param Id the Id 
     */
	void delete(Integer id);
	
	
	/**
     *  deleteALL  by usm_permissionssId .
     *  @param usm_permissionId the Id 
     */
	void deleteAll(Integer id);

    boolean verifyRegEx(String api) throws Exception;
    
    
    /**
     *  Find's usm-permission-api by their https requestType and containing api's name  .
     *  @param usm_permission_api_dto
     *  @return the a list of UsmPermissionApi
     *   
     */
	List<UsmPermissionApi> searchUsmPermissionApi(UsmPermissionApiDTO usm_permission_api_dto);
	
	/**
	 * refresh role mapped api configuration map
	 */
	public void refreshConfigAPIsMap();
	
	/**
	 *  role mapped api configuration map
	 */
	Map<Integer,Map<String,List<String>>> getRoleMappedApi();
	
	/**
	 * refresh whitelistedApi configuration list
	 */
	public void refreshWhiteListedApi();
	
	/**
	 * whitelistedApi configuration list
	 */
	List<String> getWhiteListedApi();
}