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
import com.lfn.iamp.usm.domain.OrgUnit;
import com.lfn.iamp.usm.repository.OrgUnitRepository;
import com.lfn.iamp.usm.service.ContextService;
import com.lfn.iamp.usm.service.OrgUnitService;
import com.lfn.iamp.usm.service.OrganisationService;

// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing OrgUnit.
 */
/**
* @author essedum
*/
@Service
@Transactional
public class OrgUnitServiceImpl implements OrgUnitService{

    
    /** The context service. */
    private final ContextService contextService;
    
    
    /** The organisation service. */
    private final OrganisationService organisationService;
    
    /** The log. */
    private final Logger log = LoggerFactory.getLogger(OrgUnitServiceImpl.class);

    /** The org unit repository. */
    private final OrgUnitRepository orgUnitRepository;

    /**
     * Instantiates a new org unit service impl.
     *
     * @param org_unitRepository the org unit repository
     * @param contextService the context service
     * @param organisationService the organisation service
     */
    public OrgUnitServiceImpl(OrgUnitRepository org_unitRepository, ContextService contextService,OrganisationService organisationService) {
        this.orgUnitRepository = org_unitRepository;
        this.contextService = contextService;
        this.organisationService=organisationService;
    }

    /**
     * Save a org_unit.
     *
     * @param orgUnit the entity to save
     * @return the persisted entity
     * @throws SQLException the SQL exception
     */
    @Override
    public OrgUnit save(OrgUnit orgUnit) throws SQLException{
        log.debug("Request to save OrgUnit : {}", orgUnit);
        return orgUnitRepository.save(orgUnit);
    }

    /**
     *  Get all the org_units.
     *
     * @param pageable the pagination information
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    @Override
    @Transactional(readOnly = true)
    public Page<OrgUnit> findAll(Pageable pageable) throws SQLException{
        log.debug("Request to get all OrgUnits");
        return orgUnitRepository.findAll(pageable);
    }

    /**
     *  Get one org_unit by id.
     *
     * @param id the id of the entity
     * @return the entity
     * @throws SQLException the SQL exception
     */
    @Override
    @Transactional(readOnly = true)
    public OrgUnit getOne(Integer id) throws SQLException{
    	log.debug("Request to get OrgUnit : {}", id);     
    	OrgUnit content = null;
     Optional<OrgUnit> value = orgUnitRepository.findById(id);
        if (value.isPresent()) {
               content = toDTO(value.get(), 5);
        }
        return content;
    }

    /**
     *  deleteById the  org_unit by id.
     *
     * @param id the id of the entity
     * @throws SQLException the SQL exception
     */
    @Override
    public void deleteById(Integer id) throws SQLException{
        log.debug("Request to deleteById OrgUnit : {}", id);
        orgUnitRepository.deleteById(id);
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
    public PageResponse<OrgUnit> getAll(PageRequestByExample<OrgUnit> req) throws SQLException{
        log.debug("Request to get all OrgUnit");
        Example<OrgUnit> example = null;
        OrgUnit orgUnit = req.getExample();

        if (orgUnit != null) {
            ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for name,description
                    .withMatcher("name", match -> match.ignoreCase().startsWith())
                    .withMatcher("description", match -> match.ignoreCase().startsWith())
;

            example = Example.of(orgUnit, matcher);
        }

        Page<OrgUnit> page;
        if (example != null) {
            page =  orgUnitRepository.findAll(example, req.toPageable());
        } else {
            page =  orgUnitRepository.findAll(req.toPageable());
        }

        return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
    }

    /**
     * To DTO.
     *
     * @param orgUnit the org unit
     * @return the org unit
     */
    public OrgUnit toDTO(OrgUnit orgUnit) {
        return toDTO(orgUnit, 5);
    }

    /**
     * Converts the passed org_unit to a DTO. The depth is used to control the
     * amount of association you want. It also prevents potential infinite serialization cycles.
     *
     * @param orgUnit the org unit
     * @param depth the depth of the serialization. A depth equals to 0, means no x-to-one association will be serialized.
     *              A depth equals to 1 means that xToOne associations will be serialized. 2 means, xToOne associations of
     *              xToOne associations will be serialized, etc.
     * @return the org unit
     */
    public OrgUnit toDTO(OrgUnit orgUnit, int depth) {
        if (orgUnit == null) {
            return null;
        }

        OrgUnit dto = new OrgUnit();

            dto.setId(orgUnit.getId());
            dto.setName(orgUnit.getName());
            dto.setDescription(orgUnit.getDescription());       
            dto.setOnboarded(orgUnit.getOnboarded());  
//         if (depth-- > 0) {
            dto.setContext(contextService.toDTO(orgUnit.getContext(), depth));
            dto.setOrganisation(organisationService.toDTO(orgUnit.getOrganisation(), depth));
//        }
        return dto;
    }

    
}
