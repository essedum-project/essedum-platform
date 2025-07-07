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
