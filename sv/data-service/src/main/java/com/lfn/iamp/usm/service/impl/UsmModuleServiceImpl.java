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

package com.lfn.iamp.usm.service.impl;

import java.sql.SQLException;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.domain.UsmModule;
import com.lfn.iamp.usm.repository.UsmModuleRepository;
import com.lfn.iamp.usm.service.UsmModuleService;



// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing UsmModule.
 */
@Service
@Transactional
public class UsmModuleServiceImpl implements UsmModuleService{

    

    /** The log. */
    private final Logger log = LoggerFactory.getLogger(UsmModuleServiceImpl.class);

    /** The usm module repository. */
    private final UsmModuleRepository usm_moduleRepository;

    /**
     * Instantiates a new usm module service impl.
     *
     * @param usm_moduleRepository the usm module repository
     */
    public UsmModuleServiceImpl(UsmModuleRepository usm_moduleRepository) {
        this.usm_moduleRepository = usm_moduleRepository;
    }

    /**
     * Save a usm_module.
     *
     * @param usm_module the entity to save
     * @return the persisted entity
     * @throws SQLException the SQL exception
     */
    @Override
    public UsmModule save(UsmModule usm_module) throws SQLException{
        log.debug("Request to save UsmModule : {}", usm_module);
        return usm_moduleRepository.save(usm_module);
    }

    /**
     *  Get all the usm_modules.
     *
     * @param pageable the pagination information
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    @Override
    @Transactional(readOnly = true)
    public Page<UsmModule> findAll(Pageable pageable) throws SQLException{
        log.debug("Request to get all UsmModules");
        return usm_moduleRepository.findAll(pageable);
    }

    /**
     *  Get one usm_module by id.
     *
     * @param id the id of the entity
     * @return the entity
     * @throws SQLException the SQL exception
     */
    @Override
    @Transactional(readOnly = true)
    public UsmModule findOne(Integer id)  throws SQLException{
        log.debug("Request to get UsmModule : {}", id);
        UsmModule content = null;
		Optional<UsmModule> value = usm_moduleRepository.findById(id);
		if (value.isPresent()) {
			content = toDTO(value.get(), 1);
		}
		return content;
    }

    /**
     *  Delete the  usm_module by id.
     *
     * @param id the id of the entity
     * @throws SQLException the SQL exception
     */
    @Override
    public void delete(Integer id) throws SQLException{
        log.debug("Request to delete UsmModule : {}", id);
        usm_moduleRepository.deleteById(id);
    }

     /**
      *  Get all the widget_configurations.
      *
      * @param req the req
      * @return the list of entities
      * @throws SQLException the SQL exception
      */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<UsmModule> getAll(PageRequestByExample<UsmModule> req) throws SQLException{
        log.debug("Request to get all UsmModule");
        Example<UsmModule> example = null;
        UsmModule usm_module = req.getExample();

        if (usm_module != null) {
            ExampleMatcher matcher = ExampleMatcher.matching() //
                    .withMatcher("name", match -> match.ignoreCase().startsWith())
;

            example = Example.of(usm_module, matcher);
        }

        Page<UsmModule> page;
        if (example != null) {
            page =  usm_moduleRepository.findAll(example, req.toPageable());
        } else {
            page =  usm_moduleRepository.findAll(req.toPageable());
        }

        return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
    }

    /**
     * To DTO.
     *
     * @param usm_module the usm module
     * @return the usm module
     */
    public UsmModule toDTO(UsmModule usm_module) {
        return toDTO(usm_module, 0);
    }

    /**
     * Converts the passed usm_module to a DTO. The depth is used to control the
     * amount of association you want. It also prevents potential infinite serialization cycles.
     *
     * @param usm_module the usm module
     * @param depth the depth of the serialization. A depth equals to 0, means no x-to-one association will be serialized.
     *              A depth equals to 1 means that xToOne associations will be serialized. 2 means, xToOne associations of
     *              xToOne associations will be serialized, etc.
     * @return the usm module
     */
    public UsmModule toDTO(UsmModule usm_module, int depth) {
        if (usm_module == null) {
            return null;
        }

        UsmModule dto = new UsmModule();

            dto.setId(usm_module.getId());

            dto.setName(usm_module.getName());
            // dto.setDisplay_name(usm_module.getDisplay_name());
            // dto.setDescriptions(usm_module.getDescriptions());
            // dto.setUsers_count(usm_module.getUsers_count());
            // dto.setModule_type(usm_module.getModule_type());
            // dto.setUrl(usm_module.getUrl());
        
           return dto;
    }

    @Override
	public PageResponse<UsmModule> getPaginatedUsmModulesList(Pageable pageable) {
		log.info("Request to get a page of modules from DB  {} : start",  pageable);
		Page<UsmModule> page = usm_moduleRepository.findAll(pageable);
		log.info("Request to get a page of modules from DB for  {} : end",  pageable);
		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}
    
    @Override
	public PageResponse<UsmModule> search(Pageable pageable, PageRequestByExample<UsmModule> prbe) {
		log.debug("Request to get all Users");
		Example<UsmModule> example = null;
		UsmModule usmModule = prbe.getExample();
		if (usmModule != null) {
			ExampleMatcher matcher = ExampleMatcher.matching() 
					.withMatcher("name", match -> match.ignoreCase().contains());
			example = Example.of(usmModule, matcher);
		}
		Page<UsmModule> page;
		if (example != null) {
			page = usm_moduleRepository.findAll(example, pageable);
		}
		else {
			page = usm_moduleRepository.findAll(pageable);
		}
		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}


    
}