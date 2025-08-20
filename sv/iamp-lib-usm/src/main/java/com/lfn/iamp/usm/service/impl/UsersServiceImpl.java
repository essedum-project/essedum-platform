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
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import jakarta.persistence.EntityNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.config.Constants;
import com.lfn.iamp.usm.config.Messages;
import com.lfn.iamp.usm.domain.UserProjectRole;
import com.lfn.iamp.usm.domain.Users;
import com.lfn.iamp.usm.dto.UserPartialDTO;
import com.lfn.iamp.usm.repository.UserProjectRoleRepository;
import com.lfn.iamp.usm.repository.UserUnitRepository;
import com.lfn.iamp.usm.repository.UsersRepository;
import com.lfn.iamp.usm.service.ContextService;
import com.lfn.iamp.usm.service.UserProjectRoleService;
import com.lfn.iamp.usm.service.UsersService;

// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing Users.
 */
/**
 * @author essedum
 */
@Service
@Transactional
@RefreshScope
public class UsersServiceImpl implements UsersService {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(UsersServiceImpl.class);

	/** The users repository. */
	@Autowired
	private final UsersRepository usersRepository;

	/** The context service. */
	private final ContextService contextService;

	/** The user unit repository. */
	private final UserUnitRepository userUnitRepository;

	/** The encoder. */
	private final PasswordEncoder passwordEncoder;

	/** The default PWD. */
	@EssedumProperty("application.autouser.defaultPWD")
	private String defaultPWD;

	@Autowired
	private final AzureUserServiceImpl azureService;

	@Autowired
	private UserProjectRoleService userProjectRoleService;
	
	
	/** The user project role repository. */
	@Autowired
	private UserProjectRoleRepository userProjectRoleRepository;

	@EssedumProperty("application.azure.inviteAzureUsers")
	private String inviteAzureUsers;

	@Value("${config.active-profiles}")
	private String activeProfile;

	/*
	 * @Autowired private UsersRepo usersRepo;
	 */

	/**
	 * Instantiates a new users service impl.
	 *
	 * @param usersRepository    the users repository
	 * @param the                encoder
	 * @param contextService     the context service
	 * @param userUnitRepository the user unit repository
	 */
	public UsersServiceImpl(UsersRepository usersRepository, PasswordEncoder passwordEncoder,
			ContextService contextService, UserUnitRepository userUnitRepository, AzureUserServiceImpl azureService) {
		this.usersRepository = usersRepository;
		this.passwordEncoder = passwordEncoder;
		this.contextService = contextService;
		this.userUnitRepository = userUnitRepository;
		this.azureService = azureService;
	}

	/**
	 * Find by user login.
	 *
	 * @param user_login the user login
	 * @return the users
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.lfn.iamp.usm.service.UsersService#findByUserLogin(java.lang.
	 * String)
	 */
	@Override
	public Users findByUserLogin(String user_login) {
		return this.usersRepository.findByUserLogin(user_login);
	}

	/**
	 * Find by user login.
	 *
	 * @param example the example
	 * @return the users
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see com.lfn.iamp.usm.service.UsersService#findByUserLogin(org.
	 * springframework.data.domain.Example)
	 */
	@Override
	public Users findByUserLogin(Example<Users> example) {
		Optional<Users> user = usersRepository.findOne(example);
		return user.isPresent() ? user.get() : null;
	}

	/**
	 * Save a users.
	 *
	 * @param users the entity to save
	 * @return the persisted entity
	 * @throws SQLException the SQL exception
	 */
	@Override
	public Users save(Users users) throws SQLException {
		log.debug("Request to save Users : {}", users);
		if (users.getPassword() != null){
			users.setPassword(passwordEncoder.encode(users.getPassword()));
		}
		else{
			users.setPassword(passwordEncoder.encode(defaultPWD));
		}
		if(users.getIsUiInactivityTracked()	== null) {
			users.setIsUiInactivityTracked(true);		
		}
	    Users newuser = null;
		newuser = usersRepository.findUser(users.getUser_login());
		if (inviteAzureUsers.equals("true") && activeProfile.contains("oauth2")) {
			if (azureService.inviteAzureUser(users)) {
				Date date = new Date();
	            date.getTime();
	            users.setLast_updated_dts(date);
			 if(newuser != null) {
					if(!newuser.getActivated() && !newuser.getOnboarded() && newuser.getUser_act_ind()) {
	            		newuser.setActivated(true);
	            		newuser.setLast_updated_dts(date);
						newuser.setOnboarded(true);
						newuser.setUser_act_ind(false);
	            		newuser = usersRepository.save(newuser);
	            	}
				  }else {
					newuser = usersRepository.save(users);
				}
				
				userProjectRoleService.createUserWithDefaultMapping(newuser);
				return newuser;
			}else {
				return null;
			}

		} else {
			Date date = new Date();
			date.getTime();
			users.setLast_updated_dts(date);
			if(newuser != null) {
				if(!newuser.getActivated() && !newuser.getOnboarded() && newuser.getUser_act_ind() ) {
            		newuser.setActivated(true);
            		newuser.setLast_updated_dts(date);
					newuser.setOnboarded(true);
					newuser.setUser_act_ind(false);
            		newuser = usersRepository.save(newuser);
            	}
			}else {
				newuser = usersRepository.save(users);
			}
		    return newuser;
		}
	}

	/**
	 * Get all the userss.
	 *
	 * @param pageable the pagination information
	 * @return the list of entities
	 * @throws SQLException the SQL exception
	 */
	@Override
	@Transactional(readOnly = true)
	public Page<Users> findAll(Pageable pageable) throws SQLException {
		log.debug("Request to get all Userss");
		return usersRepository.findAll(pageable);
	}

	/**
	 * Get one users by id.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 * @throws SQLException the SQL exception
	 */
	@Override
	@Transactional(readOnly = true)
	public Users findOne(Integer id) throws SQLException {
		log.debug("Request to get Users : {}", id);
		Users content = null;
		Optional<Users> value = usersRepository.findById(id);
		if (value.isPresent()) {
			content = toDTO(value.get(), 1);
		}
		return content;

	}

	/**
	 * Delete the users by id.
	 *
	 * @param id the id of the entity
	 * @throws SQLException the SQL exception
	 */
	@Override
	public void delete(Users user) throws SQLException {
		log.debug("Request to delete Users : {}", user.getId());
		usersRepository.deleteById(user.getId());
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
	public PageResponse<Users> getAll(PageRequestByExample<Users> req) throws SQLException {
		log.debug("Request to get all Users");
		Example<Users> example = null;
		Users users = req.getExample();
		if (users != null) {
			users.setActivated(true);
			users.setOnboarded(true);
			users.setUser_act_ind(false);
		}

		if (users != null) {
			ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for
																// userFName,userMName,userLName,userEmail,userLogin
					.withMatcher("userFName", match -> match.ignoreCase().startsWith())
					.withMatcher("userMName", match -> match.ignoreCase().startsWith())
					.withMatcher("userLName", match -> match.ignoreCase().startsWith())
					.withMatcher("userEmail", match -> match.ignoreCase().startsWith())
					.withMatcher("userLogin", match -> match.ignoreCase().startsWith());

			example = Example.of(users, matcher);
		}

		Page<Users> page;

		page = usersRepository.findAll(example, req.toPageable());

		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(),
				page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}

	/**
	 * To DTO.
	 *
	 * @param users the users
	 * @return the users
	 */
	public Users toDTO(Users users) {
		return toDTO(users, 5);
	}

	/**
	 * Converts the passed users to a DTO. The depth is used to control the amount
	 * of association you want. It also prevents potential infinite serialization
	 * cycles.
	 *
	 * @param users the users
	 * @param depth the depth of the serialization. A depth equals to 0, means no
	 *              x-to-one association will be serialized. A depth equals to 1
	 *              means that xToOne associations will be serialized. 2 means,
	 *              xToOne associations of xToOne associations will be serialized,
	 *              etc.
	 * @return the users
	 */
	public Users toDTO(Users users, int depth) {

		if (users == null) {
			return null;
		}
		Users dto = new Users();

		dto.setId(users.getId());

		dto.setUser_f_name(users.getUser_f_name());

		dto.setUser_m_name(users.getUser_m_name());

		dto.setUser_l_name(users.getUser_l_name());

		dto.setUser_email(users.getUser_email());

		dto.setUser_login(users.getUser_login());
		
		dto.setIsUiInactivityTracked(users.getIsUiInactivityTracked());

		dto.setPassword(users.getPassword());

		dto.setUser_act_ind(users.getUser_act_ind());

		dto.setUser_added_by(users.getUser_added_by());

		dto.setLast_updated_dts(users.getLast_updated_dts());
		dto.setOnboarded(users.getOnboarded());
		dto.setActivated(users.getActivated());
		dto.setForce_password_change(users.getForce_password_change());
		dto.setProfileImage(users.getProfileImage());
		dto.setProfileImageName(users.getProfileImageName());
		dto.setClientDetails(users.getClientDetails());
		dto.setCountry(users.getCountry());
		dto.setDesignation(users.getDesignation());
		dto.setTimezone(users.getTimezone());
		dto.setOther_details(users.getOther_details());
		dto.setContact_number(users.getContact_number());
//		if (depth-- > 0) {
		dto.setContext(contextService.toDTO(users.getContext(), depth));
//		}
		return dto;
	}

	/**
	 * Authorize user.
	 *
	 * @param users   the users
	 * @param orgName the org name
	 * @return the users
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.lfn.iamp.usm.service.UsersService#authorizeUser(com.lfn.
	 *iamp.usm.domain.Users, java.lang.String)
	 */
	@Override
	public Users authorizeUser(Users users, String orgName) {
		try {
			final String userPassword = users.getPassword();
			users.setActivated(true);
			users.setOnboarded(true);
			users.setUser_act_ind(false);
			users.setPassword(null);
			Users user = null;
			Users userTemp = null;

			userTemp = usersRepository.findByUserLogin(users.getUser_login());

			if (passwordEncoder.matches(userPassword, userTemp.getPassword())) {
				user = userTemp;
			}
			if (user != null) {
				if (userUnitRepository.findByUserAndOrg(user.getId(), orgName) == null) {
					return null;
				}
			} else {
				return new Users();
			}
			return user;
		} catch (EntityNotFoundException ex) {
			throw ex;
		}
	}

	/**
	 * Authenticate user.
	 *
	 * @param users   the users
	 * @param orgName the org name
	 * @return the users
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.lfn.iamp.usm.service.UsersService#authenticateUser(com.lfn.
	 * iamp.usm.domain.Users, java.lang.String)
	 */
	@Override
	public Users authenticateUser(Users users, String orgName) {
		try {
			users.setActivated(true);
			users.setOnboarded(true);
			users.setUser_act_ind(false);
			users.setPassword(null);
			Users result = usersRepository.findOne(Example.of(users)).orElse(null);
			Users authenticatedUser = null;

			if (result != null) {
				authenticatedUser = result;
			}
			if (authenticatedUser != null
					&& userUnitRepository.findByUserAndOrg(authenticatedUser.getId(), orgName) == null) {
				return null;
			}
			return authenticatedUser;
		} catch (EntityNotFoundException ex) {
			throw ex;
		}
	}

	/**
	 * Creates the user with default mapping.
	 *
	 * @param userName      the user name
	 * @param userFirstname the user firstname
	 * @param userLastname  the user lastname
	 * @param userEmail     the user email
	 * @return the users
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.lfn.iamp.usm.service.UsersService#createUserWithDefaultMapping(
	 * java.lang.String, java.lang.String, java.lang.String, java.lang.String)
	 */
	@Override
	public Users createUserWithDefaultMapping(String userName, String userFirstname, String userLastname,
			String userEmail) {
		Users user = usersRepository.findUser(userName);
		if (user == null) {
			user = new Users();
			user.setUser_login(userName);
			user.setUser_f_name(userFirstname);
			user.setUser_l_name(userLastname);
			user.setUser_email(userEmail);
			user.setUser_act_ind(false);
			user.setActivated(true);
			user.setForce_password_change(false);
			user.setOnboarded(true);
			user.setPassword(passwordEncoder.encode(defaultPWD));
			Date date = new Date();
            date.getTime();
            user.setLast_updated_dts(date);
            user.setIsUiInactivityTracked(true);
			user = usersRepository.save(user);
		}
		else {
		
			if(!user.getActivated() && !user.getOnboarded() && user.getUser_act_ind()) {
	        	user.setActivated(true);
				user.setOnboarded(true);
				user.setUser_act_ind(false);
	        }
			Date date = new Date();
            date.getTime();
            user.setLast_updated_dts(date);
			user = usersRepository.save(user);
	    }
		return user;
	}

	/**
	 * Update.
	 *
	 * @param users the users
	 * @return the users
	 * @throws SQLException the SQL exception
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.lfn.iamp.usm.service.UsersService#update(com.lfn.iamp
	 * .usm.domain.Users)
	 */
	@Override
	public Users update(Users users) throws SQLException {
		log.debug("Request to update Users : {}", users);
		Optional<Users> value = usersRepository.findById(users.getId());
		users.setPassword(value.isPresent() ? value.get().getPassword() : null);
		Date date = new Date();
        date.getTime();
        users.setLast_updated_dts(date);
		return usersRepository.save(users);
	}

	/**
	 * Reset .
	 *
	 * @param users the users
	 * @return the users
	 * @throws SQLException the SQL exception
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.lfn.iamp.usm.service.UsersService(com.lfn.iamp.usm.
	 * domain.Users)
	 */
	@Override
	public Users resetPassword(Users users) throws SQLException {
		Users user = usersRepository.findByUserEmail(users.getUser_email());
		if (users.getPassword() != null)
			user.setPassword(passwordEncoder.encode(users.getPassword()));
		else
			user.setPassword(passwordEncoder.encode(defaultPWD));
		Date date = new Date();
        date.getTime();
        users.setLast_updated_dts(date);
		return usersRepository.save(user);
	}
	
	/**
	 * Find Existing User Data.
	 *
	 * @param email the user email
	 * @return the User details
	 * @throws EssedumException the essedum exception
	 */
	@Override
	public Users findUserDataByEmail(String email) throws EssedumException {
		Users user = usersRepository.findByUserEmail(email.trim());
		if (user == null)
			throw new EssedumException(Messages.getMsg(Constants.EXCEPTION_USERSERVICEIMPL_FINDEMAIL));
		else
			return user;
	}

	/**
	 * Find email.
	 *
	 * @param email the email
	 * @return the client details
	 * @throws EssedumException the essedum exception
	 */
	@Override
	public Integer findEmail(String email) throws EssedumException {
		Users user = usersRepository.findByUserEmail(email.trim());
		if (user == null)
			throw new EssedumException(Messages.getMsg(Constants.EXCEPTION_USERSERVICEIMPL_FINDEMAIL));
		else
			return user.getId();
	}

	/**
	 * Gets the paginated users list.
	 *
	 * @param pageable the pageable
	 * @return the paginated users list
	 */
	@Override
	public PageResponse<Users> getPaginatedUsersList(Pageable pageable) throws SQLException {
		log.info("Request to get a page of Users from DB  {} : start", pageable);
		Example<Users> example = null;
		Users users = new Users();
		if (example == null) {
			users.setActivated(true);
			users.setOnboarded(true);
			users.setUser_act_ind(false);
			example = Example.of(users);
		}
		Page<Users> page = usersRepository.findAll(example, pageable);
		log.info("Request to get a page of Users from DB for  {} : end", pageable);
		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(),
				page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}
	
	
	@Override
    public PageResponse<Users> getProjectUsersList(Pageable pageable, Boolean portfolio, Integer Id) throws SQLException{
        log.info("Request to getProjectUsersList from usm_users and user_project_role table  {} : start", pageable);
        Example<Users> example = null;
        Users users = new Users();
        if (example == null) {
            users.setActivated(true);
            users.setOnboarded(true);
            users.setUser_act_ind(false);
            example = Example.of(users);
        }
        List<Users> usersList = usersRepository.findAll(example);
        List<UserProjectRole> userProjectRoles = new ArrayList<UserProjectRole>();
        if(portfolio) {
            userProjectRoles = userProjectRoleRepository.findByPortfolioIdId(Id);

        }else {
            userProjectRoles = userProjectRoleRepository.findByProjectIdId(Id);
        }
        List<Integer> userIds = new ArrayList<Integer>();
        userProjectRoles.forEach(userPrRec -> {
            userIds.add(userPrRec.getUser_id().getId());
        });
        List<Users> usersListRemove = new ArrayList<Users>();
        usersList.forEach(res -> {
        	if(!userIds.contains(res.getId())){
        		usersListRemove.add(res);
        	}  
        });
        usersList.removeAll(usersListRemove);
        List<Users> paginationUsers = new ArrayList<Users>();
        int startIndex = 0;
        int pageSize = pageable.getPageSize();  
        int totalUsers = usersList.size();  
        int currentPage = pageable.getPageNumber(); 
        if (totalUsers > 0 && pageSize > 0) {  
            startIndex = currentPage * pageSize;  

 

            if (startIndex < totalUsers) {
                int endIndex = Math.min(startIndex + pageSize, totalUsers);  
                paginationUsers = usersList.subList(startIndex, endIndex);  
            }
        }
        return new PageResponse<>(1, usersList.size(),
        		paginationUsers.stream().map(this::toDTO).collect(Collectors.toList()));
    }
	
	@Override
	public List<Users> getProjectOrPortUsersList(Boolean portfolio, Integer id) throws SQLException {
        log.info("Request to getProjectOrPortUsersList from usm_users and user_project_role table  {} : start");
        Example<Users> example = null;
        Users users = new Users();
        if (example == null) {
            users.setActivated(true);
            users.setOnboarded(true);
            users.setUser_act_ind(false);
            example = Example.of(users);
        }
        List<Users> usersList = usersRepository.findAll(example);
        List<UserProjectRole> userProjectRoles = new ArrayList<UserProjectRole>();
        if(portfolio) {
            userProjectRoles = userProjectRoleRepository.findByPortfolioIdId(id);

        }else {
            userProjectRoles = userProjectRoleRepository.findByProjectIdId(id);
        }
        List<Integer> userIds = new ArrayList<Integer>();
        userProjectRoles.forEach(userPrRec -> {
            userIds.add(userPrRec.getUser_id().getId());
        });
        List<Users> usersListRemove = new ArrayList<Users>();
        usersList.forEach(res -> {
        	if(!userIds.contains(res.getId())){
        		usersListRemove.add(res);
        	}  
        });
        usersList.removeAll(usersListRemove);
		return usersList;
	}

	/**
	 * Search.
	 *
	 * @param pageable the pageable
	 * @param prbe     the prbe
	 * @return the page response
	 */
	@Override
	public PageResponse<Users> search(Pageable pageable, PageRequestByExample<Users> prbe) throws SQLException {
		log.debug("Request to get all Users");
		Example<Users> example = null;
		Users users = prbe.getExample();
		if (users != null) {
			users.setActivated(true);
			users.setOnboarded(true);
			users.setUser_act_ind(false);
		}
		if (users != null) {
			ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for
																// userFName,userMName,userLName,userEmail,userLogin
					.withMatcher("user_f_name", match -> match.ignoreCase().contains())
					.withMatcher("user_m_name", match -> match.ignoreCase().contains())
					.withMatcher("user_l_name", match -> match.ignoreCase().contains())
					.withMatcher("user_email", match -> match.ignoreCase().contains())
					.withMatcher("user_login", match -> match.ignoreCase().contains());

			example = Example.of(users, matcher);
		}
		Page<Users> page;
		if (example != null) {
			page = usersRepository.findAll(example, pageable);
		} else {
			page = usersRepository.findAll(pageable);
		}
		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(),
				page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}
	
	
	@Override
	public PageResponse<Users> searchProjectPortfolioUsers(Pageable pageable, PageRequestByExample<Users> prbe, Boolean portfolio,
			Integer id) throws SQLException {
		log.debug("Request to get all searchProjectPortfolioUsers");
		Example<Users> example = null;
		Users users = prbe.getExample();
		

		if (users != null) {
			users.setActivated(true);
			users.setOnboarded(true);
			users.setUser_act_ind(false);
			ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for
																// userFName,userMName,userLName,userEmail,userLogin
					.withMatcher("user_f_name", match -> match.ignoreCase().contains())
					.withMatcher("user_m_name", match -> match.ignoreCase().contains())
					.withMatcher("user_l_name", match -> match.ignoreCase().contains())
					.withMatcher("user_email", match -> match.ignoreCase().contains())
					.withMatcher("user_login", match -> match.ignoreCase().contains());

			example = Example.of(users, matcher);
		}

			List<Users> usersList = usersRepository.findAll(example);
		    List<UserProjectRole> userProjectRoles = new ArrayList<UserProjectRole>();
	        if(portfolio) {
	            userProjectRoles = userProjectRoleRepository.findByPortfolioIdId(id);
	        }else {
	            userProjectRoles = userProjectRoleRepository.findByProjectIdId(id);
	        }
	        List<Integer> userIds = new ArrayList<Integer>();
	        userProjectRoles.forEach(userPrRec -> {
	            userIds.add(userPrRec.getUser_id().getId());
	        });
	        List<Users> usersListRemove = new ArrayList<Users>();
	        usersList.forEach(res -> {
	        	if(!userIds.contains(res.getId())){
	        		usersListRemove.add(res);
	        	}  
	        });
	        usersList.removeAll(usersListRemove);
	        List<Users> paginationUsers = new ArrayList<Users>();
	        int startIndex = 0;
	        int pageSize = pageable.getPageSize();  //6   
	        int totalUsers = usersList.size();  //14
	        int currentPage = pageable.getPageNumber(); //0 //1  //2

	        if (totalUsers > 0 && pageSize > 0) {  
	            startIndex = currentPage * pageSize;  //0 //6  //12

	 

	            if (startIndex < totalUsers) {
	                int endIndex = Math.min(startIndex + pageSize, totalUsers);  //6  //12  //14
	                paginationUsers = usersList.subList(startIndex, endIndex);  //0-6  //6-12  //12-14
	            }
	        }
	        return new PageResponse<>(1, usersList.size(),
	        		paginationUsers.stream().map(this::toDTO).collect(Collectors.toList()));
	        
	}


	/**
	 * On keyup users for experiments.
	 *
	 * @param text        the text
	 * @param projectId   the project id
	 * @param portfolioId the portfolio id
	 * @return the list
	 * @throws SQLException the SQL exception
	 */
	@Override
	public List<Users> onKeyupUsersForExperiments(String text, Integer projectId, Integer portfolioId)
			throws SQLException {
		List<Users> users = usersRepository.onKeyupUsersForExperiments(text, projectId, portfolioId);
		return users;
	}

	@Override
	public List<Users> findUsersByPortfolio(Integer portfolioId) {
		List<Users> users = usersRepository.getUsersByPortfolio(portfolioId);
		// TODO Auto-generated method stub
		return users;
	}

	@Override
	public List<Users> findAll() throws SQLException {
		return usersRepository.findAll();
	}

	@Override
	public Users revokeAccess(String email) throws SQLException, EssedumException {
		// TODO Auto-generated method stub
		Users user = usersRepository.findByUserEmail(email);
		if (user == null)
			throw new EssedumException(Messages.getMsg(Constants.EXCEPTION_USERSERVICEIMPL_FINDEMAIL));
		else {
			user.setActivated(false);
			user.setOnboarded(false);
			user.setUser_act_ind(true);
			Date date = new Date();
            date.getTime();
            user.setLast_updated_dts(date);
			return usersRepository.save(user);
		}

	}
	@Override
	public List<UserPartialDTO> findUserDetailsIds(Integer[] fetchAllocatedUsers){
		return usersRepository.findUserDetailsById(fetchAllocatedUsers); 
	}
	
    public List<String> getProjectNameForUser(String email) {
		return this.usersRepository.getPermissionForModulesnew(email);
	}
	
	public List<String> getPortfolioNameForUser(String email) {
		return this.usersRepository.getPortfolioNameForUser(email); 
	}
	
	public List<String> getActiveModules() {
		return this.usersRepository.getActiveModules(); 
	}

	

}