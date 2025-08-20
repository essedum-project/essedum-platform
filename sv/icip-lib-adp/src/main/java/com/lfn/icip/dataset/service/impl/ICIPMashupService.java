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

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.dataset.constants.ICIPPluginConstants;
import com.lfn.icip.dataset.model.ICIPMashups;
import com.lfn.icip.dataset.model.ICIPSchemaForm;
import com.lfn.icip.dataset.model.MlSpecTemplates;
import com.lfn.icip.dataset.repository.ICIPMashupRepository;
import com.lfn.icip.dataset.service.IICIPMashupService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPSchemaRegistryService.
 *
 * @author essedum
 */
@Service
@Transactional
public class ICIPMashupService implements IICIPMashupService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPMashupService.class);

	/** The schema registry repository. */
	private ICIPMashupRepository mashupRepository;
	
	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/**
	 * Instantiates a new ICIP schema registry service.
	 *
	 * @param schemaRegistryRepository the schema registry repository
	 * @param ncs the ncs
	 */
	public ICIPMashupService(ICIPMashupRepository mashupRepository) {
		super();
		this.mashupRepository = mashupRepository;
	}


	/**
	 * Gets the mashup.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the mashup
	 */
	@Override
	public ICIPMashups getMashupByName(String name, String org) {
		ICIPMashups mashup = mashupRepository.findByNameAndOrganization(name, org);
		return mashup;
	}
	
	@Override
	public ICIPMashups save(ICIPMashups mashups) {
		return mashupRepository.save(mashups);
	}


	/**
	 * Gets all mashups.
	 *
	 * @param org the org
	 * @return all mashups
	 */
	@Override
	public List<ICIPMashups> getMashupsByOrg(String organization) {
		logger.info("Getting Schemas");
		return mashupRepository.getMashupsByOrganization(organization);
	}
	
	@Override
	public boolean copy(Marker marker, String fromProjectId, String toProjectId, int datasetProjectId) {
		List<ICIPMashups> mashups = mashupRepository.findByOrganization(fromProjectId);
		List<ICIPMashups> toMashups = mashups.parallelStream().map(form -> {
			form.setId(null);
			form.setOrganization(toProjectId);
			return form;
		}).collect(Collectors.toList());
		toMashups.stream().forEach(mashup -> {
			
			ICIPMashups schemaform = getMashupByName(mashup.getName(), mashup.getOrganization());
			logger.info("Fethed a mashup");
			String id = null;
			if (schemaform != null) {
				mashup.setId(schemaform.getId());
				id = schemaform.getId().toString();
			}
			try {
				save(mashup);
			} catch (Exception e) {
				joblogger.error("Error in saving Mashup : {}", mashup.getName());
				joblogger.error(e.getMessage());
			}
		});
		return true;
	}


	@Override
	public Map<String, String> deleteMashupByName(String name, String org) {
		Map<String, String> response = new HashMap<>();
		ICIPMashups mashup = mashupRepository.findByNameAndOrganization(name, org);
		if (mashup != null) {
			try {
				mashupRepository.delete(mashup);
				response.put(ICIPPluginConstants.MESSAGE, ICIPPluginConstants.MESSAGE_SUCCESS);
			} catch (Exception e) {
				response.put(ICIPPluginConstants.MESSAGE, ICIPPluginConstants.MESSAGE_FAILED);
				logger.error("Error because of:{} at class:{} and line:{}", e.getMessage(),
						e.getStackTrace()[0].getClass(), e.getStackTrace()[0].getLineNumber());
				if (logger.isDebugEnabled()) {
					logger.error("Error due to:", e);
				}
			}
		}
		return response;
	}
	
//	@Override
//	public boolean copytemplate(Marker marker, String fromProjectId, String toProjectId, int datasetProjectId) {
//		List<ICIPMashups> mashups = mashupRepository.findByInterfacetypeAndOrganization("template",fromProjectId);
//		List<ICIPMashups> toMashups = mashups.parallelStream().map(form -> {
//			form.setId(null);
//			form.setOrganization(toProjectId);
//			return form;
//		}).collect(Collectors.toList());
//		toMashups.stream().forEach(mashup -> {
//			ICIPMashups schemaform = getMashupByName(mashup.getName(), mashup.getOrganization());
//			String id = null;
//			if (schemaform != null) {
//				mashup.setId(schemaform.getId());
//				id = schemaform.getId().toString();
//			}
//			try {
//				save(mashup);
//			} catch (Exception e) {
//				joblogger.error(marker,"Error in saving mashup : {}", mashup.getName());
//				joblogger.error(e.getMessage());
//			}
//		});
//		return true;
//	}
	@Override
	public JsonObject export(Marker marker, String source, JSONArray modNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			joblogger.info(marker, "Exporting Mashups started");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			List<ICIPMashups> mashups = new ArrayList<>();
			modNames.forEach(mashupName -> {
				mashups.add(mashupRepository.findByNameAndOrganization(mashupName.toString(),source));
			});
			jsnObj.add("mlmashups", gson.toJsonTree(mashups));
			joblogger.info(marker, "Exported specTemplates successfully");
		}
		catch(Exception ex) {
			joblogger.error(marker,"Error in exporting Mashups");
			joblogger.error(marker, ex.getMessage());
		}
		
		return jsnObj;
	}
	
	@Override
	public void importData(Marker marker, String target, JSONObject jsonObject) {
		Gson g = new Gson();
		try {
			joblogger.info(marker, "Importing mashups Started");
			JsonArray mashups = g.fromJson(jsonObject.get("mlmashups").toString(), JsonArray.class);
			mashups.forEach(x -> {
				ICIPMashups mash = g.fromJson(x, ICIPMashups.class);
				ICIPMashups mashPresent = mashupRepository.findByNameAndOrganization(mash.getName(),target);
				mash.setOrganization(target);
				mash.setId(null);
				try {
					if(mashPresent == null)
						mashupRepository.save(mash);
				}
				catch(Exception de) {
					joblogger.error(marker, "Error in importing duplicate mashups {}",mash.getName());
				}
			});
			joblogger.info(marker, "Imported mashups Successfully");
		}
		catch(Exception ex) {
			joblogger.error(marker, "Error in importing mashups");
			joblogger.error(marker, ex.getMessage());
		}
	}

}
