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
import java.time.Clock;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.commons.lang3.SerializationUtils;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.annotation.service.impl.ConstantsServiceImplAbstract;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.OrgUnit;
import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.domain.Role;
import com.infosys.icets.iamp.usm.domain.UserProjectRole;
import com.infosys.icets.iamp.usm.domain.UserProjectRoleSummary;
import com.infosys.icets.iamp.usm.domain.UserProjectRoleSummary.Porfolio;
import com.infosys.icets.iamp.usm.domain.UserUnit;
import com.infosys.icets.iamp.usm.domain.Users;
import com.infosys.icets.iamp.usm.domain.UsmAuthToken;
import com.infosys.icets.iamp.usm.domain.UsmPortfolio;
import com.infosys.icets.iamp.usm.dto.UserProjectRoleDTO;
import com.infosys.icets.iamp.usm.dto.UsersDTO;
import com.infosys.icets.iamp.usm.repository.OrgUnitRepository;
import com.infosys.icets.iamp.usm.repository.UserProjectRoleRepository;
import com.infosys.icets.iamp.usm.repository.UserUnitRepository;
import com.infosys.icets.iamp.usm.service.CamundaUSM;
import com.infosys.icets.iamp.usm.service.InvalidTokenService;
import com.infosys.icets.iamp.usm.service.ProjectService;
import com.infosys.icets.iamp.usm.service.RoleService;
import com.infosys.icets.iamp.usm.service.UserProjectRoleService;
import com.infosys.icets.iamp.usm.service.UsersService;
import com.infosys.icets.iamp.usm.service.UsmPortfolioService;

// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing UserProjectRole.
 */
/**
 * @author icets
 */
@Service
@Transactional
@RefreshScope
public class UserProjectRoleServiceImpl implements UserProjectRoleService {

	/** The Constant DEFAULT_ROLE. */
	private static final String DEFAULT_ROLE = "IT Portfolio Manager";

	/** The Constant DEFAULT_PROJECT. */
	private static final String DEFAULT_PROJECT = "Acme";

	/** The Constant DEFAULT_PORTFOLIO. */
	private static final Integer DEFAULT_PORTFOLIO = 1;

	/** The users service. */
	@Autowired
	private UsersService usersService;

	/** The project service. */
	@Autowired
	private ProjectService projectService;

	/** The role service. */
	@Autowired
	private RoleService roleService;

	/** The portfolio service. */
	@Autowired
	private UsmPortfolioService portfolioService;

	/** The roles. */
	@LeapProperty("application.autouser.autoRoles")
	private String roles;

	/** The auto user project. */
	@LeapProperty("application.uiconfig.autoUserProject")
	private String autoUserProject;
	
	

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(UserProjectRoleServiceImpl.class);

	/** The user project role repository. */
	@Autowired
	private final UserProjectRoleRepository userProjectRoleRepository;

	/** The user unit repository. */
	private final UserUnitRepository userUnitRepository;

	/** The org unit repository. */
	private final OrgUnitRepository orgUnitRepository;
	
	@Autowired
	ConstantsServiceImplAbstract constantsServiceImplAbstract;

	/** The Constant default portfolio key. */
	private static final String DEFAULT_PORTFOLIO_KEY = "defaultPortfolio";

//	@LeapProperty("defaultPortfolio")
	private String defaultPortfolio;
	
	@Autowired(required = false)
	private CamundaUSM camundaUSM;
	
	@Autowired
	private  InvalidTokenService invalidTokenService;
	
	

	


	/*
	 * @Autowired private UserProjectRoleRepo userProjectRoleRepo;
	 */
	/**
	 * Instantiates a new user project role service impl.
	 *
	 * @param userProjectRoleRepository the user project role repository
	 * @param usersService              the users service
	 * @param projectService            the project service
	 * @param roleService               the role service
	 * @param portfolioService          the portfolio service
	 * @param userUnitRepository        the user unit repository
	 * @param orgUnitRepository         the org unit repository
	 */
	public UserProjectRoleServiceImpl(UserProjectRoleRepository userProjectRoleRepository, UsersService usersService,
			ProjectService projectService, RoleService roleService, UsmPortfolioService portfolioService,
			UserUnitRepository userUnitRepository, OrgUnitRepository orgUnitRepository,InvalidTokenService jwtTokenService) {
		this.userProjectRoleRepository = userProjectRoleRepository;
		this.usersService = usersService;
		this.projectService = projectService;
		this.roleService = roleService;
		this.portfolioService = portfolioService;
		this.userUnitRepository = userUnitRepository;
		this.orgUnitRepository = orgUnitRepository;
		this.invalidTokenService=jwtTokenService;
	}

	/**
	 * Save a user_project_role.
	 *
	 * @param userProjectRole the entity to save
	 * @return the persisted entity
	 * @throws SQLException the SQL exception
	 */
	@Override
	public UserProjectRole save(UserProjectRole userProjectRole) throws SQLException {
		logger.debug("Request to save UserProjectRole : {}", userProjectRole);
		return userProjectRoleRepository.save(userProjectRole);
	}

	/**
	 * Get all the user_project_roles.
	 *
	 * @param pageable the pagination information
	 * @return the list of entities
	 * @throws SQLException the SQL exception
	 */
	@Override
	@Transactional(readOnly = true)
	public Page<UserProjectRole> findAll(Pageable pageable) throws SQLException {
		logger.debug("Request to get all UserProjectRoles");
		return userProjectRoleRepository.findAll(pageable);
	}

	/**
	 * Get one user_project_role by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 * @throws SQLException the SQL exception
	 */
	@Override
	@Transactional(readOnly = true)
	public UserProjectRole findOne(Integer id) throws SQLException {
		logger.debug("Request to get UserProjectRole : {}", id);
		UserProjectRole content = null;
		Optional<UserProjectRole> value = userProjectRoleRepository.findById(id);
		if (value.isPresent()) {
			content = toDTO(value.get(), 1);
		}
		return content;

	}

	/**
	 * Delete the user_project_role by id.
	 *
	 * @param id the id of the entity
	 * @throws SQLException the SQL exception
	 */
	@Override
	public void delete(UserProjectRole userProjectRole) throws SQLException {
		logger.debug("Request to delete UserProjectRole : {}", userProjectRole.getId());
		userProjectRoleRepository.deleteById(userProjectRole.getId());
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
	public PageResponse<UserProjectRole> getAll(PageRequestByExample<UserProjectRole> req) throws SQLException {
		logger.debug("Request to get all UserProjectRole");
		Example<UserProjectRole> example = null;
		UserProjectRole userProjectRole = req.getExample();

		if (userProjectRole != null) {
			ExampleMatcher matcher = ExampleMatcher.matching() //
			;

			example = Example.of(userProjectRole, matcher);
		}

		Page<UserProjectRole> page;
		if (example != null) {
			page = userProjectRoleRepository.findAll(example, req.toPageable());
		} else {
			page = userProjectRoleRepository.findAll(req.toPageable());
		}
		List<UserProjectRole> temp=page.getContent().stream().map(this::toDTO).collect(Collectors.toList());
		temp.stream().forEach(userproject ->{
			Project project = new Project();
			project.setId(userproject.getProject_id().getId());
			project.setName(userproject.getProject_id().getName());
			userproject.setProject_id(project);
		});
		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(),temp);
	}

	/**
	 * Gets the user project role summary.
	 *
	 * @param userLogin the user login
	 * @return the user project role summary
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see com.infosys.icets.iamp.usm.service.UserProjectRoleService#
	 * getUserProjectRoleSummary(java.lang.String)
	 */
	public Optional<UserProjectRoleSummary> getUserProjectRoleSummary(String userLogin) {
		UserProjectRoleSummary userProjectRoleSummary = new UserProjectRoleSummary();

		Users user = usersService.findByUserLogin(userLogin);
		if (user == null) {
			logger.info("User doesn't exists in DB " + userLogin);
			return Optional.empty();
		}
		userProjectRoleSummary.setUserId(user);

		List<UserProjectRole> userProjectRoles = userProjectRoleRepository.findByUserId(user.getId());
		Map<UsmPortfolio, Map<Project, List<UserProjectRole>>> groupByPortfolios = userProjectRoles.stream()
				.collect(Collectors.groupingBy(UserProjectRole::getPortfolio_id,
						Collectors.groupingBy(UserProjectRole::getProject_id)));
		List<Porfolio> porfolios = new ArrayList<>();

		logger.info("groupByPortfolios - " + groupByPortfolios);

		groupByPortfolios.entrySet().stream().forEach(entry -> {
			UserProjectRoleSummary.Porfolio portfolio = userProjectRoleSummary.new Porfolio();
			portfolio.setPorfolioId(portfolioService.findOne(entry.getKey().getId()));
			List<UserProjectRoleSummary.ProjectWithRoles> projectWithRoles = new ArrayList<>();
			Map<Project, List<UserProjectRole>> projectRoles = entry.getValue();
			projectRoles.entrySet().stream().forEach(mapping -> {
				UserProjectRoleSummary.ProjectWithRoles projectWithRolesItem = userProjectRoleSummary.new ProjectWithRoles();
				try {
					projectWithRolesItem.setProjectId(projectService.findOne(mapping.getKey().getId()));
				} catch (SQLException e) {
					// TODO Auto-generated catch block
					logger.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
				}
				List<Role> rolesOfProject = new ArrayList<>();
				mapping.getValue().stream().forEach(value -> {
					try {
						rolesOfProject.add(roleService.findOne(value.getRole_id().getId()));
					} catch (SQLException e) {
						// TODO Auto-generated catch block
						logger.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
					}
				});
				projectWithRolesItem.setRoleId(rolesOfProject);
				projectWithRoles.add(projectWithRolesItem);
			});
			portfolio.setProjectWithRoles(projectWithRoles);
			defaultPortfolio = constantsServiceImplAbstract.findByKeys(DEFAULT_PORTFOLIO_KEY, "Core");
			if (defaultPortfolio != null && !defaultPortfolio.isBlank()
					&& portfolio.getPorfolioId().getPortfolioName().equalsIgnoreCase(defaultPortfolio))
				porfolios.add(0, portfolio);
			else
				porfolios.add(portfolio);
		});
//		porfolios.forEach(res -> {
//			  res.getProjectWithRoles().forEach(pr -> {
//				  if(pr.getProjectId().getId() == Integer.parseInt(autoUserProject)) {
//					  Collections.swap(porfolios, porfolios.indexOf(res), porfolios.size()-1);
//				  }
//				  
//			  });
//		});
		userProjectRoleSummary.setPorfolios(porfolios);
		return Optional.of(userProjectRoleSummary);
	}

	/**
	 * To DTO.
	 *
	 * @param userProjectRole the user project role
	 * @return the user project role
	 */
	public UserProjectRole toDTO(UserProjectRole userProjectRole) {
		return toDTO(userProjectRole, 1);
	}

	/**
	 * Converts the passed user_project_role to a DTO. The depth is used to control
	 * the amount of association you want. It also prevents potential infinite
	 * serialization cycles.
	 *
	 * @param userProjectRole the user project role
	 * @param depth           the depth of the serialization. A depth equals to 0,
	 *                        means no x-to-one association will be serialized. A
	 *                        depth equals to 1 means that xToOne associations will
	 *                        be serialized. 2 means, xToOne associations of xToOne
	 *                        associations will be serialized, etc.
	 * @return the user project role
	 */
	public UserProjectRole toDTO(UserProjectRole userProjectRole, int depth) {
		if (userProjectRole == null) {
			return null;
		}

		UserProjectRole dto = new UserProjectRole();

		dto.setId(userProjectRole.getId());

//		if (depth-- > 0) {
			dto.setUser_id(usersService.toDTO(userProjectRole.getUser_id(), depth));
			dto.setProject_id(projectService.toDTO(userProjectRole.getProject_id(), depth));
			dto.setRole_id(roleService.toDTO(userProjectRole.getRole_id(), depth));
			dto.setPortfolio_id(portfolioService.toDTO(userProjectRole.getPortfolio_id(), depth));
//		}
		return dto;
	}

	/**
	 * Creates the user with default mapping.
	 *
	 * @param user the user
	 * @return the user project role summary
	 * @throws SQLException the SQL exception
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see com.infosys.icets.iamp.usm.service.UserProjectRoleService#
	 * createUserWithDefaultMapping(com.infosys.icets.iamp.usm.domain.Users)
	 */
	@Override
	public UserProjectRoleSummary createUserWithDefaultMapping(Users user) throws SQLException {
		UserProjectRole userProjectRole = new UserProjectRole();
		List<UserProjectRole> userProjectRoleList = new ArrayList<UserProjectRole>();
		userProjectRole.setUser_id(user);
		Project project = projectService.findOne(Integer.parseInt(autoUserProject));
		userProjectRole.setProject_id(project);
		userProjectRole.setPortfolio_id(project.getPortfolioId());
		String[] roleArray = roles.split(",");
		for (int i = 0; i < roleArray.length; i++) {
			userProjectRole.setRole_id(roleService.findOne(Integer.parseInt(roleArray[i])));
			Clock cl = Clock.systemUTC(); 
			 ZonedDateTime  now = ZonedDateTime.now(cl);  
			   userProjectRole.setTime_stamp(now);
			UserProjectRole dummy = SerializationUtils.clone(userProjectRole);
			userProjectRoleList.add(dummy);
		}
		saveList(userProjectRoleList);
		if(camundaUSM!=null) {
			try {
				if(userProjectRoleList!=null && !userProjectRoleList.isEmpty()) {
					ModelMapper modelMapper = new ModelMapper();
					List<UserProjectRoleDTO>user_project_role_dto = userProjectRoleList.stream().map(source -> modelMapper.map(source, UserProjectRoleDTO.class)).collect(Collectors.toList());
					camundaUSM.createUserProjectRole(user_project_role_dto);
				}
			}
			catch(Exception e) {
				logger.error("Camunda Mapping already exists");
			}
		}

		return getUserProjectRoleSummary(user.getUser_login()).orElseThrow(SQLException::new);
	}

	/**
	 * Creates the user with default mapping.
	 *
	 * @param userName the user name
	 * @return the user project role summary
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see com.infosys.icets.iamp.usm.service.UserProjectRoleService#
	 * createUserWithDefaultMapping(java.lang.String)
	 */
	@Override
	public UserProjectRoleSummary createUserWithDefaultMapping(String userName) {
		Users user = usersService.createUserWithDefaultMapping(userName, userName, userName, userName);
		try {
			return this.createUserWithDefaultMapping(user);
		} catch (SQLException e) {
			logger.error("Unable to create user default mapping ", e);
		}
		return null;
	}

	/**
	 * Get the user_project_role of a particular user by its userLogin.
	 *
	 * @param name the userLogin of the user
	 * @return the map of project id and associated roles of the user
	 * @throws SQLException the SQL exception
	 */
	@Override
	public Map<Integer, List<Role>> findByUserIdUserLogin(String name) throws SQLException {
		List<UserProjectRole> projectRoleList = null;
		projectRoleList = userProjectRoleRepository.findByUserIdUserLogin(name);
		Map<Integer, List<Role>> projectRoleMap = new HashMap<Integer, List<Role>>();
		for (UserProjectRole userProjectRole : projectRoleList) {
			userProjectRole = toDTO(userProjectRole, 1);
			Integer projectId = userProjectRole.getProject_id().getId();
			Role role = userProjectRole.getRole_id();
			if (projectRoleMap.containsKey(projectId)) {
				projectRoleMap.get(projectId).add(role);
			} else {
				List<Role> roles = new ArrayList<Role>();
				roles.add(role);
				projectRoleMap.put(projectId, roles);
			}
		}

		return projectRoleMap;
	}

	/**
	 * Gets the mapped roles.
	 *
	 * @param userName the user name
	 * @return the mapped roles
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.infosys.icets.iamp.usm.service.UserProjectRoleService#getMappedRoles(java
	 * .lang.String)
	 */
	@Override
	public List<Integer> getMappedRoles(String userName) {
		return userProjectRoleRepository.getMappedRoles(usersService.findByUserLogin(userName).getId());
	}
	
	
	/**
	 * Gets the mapped roles for user loing and project id
	 *
	 * @param userName the user name
	 * @return the mapped roles
	 */
	@Override
	public List<Integer> getMappedRolesForUserLoginAndProject(String userName,Integer projectId) {
		return userProjectRoleRepository.getMappedRolesForUserLoginAndProject(userName,projectId);
	}
	

	/**
	 * Save list.
	 *
	 * @param user_project_role_list the user project role list
	 * @return the list
	 * @throws SQLException the SQL exception
	 */
	public List<UserProjectRole> saveList(List<UserProjectRole> user_project_role_list) throws SQLException {

		logger.debug("Request to save User Project Role : {}", user_project_role_list);
		List<UserProjectRole> userProjectRoleList = new ArrayList<UserProjectRole>();
//			user_project_role_list.stream().forEach(obj -> {
//				userProjectRoleList.add(toDTO(userProjectRoleRepository.save(obj), 1));				
//			});		
		userProjectRoleList = userProjectRoleRepository.saveAll(user_project_role_list);
		logger.debug("content size : {}", userProjectRoleList.size());

		return userProjectRoleList;

	}

	/**
	 * Register userwith default roles.
	 *
	 * @param user the user
	 * @return the user project role summary
	 * @throws SQLException the SQL exception
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.infosys.icets.iamp.usm.service.UsersService#registerUserwithDefaultRoles(
	 * com.infosys.icets.iamp.usm.domain.Users)
	 */
	@Override
	public UserProjectRoleSummary registerUserwithDefaultRoles(Users user) throws SQLException {
		logger.debug("Request to save Users : {}", user);
		user = usersService.save(user);
		Optional<OrgUnit> orgUnit = orgUnitRepository.findById(1);
		UserUnit userUnit = new UserUnit();
		if (orgUnit.isPresent()) {
			userUnit.setUnit(orgUnit.get());
		}
		userUnit.setUser(user);
		userUnitRepository.save(userUnit);
		UserProjectRoleSummary summary = createUserWithDefaultMapping(user);
		return summary;
	}

	/**
	 * Gets the paginated user project roles.
	 *
	 * @param prbe     the prbe
	 * @param pageable the pageable
	 * @return the paginated user project roles
	 */
	@Override
	public PageResponse<UserProjectRole> getPaginatedUserProjectRoles(PageRequestByExample<UserProjectRole> prbe,
			Pageable pageable) {
		logger.debug("Request to get all UserProjectRole");
		Example<UserProjectRole> example = null;
		UserProjectRole userProjectRole = prbe.getExample();

		if (userProjectRole != null) {
			ExampleMatcher matcher = ExampleMatcher.matching() //
			;

			example = Example.of(userProjectRole, matcher);
		}

		Page<UserProjectRole> page;
		if (example != null) {
			page = userProjectRoleRepository.findAll(example, pageable);
		} else {
			page = userProjectRoleRepository.findAll(pageable);
		}
		List<UserProjectRole> temp=page.getContent().stream().map(this::toDTO).collect(Collectors.toList());
		temp.stream().forEach(userproject ->{
			Project project = new Project();
			project.setId(userproject.getProject_id().getId());
			project.setName(userproject.getProject_id().getName());
			userproject.setProject_id(project);
		});
		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), temp);
	}

	/**
	 * Search.
	 *
	 * @param pageable the pageable
	 * @param prbe     the prbe
	 * @return the page response
	 */
	@Override
	public PageResponse<UserProjectRole> search(Pageable pageable, PageRequestByExample<UserProjectRole> prbe) {
		logger.debug("Request to get all UserProjectRole");
		Example<UserProjectRole> example = null;
		UserProjectRole userProjectRole = prbe.getExample();

		if (userProjectRole != null) {
			ExampleMatcher matcher = ExampleMatcher.matching() // example matcher Projectid.name,userid.userFirstname
					.withMatcher("project_id.name", match -> match.ignoreCase().contains())
					.withMatcher("user_id.user_f_name", match -> match.ignoreCase().contains())
					.withMatcher("role_id.name", match -> match.ignoreCase().contains());

			example = Example.of(userProjectRole, matcher);
		}

		Page<UserProjectRole> page;
		if (example != null) {
			page = userProjectRoleRepository.findAll(example, pageable);
		} else {
			page = userProjectRoleRepository.findAll(pageable);
		}
		List<UserProjectRole> temp=page.getContent().stream().map(this::toDTO).collect(Collectors.toList());
		temp.stream().forEach(userproject ->{
			Project project = new Project();
			project.setId(userproject.getProject_id().getId());
			project.setName(userproject.getProject_id().getName());
			userproject.setProject_id(project);
		});
		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), temp);
	}

	/**
	 * Gets the project list by user name.
	 *
	 * @param userLogin the user login
	 * @return the project list by user name
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see com.infosys.icets.iamp.usm.service.UserProjectRoleService#
	 * getProjectListByUserName(java.lang.String)
	 */
	@Override
	public List<Project> getProjectListByUserName(String userLogin) {
		List<UserProjectRole> userProjectRole = userProjectRoleRepository.findByUserIdUserLogin(userLogin).stream()
				.map(this::toDTO).collect(Collectors.toList());
		// filter userprojectroles
		List<Project> projects = userProjectRole.stream().map(obj -> obj.getProject_id()).distinct()
				.collect(Collectors.toList());
		// removing project logo
		projects.stream().forEach(obj -> obj.setLogo(null));

		return projects;
	}

	@Override
	public List<UserProjectRole> getUsersWithPermission(Integer projectId, Integer portfolioId, String permission) {
		List<UserProjectRole> userProjectRole = userProjectRoleRepository.getUsersWithPermission(projectId, portfolioId,
				permission);
		return userProjectRole;
	}
	
	@Override
	public List<Map<String,?>> getUsersByRoleId(Integer roleId, Integer projectId) throws SQLException{
		List<Object[]> userDetails = userProjectRoleRepository.getUsersByRoleId(roleId, projectId);
		List<Map<String,?>> updatedUserDetails = new ArrayList<Map<String,?>>();
		for(Object[] element : userDetails) {
			Map<String,Object> elementObject = new HashMap<String,Object>();
			elementObject.put("id",element[0]);
			elementObject.put("user_f_name",element[1]);
			elementObject.put("user_login",element[2]);
			updatedUserDetails.add(elementObject);
		}
		return updatedUserDetails;
	}

	@Override
	public UserProjectRole getUserProjectRole(Integer id) {
		return userProjectRoleRepository.getOne(id);
	}

	@Override
	public void addInvalidToken(UsmAuthToken token){
		this.invalidTokenService.addInvalidToken(token);

	}

	@Override
	public Boolean isInvalidToken(String token){	
		return this.invalidTokenService.isInvalidToken(token);
	}

	@Override
	public void deleteExpiredToken() {
		this.invalidTokenService.deleteAll();
	}
	
	/**
	 * check is any role is present for user
	 *
	 * @param user the project User
	 * @param projectId the project id
	 * @param roleId the role id
	 * @return the boolean
	 */
	
	@Override
	public Boolean isRoleExistsByUserAndProjectIdAndRoleId(String user,Integer projectId, Integer roleId) {	
		 if(userProjectRoleRepository.isRoleExistsByUserAndProjectIdAndRoleId(user,projectId,roleId)==0) return false ;
		 return true;
	}
	
	/**
	 * Find roleId .
	 *
	 * @param user the project User
	 * @param projectId the project id
	 * @param roleId the role id
	 * @return the boolean
	 */
	@Override
	public Integer getRoleIdByUserAndProjectIdAndRoleName(String user,Integer projectId, String roleName) {	
		return userProjectRoleRepository.getRoleIdByUserAndProjectIdAndRoleName(user,projectId,roleName);
	}

	
    @Override
	public List<Integer> getMappedRolesForUserLogin(String userName) {
		Integer userId = usersService.findByUserLogin(userName).getId();
		return userProjectRoleRepository.getMappedRolesForUserId(userId);
    }

	@Override
	public void deleteByUserRoleId(UsersDTO user) {
		 userProjectRoleRepository.deleteByUserRoleId(user.getId(),Integer.parseInt(autoUserProject));
	}

}