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

package com.lfn.iamp.usm.service.configApis.support;

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
