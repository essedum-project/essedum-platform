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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.UsmModuleOrganisation;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing UsmModuleOrganisation.
 */
public interface UsmModuleOrganisationService {

    /**
     * Save a usm_module_organisation.
     *
     * @param usm_module_organisation the entity to save
     * @return the persisted entity
     * @throws SQLException the SQL exception
     */
    UsmModuleOrganisation save(UsmModuleOrganisation usm_module_organisation) throws SQLException;

    /**
     *  Get all the usm_module_organisations.
     *
     * @param pageable the pagination information
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    Page<UsmModuleOrganisation> findAll(Pageable pageable) throws SQLException;

    /**
     *  Get the "id" usm_module_organisation.
     *
     * @param id the id of the entity
     * @return the entity
     * @throws SQLException the SQL exception
     */
    UsmModuleOrganisation findOne(Integer id) throws SQLException;

    /**
     *  Delete the "id" usm_module_organisation.
     *
     * @param id the id of the entity
     * @throws SQLException the SQL exception
     */
    void delete(Integer id) throws SQLException;;


    /**
     *  Get all the usm_module_organisations with search.
     *
     * @param req the req
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    PageResponse<UsmModuleOrganisation> getAll(PageRequestByExample<UsmModuleOrganisation> req) throws SQLException;

    /**
     * To DTO.
     *
     * @param usm_module_organisation the usm module organisation
     * @param depth the depth
     * @return the usm module organisation
     */
    public UsmModuleOrganisation toDTO(UsmModuleOrganisation usm_module_organisation, int depth);

	/**
	 * Save list.
	 *
	 * @param usm_module_organisation the usm module organisation
	 * @return the list
	 * @throws SQLException the SQL exception
	 */
	List<UsmModuleOrganisation> saveList(List<UsmModuleOrganisation> usm_module_organisation) throws SQLException;
    
}
