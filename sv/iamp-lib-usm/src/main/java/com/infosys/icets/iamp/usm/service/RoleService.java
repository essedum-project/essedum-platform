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
