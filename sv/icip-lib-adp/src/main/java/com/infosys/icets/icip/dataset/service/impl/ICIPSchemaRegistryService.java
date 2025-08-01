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

package com.infosys.icets.icip.dataset.service.impl;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.json.JSONObject;
import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.ai.comm.lib.util.logger.JobLogger;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.NameEncoderService;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.model.ICIPSchemaForm;
import com.infosys.icets.icip.dataset.model.ICIPSchemaRegistry;
import com.infosys.icets.icip.dataset.model.dto.ICIPSchemaRegistryDTO2;
import com.infosys.icets.icip.dataset.repository.ICIPSchemaFormRepository;
import com.infosys.icets.icip.dataset.repository.ICIPSchemaRegistryRepository;
import com.infosys.icets.icip.dataset.service.IICIPSchemaRegistryService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPSchemaRegistryService.
 *
 * @author icets
 */
@Service
@Transactional
public class ICIPSchemaRegistryService implements IICIPSchemaRegistryService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPSchemaRegistryService.class);

	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/** The schema registry repository. */
	private ICIPSchemaRegistryRepository schemaRegistryRepository;
	
	@Autowired
	private ICIPSchemaFormRepository schemaFormRepository;

	/** The ncs. */
	private NameEncoderService ncs;
	
	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	/**
	 * Instantiates a new ICIP schema registry service.
	 *
	 * @param schemaRegistryRepository the schema registry repository
	 * @param ncs the ncs
	 */
	public ICIPSchemaRegistryService(ICIPSchemaRegistryRepository schemaRegistryRepository, NameEncoderService ncs) {
		super();
		this.schemaRegistryRepository = schemaRegistryRepository;
		this.ncs = ncs;
	}

	/**
	 * Fetch schema value.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the string
	 */
	@Override
	public String fetchSchemaValue(String name, String org) {
		ICIPSchemaRegistry schema = schemaRegistryRepository.getByNameAndOrganization(name, org);
		if (schema != null) {
			return schema.getSchemavalue();
		}
		return "";
	}

	/**
	 * Gets the schema by name.
	 *
	 * @param name the name
	 * @param org the org
	 * @return the schema by name
	 */
	@Override
	public ICIPSchemaRegistry getSchemaByName(String name, String org) {
		ICIPSchemaRegistry schema = schemaRegistryRepository.getByNameAndOrganization(name, org);
		return schema;
	}
	
	@Override
	public ICIPSchemaRegistry getSchemaByAlias(String alias, String org) {
		ICIPSchemaRegistry schema = schemaRegistryRepository.getByAliasAndOrganization(alias, org);
		return schema;
	}


	/**
	 * Gets the schema.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the schema
	 */
	@Override
	public ICIPSchemaRegistry getSchema(String name, String org) {
		return schemaRegistryRepository.findByNameAndOrganization(name, org);
	}


	/**
	 * Search schemas.
	 *
	 * @param name         the name
	 * @param organization the organization
	 * @return the list
	 */
	@Override
	public List<ICIPSchemaRegistry> searchSchemas(String name, String organization) {
		return schemaRegistryRepository.searchByName(name, organization);
	}

	/**
	 * Delete.
	 *
	 * @param name the name
	 * @param org  the org
	 */
	@Override
	public void delete(String name, String org) {
		ICIPSchemaRegistry schemaRegistry = schemaRegistryRepository.findByNameAndOrganization(name, org);
		if (schemaRegistry != null) {
			logger.info("deleting schema ");
			schemaRegistryRepository.delete(schemaRegistry);
		}
	}

	public ICIPSchemaRegistry save(ICIPSchemaRegistry schema) {
		return schemaRegistryRepository.save(schema);
	}
	/**
	 * Save.
	 *
	 * @param name   the name
	 * @param org    the org
	 * @param schema the schema
	 * @return the ICIP schema registry
	 */
	public ICIPSchemaRegistry save(String name, String org, ICIPSchemaRegistry schema) {
		if (name.equals("new")) {
			name = createName(schema.getOrganization(), schema.getAlias());
		} else {
			ICIPSchemaRegistry schemaRegistry = schemaRegistryRepository.findByNameAndOrganization(name, org);
			//if schemaRegistry is not null,
			//set schema by Id from schemaRegistry's Id
			if(schemaRegistry!=null)
				schema.setId(schemaRegistry.getId());
		}
		schema.setAlias(schema.getAlias() != null && !schema.getAlias().trim().isEmpty() ? schema.getAlias()
				: schema.getName());
		schema.setName(name);
		logger.info("saving schema ");
		return schemaRegistryRepository.save(schema);
	}

	/**
	 * Fetch all by org.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	@Override
	public List<ICIPSchemaRegistry> fetchAllByOrg(String organization) {
		return schemaRegistryRepository.findAllByOrganization(organization);
	}
	/**
	 * Fetch all by org and filter/query.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	@Override
	public List<ICIPSchemaRegistry> fetchAllByOrgAndQuery(String query,String organization) {
		return schemaRegistryRepository.findAllByOrganizationAndQuery(query,organization);
	}

	/**
	 * Gets the schema names by org.
	 *
	 * @param organization the organization
	 * @return the schema names by org
	 */
	@Override
	public List<NameAndAliasDTO> getSchemaNamesByOrg(String organization) {
		logger.info("Getting Schemas");
		return schemaRegistryRepository.getSchemasByOrg(organization);
	}

	/**
	 * Gets the schemas by group and org.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @param search       the search
	 * @param page         the page
	 * @param size         the size
	 * @return the schemas by group and org
	 */
	@Override
	public List<ICIPSchemaRegistryDTO2> getSchemasByGroupAndOrg(String organization, String groupName, String search,
			int page, int size) {
		if (search == null || search.trim().isEmpty()) {
			return schemaRegistryRepository.findByOrganizationAndGroups(organization, groupName,
					PageRequest.of(page, size));
		} else {
			return schemaRegistryRepository.findByOrganizationAndGroupsAndSearch(organization, groupName, search,
					PageRequest.of(page, size));
		}
	}

	/**
	 * Gets the schema len by group and org.
	 *
	 * @param group  the group
	 * @param org    the org
	 * @param search the search
	 * @return the schema len by group and org
	 */
	@Override
	public Long getSchemaLenByGroupAndOrg(String group, String org, String search) {
		logger.info("Getting Groups Length by Organization {}", org);
		if (search == null || search.trim().isEmpty()) {
			return schemaRegistryRepository.countByGroupAndOrganization(group, org);
		} else {
			return schemaRegistryRepository.countByGroupAndOrganizationAndSearch(group, org, search);
		}
	}

	/**
	 * Rename project.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	@Override
	public boolean renameProject(String fromProjectId, String toProjectId) {
		List<ICIPSchemaRegistry> dsets = schemaRegistryRepository.findByOrganization(fromProjectId);
		dsets.stream().forEach(ds -> {
			ds.setOrganization(toProjectId);
			schemaRegistryRepository.save(ds);
		});
		return true;
	}

	/**
	 * Copy.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	@Override
	public boolean copy(Marker marker, String fromProjectId, String toProjectId) {
		List<ICIPSchemaRegistry> sregistries = schemaRegistryRepository.findByOrganization(fromProjectId);
		List<ICIPSchemaRegistry> toSregistries = sregistries.parallelStream().map(sregistry -> {
			sregistry.setId(null);
			sregistry.setOrganization(toProjectId);
			return sregistry;
		}).collect(Collectors.toList());
		toSregistries.stream().forEach(sregistry -> {
		
			if (getSchema(sregistry.getName(), sregistry.getOrganization()) == null) {
				try {
					schemaRegistryRepository.save(sregistry);
					joblogger.info(marker, "saving schema {} to {}", sregistry.getAlias(), sregistry.getOrganization());
				} catch (DataIntegrityViolationException e) {
					joblogger.error(marker, e.getMessage());
				}
			}
		});
		return true;
	}

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	@Override
	public void delete(String project) {
		schemaRegistryRepository.deleteByProject(project);
	}

	/**
	 * Copy selected.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @param schemas       the schemas
	 * @return true, if successful
	 */
	@Override
	public boolean copySelected(Marker marker, String fromProjectId, String toProjectId, String schemas) {
		ICIPSchemaRegistry sregistries = schemaRegistryRepository.findByNameAndOrganization(schemas, fromProjectId);
		ICIPSchemaRegistry toSregistries = new ICIPSchemaRegistry();
		toSregistries.setId(null);
		toSregistries.setOrganization(toProjectId);
		toSregistries.setName(sregistries.getName());
		toSregistries.setAlias(sregistries.getAlias());
		toSregistries.setSchemavalue(sregistries.getSchemavalue());
		if (getSchema(toSregistries.getName(), toSregistries.getOrganization()) == null) {
			try {
				schemaRegistryRepository.save(toSregistries);
			} catch (DataIntegrityViolationException e) {
				joblogger.error(marker, e.getMessage());
			}
		}
		return true;
	}

	/**
	 * Creates the name.
	 *
	 * @param org the org
	 * @param alias the alias
	 * @return the string
	 */
	@Override
	public String createName(String org, String alias) {
		boolean uniqueName = true;
		String name = null;
		do {
			name = ncs.nameEncoder(org, alias);
			uniqueName = schemaRegistryRepository.countByName(name) == 0;
		} while (!uniqueName);
		logger.info(name);
		return name;
	}

	/**
	 * Gets the name and alias.
	 *
	 * @param groupName the group name
	 * @param org the org
	 * @return the name and alias
	 */
	@Override
	public List<NameAndAliasDTO> getNameAndAlias(String groupName, String org) {
		return schemaRegistryRepository.getNameAndAlias(groupName, org);
	}
	
	@Override
	public ICIPSchemaRegistry getSchemaByAliasAndOrganization(String name, String org) {
		return schemaRegistryRepository.findByAliasAndOrganization(name, org);
	}
	
	public JsonObject export(Marker marker, String source, JSONArray modNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			joblogger.info(marker,"Exporting schemas started");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			
			List<ICIPSchemaRegistry> schemas = new ArrayList<>();
			List<ICIPSchemaForm> schemaform = new ArrayList<>();
			modNames.forEach(alias -> {
				ICIPSchemaRegistry schem = schemaRegistryRepository.findByAliasAndOrganization(alias.toString(), source);
				schemas.add(schem);
				List<ICIPSchemaForm> forms = schemaFormRepository.getBySchemanameAndOrganization(schem.getName(),source);
				schemaform.addAll(forms);
			});
			jsnObj.add("mlschemaregistry", gson.toJsonTree(schemas));
			if(schemaform != null)
				jsnObj.add("mlschemaformtemplates", gson.toJsonTree(schemaform));
			joblogger.info(marker, "Exported schemas successfully");
		}
		catch(Exception ex) {
			joblogger.error(marker, "Error in exporting schemas");
			joblogger.error(marker, ex.getMessage());
		}
		return jsnObj;
	}

	public void importData(Marker marker, String target, JSONObject jsonObject) {
		Gson g = new Gson();
		try {
			joblogger.info(marker, "Importing Schemas Started");
			JsonArray schemas = g.fromJson(jsonObject.get("mlschemaregistry").toString(), JsonArray.class);
			JsonArray schemaforms = g.fromJson(jsonObject.get("mlschemaformtemplates").toString(), JsonArray.class);
			schemas.forEach(x -> {
				ICIPSchemaRegistry sch = g.fromJson(x, ICIPSchemaRegistry.class);
				ICIPSchemaRegistry schPresent = schemaRegistryRepository.findByNameAndOrganization(sch.getName(), target);
				sch.setOrganization(target);
				sch.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));
				sch.setLastmodifiedby(ICIPUtils.getUser(claim));
				sch.setId(null);
				try {
					if(schPresent == null)
					schemaRegistryRepository.save(sch);
				}
				catch(DataIntegrityViolationException de) {
					joblogger.info(marker, "Error in importing duplicate schema {}",sch.getAlias());
				}
			});
			schemaforms.forEach(x -> {
				ICIPSchemaForm sch = g.fromJson(x, ICIPSchemaForm.class);
				ICIPSchemaForm schPresent = schemaFormRepository.getByNameAndSchemanameAndOrganization(sch.getName(), sch.getSchemaname(), target);
				sch.setOrganization(target);
				sch.setId(null);
				try {
					if(schPresent == null)
					schemaFormRepository.save(sch);
				}
				catch(DataIntegrityViolationException de) {
					joblogger.info(marker, "Error in importing duplicate schemaform {}",sch.getAlias());
				}
			});
			joblogger.info(marker, "Imported schemas successfully");
		}
		catch(Exception ex) {
			joblogger.error(marker, "Error in importing schemas");
			joblogger.error(marker, ex.getMessage());
		}
		
	}
}
