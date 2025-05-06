/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipwebeditor.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.ai.comm.lib.util.ICIPHeaderUtil;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.ai.comm.lib.util.exceptions.ApiError;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.infosys.icets.icip.icipwebeditor.model.ICIPGroupModel;
import com.infosys.icets.icip.icipwebeditor.model.ICIPGroups;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPartialGroups;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPGroupsDTO;
//import com.infosys.icets.icip.icipwebeditor.service.IICIPGroupsService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPPartialGroupsService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;
//COMMENTED AS PART OF CODE CLEANUP
// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPGroupsController.
 *
 * @author icets
 */
//@RestController
//@Timed
//@Hidden
//@RequestMapping(path = "/${icip.pathPrefix}/groups")
//public class ICIPGroupsController {
//
//	/** The Constant ENTITY_NAME. */
//	private static final String ENTITY_NAME = "groups";
//
//	/** The Constant logger. */
//	private static final Logger logger = LoggerFactory.getLogger(ICIPGroupsController.class);
//
//	/** The i ICIP groups service. */
//	@Autowired
//	private IICIPGroupsService iICIPGroupsService;
//
//	/** The i ICIP partial groups service. */
//	@Autowired
//	private IICIPPartialGroupsService iICIPPartialGroupsService;
//	
//	/** The claim. */
//	@Value("${security.claim:#{null}}")
//	private String claim;
//
//	
//	/**
//	 * Gets the groups by org and entity.
//	 *
//	 * @param entityType the entity type
//	 * @param entity     the entity
//	 * @param org        the org
//	 * @param page       the page
//	 * @param size       the size
//	 * @return the groups by org and entity
//	 */
//	@GetMapping("/search/{entityType}/{entity}")
//	public ResponseEntity<List<ICIPPartialGroups>> getGroupsByOrgAndEntity(
//			@PathVariable(name = "entityType") String entityType, @PathVariable("entity") String entity,
//			@RequestParam(name = "org", required = true) String org,
//			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
//			@RequestParam(name = "size", defaultValue = "12", required = false) String size) {
//		logger.info("Getting Groups by Organization : {} and EntityType : {} and Entity : {}", org, entityType, entity);
//		return new ResponseEntity<>(iICIPPartialGroupsService.getGroupsByOrgAndEntity(org, entity, entityType,
//				Integer.parseInt(page), Integer.parseInt(size)), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	@GetMapping("/searchByType/{org}/{type}")
//	public ResponseEntity<List<ICIPGroups>> getGroupsByOrgAndType(
//			@PathVariable(name = "org", required = true) String org,
//			@PathVariable(name = "type", required = true) String type,
//			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
//			@RequestParam(name = "size", defaultValue = "12", required = false) String size) {
//		logger.info("Getting Groups by Organization : {} and Type : {}", org, org, type);
//		return new ResponseEntity<>(iICIPGroupsService.getGroupsByOrganizationAndType(org, type), new HttpHeaders(), HttpStatus.OK);
//	}
//	/**
//	 * Gets the groups len by org and entity.
//	 *
//	 * @param entityType the entity type
//	 * @param entity     the entity
//	 * @param org        the org
//	 * @return the groups len by org and entity
//	 */
//	@GetMapping("/search/len/{entityType}/{entity}/{org}")
//	public ResponseEntity<Long> getGroupsLenByOrgAndEntity(@PathVariable(name = "entityType") String entityType,
//			@PathVariable("entity") String entity, @PathVariable(name = "org") String org) {
//		logger.info("Getting Groups Len by Organization : {} and EntityType : {} and Entity : {}", org, entityType,
//				entity);
//		return new ResponseEntity<>(iICIPPartialGroupsService.getGroupsLenByOrgAndEntity(org, entity, entityType), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the groups by entity and org.
//	 *
//	 * @param entity the entity
//	 * @param org    the org
//	 * @return the groups by entity and org
//	 */
//	@GetMapping("/pipeline/{entity}/{org}")
//	public ResponseEntity<ICIPPartialGroups> getGroupsByEntityAndOrg(@PathVariable("entity") String entity,
//			@PathVariable("org") String org) {
//		logger.info("Getting Groups by Organization : {} and Entity : {}", org, entity);
//		return new ResponseEntity<>(iICIPPartialGroupsService.getSingleGroupsByOrgAndEntity(org, entity), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the paginated groups.
//	 *
//	 * @param org  the org
//	 * @param page the page
//	 * @param size the size
//	 * @return the paginated groups
//	 */
//	@GetMapping("/paginated/all")
//	public ResponseEntity<List<ICIPPartialGroups>> getPaginatedGroups(
//			@RequestParam(name = "org", required = true) String org,
//			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
//			@RequestParam(name = "size", defaultValue = "12", required = false) String size) {
//		logger.info("Getting Groups by Organization [/paginated/all] : {} ", org);
//		return new ResponseEntity<>(iICIPPartialGroupsService.getGroupsByOrg(org, Integer.parseInt(page),
//				Integer.parseInt(size)), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the group names.
//	 *
//	 * @param org the org
//	 * @return the group names
//	 */
//	@GetMapping("/names")
//	public ResponseEntity<List<NameAndAliasDTO>> getGroupNames(
//			@RequestParam(name = "org", required = true) String org) {
//		logger.info("Getting Groups by Organization [/names] : {} ", org);
//		return new ResponseEntity<>(iICIPGroupsService.getGroupNames(org), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the groups len.
//	 *
//	 * @param org the org
//	 * @return the groups len
//	 */
//	@GetMapping("/all/len/{org}")
//	public ResponseEntity<Long> getGroupsLen(@PathVariable(name = "org") String org) {
//		logger.info("Getting Groups Length by Organization : {} ", org);
//		return new ResponseEntity<>(iICIPPartialGroupsService.getGroupsLenByOrg(org), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the featured groups.
//	 *
//	 * @param org the org
//	 * @return the featured groups
//	 */
//	@GetMapping("/featured")
//	public ResponseEntity<List<ICIPPartialGroups>> getFeaturedGroups(
//			@RequestParam(name = "org", required = true) String org) {
//		logger.info("Getting Groups by Organization [/featured] : {} ", org);
//		return new ResponseEntity<>(iICIPPartialGroupsService.getFeaturedGroupsByOrg(org), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the ICIP group.
//	 *
//	 * @param name the name
//	 * @param org  the org
//	 * @return the ICIP group
//	 */
//	@GetMapping("/view/{nameStr}/{org}")
//	public ResponseEntity<ICIPGroups> getICIPGroup(@PathVariable(name = "nameStr") String name,
//			@PathVariable(name = "org") String org) {
//		logger.info("Getting Group : {}_{}", name, org);
//		
//		return new ResponseEntity<>(iICIPGroupsService.getGroup(name, org), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Creates the groups.
//	 *
//	 * @param alias the alias
//	 * @param groupDTO the group DTO
//	 * @return the response entity
//	 * @throws URISyntaxException the URI syntax exception
//	 */
//	@PostMapping("/add/{nameStr}")
//	public ResponseEntity<ICIPGroups> createGroups(@PathVariable(name = "nameStr") String alias,
//			@RequestBody ICIPGroupsDTO groupDTO) throws URISyntaxException {
//		groupDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
//		groupDTO.setLastmodifieddate(Timestamp.from(Instant.now()));
//		groupDTO.setAlias(alias);
//		ModelMapper modelMapper = new ModelMapper();
//		ICIPGroups group = modelMapper.map(groupDTO, ICIPGroups.class);
//		ICIPGroups result = iICIPGroupsService.save(group);
//		logger.info("Creating Group : {} ", alias);
//		return ResponseEntity.created(new URI("/groups/" + result.getId()))
//				.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);
//	}
//
//	/**
//	 * Gets the groups for entity.
//	 *
//	 * @param entityType the entity type
//	 * @param entity     the entity
//	 * @param org        the org
//	 * @return the groups for entity
//	 */
//	@GetMapping("/all/{entityType}/{entity}")
//	public ResponseEntity<List<ICIPGroups>> getGroupsForEntity(@PathVariable(name = "entityType") String entityType,
//			@PathVariable("entity") String entity, @RequestParam(name = "org", required = true) String org) {
//		List<ICIPGroupModel> groups = iICIPPartialGroupsService.getAllGroupsByOrgAndEntity(org, entity, entityType);
//		logger.info("Getting Groups for Entity :{} ", groups);
//		List grps = new ArrayList<>();
//		groups.forEach(grp -> grps.add(grp.getGroups()));
//		return new ResponseEntity<>(grps, new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the group.
//	 *
//	 * @param org       the org
//	 * @param groupName the group name
//	 * @return the group
//	 * @throws URISyntaxException the URI syntax exception
//	 */
//	@GetMapping("/get/{nameStr}/{org}")
//	public ResponseEntity<ICIPGroups> getGroup(@PathVariable("org") String org,
//			@PathVariable("nameStr") String groupName) throws URISyntaxException {
//
//		return new ResponseEntity<>( iICIPGroupsService.getGroup(groupName, org), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the groups.
//	 *
//	 * @param org  the org
//	 * @param page the page
//	 * @param size the size
//	 * @return the groups
//	 */
//	@GetMapping("/all")
//	public ResponseEntity<List<ICIPPartialGroups>> getGroups(@RequestParam(name = "org", required = true) String org,
//			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
//			@RequestParam(name = "size", defaultValue = "12", required = false) String size) {
//		logger.info("Getting Groups by Organization [/all] : {} ", org);
//		return new ResponseEntity<>(iICIPPartialGroupsService.getGroups(org), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Delete groups.
//	 *
//	 * @param name the name
//	 * @param org  the org
//	 * @return the response entity
//	 */
//	@DeleteMapping("/delete/{nameStr}/{org}")
//	public ResponseEntity<Void> deleteGroups(@PathVariable(name = "nameStr") String name,
//			@PathVariable(name = "org") String org) {
//		iICIPGroupsService.delete(name, org);
//		logger.info("Deleting Group : {}", name);
//		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, name)).build();
//	}
//
//	/**
//	 * Handle all.
//	 *
//	 * @param ex the ex
//	 * @return the response entity
//	 */
//	@ExceptionHandler(Exception.class)
//	public ResponseEntity<Object> handleAll(Exception ex) {
//		logger.error(ex.getMessage(), ex);
//		Throwable rootcause = ExceptionUtil.findRootCause(ex);
//			return new ResponseEntity<>( new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 
//					rootcause.getMessage(), "error occurred").getMessage(), new HttpHeaders(),  new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 
//							rootcause.getMessage(), "error occurred").getStatus());
//	}
//
//}