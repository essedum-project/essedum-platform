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

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import com.google.gson.JsonObject;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.UserProcessMapping;
import com.infosys.icets.iamp.usm.dto.UserProcessMappingDTO;

public interface UserProcessMappingService {
	
	public UserProcessMapping create(UserProcessMappingDTO userProcessMappingDTO) throws  LeapException;

	UserProcessMapping updateStatus(Integer id, Boolean status);

	void deleteMapping(Integer id);
	

	List<HashMap<String,String>> findByUser(String Organization,String user);

	UserProcessMappingDTO findByUserLoginAndProcess(String organization, String user, String processKey,String role);

	List<UserProcessMappingDTO> findAllUserByProcess(String organization, String processKey);
	
	List<UserProcessMappingDTO> findAllUserByProcessAndRole(String organization, String processKey,String role);

	JsonObject findAllUserToDelegate(String organization, String processKey, String startTime,
			String endTime,String currentUser);

	PageResponse<UserProcessMapping> getAllMappings(String organization, Optional<String> process,
			Optional<String> roleMng, Optional<String> user);
	

}
