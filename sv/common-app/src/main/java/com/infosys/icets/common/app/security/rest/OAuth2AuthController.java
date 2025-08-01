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

package com.infosys.icets.common.app.security.rest;

import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.Optional;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.ai.comm.lib.util.Crypt;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.common.app.security.jwt.CustomJWTTokenProvider;
import com.infosys.icets.common.app.security.rest.dto.AuthorizeApiDTO;
import com.infosys.icets.common.app.security.rest.dto.ResponseDTO;
import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.domain.UserProjectRoleSummary;
import com.infosys.icets.iamp.usm.domain.Users;
import com.infosys.icets.iamp.usm.repository.ProjectRepository;
import com.infosys.icets.iamp.usm.repository.RoleRepository;
import com.infosys.icets.iamp.usm.repository.UserProjectRoleRepository;
import com.infosys.icets.iamp.usm.service.UserProjectRoleService;
import com.infosys.icets.iamp.usm.service.UsersService;

import io.swagger.v3.oas.annotations.Hidden;
import lombok.Setter;

// 
/**
 * The Class OAuth2AuthController.
 *
 * @author icets
 */
@Profile("oauth2")
@Controller
@Hidden
@RequestMapping("/")
@Setter
public class OAuth2AuthController {

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(OAuth2AuthController.class);

	/** The Constant ENTITY_NAME. */
	//private static final String ENTITY_NAME = "users";

	/** The users service. */
	@Autowired
	private UsersService usersService;

	/** The user project role service. */
	@Autowired
	private UserProjectRoleService userProjectRoleService;
	
	@Autowired
	private ProjectRepository projectRepo;
	
	@Autowired
	private RoleRepository roleRepository;
	
	@Autowired
	private UserProjectRoleRepository userProjectRoleRepository;
	/** The auto user creation. */
	@Value("${security.createUserIfNotExist}")
	private boolean createUserIfNotExist;

	/** Claim. */
	@Value("${security.claim}")
	private String claim;
	@LeapProperty("application.uiconfig.enckeydefault")
	private String encKeydefault;
	
	@Autowired
	private CustomJWTTokenProvider tokenProvider;
	
	/**
	 * Gets the user info.
	 *
	 * @return the user info
	 * @throws JsonProcessingException
	 * @throws NoSuchAlgorithmException
	 * @throws InvalidKeySpecException
	 * @throws BadPaddingException
	 * @throws IllegalBlockSizeException
	 * @throws NoSuchPaddingException
	 * @throws InvalidKeyException
	 * @throws UnsupportedEncodingException
	 * @throws InvalidAlgorithmParameterException
	 */
	@GetMapping("api/userInfo")
	public ResponseEntity<?> getUserInfo() throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException,
			IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException,
			InvalidAlgorithmParameterException, UnsupportedEncodingException {
		String jwtClaim = ICIPUtils.getUser(claim);
		Optional<UserProjectRoleSummary> userProjectRoleSummary = userProjectRoleService
				.getUserProjectRoleSummary(jwtClaim);
		if (userProjectRoleSummary.isPresent()) {
			logger.info(userProjectRoleSummary.get().getUserId().getUser_login() + " Logged In");
			ObjectMapper mapper = new ObjectMapper();
			String str = mapper.writeValueAsString(userProjectRoleSummary.get());
			String encrStr = Crypt.encrypt(str, encKeydefault);
			return new ResponseEntity<>(encrStr, new HttpHeaders(), HttpStatus.OK);
		} else {
			if (createUserIfNotExist) {
				userProjectRoleSummary = createUserWithDefaultMapping(jwtClaim);
//				logger.info(userProjectRoleSummary.get().getUserId().getUser_login() + " Logged In");
				if (userProjectRoleSummary.isPresent()) {
				    logger.info(userProjectRoleSummary.get().getUserId().getUser_login() + " Logged In");
				}
				ObjectMapper mapper = new ObjectMapper();
				String str = mapper.writeValueAsString(userProjectRoleSummary.get());
				String encrStr = Crypt.encrypt(str, encKeydefault);
				return new ResponseEntity<>(encrStr, new HttpHeaders(), HttpStatus.OK);
			} else {
				logger.info("User doesn't have sufficient permission, Please contact administrator");
				return new ResponseEntity<String>(
						"User doesn't have sufficient permission, Please contact administrator", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
	}
	
	/**
	 * Validate the user.
	 *
	 * @return the user status
	 * @throws JsonProcessingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 * @throws UnsupportedEncodingException 
	 * @throws InvalidAlgorithmParameterException 
	 */
	@GetMapping("api/validateUser")
	public ResponseEntity<?> validateUser(@RequestHeader("Authorization") String token,
			@RequestHeader("Project") Integer projectId,
			@RequestHeader("Projectname") String projectName,
			@RequestHeader("Roleid") Integer roleId,
			@RequestHeader("Rolename") String roleName,
			@RequestHeader("api") String apiName,
			@RequestHeader("MethodType") String methodType) throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, UnsupportedEncodingException {			
		
		AuthorizeApiDTO authorizeApiDTO=new AuthorizeApiDTO();
		authorizeApiDTO.setMethodType(methodType);
		authorizeApiDTO.setProjectId(projectId);
		authorizeApiDTO.setProjectName(projectName);
		authorizeApiDTO.setUrl(apiName);
		authorizeApiDTO.setToken(token);
		authorizeApiDTO.setRoleId(roleId);
		authorizeApiDTO.setRoleName(roleName);
		
		String user=ICIPUtils.getUserFromToken(token, claim);
		authorizeApiDTO.setUser(user);
		ResponseDTO dto = this.tokenProvider.authorize(authorizeApiDTO);
		logger.info("ApiAccessVoter API="+dto.getStatus()+"---"+dto.getResponse()) ;
		logger.info(
				"ApiAccessVoter API getHttpRequest -url {} projectId {}  MethodType {} roldeId {} roleName {} token {}",
				authorizeApiDTO.getUrl(), authorizeApiDTO.getProjectId(),
				authorizeApiDTO.getMethodType(), authorizeApiDTO.getRoleId(),
				authorizeApiDTO.getRoleName(), authorizeApiDTO.getToken());
	
		if (dto.getStatus().equalsIgnoreCase("Success")) {	
			
			logger.info("user Logged In");
			return new ResponseEntity<>("User verified from token!", new HttpHeaders(), HttpStatus.OK);
		}
		else {
			logger.info("User doesn't have sufficient permission, Please contact administrator");
			return new ResponseEntity<String>(
					"error : User doesn't have sufficient permission, Please contact administrator", new HttpHeaders(),
					HttpStatus.UNAUTHORIZED);
		}

	}
	
	@PostMapping("api/validateUserCAP")
	public ResponseEntity<?> validateUserCAP(@RequestBody String data) throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, UnsupportedEncodingException {			
		JSONObject json = new JSONObject(data);
		String token = json.getString("token");
		JSONObject result =  new JSONObject();
		String projectId = "";
		String projectName = "";
		String successData = "";
		String errorData = "";
		
		if(json.has("projectId"))
		{
			projectId = json.getString("projectId");
		}
		else
		{
			projectName =  json.getString("projectName");
		}
//		String roleName = json.getString("roleName");
//		
//		Integer roleId = 0 ;
		//String userName = json.getString("userName");
		String userLogin=null;
		if(token!=null) {
		userLogin = ICIPUtils.getUserFromToken(token,claim);
		Optional<UserProjectRoleSummary> userProjectRoleSummary = userProjectRoleService
				.getUserProjectRoleSummary(userLogin);
		
		Integer userId = userProjectRoleSummary.get().getUserId().getId();
		
		if (userProjectRoleSummary.isPresent()) { 
//			if(projectName!="")
			if (!projectName.equals(""))
			{
				Project projectDetail = projectRepo.findByName(projectName);
				if(projectDetail!= null)
				{
					projectId = projectDetail.getId().toString();
				}
				else
				{
					successData = "null";
					errorData = "Project Id not found";
					result.put("Success Data", "null");
					result.put("Error Data","Project Name not found");
					logger.info("Project Name not found");
					return new ResponseEntity<>(
							new result(projectId,userId,successData,errorData), new HttpHeaders(),
							HttpStatus.BAD_REQUEST);
				}
				
			}
//			if(projectId!="")
			if (!projectId.equals(""))
			{
				Optional<Project> projectDetail = projectRepo.findById(Integer.parseInt(projectId));
				if(!(projectDetail.isPresent()))
				{
					successData = "null";
					errorData = "Project Id not found";
					result.put("Success Data", "null");
					result.put("Error Data","Project Id not found");
					logger.info("Project Id not found");
					return new ResponseEntity<>(
							new result(projectId,userId,successData,errorData), new HttpHeaders(),
							HttpStatus.BAD_REQUEST);
				}
			}
//			if(roleName!=null)
//			{
//				List<Role> roleDetail = roleRepository.findByName(roleName);
//				if(roleDetail!=null) {
//				for (Role role : roleDetail) {
//						roleId = role.getId();
//						break;
//				}
//			}
//			}
//				else
//				{
//					logger.info("Role name not found");
//					return new ResponseEntity<String>(
//							"error : Role Name not found", new HttpHeaders(),
//							HttpStatus.BAD_REQUEST);
//			}
//			List<Integer> roleIds = userProjectRoleRepository.getMappedRolesForUserLoginAndProject(userLogin, Integer.parseInt(projectId));
//			if(roleIds.contains((roleId)))
//			{
			successData = "User is valid";
			errorData = "null";
			result.put("Success Data", "User is Valid");
			result.put("User ID",userProjectRoleSummary.get().getUserId().getId());
			result.put("Project ID",Integer.parseInt(projectId));
			result.put("Error Data","null");
			logger.info("AppData: User is valid,userId: "+userProjectRoleSummary.get().getUserId().getId()+",projectId: "+projectId);
			return new ResponseEntity<>(
					new result(projectId,userId,successData,errorData), new HttpHeaders(),
					HttpStatus.OK);
//			}
//			else
//			{
//				logger.info("User is valid but dont have access on : "+ roleName);
//				return new ResponseEntity<String>(
//						"User is valid but dont have access on : "+ roleName, new HttpHeaders(),
//						HttpStatus.UNAUTHORIZED);
//			}
//		
		}
		else {
			successData = "null";
			errorData = "User doesn't have sufficient permission, Please contact administrator";
			result.put("Success Data", "null");
			result.put("Error Data","User doesn't have sufficient permission, Please contact administrator");
				logger.info("User doesn't have sufficient permission, Please contact administrator");
				return new ResponseEntity<>(new result(projectId,userId,successData,errorData),
						new HttpHeaders(), HttpStatus.UNAUTHORIZED);
		}
	}
		else  {
			
			successData = "null";
			errorData = "Token not provided";
			Integer userId = null  ;
			result.put("Success Data", "null");
			result.put("Error Data","Token not provided");
				logger.info("Token not provided");
				return new ResponseEntity<>(new result(projectId,userId,successData,errorData),
						new HttpHeaders(), HttpStatus.UNAUTHORIZED);
		}
	}
	public static class result {
		
		private String projectId;
		private int userId;
		private String successData;
		private String errorData;
		
		 result(String projectId,Integer userId,String successData,String errorData ) {
			this.projectId = projectId;
			this.userId = userId;
			this.successData = successData;
			this.errorData = errorData;
		}
		 
		 @JsonProperty("projectId")
			String getProjectId() {
				return projectId;
			}
		 @JsonProperty("userId")
			Integer getUserId() {
				return userId;
			}
		 @JsonProperty("successData")
			String getSuccessData() {
				return successData;
			}
		 @JsonProperty("errorData")
			String getErrorData() {
				return errorData;
			}
		 
	}

	/**
	 * Creates the user with default mapping.
	 *
	 * @param userName the user name
	 * @return the user project role summary
	 */
	private Optional<UserProjectRoleSummary> createUserWithDefaultMapping(String claim) {
		String email = claim;
		String userName = claim;

		// String[] names = userName.split("@")[0].split("[_.]");
		String firstname = "";
		String lastname = "";
		String[] names = null;
		try {
			names=userName.split("@")[0].split("[_.]");
			if(names.length>1) {
				firstname=names[0];
				lastname=names[1];
			}
			else {
				firstname=names[0];
			}
		}catch ( Exception ex) {
			logger.debug("failed to parse {}", claim);
			firstname=claim;
		}
		Users user = usersService.createUserWithDefaultMapping(userName, firstname, lastname, email);
		try {
			return Optional.of(userProjectRoleService.createUserWithDefaultMapping(user));
		} catch (Exception e) {
			logger.error("Unable to create user default mapping ", e);
		}
//		return null;
		return Optional.empty();
	}

}



