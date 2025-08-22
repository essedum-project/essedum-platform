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
import java.time.ZonedDateTime;
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

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.domain.Project2;
import com.infosys.icets.iamp.usm.domain.UserProjectRole;
import com.infosys.icets.iamp.usm.repository.ProjectRepository;
import com.infosys.icets.iamp.usm.repository.UserProjectRoleRepository;
import com.infosys.icets.iamp.usm.service.ProjectService;
import com.infosys.icets.iamp.usm.service.RoleService;
import com.infosys.icets.iamp.usm.service.UsmPortfolioService;

// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing Project.
 */
/**
 * @author icets
 */
@Service
@Transactional
public class ProjectServiceImpl implements ProjectService {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(ProjectServiceImpl.class);

	/** The project repository. */
	@Autowired
	private final ProjectRepository projectRepository;

	/** The portfolio service. */
	@Autowired
	private UsmPortfolioService portfolioService;

	@Autowired
	private RoleService roleService;

	/** The user project role repository. */
	@Autowired
	private UserProjectRoleRepository userProjectRoleRepository;

//	@Autowired
//	private  ProjectRepo projectRepo;

	// @Autowired
	// private UserProjectRoleRepo userProjectRoleRepo;

	/**
	 * Instantiates a new project service impl.
	 *
	 * @param projectRepository         the project repository
	 * @param portfolioService          the portfolio service
	 * @param userProjectRoleRepository the user project role repository
	 */
	public ProjectServiceImpl(ProjectRepository projectRepository, UsmPortfolioService portfolioService,
			UserProjectRoleRepository userProjectRoleRepository) {
		this.projectRepository = projectRepository;
		this.portfolioService = portfolioService;
		this.userProjectRoleRepository = userProjectRoleRepository;

	}

	/**
	 * Find by name.
	 *
	 * @param name the name
	 * @return the project
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see com.infosys.icets.iamp.usm.service.ProjectService#findByName(java.lang.
	 * String)
	 */
	@Override
	public Project findByName(String name) {
		return projectRepository.findByName(name);
	}

	/**
	 * Update project.
	 *
	 * @param projectId   the project id
	 * @param updatedDate the updated date
	 * @return the int
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see com.infosys.icets.iamp.usm.service.ProjectService#updateProject(int,
	 * java.time.ZonedDateTime)
	 */
	@Override
	public int updateProject(int projectId, ZonedDateTime updatedDate) {
		return projectRepository.updateProject(projectId, updatedDate);
	}

	/**
	 * Save a project.
	 *
	 * @param project the entity to save
	 * @return the persisted entity
	 * @throws SQLException the SQL exception
	 */
	@Override
	public Project save(Project project) throws SQLException {
		log.debug("Request to save Project : {}", project);
		if (project.getId() == null) {
			return projectRepository.save(project);
//			return projectRepository.findById(project.getId()).orElse(null);
		} else {
			Project content = findOne(project.getId());
			List<UserProjectRole> userProjectRoles = new ArrayList<>();
			userProjectRoles = userProjectRoleRepository.findByProjectIdId(project.getId());
			if (!(content.getPortfolioId().getId().equals(project.getPortfolioId().getId()))) {
				userProjectRoles = userProjectRoleRepository.findByProjectIdId(content.getId());
				// filter userProjectRoles
				userProjectRoles.forEach(action -> {
					action.setPortfolio_id(project.getPortfolioId());
				});
				userProjectRoleRepository.saveAll(userProjectRoles);
			}
//			userProjectRoles = userProjectRoles.stream().filter(obj -> obj.getPortfolio_id().getId() != content.getPortfolioId().getId())
//				.peek(obj -> obj.setPortfolio_id(project.getPortfolioId())).collect(Collectors.toList());		
		}
		return projectRepository.save(project);
	}

	/**
	 * Get all the projects.
	 *
	 * @param pageable the pagination information
	 * @return the list of entities
	 * @throws SQLException the SQL exception
	 */
	@Override
	@Transactional(readOnly = true)
	public Page<Project> findAll(Pageable pageable) throws SQLException {
		log.debug("Request to get all Projects - Pageable");
		return projectRepository.findAll(pageable);
	}

	/**
	 * Find all.
	 *
	 * @return the list
	 * @throws SQLException the SQL exception
	 */
	@Override
	@Transactional(readOnly = true)
	public List<Project> findAll() throws SQLException {
		log.debug("Request to get all Projects");
		return projectRepository.findAll();
	}

	/**
	 * Get one project by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 * @throws SQLException the SQL exception
	 */
	@Override
	@Transactional(readOnly = true)
	public Project findOne(Integer id) throws SQLException {
		log.debug("Request to get Project : {}", id);
		Project content = null;
		Optional<Project> value = projectRepository.findById(id);
		if (value.isPresent()) {
			content = toCompleteDTO(value.get(), 1);
		}
		return content;

	}

	/**
	 * Delete the project by id.
	 *
	 * @param id the id of the entity
	 * @throws SQLException the SQL exception
	 */
	@Override
	public void delete(Project project) throws SQLException {
		log.debug("Request to delete Project : {}", project.getId());
		projectRepository.deleteById(project.getId());
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
	public PageResponse<Project> getAll(PageRequestByExample<Project> req) throws SQLException {
		log.debug("Request to get all Project");
		Example<Project> example = null;
		Project project = req.getExample();

		if (project != null) {
			ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for name,description
					.withMatcher("name", match -> match.ignoreCase().startsWith())
					.withMatcher("description", match -> match.ignoreCase().startsWith());

			example = Example.of(project, matcher);
		}

		Page<Project> page;
		if (example != null) {
			page = projectRepository.findAll(example, req.toPageable());
		} else {
			page = projectRepository.findAll(req.toPageable());
		}

		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(),
				page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}

	/**
	 * To DTO.
	 *
	 * @param project the project
	 * @return the project
	 */
	public Project toDTO(Project project) {
		return toDTO(project, 1);
	}

	private Project toCompleteDTO(Project project, int depth) {
		if (project == null) {
			return null;
		}

		Project dto = new Project();
		dto.setId(project.getId());
		dto.setName(project.getName());
		dto.setDescription(project.getDescription());
		dto.setDefaultrole(project.getDefaultrole());
		dto.setLogoName(project.getLogoName());
		dto.setLogo(project.getLogo());
		dto.setProjectdisplayname(project.getProjectdisplayname());
		dto.setTheme(project.getTheme());
		dto.setDomainName(project.getDomainName());
		dto.setProductDetails(project.getProductDetails());
		dto.setTimeZone(project.getTimeZone());
		dto.setAzureOrgId(project.getAzureOrgId());
		dto.setLastUpdated(project.getLastUpdated());
		dto.setProvisioneddate(project.getProvisioneddate());
		dto.setDisableExcel(project.getDisableExcel());
		dto.setCreatedDate(project.getCreatedDate());
		dto.setProjectAutologin(project.getProjectAutologin());
		dto.setPortfolioId(portfolioService.toDTO(project.getPortfolioId(), depth));
		dto.setAutologinRole(roleService.toDTO(project.getAutologinRole(), depth));
		return dto;
	}

	/**
	 * Converts the passed project to a DTO. The depth is used to control the amount
	 * of association you want. It also prevents potential infinite serialization
	 * cycles.
	 *
	 * @param project the project
	 * @param depth   the depth of the serialization. A depth equals to 0, means no
	 *                x-to-one association will be serialized. A depth equals to 1
	 *                means that xToOne associations will be serialized. 2 means,
	 *                xToOne associations of xToOne associations will be serialized,
	 *                etc.
	 * @return the project
	 */
	public Project toDTO(Project project, int depth) {
		if (project == null) {
			return null;
		}
		Project dto = new Project();
		dto.setId(project.getId());
		dto.setName(project.getName());		
		dto.setProjectdisplayname(project.getProjectdisplayname());
		dto.setTheme(project.getTheme());
		dto.setDescription(project.getDescription());
		dto.setDefaultrole(project.getDefaultrole());
		
		if (depth-- > 0) {
			dto.setPortfolioId(portfolioService.toDTO(project.getPortfolioId(), depth));
		}
		return dto;
	}

	/**
	 * Gets the paginated project list.
	 *
	 * @param req      the req
	 * @param pageable the pageable
	 * @return the paginated project list
	 */
	@Override
	public PageResponse<Project> getPaginatedProjectList(PageRequestByExample<Project> req, Pageable pageable) {
		log.info("Request to get a page of Projects from DB  {} : start", pageable);
		Example<Project> example = null;
		Project project = req.getExample();
		if (project != null) {
			ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for name,description
					.withMatcher("name", match -> match.ignoreCase().startsWith())
					.withMatcher("description", match -> match.ignoreCase().startsWith());

			example = Example.of(project, matcher);
		}
		Page<Project> page;
		if (example != null) {
			page = projectRepository.findAll(example, pageable);
		} else {
			page = projectRepository.findAll(pageable);
		}
		log.info("Request to get a page of Projects from DB for  {} : end", pageable);

		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(),
				page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}

	/**
	 * Search.
	 *
	 * @param pageable the pageable
	 * @param prbe     the prbe
	 * @return the page response
	 */
	@Override
	public PageResponse<Project> search(Pageable pageable, PageRequestByExample<Project> prbe) {
		log.debug("Request to get all Project");
		Example<Project> example = null;
		Project project = prbe.getExample();
		if (project != null) {
			ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for name,description
					.withMatcher("name", match -> match.ignoreCase().contains())
					.withMatcher("description", match -> match.ignoreCase().contains());

			example = Example.of(project, matcher);
		}
		Page<Project> page;
		if (example != null) {
			page = projectRepository.findAll(example, pageable);
		} else {
			page = projectRepository.findAll(pageable);
		}

		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(),
				page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}

	/**
	 * Find all names.
	 *
	 * @return the list
	 */
	@Override
	public List<String> findAllNames() {
		return projectRepository.findAllNames();
	}

	/**
	 * Find project by name.
	 *
	 * @param name the name
	 * @return the project
	 */
	@Override
	public Project findProjectByName(String name) {
		return projectRepository.findByName(name);
	}

	@Override
	public List<Project> findProjectByPortfolio(Integer portfolioId) {
		// TODO Auto-generated method stub

		List<Project> projects = projectRepository.getProjectsById(portfolioId);
		return projects;
	}
	
	@Override
	public List<Project> findAllProjectByName(String projectName){
		
		Project project = new Project();
		project.setName(projectName);
		return projectRepository.findAll(Example.of(project));
		
	}
	/**
	 * Find projectId by name.
	 *
	 * @param projectName the projectName
	 * @return the projectId
	 */
	
	@Override
	public Integer getProjectIdByProjectName(String name) {
		return projectRepository.findByName(name).getId();
	}

	@Override
	public List<Integer> findProjectIdsForPortfolio(Integer portfolioId) {
		List<Integer> projectIdsList = projectRepository.findProjectIdsForPortfolio(portfolioId);
		return projectIdsList;
	}
	
}