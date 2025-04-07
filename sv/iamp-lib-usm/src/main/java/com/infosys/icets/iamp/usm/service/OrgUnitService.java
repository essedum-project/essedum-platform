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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.OrgUnit;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing OrgUnit.
 */
/**
* @author icets
*/
public interface OrgUnitService {

    /**
     * Save a org_unit.
     *
     * @param org_unit the entity to save
     * @return the persisted entity
     * @throws SQLException the SQL exception
     */
    OrgUnit save(OrgUnit org_unit) throws SQLException;

    /**
     *  Get all the org_units.
     *
     * @param pageable the pagination information
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    Page<OrgUnit> findAll(Pageable pageable) throws SQLException;

    /**
     *  Get the "id" org_unit.
     *
     * @param id the id of the entity
     * @return the entity
     * @throws SQLException the SQL exception
     */
    OrgUnit getOne(Integer id) throws SQLException;

    /**
     *  deleteById the "id" org_unit.
     *
     * @param id the id of the entity
     * @throws SQLException the SQL exception
     */
    void deleteById(Integer id) throws SQLException;


    /**
     *  Get all the org_units with search.
     *
     * @param req the req
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    PageResponse<OrgUnit> getAll(PageRequestByExample<OrgUnit> req) throws SQLException;

    /**
     * To DTO.
     *
     * @param org_unit the org unit
     * @param depth the depth
     * @return the org unit
     */
    public OrgUnit toDTO(OrgUnit org_unit, int depth);
    
}
