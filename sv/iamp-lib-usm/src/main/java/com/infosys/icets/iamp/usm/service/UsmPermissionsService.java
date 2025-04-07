/**
 * @ 2020 - 2021 Infosys Limited, Bangalore, India. All Rights Reserved.
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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.UsmPermissions;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing UsmPermissions.
 */
/**
* @author icets
*/
public interface UsmPermissionsService {

    /**
     * Save a usm_permissions.
     *
     * @param usm_permissions the entity to save
     * @return the persisted entity
     */
    UsmPermissions save(UsmPermissions usm_permissions);

    /**
     *  Get all the usm_permissionss.
     *
     *  @param pageable the pagination information
     *  @return the list of entities
     */
    Page<UsmPermissions> findAll(Pageable pageable);

    /**
     *  Get the "id" usm_permissions.
     *
     *  @param id the id of the entity
     *  @return the entity
     */
    UsmPermissions findOne(Integer id);

    /**
     *  Delete the "id" usm_permissions.
     *
     *  @param id the id of the entity
     */
    void delete(Integer id);


    /**
     *  Get all the usm_permissionss with search.
     *
     * @param req the req
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    PageResponse<UsmPermissions> getAll(PageRequestByExample<UsmPermissions> req) throws SQLException;

    /**
     * To DTO.
     *
     * @param usm_permissions the usm permissions
     * @param depth the depth
     * @return the usm permissions
     */
    public UsmPermissions toDTO(UsmPermissions usm_permissions, int depth);
    
	/**
 * Gets the permission by role and module.
 *
 * @param role the role
 * @param module the module
 * @return the permission by role and module
 */
List<UsmPermissions> getPermissionByRoleAndModule( Integer role, String module);
    
}
