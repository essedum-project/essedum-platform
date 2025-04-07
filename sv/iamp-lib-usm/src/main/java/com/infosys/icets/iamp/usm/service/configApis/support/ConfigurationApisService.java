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
package com.infosys.icets.iamp.usm.service.configApis.support;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ConfigurationApisService {

	private static Map<Integer, Map<String, List<String>>> roleMappedApi;
	private final Logger log = LoggerFactory.getLogger(ConfigurationApisService.class);

	private static List<String> whiteListedUrl;

	public boolean isContainsRole(Integer roleId) {
		log.info("checking wheter it is present or not {}",this.roleMappedApi.containsKey(roleId));
		if (this.roleMappedApi.containsKey(roleId)) {
			return true;
		}
		return false;
	}
	public List<String> getWhiteListedUrl(){
		return this.whiteListedUrl;
	}

	public Map<String, List<String>> getRoleMappedApis(Integer roleId) {
		return roleMappedApi.get(roleId);
	}

	public void refreshRoleMappedApi(Map<Integer, Map<String, List<String>>> roleMappedApi) {

// 		log.info("Map update successfully",roleMappedApi);
		this.roleMappedApi = roleMappedApi;

	}
	public Boolean isMapEmpty() {
		if(this.roleMappedApi.isEmpty()) return true;
		return false;
	}

	public void refreshWhiteListedApi(List<String> whiteListedUrl) {	
		this.whiteListedUrl = whiteListedUrl;	
	}

}
