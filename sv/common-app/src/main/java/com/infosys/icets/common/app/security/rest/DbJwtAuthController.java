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
import java.nio.charset.StandardCharsets;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;
import java.util.Optional;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import jakarta.validation.Valid;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.ai.comm.lib.util.Crypt;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.common.app.security.jwt.CustomAuthFilter;
import com.infosys.icets.common.app.security.jwt.CustomJWTTokenProvider;
import com.infosys.icets.common.app.security.rest.dto.AuthorizeApiDTO;
import com.infosys.icets.common.app.security.rest.dto.LoginDto;
import com.infosys.icets.common.app.security.rest.dto.ResponseDTO;
import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.domain.UserProjectRoleSummary;
import com.infosys.icets.iamp.usm.repository.ProjectRepository;
import com.infosys.icets.iamp.usm.service.UserProjectRoleService;

import io.swagger.v3.oas.annotations.Hidden;
import lombok.Setter;

// 
/**
 * The Class DbJwtAuthController.
 *
 * @author icets
 */
@Profile("dbjwt")
@RestController
@Hidden
@RequestMapping("/api")
@Setter
@RefreshScope
public class DbJwtAuthController {

	/** The token provider. */
	@Autowired
	private CustomJWTTokenProvider tokenProvider;

	/** The authentication manager builder. */
	@Autowired
	private AuthenticationManagerBuilder authenticationManagerBuilder;

	/** The user project role service. */
	@Autowired
	private UserProjectRoleService userProjectRoleService;

	@Autowired
	private ProjectRepository projectRepo;

	/** The auto user creation. */
	@LeapProperty("application.uiconfig.autoUserCreation")
	String autoUserCreation;

	@LeapProperty("application.uiconfig.enckeydefault")
	private String encKeydefault;

	/** Claim. */
	private String claim = "sub";

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(DbJwtAuthController.class);

	private AuthorizeApiDTO authorizeApiDTO;

	/**
	 * Authorize.
	 *
	 * @param loginDto the login dto
	 * @return the response entity
	 * @throws JsonProcessingException
	 * @throws JsonMappingException
	 * @throws UnsupportedEncodingException
	 */
	@PostMapping("/authenticate")
	public ResponseEntity<JWTToken> authorize(@Valid @RequestBody String logininfo) throws JsonProcessingException {
		String decodedvalue = new String(Base64.getDecoder().decode(logininfo), StandardCharsets.UTF_8);
		ObjectMapper objectMapper = new ObjectMapper();
		LoginDto loginDto = objectMapper.readValue(decodedvalue, new TypeReference<LoginDto>() {
		});
		UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
				loginDto.getUsername(), loginDto.getPassword());
		Authentication authentication = null;
		try {
			authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
		} catch (Exception e) {
			return new ResponseEntity<>(HttpStatus.FORBIDDEN);
		}
		SecurityContextHolder.getContext().setAuthentication(authentication);

		boolean rememberMe = loginDto.isRememberMe() != null && loginDto.isRememberMe();
		String jwt = tokenProvider.createToken(authentication, rememberMe);

		HttpHeaders httpHeaders = new HttpHeaders();
		httpHeaders.add(CustomAuthFilter.AUTHORIZATION_HEADER, "Bearer " + jwt);

		return new ResponseEntity<>(new JWTToken(jwt), httpHeaders, HttpStatus.OK);
	}

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
	@GetMapping("/userInfo")
	public ResponseEntity<?> getUserInfo() throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException,
			IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException,
			InvalidAlgorithmParameterException, UnsupportedEncodingException {
		String user = ICIPUtils.getUser(null);
		Optional<UserProjectRoleSummary> userProjectRoleSummary = userProjectRoleService
				.getUserProjectRoleSummary(user);

		if (userProjectRoleSummary.isPresent()) {
			logger.info(userProjectRoleSummary.get().getUserId().getUser_login() + " Logged In");
			ObjectMapper mapper = new ObjectMapper();
			String str = mapper.writeValueAsString(userProjectRoleSummary.get());
			String encrStr = Crypt.encrypt(str, encKeydefault);
			return new ResponseEntity<>(encrStr, new HttpHeaders(), HttpStatus.OK);
//			return new ResponseEntity<>(str, new HttpHeaders(), HttpStatus.OK);
		} else {
			if (Boolean.parseBoolean(autoUserCreation))
				return new ResponseEntity<>(userProjectRoleService.createUserWithDefaultMapping(user),
						new HttpHeaders(), HttpStatus.OK);
			else {
				logger.info("User doesn't have sufficient permission, Please contact administrator");
				return new ResponseEntity<>("User doesn't have sufficient permission, Please contact administrator",
						new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
	}
	

	
	/**
	 * Gets the user info for CAP.
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
	@PostMapping("/userInfoCAP")
	public ResponseEntity<?> getUserInfoCAP(@RequestBody String data) throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException,
			IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException,
			InvalidAlgorithmParameterException, UnsupportedEncodingException {
		
		String user = ICIPUtils.getUser(null);
		 
		JSONObject json = new JSONObject(data);
		JSONObject result =  new JSONObject();
		String projectId = "";
		String projectName = "";
		String successData = "";
		String errorData = "";
        //Integer userId = null;
		
		if(json.has("projectId"))
		{
			projectId = json.getString("projectId");
		}
		else
		{
			projectName =  json.getString("projectName");
		}
		
		Optional<UserProjectRoleSummary> userProjectRoleSummary = userProjectRoleService
				.getUserProjectRoleSummary(user);
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
					errorData = "Project Name not found";
					
					result.put("Success Data", "null");
					result.put("Error Data","Project Name not found");
					logger.info("Project Name not found");
					//return new ResponseEntity<>(result.toString(),new HttpHeaders(),HttpStatus.BAD_REQUEST);	
					return new ResponseEntity<>(new result(projectId,userId,successData,errorData),new HttpHeaders(),HttpStatus.OK);
					//return new ResponseEntity<>("Success Data : null , Error Data : Project name not found",new HttpHeaders(),HttpStatus.BAD_REQUEST);
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
					//return new ResponseEntity<>(result.toMap(),new HttpHeaders(),HttpStatus.BAD_REQUEST);
					//return new ResponseEntity<>(result.toString(),new HttpHeaders(),HttpStatus.BAD_REQUEST);	
					//return new ResponseEntity<>("Success Data : null , Error Data : Project Id not found",new HttpHeaders(),HttpStatus.BAD_REQUEST);	
					return new ResponseEntity<>(new result(projectId,userId,successData,errorData),new HttpHeaders(),HttpStatus.OK);
				}
			}

				successData = "User is valid";
				errorData = "null";
				result.put("Success Data", "User is Valid");
				result.put("User ID",userProjectRoleSummary.get().getUserId().getId());
				result.put("Project ID",Integer.parseInt(projectId));
				result.put("Error Data","null");
				logger.info("AppData: User is valid,userId: "+userProjectRoleSummary.get().getUserId().getId()+",projectId: "+projectId);
				
				return new ResponseEntity<>(new result(projectId,userId,successData,errorData),new HttpHeaders(),HttpStatus.OK);
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
	
	@GetMapping("/validateUser")
	public ResponseEntity<?> validateUser(@RequestHeader("Authorization") String token,
			@RequestHeader("Project") Integer projectId,
			@RequestHeader("Projectname") String projectName,
			@RequestHeader("Roleid") Integer roleId,
			@RequestHeader("Rolename") String roleName,
			@RequestHeader("api") String apiName,
			@RequestHeader("MethodType") String methodType
			) throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, UnsupportedEncodingException {			
		
		AuthorizeApiDTO authorizeApiDTO=new AuthorizeApiDTO();
		authorizeApiDTO.setMethodType(methodType);
		authorizeApiDTO.setProjectId(projectId);
		authorizeApiDTO.setUrl(apiName);
		authorizeApiDTO.setToken(token);
		authorizeApiDTO.setRoleId(roleId);
		authorizeApiDTO.setRoleName(roleName);
		String user=ICIPUtils.getUserFromToken(token, "sub");
		authorizeApiDTO.setUser(user);
		ResponseDTO dto = this.tokenProvider.authorize(authorizeApiDTO);
		logger.info("ApiAccessVoter API="+dto.getStatus()+"---"+dto.getResponse()) ;
		logger.info(
				"ApiAccessVoter API getHttpRequest -url {} projectId {} user {} MethodType {} roldeId {} roleName {} token {}",
				authorizeApiDTO.getUrl(), authorizeApiDTO.getProjectId(), user,
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
	 * Object to return as body in JWT Authentication.
	 * 
	 * @author icets
	 */
	
	public static class JWTToken {

		/** The access token. */
		private String accessToken;

		/**
		 * Instantiates a new JWT token.
		 *
		 * @param accessToken the access token
		 */
		JWTToken(String accessToken) {
			this.accessToken = accessToken;
		}
		

		/**
		 * Gets the id token.
		 *
		 * @return the access token
		 */
		@JsonProperty("access_token")
		String getIdToken() {
			return accessToken;
		}

		/**
		 * Sets the id token.
		 *
		 * @param idToken the new id token
		 */
		void setIdToken(String accessToken) {
			this.accessToken = accessToken;
		}
	}

}
