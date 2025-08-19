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

package com.infosys.icets.ai.comm.lib.util.annotation.service;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.DashConstant;
import com.infosys.icets.iamp.usm.domain.DashConstant2;

/**
 * Service Interface for managing DashConstant.
 */
/**
 * @author icets
 */
public interface ConstantsService {

	/**
	 * Save a dash_constant.
	 *
	 * @param dash_constant the entity to save
	 * @return the persisted entity
	 * @throws SQLException the SQL exception
	 */
	DashConstant save(DashConstant dash_constant) throws SQLException;

	/**
	 * Get all the dash_constants.
	 *
	 * @param pageable the pagination information
	 * @return the list of entities
	 * @throws SQLException the SQL exception
	 */
	Page<DashConstant> findAll(Pageable pageable) throws SQLException;

	/**
	 * Get the "id" dash_constant.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 * @throws SQLException the SQL exception
	 */
	DashConstant findOne(Integer id) throws SQLException;

	/**
	 * Get the "id" dash_constant.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 */
	List<DashConstant> findByProjectId(Integer id);

	/**
	 * Delete the "id" dash_constant.
	 *
	 * @param id the id of the entity
	 * @throws SQLException the SQL exception
	 */
	void delete(Integer id) throws SQLException;

	/**
	 * Get all the dash_constants with search.
	 *
	 * @param req the req
	 * @return the list of entities
	 * @throws SQLException the SQL exception
	 */
	PageResponse<DashConstant> getAll(PageRequestByExample<DashConstant> req) throws SQLException;

	/**
	 * Get all the dash_constants according to project id for sbx.
	 *
	 * @param projectid the projectid
	 * @return the list of entities
	 * @throws SQLException the SQL exception
	 */
//	List<DashConstant> getForSbx(Integer projectid) throws SQLException;

	/**
	 * To DTO.
	 *
	 * @param dash_constant the dash constant
	 * @param depth         the depth
	 * @return the dash constant
	 */
	public DashConstant toDTO(DashConstant dash_constant, int depth);

	/**
	 * Find all dash constants.
	 *
	 * @param projectId the project id
	 * @return the list
	 */
	public List<DashConstant> findAllDashConstants(Integer projectId, Integer portfolioId);

	public String findByKeys(String key, String project);

	public DashConstant getByKeys(String key, String project);

	public List<String> findByKeyArray(String key, String project);

	public List<DashConstant> getDashConstantsbyitemAndname(String item, String project_name);

	public List<DashConstant> findAllKeys();

	public HashMap<String, String> getConfigKeyMap();

	public void refreshConfigKeyMap();

	public String findExtensionKey(Integer projectId, String key);

	public List<DashConstant> getDashConstantsForProcess(List<String> item, String project_name);

}
