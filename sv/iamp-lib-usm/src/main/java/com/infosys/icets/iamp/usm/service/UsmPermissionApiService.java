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