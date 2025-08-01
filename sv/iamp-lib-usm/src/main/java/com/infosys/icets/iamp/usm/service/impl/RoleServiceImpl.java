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
import com.infosys.icets.iamp.usm.domain.Role;
import com.infosys.icets.iamp.usm.domain.RoleProcess;
import com.infosys.icets.iamp.usm.repository.RoleProcessRepository;
import com.infosys.icets.iamp.usm.repository.RoleRepository;
import com.infosys.icets.iamp.usm.service.RoleService;

// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing Role.
 */
/**
 * @author icets
 */
@Service
@Transactional
public class RoleServiceImpl implements RoleService {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(RoleServiceImpl.class);

	/** The role repository. */
	private final RoleRepository roleRepository;

	/**
	 * Instantiates a new role service impl.
	 *
	 * @param roleRepository the role repository
	 */

	@Autowired
	private RoleProcessRepository roleProcessRepository;

	public RoleServiceImpl(RoleRepository roleRepository) {
		this.roleRepository = roleRepository;
	}

	/**
	 * Save a role.
	 *
	 * @param role the entity to save
	 * @return the persisted entity
	 * @throws SQLException the SQL exception
	 */
	@Override
	public Role save(Role role) throws SQLException {
		log.debug("Request to save Role : {}", role);
		return roleRepository.save(role);
	}

	/**
	 * Get all the roles.
	 *
	 * @param pageable the pagination information
	 * @return the list of entities
	 * @throws SQLException the SQL exception
	 */
	@Override
	@Transactional(readOnly = true)
	public Page<Role> findAll(Pageable pageable) throws SQLException {
		log.debug("Request to get all Roles");
		return roleRepository.findAll(pageable);
	}

	/**
	 * Get one role by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 * @throws SQLException the SQL exception
	 */
	@Override
	@Transactional(readOnly = true)
	public Role findOne(Integer id) throws SQLException {
		log.debug("Request to get Role : {}", id);
		Role content = null;
		Optional<Role> value = roleRepository.findById(id);
		if (value.isPresent()) {
			content = toDTO(value.get(), 0);
		}
		return content;

	}

	/**
	 * Delete the role by id.
	 *
	 * @param id the id of the entity
	 * @throws SQLException the SQL exception
	 */
	@Override
	public void delete(Role role) throws SQLException {
		log.debug("Request to delete Role : {}", role.getId());
		roleRepository.deleteById(role.getId());
	}

	/**
	 * Get all the widget_configurations.
	 *
	 * @param req the req
	 * @return the list of entities
	 * @throws SQLException the SQL exception
	 */
	@Override
	@Transactional(readOnly = true)
	public PageResponse<Role> getAll(PageRequestByExample<Role> req) throws SQLException {
		log.debug("Request to get all Role");
		Example<Role> example = null;
		Role role = req.getExample();

		if (role != null) {
			ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for name,description
					.withMatcher("name", match -> match.ignoreCase().startsWith())
					.withMatcher("description", match -> match.ignoreCase().startsWith());

			example = Example.of(role, matcher);
		}

		Page<Role> page;
		if (example != null) {
			page = roleRepository.findAll(example, req.toPageable());
		} else {
			page = roleRepository.findAll(req.toPageable());
		}

		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(),
				page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}

	/**
	 * To DTO.
	 *
	 * @param role the role
	 * @return the role
	 */
	public Role toDTO(Role role) {
		return toDTO(role, 0);
	}

	/**
	 * Converts the passed role to a DTO. The depth is used to control the amount of
	 * association you want. It also prevents potential infinite serialization
	 * cycles.
	 *
	 * @param role  the role
	 * @param depth the depth of the serialization. A depth equals to 0, means no
	 *              x-to-one association will be serialized. A depth equals to 1
	 *              means that xToOne associations will be serialized. 2 means,
	 *              xToOne associations of xToOne associations will be serialized,
	 *              etc.
	 * @return the role
	 */
	public Role toDTO(Role role, int depth) {
		if (role == null) {
			return null;
		}

		Role dto = new Role();

		dto.setId(role.getId());

		dto.setName(role.getName());

		dto.setDescription(role.getDescription());

		dto.setPermission(role.getPermission());
		dto.setProjectId(role.getProjectId());
		dto.setRoleadmin(role.getRoleadmin());
		dto.setProjectadmin(role.getProjectadmin());
		dto.setPortfolioId(role.getPortfolioId());
		dto.setProjectAdminId(role.getProjectAdminId());
		return dto;
	}

	/**
	 * Find by name.
	 *
	 * @param roleName the role name
	 * @return the list
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.infosys.icets.iamp.usm.service.RoleService#findByName(java.lang.String)
	 */
	@Override
	public List<Role> findByName(String roleName) {
		return roleRepository.findByName(roleName);
	}

	@Override
	@Transactional(readOnly = true)
	public List<Map<String, ?>> getAllRolesByProcessId(Integer processId, Integer filterType, Integer roleId)
			throws SQLException {
		log.debug("Request to get all Roles");
		List<Object[]> completeRoleList = roleRepository.getAllRolesByProcessId(processId);
		List<Object[]> roleDetails = completeRoleList;

		if (filterType == 0) { // All roles valid
			roleDetails = completeRoleList;
		} else {
			/** List Of All The Process-Role complete data */
			List<RoleProcess> roleProcessList = roleProcessRepository.findByRoleProcessIdentityProcessId(processId);

			/** Fetching Current Role Hierarchy */
			Integer currentRoleHeirarchy = null;
			for (int i = 0; i < roleProcessList.size(); i++) {
				if (roleProcessList.get(i).getRole_id().getId().equals(roleId)) {
					currentRoleHeirarchy = roleProcessList.get(i).getRole_hierarchy();
					break;
				}
			}

			/** Filtered List to be sent based on assigning criteria */
			List<Object[]> filteredRoleList = new ArrayList<Object[]>();

			if (filterType == 1) { // Lower in hierarchy
				for (RoleProcess roleProcess : roleProcessList) {
					if (roleProcess.getRole_hierarchy() > currentRoleHeirarchy) {
						Object[] element = new Object[] { roleProcess.getRole_id().getId(),
								roleProcess.getRole_id().getName() };
						filteredRoleList.add(element);
					}
				}
				roleDetails = filteredRoleList;

			} else if (filterType == 2) { // Equal and lower in hierarchy
				for (RoleProcess roleProcess : roleProcessList) {
					if (roleProcess.getRole_hierarchy() >= currentRoleHeirarchy) {
						Object[] element = new Object[] { roleProcess.getRole_id().getId(),
								roleProcess.getRole_id().getName() };
						filteredRoleList.add(element);
					}
				}
				roleDetails = filteredRoleList;

			} else { // Equal in hierarchy
				for (RoleProcess roleProcess : roleProcessList) {
					if (roleProcess.getRole_hierarchy().equals(currentRoleHeirarchy)) {
						Object[] element = new Object[] { roleProcess.getRole_id().getId(),
								roleProcess.getRole_id().getName() };
						filteredRoleList.add(element);
					}
				}
				roleDetails = filteredRoleList;
			}
		}

		List<Map<String, ?>> updatedRoleDetails = new ArrayList<Map<String, ?>>();
		for (Object[] element : roleDetails) {
			Map<String, Object> elementObject = new HashMap<String, Object>();
			elementObject.put("id", element[0]);
			elementObject.put("name", element[1]);
			updatedRoleDetails.add(elementObject);
		}

		return updatedRoleDetails;
	}

	@Override
	public List<Role> findAll() {
		return roleRepository.findAll();
	}
	
	@Override
	public List<Role> getAllRolesByProcess(String process) throws SQLException{
		return roleRepository.getAllRolesByProcess(process);
	}
	
	@Override
	public List<Role> getRolesByNameAndProjectId(String roleName,String projectId) {
		return roleRepository.findByNameAndProjectId(roleName,Integer.parseInt(projectId));
	}

}