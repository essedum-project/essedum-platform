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

package com.lfn.iamp.usm.service;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.domain.UsmPermissionApi;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing UsmPermissionApi.
 */
/**
* @author essedum
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
