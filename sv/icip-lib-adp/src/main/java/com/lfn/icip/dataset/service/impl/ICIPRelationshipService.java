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

package com.lfn.icip.dataset.service.impl;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Collections;

import org.json.JSONObject;
import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.dataset.model.ICIPRelationship;
import com.lfn.icip.dataset.model.ICIPSchemaForm;
import com.lfn.icip.dataset.model.ICIPSchemaRegistry;
import com.lfn.icip.dataset.repository.ICIPRelationshipRepository;
import com.lfn.icip.dataset.repository.ICIPSchemaRegistryRepository;
import com.lfn.icip.dataset.service.IICIPRelationshipService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class IICIPRelationshipService.
 *
 * @author essedum
 */
@Service
@Transactional
public class ICIPRelationshipService implements IICIPRelationshipService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPRelationshipService.class);
	
	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);
	
	/** The schema registry repository. */
	@Autowired
	private ICIPSchemaRegistryRepository schemaRegistryRepository;

	/** The relationship repository. */
	@Autowired
	private ICIPRelationshipRepository relationshipRepository;
	
	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	/**
	 * Find one.
	 *
	 * @param id the id
	 * @return the ICIP relationship
	 */
	public ICIPRelationship findOne(Integer id) {
		logger.info("Fetching relationship by Id {}", id);
		return relationshipRepository.findById(id).orElse(null);
	}

	/**
	 * Save.
	 *
	 * @param relationship the relationship
	 * @return the ICIP relationship
	 */
	@Override
	public ICIPRelationship save(ICIPRelationship relationship) {
		relationship.setAlias(
				relationship.getAlias() != null && !relationship.getAlias().trim().isEmpty() ? relationship.getAlias()
						: relationship.getName());
		return relationshipRepository.save(relationship);
	}

	/**
	 * Update.
	 *
	 * @param rel the rel
	 * @return the ICIP relationship
	 * @throws SQLException the SQL exception
	 */
	public ICIPRelationship update(ICIPRelationship rel) throws SQLException {
		ICIPRelationship fetched = relationshipRepository.getOne(rel.getId());
		if (rel.getName() != null)
			fetched.setName(rel.getName());
		if (rel.getOrganization() != null)
			fetched.setOrganization(rel.getOrganization());
		if (rel.getLastmodifiedby() != null)
			fetched.setLastmodifiedby(rel.getLastmodifiedby());
		if (rel.getSchema_relation() != null)
			fetched.setSchema_relation(rel.getSchema_relation());
		if (rel.getRelationship_template() != null)
			fetched.setRelationship_template(rel.getRelationship_template());
		if (rel.getAlias() != null)
			fetched.setAlias(rel.getAlias());
		if (rel.getSchemaA() != null)
			fetched.setSchemaA(rel.getSchemaA());
		if (rel.getSchemaB() != null)
			fetched.setSchemaB(rel.getSchemaB());
		fetched.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));
		logger.info("Updating relationship {}", fetched.getName());
		return relationshipRepository.save(fetched);
	}

	/**
	 * Delete.
	 *
	 * @param id the id
	 * @throws SQLException the SQL exception
	 */
	public void delete(Integer id) throws SQLException {
		relationshipRepository.deleteById(id);
		logger.info("Deleting relationship by Id {}", id);

	}

	/**
	 * Gets the all relationships.
	 *
	 * @return the all relationships
	 */
	@Override
	public List<ICIPRelationship> getAllRelationships() {
		logger.debug("Getting all pipelines");
		return relationshipRepository.findAll();
	}
	
	@Override
	public List<ICIPRelationship> getAllRelationshipsByOrg(String org) {
		logger.debug("Getting all pipelines by org");
		return relationshipRepository.findByOrganization(org);
	}
	
	@Override
	public JsonObject export(Marker marker, String source, JSONArray modNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			joblogger.info(marker,"Exporting relationship started");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			
//			List<ICIPRelationship> relationship = relationshipRepository.findByOrganization(source);
			List<ICIPRelationship> relationship = new ArrayList<>();
			modNames.forEach(alias -> {
				relationship.add(relationshipRepository.findByAliasAndOrganization(alias.toString(), source));
			});
			List<ICIPSchemaRegistry> relrelatedschemas = new ArrayList<>();
			Optional.ofNullable(relationship).orElse(Collections.emptyList()).forEach(relation -> {
				ICIPSchemaRegistry schA = schemaRegistryRepository.findByNameAndOrganization(relation.getSchemaA(),source);
				ICIPSchemaRegistry schB = schemaRegistryRepository.findByNameAndOrganization(relation.getSchemaB(),source);
				relrelatedschemas.add(schA);
				relrelatedschemas.add(schB);
			});
			jsnObj.add("mlrelationship", gson.toJsonTree(relationship));
			if(relrelatedschemas != null)
				jsnObj.add("relrelatedschemas", gson.toJsonTree(relrelatedschemas));
			joblogger.info(marker, "Exported relationship successfully");
		}
		catch(Exception ex) {
			joblogger.error(marker, "Error in exporting relationship");
			joblogger.error(marker, ex.getMessage());
		}
		return jsnObj;
	}
	
	public void importData(Marker marker, String target, JSONObject jsonObject) {
		Gson g = new Gson();
		try {
			joblogger.info(marker, "Importing Relationship Started");
			JsonArray relations = g.fromJson(jsonObject.get("mlrelationship").toString(), JsonArray.class);
			JsonArray relationschemas = g.fromJson(jsonObject.get("relrelatedschemas").toString(), JsonArray.class);
			relations.forEach(x -> {
				ICIPRelationship rel = g.fromJson(x, ICIPRelationship.class);
				ICIPRelationship relPresent = relationshipRepository.findByNameAndOrganization(rel.getName(), target);
				rel.setOrganization(target);
				rel.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));
				rel.setLastmodifiedby(ICIPUtils.getUser(claim));
				rel.setId(null);
				try {
					if(relPresent == null)
					relationshipRepository.save(rel);
				}
				catch(DataIntegrityViolationException de) {
					joblogger.error(marker, "Error in importing duplicate relation {}",rel.getAlias());
				}
			});
			relationschemas.forEach(x -> {
				ICIPSchemaRegistry sch = g.fromJson(x, ICIPSchemaRegistry.class);
				ICIPSchemaRegistry schPresent = null;
				if(sch != null) {
					schPresent = schemaRegistryRepository.findByNameAndOrganization(sch.getName(), target);
					sch.setOrganization(target);
					sch.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));
					sch.setLastmodifiedby(ICIPUtils.getUser(claim));
					sch.setId(null);
				}
				try {
					if(schPresent == null)
					schemaRegistryRepository.save(sch);
				}
				catch(DataIntegrityViolationException de) {
					joblogger.error(marker, "Error in importing duplicate schema {}",sch.getAlias());
				}
			});
			joblogger.info(marker, "Imported Relationships Successfully");
		}
		catch(Exception ex) {
			joblogger.error(marker, "Error in importing Relationships");
			joblogger.error(marker, ex.getMessage());
		}
	}

}
