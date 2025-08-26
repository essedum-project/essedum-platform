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
