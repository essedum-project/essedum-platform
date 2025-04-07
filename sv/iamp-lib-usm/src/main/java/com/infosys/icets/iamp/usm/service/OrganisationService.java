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
import com.infosys.icets.iamp.usm.domain.Organisation;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing Organisation.
 */
/**
* @author icets
*/
public interface OrganisationService {

    /**
     * Save a organisation.
     *
     * @param organisation the entity to save
     * @return the persisted entity
     * @throws SQLException the SQL exception
     */
    Organisation save(Organisation organisation) throws SQLException;

    /**
     *  Get all the organisations.
     *
     * @param pageable the pagination information
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    Page<Organisation> findAll(Pageable pageable) throws SQLException;

    /**
     *  Get the "id" organisation.
     *
     * @param id the id of the entity
     * @return the entity
     * @throws SQLException the SQL exception
     */
    Organisation getOne(Integer id) throws SQLException;

    /**
     *  deleteById the "id" organisation.
     *
     * @param id the id of the entity
     * @throws SQLException the SQL exception
     */
    void deleteById(Integer id) throws SQLException;


    /**
     *  Get all the organisations with search.
     *
     * @param req the req
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    PageResponse<Organisation> getAll(PageRequestByExample<Organisation> req) throws SQLException;

    /**
     * To DTO.
     *
     * @param organisation the organisation
     * @param depth the depth
     * @return the organisation
     */
    public Organisation toDTO(Organisation organisation, int depth);
	
    
}
