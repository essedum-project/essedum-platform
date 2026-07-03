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

package com.lfn.ai.comm.lib.util.annotation.service.impl;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;
import com.lfn.ai.comm.lib.util.service.configkeys.support.ConfigurationKeysService;
import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.domain.DashConstant;
import com.lfn.iamp.usm.domain.DashConstant2;
import com.lfn.iamp.usm.domain.Portfolio2;
import com.lfn.iamp.usm.domain.Project2;
import com.lfn.iamp.usm.repository.DashConstantRepository;
import com.lfn.iamp.usm.repository.DashConstantRepository2;

/**
 * Service Implementation for managing DashConstant.
 *
 * @author essedum
 */
public abstract class ConstantsServiceImplAbstract implements ConstantsService {

	/** The configurationkey service of comm lib util. */
	private final ConfigurationKeysService configurationKeysService;

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(ConstantsServiceImplAbstract.class);

	/** The dash constant repository. */
	private final DashConstantRepository dashConstantRepository;

	/** The dash constant repository. */
	protected final DashConstantRepository2 dashConstantRepository2;

	protected final Environment environment;

	protected ConstantsServiceImplAbstract(ConfigurationKeysService configurationKeysService,
			DashConstantRepository dashConstantRepository, DashConstantRepository2 dashConstantRepository2,
			Environment environment) {
		this.configurationKeysService = configurationKeysService;
		this.dashConstantRepository = dashConstantRepository;
		this.dashConstantRepository2 = dashConstantRepository2;
		this.environment = environment;
	}

	/**
	 * Save a dash_constant.
	 *
	 * @param dash_constant the entity to save
	 * @return the persisted entity
	 * @throws SQLException the SQL exception
	 */
	@Override
	public DashConstant save(DashConstant dashconstant) throws SQLException {
		log.debug("Request to save DashConstant : {}", dashconstant);
		DashConstant2 dashconstant2 = dashConstantRepository2.save(toDashConstant2(dashconstant));
		return toDashConstant(dashconstant2);
	}

	private DashConstant2 toDashConstant2(DashConstant dashconstant) {
		DashConstant2 dashconstant2  = new DashConstant2();
		dashconstant2.setId(dashconstant.getId());
		dashconstant2.setKeys(dashconstant.getKeys());
		dashconstant2.setProject_id(dashconstant.getProject_id().getId());
		dashconstant2.setProject_name(dashconstant.getProject_name());
		dashconstant2.setValue(dashconstant.getValue());
		dashconstant2.setPortfolio_id(dashconstant.getPortfolio_id() != null ? dashconstant.getPortfolio_id().getId() : null);
		return dashconstant2;
	}
	
	private DashConstant toDashConstant(DashConstant2 dashconstant2) {
		DashConstant dashconstant  = new DashConstant();
		dashconstant.setId(dashconstant2.getId());
		dashconstant.setKeys(dashconstant2.getKeys());
		Project2 project2 = new Project2();
		project2.setId(dashconstant2.getProject_id());
		dashconstant.setProject_id(project2);
		dashconstant.setProject_name(dashconstant2.getProject_name());
		dashconstant.setValue(dashconstant2.getValue());
		Portfolio2 portfolio2 = new Portfolio2();
		portfolio2.setId(dashconstant2.getPortfolio_id());
		dashconstant.setPortfolio_id(portfolio2);
		return dashconstant;
	}	

	/**
	 * Get all the dash_constants.
	 *
	 * @param pageable the pagination information
	 * @return the list of entities
	 * @throws SQLException the SQL exception
	 */
	@Override
	@Transactional(readOnly = true)
	public Page<DashConstant> findAll(Pageable pageable) throws SQLException {
		log.debug("Request to get all DashConstants");
		return dashConstantRepository.findAll(pageable);
	}

	/**
	 * Get one dash_constant by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 * @throws SQLException the SQL exception
	 */
	@Override
	@Transactional(readOnly = true)
	public DashConstant findOne(Integer id) throws SQLException {
		log.debug("Request to get DashConstant : {}", id);
		DashConstant content = null;
		Optional<DashConstant> value = dashConstantRepository.findById(id);
		if (value.isPresent()) {
			content = toDTO(value.get(), 1);
		}
		return content;

	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.lfn.iamp.ccl.service.DashConstantService#findByProjectId(com.
	 * lfn.iamp.usm.domain.Project)
	 */
	/**
	 * Find by project id.
	 *
	 * @param project the project
	 * @return the list
	 */
	@Override
	@Transactional(readOnly = true)
	public List<DashConstant> findByProjectId(Integer projectId) {
		log.debug("Request to get DashConstant : {}", projectId);
		return dashConstantRepository.findByProjectId(projectId);
	}

	/**
	 * Delete the dash_constant by id.
	 *
	 * @param id the id of the entity
	 * @throws SQLException the SQL exception
	 */
	@Override
	public void delete(Integer id) throws SQLException {
		log.debug("Request to delete DashConstant : {}", id);
		dashConstantRepository.deleteById(id);
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
	public PageResponse<DashConstant> getAll(PageRequestByExample<DashConstant> req) throws SQLException {
		log.debug("Request to get all DashConstant");
		Example<DashConstant> example = null;
		DashConstant dashConstant = req.getExample();

		if (dashConstant != null) {
			ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for project_name,keys
					.withMatcher("project_name", match -> match.ignoreCase().startsWith())
					.withMatcher("keys", match -> match.ignoreCase().startsWith());
			example = Example.of(dashConstant, matcher);
		}

		Page<DashConstant> page;
		if (example != null) {
			page = dashConstantRepository.findAll(example, req.toPageable());
		} else {
			page = dashConstantRepository.findAll(req.toPageable());
		}

		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(),
				page.getContent().stream().map(this::toDTO).toList());
	}

	/**
	 * To DTO.
	 *
	 * @param dashConstant the dash constant
	 * @return the dash constant
	 */
	public DashConstant toDTO(DashConstant dashConstant) {
		return toDTO(dashConstant, 1);
	}

	/**
	 * Converts the passed dash_constant to a DTO. The depth is used to control the
	 * amount of association you want. It also prevents potential infinite
	 * serialization cycles.
	 *
	 * @param dashConstant the dash constant
	 * @param depth         the depth of the serialization. A depth equals to 0,
	 *                      means no x-to-one association will be serialized. A
	 *                      depth equals to 1 means that xToOne associations will be
	 *                      serialized. 2 means, xToOne associations of xToOne
	 *                      associations will be serialized, etc.
	 * @return the dash constant
	 */
	public DashConstant toDTO(DashConstant dashConstant, int depth) {
		if (dashConstant == null) {
			return null;
		}

		DashConstant dto = new DashConstant();

		dto.setId(dashConstant.getId());

		dto.setProject_name(dashConstant.getProject_name());

		dto.setKeys(dashConstant.getKeys());

		dto.setValue(dashConstant.getValue());

		dto.setProject_id(dashConstant.getProject_id());

		dto.setPortfolio_id(dashConstant.getPortfolio_id());

		return dto;
	}

	/**
	 * Find all dash constants.
	 *
	 * @param projectId   the project id
	 * @param portfolioId the portfolio id
	 * @return the list
	 */
	@Override
	public List<DashConstant> findAllDashConstants(Integer projectId, Integer portfolioId) {
		log.debug("Request to get Dash Constants for caching");
		List<DashConstant> dashConstants = dashConstantRepository.findAllDashConstants(projectId, "%default");
		List<DashConstant> dashConstantDTOList = new ArrayList<>();
		dashConstants.forEach(dashConstant -> {
			DashConstant dashConstantDTO = setDashConstantDTO(dashConstant);
			dashConstantDTOList.add(dashConstantDTO);

		});
		if (projectId != 1) {
			List<DashConstant> dashConstantsSides = dashConstantRepository.findAllDashConstantsSides("Core", portfolioId, "%side");
			dashConstantsSides.forEach(dashConstant -> {
				DashConstant dashConstantDTO = setDashConstantDTO(dashConstant);
				dashConstantDTOList.add(dashConstantDTO);

			});
		}
		return dashConstantDTOList;
	}

	@Override
	public DashConstant getByKeys(String key, String project) {
		log.debug("Request to get dash-constants for essedumPropertyCache");
		DashConstant dashConstant = dashConstantRepository.findByKeys(key, project);
		if (dashConstant != null) {
			String element = dashConstant.getValue();
			int index1 = element.indexOf("@!");
			int index2 = element.indexOf("!@");
			if (index1 >= 0 && index2 > index1) {
				String newkey = element.substring(index1 + 2, index2);
				if (environment.containsProperty(newkey)) {
					dashConstant.setValue(createElement(element, environment.getProperty(newkey), index1, index2));
				}
			}
			dashConstant.setValue(element);
		}
		return dashConstant;
	}

	protected String createElement(String element, String value, int index1, int index2) {
		return element.substring(0, index1) + value + element.substring(index2 + 2);
	}

	@Override
	public List<DashConstant> getDashConstantsbyitemAndname(String item, String projectName) {
		return dashConstantRepository.findAllDashConstantsbyItemAndProject(item, projectName);
	}

	@Override
	public List<DashConstant> findAllKeys() {

		return dashConstantRepository.findAll();
	}

	@Override
	public HashMap<String, String> getConfigKeyMap() {

		HashMap<String, String> hmap = new HashMap<>();
		this.findAllKeys().forEach(x -> {
			if(x.getProject_id()!=null) {
				int projectId = x.getProject_id().getId();
			// To handle situation where core project id is 0 . Setting it 1 help in
			// searching the key
			if (x.getProject_name() != null && x.getProject_name().equalsIgnoreCase("core"))
				projectId = 1;
			hmap.put(projectId + " " + x.getKeys(), x.getValue());
			}
		});

		return hmap;
	}

	@Override
	public void refreshConfigKeyMap() {
		this.configurationKeysService.setConfigKeyMap(this.getConfigKeyMap());

	}

	/**
	 * Get the value of allowed extension key.
	 *
	 * @param project_id the project id
	 * @param key        the allowed extension key whose value to retrieve
	 *
	 *                   Gets the value of allowed extension key for the received
	 *                   project_id if available, otherwise gives the value for
	 *                   Core.
	 */
	@Override
	public String findExtensionKey(Integer projectId, String key) {
		log.debug("Request to get Extension Key");
		List<DashConstant> dashConstants = dashConstantRepository.findExtensionKey(key, projectId);

		if (dashConstants.isEmpty()) {
			return "";
		}
		List<DashConstant> list = dashConstants.stream()
				.filter(item -> item.getProject_id().getId().equals(projectId)).toList();
		if (!list.isEmpty()) {
			return list.get(0).getValue();
		}
		List<DashConstant> listForCore = dashConstants.stream()
				.filter(item -> item.getProject_name().equals("Core")).toList();
		return listForCore.isEmpty() ? "" : listForCore.get(0).getValue();
	}

	@Override
	public List<DashConstant> getDashConstantsForProcess(List<String> item, String projectName) {
		return dashConstantRepository.findAllDashConstantsForProcess(item, projectName);
	}
	
	private DashConstant setDashConstantDTO(DashConstant dashConstant) {
		DashConstant dashConstantDTO = new DashConstant();
		dashConstantDTO.setId(dashConstant.getId());
		dashConstantDTO.setKeys(dashConstant.getKeys());
		dashConstantDTO.setValue(dashConstant.getValue());
		dashConstantDTO.setProject_name(dashConstant.getProject_name());
		dashConstantDTO.setProject_id(dashConstant.getProject_id());
		dashConstantDTO.setPortfolio_id(dashConstant.getPortfolio_id());
		return dashConstantDTO;
	}
}