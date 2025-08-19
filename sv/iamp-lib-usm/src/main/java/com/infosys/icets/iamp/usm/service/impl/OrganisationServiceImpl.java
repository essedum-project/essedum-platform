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

package com.infosys.icets.iamp.usm.service.impl;

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

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.Organisation;
import com.infosys.icets.iamp.usm.repository.OrganisationRepository;
import com.infosys.icets.iamp.usm.service.ContextService;
import com.infosys.icets.iamp.usm.service.OrganisationService;

// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing Organisation.
 */
/**
* @author icets
*/
@Service
@Transactional
public class OrganisationServiceImpl implements OrganisationService{

    
    /** The context service. */
    private final ContextService contextService;
    
    /** The log. */
    private final Logger log = LoggerFactory.getLogger(OrganisationServiceImpl.class);

    /** The organisation repository. */
    private final OrganisationRepository organisationRepository;

    /**
     * Instantiates a new organisation service impl.
     *
     * @param organisationRepository the organisation repository
     * @param contextService the context service
     */
    public OrganisationServiceImpl(OrganisationRepository organisationRepository, ContextService contextService) {
        this.organisationRepository = organisationRepository;
        this.contextService = contextService;
    }

    /**
     * Save a organisation.
     *
     * @param organisation the entity to save
     * @return the persisted entity
     * @throws SQLException the SQL exception
     */
    @Override
    public Organisation save(Organisation organisation) throws SQLException{
        log.debug("Request to save Organisation : {}", organisation);
        return organisationRepository.save(organisation);
    }

    /**
     *  Get all the organisations.
     *
     * @param pageable the pagination information
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    @Override
    @Transactional(readOnly = true)
    public Page<Organisation> findAll(Pageable pageable) throws SQLException{
        log.debug("Request to get all Organisations");
        return organisationRepository.findAll(pageable);
    }

    /**
     *  Get one organisation by id.
     *
     * @param id the id of the entity
     * @return the entity
     * @throws SQLException the SQL exception
     */
    @Override
    @Transactional(readOnly = true)
    public Organisation getOne(Integer id) throws SQLException{
    	log.debug("Request to get Organisation : {}", id);     
    	Organisation content = null;
     Optional<Organisation> value = organisationRepository.findById(id);
        if (value.isPresent()) {
               content = toDTO(value.get(), 1);
        }
        return content;

    }

    /**
     *  deleteById the  organisation by id.
     *
     * @param id the id of the entity
     * @throws SQLException the SQL exception
     */
    @Override
    public void deleteById(Integer id) throws SQLException{
        log.debug("Request to deleteById Organisation : {}", id);
        organisationRepository.deleteById(id);
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
    public PageResponse<Organisation> getAll(PageRequestByExample<Organisation> req) throws SQLException{
        log.debug("Request to get all Organisation");
        Example<Organisation> example = null;
        Organisation organisation = req.getExample();

        if (organisation != null) {
            ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for name,description,status,createdby,modifiedby
                    .withMatcher("name", match -> match.ignoreCase().startsWith())
                    .withMatcher("decription", match -> match.ignoreCase().startsWith())
                    .withMatcher("status", match -> match.ignoreCase().startsWith())
                    .withMatcher("createdby", match -> match.ignoreCase().startsWith())
                    .withMatcher("modifiedby", match -> match.ignoreCase().startsWith())
;

            example = Example.of(organisation, matcher);
        }

        Page<Organisation> page;
        if (example != null) {
            page =  organisationRepository.findAll(example, req.toPageable());
        } else {
            page =  organisationRepository.findAll(req.toPageable());
        }

        return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
    }

    /**
     * To DTO.
     *
     * @param organisation the organisation
     * @return the organisation
     */
    public Organisation toDTO(Organisation organisation) {
        return toDTO(organisation, 1);
    }

    /**
     * Converts the passed organisation to a DTO. The depth is used to control the
     * amount of association you want. It also prevents potential infinite serialization cycles.
     *
     * @param organisation the organisation
     * @param depth the depth of the serialization. A depth equals to 0, means no x-to-one association will be serialized.
     *              A depth equals to 1 means that xToOne associations will be serialized. 2 means, xToOne associations of
     *              xToOne associations will be serialized, etc.
     * @return the organisation
     */
    public Organisation toDTO(Organisation organisation, int depth) {
        if (organisation == null) {
            return null;
        }

        Organisation dto = new Organisation();

            dto.setId(organisation.getId());
            dto.setName(organisation.getName());
            dto.setDecription(organisation.getDecription());
            dto.setStatus(organisation.getStatus());
            dto.setCreatedby(organisation.getCreatedby());
            dto.setCreateddate(organisation.getCreateddate());
            dto.setModifiedby(organisation.getModifiedby());
            dto.setModifieddate(organisation.getModifieddate());   
            dto.setCountry(organisation.getCountry());
            dto.setDivision(organisation.getDivision());
            dto.setLocation(organisation.getLocation());
            dto.setOnboarded(organisation.getOnboarded());
//         if (depth-- > 0) {
            dto.setContext(contextService.toDTO(organisation.getContext(), depth));
//        }
        return dto;
    }

}
