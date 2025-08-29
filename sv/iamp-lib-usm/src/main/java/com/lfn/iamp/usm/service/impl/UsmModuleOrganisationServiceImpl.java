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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.domain.UsmModuleOrganisation;
import com.lfn.iamp.usm.repository.UsmModuleOrganisationRepository;
import com.lfn.iamp.usm.service.ProjectService;
import com.lfn.iamp.usm.service.UsmModuleOrganisationService;
import com.lfn.iamp.usm.service.UsmModuleService;


// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing UsmModuleOrganisation.
 */
@Service
@Transactional
public class UsmModuleOrganisationServiceImpl implements UsmModuleOrganisationService{

    
    /** The project service. */
    @Autowired
    private ProjectService projectService;
    
    /** The module service. */
    @Autowired
    private UsmModuleService moduleService;
    

    /** The log. */
    private final Logger log = LoggerFactory.getLogger(UsmModuleOrganisationServiceImpl.class);

    /** The usm module organisation repository. */
    private final UsmModuleOrganisationRepository usm_module_organisationRepository;

    /**
     * Instantiates a new usm module organisation service impl.
     *
     * @param usm_module_organisationRepository the usm module organisation repository
     * @param projectService the project service
     * @param moduleService the module service
     */
    public UsmModuleOrganisationServiceImpl(UsmModuleOrganisationRepository usm_module_organisationRepository,ProjectService projectService,UsmModuleService moduleService) {
        this.usm_module_organisationRepository = usm_module_organisationRepository;
        this.projectService=projectService;
        this.moduleService=moduleService;
    }

    /**
     * Save a usm_module_organisation.
     *
     * @param usm_module_organisation the entity to save
     * @return the persisted entity
     * @throws SQLException the SQL exception
     */
    @Override
    public UsmModuleOrganisation save(UsmModuleOrganisation usm_module_organisation) throws SQLException {
        log.debug("Request to save UsmModuleOrganisation : {}", usm_module_organisation);
        return usm_module_organisationRepository.save(usm_module_organisation);
    }

    /**
     *  Get all the usm_module_organisations.
     *
     * @param pageable the pagination information
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    @Override
    @Transactional(readOnly = true)
    public Page<UsmModuleOrganisation> findAll(Pageable pageable) throws SQLException{
        log.debug("Request to get all UsmModuleOrganisations");
        return usm_module_organisationRepository.findAll(pageable);
    }

    /**
     *  Get one usm_module_organisation by id.
     *
     * @param id the id of the entity
     * @return the entity
     * @throws SQLException the SQL exception
     */
    @Override
    @Transactional(readOnly = true)
    public UsmModuleOrganisation findOne(Integer id) throws SQLException{
        log.debug("Request to get UsmModuleOrganisation : {}", id);
        UsmModuleOrganisation content = null;
		Optional<UsmModuleOrganisation> value = usm_module_organisationRepository.findById(id);
		if (value.isPresent()) {
			content = toDTO(value.get(), 1);
		}
		return content;
    }

    /**
     *  Delete the  usm_module_organisation by id.
     *
     * @param id the id of the entity
     * @throws SQLException the SQL exception
     */
    @Override
    public void delete(Integer id) throws SQLException{
        log.debug("Request to delete UsmModuleOrganisation : {}", id);
        usm_module_organisationRepository.deleteById(id);
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
    public PageResponse<UsmModuleOrganisation> getAll(PageRequestByExample<UsmModuleOrganisation> req) throws SQLException{
        log.debug("Request to get all UsmModuleOrganisation");
        Example<UsmModuleOrganisation> example = null;
        UsmModuleOrganisation usm_module_organisation = req.getExample();

        if (usm_module_organisation != null) {
            ExampleMatcher matcher = ExampleMatcher.matching() //
                    .withMatcher("module", match -> match.ignoreCase().startsWith())
;

            example = Example.of(usm_module_organisation, matcher);
        }

        Page<UsmModuleOrganisation> page;
        if (example != null) {
            page =  usm_module_organisationRepository.findAll(example, req.toPageable());
        } else {
            page =  usm_module_organisationRepository.findAll(req.toPageable());
        }

        return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
    }

    /**
     * To DTO.
     *
     * @param usm_module_organisation the usm module organisation
     * @return the usm module organisation
     */
    public UsmModuleOrganisation toDTO(UsmModuleOrganisation usm_module_organisation) {
        return toDTO(usm_module_organisation, 2);
    }

    /**
     * Converts the passed usm_module_organisation to a DTO. The depth is used to control the
     * amount of association you want. It also prevents potential infinite serialization cycles.
     *
     * @param usm_module_organisation the usm module organisation
     * @param depth the depth of the serialization. A depth equals to 0, means no x-to-one association will be serialized.
     *              A depth equals to 1 means that xToOne associations will be serialized. 2 means, xToOne associations of
     *              xToOne associations will be serialized, etc.
     * @return the usm module organisation
     */
    public UsmModuleOrganisation toDTO(UsmModuleOrganisation usm_module_organisation, int depth) {
        if (usm_module_organisation == null) {
            return null;
        }

        UsmModuleOrganisation dto = new UsmModuleOrganisation();

            dto.setId(usm_module_organisation.getId());

            

            dto.setStartdate(usm_module_organisation.getStartdate());

            dto.setEnddate(usm_module_organisation.getEnddate());

            dto.setSubscriptionstatus(usm_module_organisation.getSubscriptionstatus());
            dto.setSubscription(usm_module_organisation.getSubscription());
        
//         if (depth-- > 0) {
            dto.setOrganisation(projectService.toDTO(usm_module_organisation.getOrganisation(), depth));
            dto.setModule(moduleService.toDTO(usm_module_organisation.getModule(), depth));
//        }
        return dto;
    }

	/**
	 * Save list.
	 *
	 * @param usm_module_organisation_list the usm module organisation list
	 * @return the list
	 * @throws SQLException the SQL exception
	 */
	@Override
	public List<UsmModuleOrganisation> saveList(List<UsmModuleOrganisation> usm_module_organisation_list)
			throws SQLException {
		
		log.debug("Request to save UsmModuleOrganisation : {}", usm_module_organisation_list);
		List<UsmModuleOrganisation> usmModuleOrganisationList = new ArrayList<UsmModuleOrganisation>();	
		usmModuleOrganisationList = usm_module_organisationRepository.saveAll(usm_module_organisation_list);
		log.debug("content size : {}", usmModuleOrganisationList.size());
		
		return usmModuleOrganisationList;
	}

    
}