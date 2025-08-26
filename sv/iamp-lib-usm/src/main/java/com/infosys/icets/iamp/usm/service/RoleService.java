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

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.Role;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing Role.
 */
/**
* @author icets
*/
public interface RoleService {

    /**
     * Save a role.
     *
     * @param role the entity to save
     * @return the persisted entity
     * @throws SQLException the SQL exception
     */
    Role save(Role role) throws SQLException;

    /**
     *  Get all the roles.
     *
     * @param pageable the pagination information
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    Page<Role> findAll(Pageable pageable) throws SQLException;

    /**
     *  Get the "id" role.
     *
     * @param id the id of the entity
     * @return the entity
     * @throws SQLException the SQL exception
     */
    Role findOne(Integer id) throws SQLException;

    /**
     *  Delete the role.
     *
     * @param role 
     * @throws SQLException the SQL exception
     */
	void delete(Role role) throws SQLException;


    /**
     *  Get all the roles with search.
     *
     * @param req the req
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    PageResponse<Role> getAll(PageRequestByExample<Role> req) throws SQLException;

    /**
     * To DTO.
     *
     * @param role the role
     * @param depth the depth
     * @return the role
     */
    public Role toDTO(Role role, int depth);
    
    /**
     * Find by name.
     *
     * @param roleName the role name
     * @return the list
     */
    public List<Role> findByName(String roleName);
    
    List<Map<String,?>> getAllRolesByProcessId(Integer processId, Integer filterType, Integer roleId) throws SQLException;

	public List<Role>  findAll();

	/**
	 * Delete the role by id.
	 *
	 * @param id the id of the entity
	 * @throws SQLException the SQL exception
	 */

	public List<Role> getAllRolesByProcess(String process) throws SQLException;

	List<Role> getRolesByNameAndProjectId(String roleName, String projectId);

}
