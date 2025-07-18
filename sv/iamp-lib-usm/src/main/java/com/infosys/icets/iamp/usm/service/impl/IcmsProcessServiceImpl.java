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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
import com.infosys.icets.iamp.usm.domain.IcmsProcess;
import com.infosys.icets.iamp.usm.repository.IcmsProcessRepository;
import com.infosys.icets.iamp.usm.service.IcmsProcessService;
import com.infosys.icets.iamp.usm.service.ProjectService;

@Service
@Transactional
public class IcmsProcessServiceImpl implements IcmsProcessService {

	private final Logger log = LoggerFactory.getLogger(IcmsProcessServiceImpl.class);
	
	@Autowired
    private  IcmsProcessRepository icmsProcessRepository;
	
	@Autowired
	private ProjectService projectService;
	
	public IcmsProcessServiceImpl(IcmsProcessRepository icmsProcessRepository) {
        this.icmsProcessRepository = icmsProcessRepository;
    }
	
	@Override
    public IcmsProcess save(IcmsProcess icmsProcess) throws SQLException {
        log.debug("Request to save Process : {}", icmsProcess);
        return icmsProcessRepository.save(icmsProcess);
    }

	@Override
	@Transactional(readOnly = true)
	public Page<IcmsProcess> findAll(Pageable pageable) throws SQLException {
		log.debug("Request to get all Processes");
		return icmsProcessRepository.findAll(pageable);
	}

	@Override
	public IcmsProcess findOne(Integer id) throws SQLException {
		log.debug("Request to get Process : {}", id);
	    IcmsProcess content = null;
	    Optional<IcmsProcess> value = icmsProcessRepository.findById(id);
	    if (value.isPresent()) {
	    	content = toDTO(value.get(), 1);
	    }
	    return content;
	}

	@Override
	public void delete(Integer id) throws SQLException {
		log.debug("Request to delete Process : {}", id);
		icmsProcessRepository.deleteById(id);
	}

	@Override
	public PageResponse<IcmsProcess> getAll(PageRequestByExample<IcmsProcess> req) throws SQLException {
		log.debug("Request to get all Processes");
        Example<IcmsProcess> example = null;
        IcmsProcess icmsProcess = req.getExample();

        if (icmsProcess != null) {
            ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for name,description,filename
                    .withMatcher("AlternateUser", match -> match.ignoreCase().startsWith())
                    .withMatcher("LoginId", match -> match.ignoreCase().startsWith())
                    .withMatcher("Comments", match -> match.ignoreCase().startsWith());

            example = Example.of(icmsProcess, matcher);
        }

        Page<IcmsProcess> page;
        if (example != null) {
            page =  icmsProcessRepository.findAll(example, req.toPageable());
        } else {
            page =  icmsProcessRepository.findAll(req.toPageable());
        }

        return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}
	
	public IcmsProcess toDTO(IcmsProcess icmsProcess) {
        return toDTO(icmsProcess, 1);
    }

	@Override
	public IcmsProcess toDTO(IcmsProcess icmsProcess, int depth) {
		if (icmsProcess == null) {
            return null;
        }

		IcmsProcess dto = new IcmsProcess();
		dto.setProcess_id(icmsProcess.getProcess_id());
		dto.setProcess_name(icmsProcess.getProcess_name());
		dto.setProcess_display_name(icmsProcess.getProcess_display_name());
		dto.setProcess_description(icmsProcess.getProcess_description());
		dto.setWorkflow_id(icmsProcess.getWorkflow_id());
		dto.setIs_active(icmsProcess.getIs_active());
		dto.setCreated_date(icmsProcess.getCreated_date());
		dto.setLast_updated_date(icmsProcess.getLast_updated_date());
		dto.setLast_updated_user(icmsProcess.getLast_updated_user());
		dto.setProject_id(projectService.toDTO(icmsProcess.getProject_id(), depth));
		
		return dto;
	}
	
	@Override
	@Transactional(readOnly = true)
	public List<Map<String,?>> getAllProcessesByUserRole(Integer userId, Integer projectid) throws SQLException {
		log.debug("Request to get all Processes");
		List<Object[]> processDetails = icmsProcessRepository.getAllProcessesByUserRole(userId,projectid);
		List<Map<String,?>> updatedProcessDetails = new ArrayList<Map<String,?>>();
		for(Object[] element : processDetails) {
			Map<String,Object> elementObject = new HashMap<String,Object>();
			elementObject.put("process_id",element[0]);
			elementObject.put("process_name",element[1]);
			elementObject.put("process_display_name",element[1]);
			updatedProcessDetails.add(elementObject);
		}
		return updatedProcessDetails;
	}
	
}
