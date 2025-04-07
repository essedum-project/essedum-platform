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

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.UsmPermissionApi;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing UsmPermissionApi.
 */
/**
* @author icets
*/
public interface UserApiPermissionsService {
	
	/**
	 * Save.
	 *
	 * @param UsmPermissionApi the user api permissions
	 * @return the user api permissions
	 * @throws SQLException the SQL exception
	 */
	UsmPermissionApi save(UsmPermissionApi UsmPermissionApi) throws SQLException;

	/**
	 * Find all.
	 *
	 * @param pageable the pageable
	 * @return the page
	 * @throws SQLException the SQL exception
	 */
	Page<UsmPermissionApi> findAll(Pageable pageable) throws SQLException;

	/**
	 * Gets the one.
	 *
	 * @param id the id
	 * @return the one
	 * @throws SQLException the SQL exception
	 */
	UsmPermissionApi getOne(Integer id) throws SQLException;

	/**
	 * Delete by id.
	 *
	 * @param id the id
	 * @throws SQLException the SQL exception
	 */
	void deleteById(Integer id) throws SQLException;

	/**
	 * Gets the all.
	 *
	 * @param req the req
	 * @return the all
	 * @throws SQLException the SQL exception
	 */
	PageResponse<UsmPermissionApi> getAll(PageRequestByExample<UsmPermissionApi> req) throws SQLException;
	
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
