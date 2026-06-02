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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.domain.UsmStage;
import com.lfn.iamp.usm.repository.UsmStageRepository;
import com.lfn.iamp.usm.service.IcmsProcessService;
import com.lfn.iamp.usm.service.ProjectService;
import com.lfn.iamp.usm.service.UsersService;
import com.lfn.iamp.usm.service.UsmStageService;

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
