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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.UsmStage;
import com.infosys.icets.iamp.usm.repository.UsmStageRepository;
import com.infosys.icets.iamp.usm.service.IcmsProcessService;
import com.infosys.icets.iamp.usm.service.ProjectService;
import com.infosys.icets.iamp.usm.service.UsersService;
import com.infosys.icets.iamp.usm.service.UsmStageService;

@Service
@Transactional
public class UsmStageServiceImpl implements UsmStageService {
	
	private final Logger log = LoggerFactory.getLogger(UsmStageServiceImpl.class);
	
	@Autowired
	private UsmStageRepository usmStageRepository;
	
	@Autowired
	private ProjectService projectService;
	
	@Autowired
	private UsersService usersService;
	
	@Autowired
	private IcmsProcessService icmsProcessService;

	@Override
	public UsmStage save(UsmStage usmStage) throws SQLException {
		log.debug("Request to save UsmStage : {}", usmStage);
		return usmStageRepository.save(usmStage);
	}

	@Override
	public Page<UsmStage> findAll(Pageable pageable) throws SQLException {
		log.debug("Request to get all UsmStages");
		return usmStageRepository.findAll(pageable);
	}

	@Override
	public UsmStage findOne(Integer id) throws SQLException {
		log.debug("Request to get UsmStage : {}", id);
		UsmStage content = null;
		Optional<UsmStage> value = usmStageRepository.findById(id);
	    if (value.isPresent()) {
	    	content = toDTO(value.get(), 1);
	    }
	    return content;
	}

	@Override
	public void delete(Integer id) throws SQLException {
		log.debug("Request to delete UsmStage : {}", id);
		usmStageRepository.deleteById(id);
	}
	
	public UsmStage toDTO(UsmStage usmStage) {
        return toDTO(usmStage, 1);
    }

	@Override
	public UsmStage toDTO(UsmStage usmStage, int depth) {
		if (usmStage == null) {
            return null;
        }
		
		UsmStage dto = new UsmStage();
		dto.setId(usmStage.getId());
		dto.setProject_id(projectService.toDTO(usmStage.getProject_id(), depth));
		dto.setUser_id(usersService.toDTO(usmStage.getUser_id(), depth));
		dto.setProcess_id(icmsProcessService.toDTO(usmStage.getProcess_id(), depth));
		dto.setStage_id(usmStage.getStage_id());
		
		return dto;
	}

	@Override
	public PageResponse<UsmStage> getAll(PageRequestByExample<UsmStage> req) throws SQLException {
		log.debug("Request to get all UsmStages");
        Example<UsmStage> example = null;
        UsmStage usmStage = req.getExample();

        if (usmStage != null) {
            ExampleMatcher matcher = ExampleMatcher.matching();

            example = Example.of(usmStage, matcher);
        }

        Page<UsmStage> page;
        if (example != null) {
            page =  usmStageRepository.findAll(example, req.toPageable());
        } else {
            page =  usmStageRepository.findAll(req.toPageable());
        }

        return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}

}
