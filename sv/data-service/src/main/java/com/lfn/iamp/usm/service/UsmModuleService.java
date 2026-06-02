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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.domain.UsmModule;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing UsmModule.
 */
public interface UsmModuleService {

    /**
     * Save a usm_module.
     *
     * @param usm_module the entity to save
     * @return the persisted entity
     * @throws SQLException the SQL exception
     */
    UsmModule save(UsmModule usm_module) throws SQLException;

    /**
     *  Get all the usm_modules.
     *
     * @param pageable the pagination information
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    Page<UsmModule> findAll(Pageable pageable) throws SQLException;

    /**
     *  Get the "id" usm_module.
     *
     * @param id the id of the entity
     * @return the entity
     * @throws SQLException the SQL exception
     */
    UsmModule findOne(Integer id) throws SQLException;

    /**
     *  Delete the "id" usm_module.
     *
     * @param id the id of the entity
     * @throws SQLException the SQL exception
     */
    void delete(Integer id) throws SQLException;


    /**
     *  Get all the usm_modules with search.
     *
     * @param req the req
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    PageResponse<UsmModule> getAll(PageRequestByExample<UsmModule> req) throws SQLException;

    /**
     * To DTO.
     *
     * @param usm_module the usm module
     * @param depth the depth
     * @return the usm module
     */
    public UsmModule toDTO(UsmModule usm_module, int depth);

    Object getPaginatedUsmModulesList(Pageable pageable);
	
	PageResponse<UsmModule> search(Pageable pageable, PageRequestByExample<UsmModule> prbe);
    
}
