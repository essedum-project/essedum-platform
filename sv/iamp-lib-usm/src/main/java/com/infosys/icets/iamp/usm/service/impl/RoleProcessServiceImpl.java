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
import java.util.ArrayList;
import java.util.List;
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
import com.infosys.icets.iamp.usm.domain.RoleProcess;
import com.infosys.icets.iamp.usm.repository.RoleProcessRepository;
import com.infosys.icets.iamp.usm.service.IcmsProcessService;
import com.infosys.icets.iamp.usm.service.RoleProcessService;

@Service
@Transactional
public class RoleProcessServiceImpl implements RoleProcessService {
	
	private final Logger log = LoggerFactory.getLogger(RoleProcessServiceImpl.class);
	
	@Autowired
    private  RoleProcessRepository roleProcessRepository ;
	
	@Autowired
	private IcmsProcessService icmsProcessService;

	public RoleProcessServiceImpl() {

	}
	
	public RoleProcessServiceImpl(IcmsProcessService icmsProcessService) {
		this.icmsProcessService = icmsProcessService;
	}
	
	@Override
	public RoleProcess save(RoleProcess roleProcess) throws SQLException {
		log.debug("Request to save RoleProcess : {}", roleProcess);
        return roleProcessRepository.save(roleProcess);
	}

	@Override
	public Page<RoleProcess> findAll(Pageable pageable) throws SQLException {
		log.debug("Request to get all RoleProcesses");
		return roleProcessRepository.findAll(pageable);
	}

	@Override
	public List<RoleProcess> findByRoleProcessIdentityProcessId(Integer id) throws SQLException {
		log.debug("Request to get RoleProcess having Process Id : {}", id);
		List<RoleProcess> result = new ArrayList<RoleProcess>();
	    List<RoleProcess> value = roleProcessRepository.findByRoleProcessIdentityProcessId(id);
	    if (!value.isEmpty()) {
	    	value.forEach(e -> {
	    		result.add(toDTO(e, 1));
	    	});
	    	
	    }
	    return result;
	}

	@Override
	public List<RoleProcess> findByRoleProcessIdentityRoleId(Integer id) throws SQLException {
		log.debug("Request to get RoleProcess having Role Id : {}", id);
		List<RoleProcess> result = new ArrayList<RoleProcess>();
	    List<RoleProcess> value = roleProcessRepository.findByRoleProcessIdentityRoleId(id);
	    if (!value.isEmpty()) {
	    	value.forEach(e -> {
	    		result.add(toDTO(e, 1));
	    	});
	    	
	    }
	    return result;
	}

	@Override
	public void deleteByRoleProcessIdentityProcessId(Integer id) throws SQLException {
		log.debug("Request to delete RoleProcess having Process Id : {}", id);
		roleProcessRepository.deleteByRoleProcessIdentityProcessId(id);
	}

	@Override
	public void deleteByRoleProcessIdentityRoleId(Integer id) throws SQLException {
		log.debug("Request to delete RoleProcess having Role Id : {}", id);
		roleProcessRepository.deleteByRoleProcessIdentityRoleId(id);
	}

	@Override
	public PageResponse<RoleProcess> getAll(PageRequestByExample<RoleProcess> req) throws SQLException {
		log.debug("Request to get all RoleProcesses");
        Example<RoleProcess> example = null;
        RoleProcess roleProcess = req.getExample();

        if (roleProcess != null) {
            ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for name,description,filename
                    .withMatcher("AlternateUser", match -> match.ignoreCase().startsWith())
                    .withMatcher("LoginId", match -> match.ignoreCase().startsWith())
                    .withMatcher("Comments", match -> match.ignoreCase().startsWith());

            example = Example.of(roleProcess, matcher);
        }

        Page<RoleProcess> page;
        if (example != null) {
            page =  roleProcessRepository.findAll(example, req.toPageable());
        } else {
            page =  roleProcessRepository.findAll(req.toPageable());
        }

        return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}

	public RoleProcess toDTO(RoleProcess roleProcess) {
        return toDTO(roleProcess, 1);
    }
	
	@Override
	public RoleProcess toDTO(RoleProcess roleProcess, int depth) {
		if (roleProcess == null) {
            return null;
        }

		RoleProcess dto = new RoleProcess();
		dto.setId(roleProcess.getId());
		dto.setProcess_id(icmsProcessService.toDTO(roleProcess.getProcess_id(), depth));
		dto.setRole_id(roleProcess.getRole_id());
		dto.setRole_hierarchy(roleProcess.getRole_hierarchy());
		dto.setLast_updated_date(roleProcess.getLast_updated_date());
		dto.setLast_updated_user(roleProcess.getLast_updated_user());
		dto.setIs_role_based_search_access(roleProcess.getIs_role_based_search_access());
		dto.setIs_role_based_reassign_access(roleProcess.getIs_role_based_reassign_access());
		dto.setIs_role_based_assign_access(roleProcess.getIs_role_based_assign_access());
		dto.setIs_role_based_transfer_access(roleProcess.getIs_role_based_transfer_access());
		dto.setIs_role_based_bulkPage_access(roleProcess.getIs_role_based_bulkPage_access());
		dto.setIs_role_based_manualPage_access(roleProcess.getIs_role_based_manualPage_access());
		dto.setProject_id(roleProcess.getProject_id());
		
		return dto;
	}
	
	public List<RoleProcess> saveRoleProcessList(List<RoleProcess> role_process_list) throws SQLException {
		List<RoleProcess> roleProcessList = new ArrayList<RoleProcess>();
		roleProcessList = roleProcessRepository.saveAll(role_process_list);
		return roleProcessList;
	}

}
