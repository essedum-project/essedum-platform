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
