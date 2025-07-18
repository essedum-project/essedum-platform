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
import com.infosys.icets.iamp.usm.domain.UserUnit;
import com.infosys.icets.iamp.usm.repository.UserUnitRepository;
import com.infosys.icets.iamp.usm.service.ContextService;
import com.infosys.icets.iamp.usm.service.OrgUnitService;
import com.infosys.icets.iamp.usm.service.UserUnitService;
import com.infosys.icets.iamp.usm.service.UsersService;


// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing UserUnit.
 */
/**
* @author icets
*/
@Service
@Transactional
public class UserUnitServiceImpl implements UserUnitService{

    
    
    /** The context service. */
    private final ContextService contextService;
    
    
    /** The users service. */
    private final UsersService usersService;
    
   
    /** The org unit service. */
    private final OrgUnitService orgUnitService;
    

    /** The log. */
    private final Logger log = LoggerFactory.getLogger(UserUnitServiceImpl.class);

    /** The user unit repository. */
    private final UserUnitRepository userUnitRepository;

    /**
     * Instantiates a new user unit service impl.
     *
     * @param userUnitRepository the user unit repository
     * @param contextService the context service
     * @param usersService the users service
     * @param orgUnitService the org unit service
     */
    public UserUnitServiceImpl(UserUnitRepository userUnitRepository, ContextService contextService,UsersService usersService,OrgUnitService orgUnitService) {
        this.userUnitRepository = userUnitRepository;
        this.contextService=contextService;
        this.usersService=usersService;
        this.orgUnitService=orgUnitService;
    }

    /**
     * Save a user_unit.
     *
     * @param userUnit the entity to save
     * @return the persisted entity
     * @throws SQLException the SQL exception
     */
    @Override
    public UserUnit save(UserUnit userUnit) throws SQLException{
        log.debug("Request to save UserUnit : {}", userUnit);
        return userUnitRepository.save(userUnit);
    }

    /**
     *  Get all the user_units.
     *
     * @param pageable the pagination information
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    @Override
    @Transactional(readOnly = true)
    public Page<UserUnit> findAll(Pageable pageable) throws SQLException{
        log.debug("Request to get all UserUnits");
        return userUnitRepository.findAll(pageable);
    }

    /**
     *  Get one user_unit by id.
     *
     * @param id the id of the entity
     * @return the entity
     * @throws SQLException the SQL exception
     */
    @Override
    @Transactional(readOnly = true)
    public UserUnit getOne(Integer id) throws SQLException{
    	log.debug("Request to get UserUnit : {}", id);     
    	UserUnit content = null;
     Optional<UserUnit> value = userUnitRepository.findById(id);
        if (value.isPresent()) {
               content = toDTO(value.get(), 5);
        }
        return content;

    }

    /**
     *  deleteById the  user_unit by id.
     *
     * @param id the id of the entity
     * @throws SQLException the SQL exception
     */
    @Override
    public void deleteById(Integer id) throws SQLException{
        log.debug("Request to deleteById UserUnit : {}", id);
        userUnitRepository.deleteById(id);
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
    public PageResponse<UserUnit> getAll(PageRequestByExample<UserUnit> req) throws SQLException{
        log.debug("Request to get all UserUnit");
        Example<UserUnit> example = null;
        UserUnit userUnit = req.getExample();

        if (userUnit != null) {
            ExampleMatcher matcher = ExampleMatcher.matching() //
;

            example = Example.of(userUnit, matcher);
        }

        Page<UserUnit> page;
        if (example != null) {
            page =  userUnitRepository.findAll(example, req.toPageable());
        } else {
            page =  userUnitRepository.findAll(req.toPageable());
        }

        return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
    }

    /**
     * To DTO.
     *
     * @param userUnit the user unit
     * @return the user unit
     */
    public UserUnit toDTO(UserUnit userUnit) {
        return toDTO(userUnit, 5);
    }

    /**
     * Converts the passed user_unit to a DTO. The depth is used to control the
     * amount of association you want. It also prevents potential infinite serialization cycles.
     *
     * @param userUnit the user unit
     * @param depth the depth of the serialization. A depth equals to 0, means no x-to-one association will be serialized.
     *              A depth equals to 1 means that xToOne associations will be serialized. 2 means, xToOne associations of
     *              xToOne associations will be serialized, etc.
     * @return the user unit
     */
    public UserUnit toDTO(UserUnit userUnit, int depth) {
        if (userUnit == null) {
            return null;
        }

        UserUnit dto = new UserUnit();

            dto.setId(userUnit.getId());        
//         if (depth-- > 0) {
            dto.setContext(contextService.toDTO(userUnit.getContext(), depth));
            dto.setUser(usersService.toDTO(userUnit.getUser(), depth));
            dto.setUnit(orgUnitService.toDTO(userUnit.getUnit(), depth));
//        }
        return dto;
    }
    
}
