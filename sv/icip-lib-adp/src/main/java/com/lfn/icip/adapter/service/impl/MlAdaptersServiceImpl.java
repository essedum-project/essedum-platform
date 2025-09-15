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

package com.lfn.icip.adapter.service.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONObject;
import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.sql.Timestamp;
import java.time.Instant;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.adapter.service.MlAdaptersService;
import com.lfn.icip.dataset.constants.ICIPPluginConstants;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDataset2;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.model.ICIPSchemaRegistry;
import com.lfn.icip.dataset.model.MlAdapters;
import com.lfn.icip.dataset.model.MlInstance;
import com.lfn.icip.dataset.model.MlSpecTemplates;
import com.lfn.icip.dataset.repository.ICIPDatasetRepository;
import com.lfn.icip.dataset.repository.ICIPDatasetRepository2;
import com.lfn.icip.dataset.repository.MlAdaptersRepository;
import com.lfn.icip.dataset.repository.MlInstancesRepository;
import com.lfn.icip.dataset.repository.MlSpecTemplatesRepository;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetService;
import com.lfn.icip.dataset.service.impl.ICIPDatasourceService;

/**
 * The Class MlAdaptersServiceImpl.
 *
 * @author essedum
 */
@Service
@RefreshScope
public class MlAdaptersServiceImpl implements MlAdaptersService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(MlAdaptersServiceImpl.class);

	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/** The mlAdaptersRepository repository. */
	private MlAdaptersRepository mlAdaptersRepository;

	/** The datasource service. */
	@Autowired
	private IICIPDatasourceService datasourceService;
	
	/** The datasource service. */
	@Autowired
	private ICIPDatasourceService datasourceServices;

	/** The mlSpecTemplatesRepository repository. */
	@Autowired
	private MlSpecTemplatesRepository mlSpecTemplatesRepository;
	
	@Autowired
	private MlSpecTemplatesServiceImpl specService;

	@Autowired
	private ICIPDatasetRepository2 datasetRepository2;
	
	@Autowired
	private ICIPDatasetRepository datasetRepository;
	
	/** The dataset service. */
	@Autowired
	private ICIPDatasetService datasetService;

	/** The mlInstancesRepository repository. */
	@Autowired
	private MlInstancesRepository mlInstancesRepository;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	public MlAdaptersServiceImpl(MlAdaptersRepository mlAdaptersRepository) {
		super();
		this.mlAdaptersRepository = mlAdaptersRepository;
	}

	@Override
	public MlAdapters save(MlAdapters mlAdapters) {
		mlAdapters.setCreatedon(Timestamp.from(Instant.now()));
		mlAdapters.setCreatedby(ICIPUtils.getUser(claim));
		mlAdapters.setLastmodifiedon(mlAdapters.getCreatedon());
		mlAdapters.setIsactive(ICIPPluginConstants.ACTIVE);
		return mlAdaptersRepository.save(mlAdapters);
	}

	@Override
	public MlAdapters updateMlAdapter(MlAdapters mlAdapters) {
		MlAdapters mlAdaptersFromDB = this.getMlAdapteByNameAndOrganization(mlAdapters.getName(),
				mlAdapters.getOrganization());
		if (mlAdaptersFromDB != null) {
			mlAdaptersFromDB.setLastmodifiedon(Timestamp.from(Instant.now()));
			mlAdaptersFromDB.setLastmodifiedby(ICIPUtils.getUser(claim));
			mlAdaptersFromDB.setConnectionid(mlAdapters.getConnectionid());
			mlAdaptersFromDB.setConnectionname(mlAdapters.getConnectionname());
			mlAdaptersFromDB.setDescription(mlAdapters.getDescription());
			mlAdaptersFromDB.setSpectemplatedomainname(mlAdapters.getSpectemplatedomainname());
			mlAdaptersFromDB.setExecutiontype(mlAdapters.getExecutiontype());
			mlAdaptersFromDB.setChainName(mlAdapters.getChainName());
			mlAdaptersFromDB.setIsChain(mlAdapters.getIsChain());
			
			return mlAdaptersRepository.save(mlAdaptersFromDB);
		}
		return mlAdaptersFromDB;
	}

	@Override
	public MlAdapters getMlAdapteByNameAndOrganization(String name, String org) {
		return mlAdaptersRepository.getMlAdapteByNameAndOrganization(name, org).stream().findFirst().orElse(null);
	}

	@Override
	public List<MlAdapters> getMlAdaptesByOrganization(String org) {
		return mlAdaptersRepository.getMlAdaptesByOrganization(org);
	}

	@Override
	public Map<String, String> deleteMlAdapteByNameAndOrganization(String name, String org) {
		MlAdapters mlAdapters = this.getMlAdapteByNameAndOrganization(name, org);
		Map<String, String> response = new HashMap<>();
		if (mlAdapters != null) {
			List<String> instanceList = mlInstancesRepository.getMlInstanceByAdapterNameAndOrganization(name, org);
			if (instanceList == null || instanceList.isEmpty()) {
				List<ICIPDataset2> iCIPDataset2ListFromDB = datasetRepository2
						.getDatasetsByAdapterNameAndOrganization(name, org);
				if (!iCIPDataset2ListFromDB.isEmpty())
					datasetRepository2.deleteAll(iCIPDataset2ListFromDB);
				mlAdaptersRepository.delete(mlAdapters);
				response.put(ICIPPluginConstants.MESSAGE, ICIPPluginConstants.MESSAGE_SUCCESS);
			} else {
				response.put(ICIPPluginConstants.MESSAGE, ICIPPluginConstants.MESSAGE_FAILED);
			}
		}
		return response;
	}

	@Override
	public MlAdapters updateAPISpec(MlAdapters mlAdapters) {
		MlAdapters mlAdaptersFromDB = this.getMlAdapteByNameAndOrganization(mlAdapters.getName(),
				mlAdapters.getOrganization());
		if (mlAdaptersFromDB != null) {
			mlAdaptersFromDB.setLastmodifiedon(Timestamp.from(Instant.now()));
			mlAdaptersFromDB.setLastmodifiedby(ICIPUtils.getUser(claim));
			mlAdaptersFromDB.setApispec(mlAdapters.getApispec());
			return mlAdaptersRepository.save(mlAdaptersFromDB);
		}
		return mlAdaptersFromDB;
	}

	@Override
	public Map<String, Object> getFiltersByOrganization(String org) {
		List<MlAdapters> mlAdapters = mlAdaptersRepository.getMlAdaptesByOrganization(org);
		List<String> categoryFilters = new ArrayList<>();
		List<String> connectionFilters = new ArrayList<>();
		List<String> specTemplateFilters = new ArrayList<>();
		Map<String, Object> filters = new HashMap<>();
		mlAdapters.forEach((adp -> {
			if (!categoryFilters.contains(adp.getCategory()))
				categoryFilters.add(adp.getCategory());
			if (!connectionFilters.contains(adp.getConnectionname()))
				connectionFilters.add(adp.getConnectionname());

			if (!specTemplateFilters.contains(adp.getSpectemplatedomainname()))
				specTemplateFilters.add(adp.getSpectemplatedomainname());
		}));
		filters.put("categories", categoryFilters);
		filters.put("connections", connectionFilters);
		filters.put("specTemplates", specTemplateFilters);
		return filters;
	}

	@Override
	public List<MlAdapters> getMlAdaptersBySpecTemplateDomainNameAndOrg(String spectemplatedomainname, String org) {
		return mlAdaptersRepository.getMlAdaptersBySpecTemplateDomainNameAndOrg(spectemplatedomainname, org);

	}

	@Override
	public List<String> getAdapterNamesByOrganization(String org) {
		return mlAdaptersRepository.getAdapterNamesByOrganization(org);
	}

	public boolean copy(String fromProjectName, String toProjectId) {
		List<MlAdapters> adapterList = mlAdaptersRepository.getMlAdaptesByOrganization(fromProjectName);
		adapterList.stream().forEach(adapter -> {
			MlAdapters ada = mlAdaptersRepository.getMlAdapteByNameAndOrganization(adapter.getName(), fromProjectName)
					.get(0);
			try {
				ada.setId(null);
				ada.setOrganization(toProjectId);
				if (ada != null) {
					String updatedAPISpecTemp = ada.getApispec().replace(fromProjectName, "{org}");
					ada.setApispec(updatedAPISpecTemp);
				}
				mlAdaptersRepository.save(ada);
			} catch (Exception e) {
				joblogger.error("Error in mlAdapters Copy Blueprint {}", e.getMessage());
			}
		});
		return true;
	}
	
	public JsonObject export(Marker marker, String source, JSONArray modNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			joblogger.info(marker, "Exporting adapters started");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			
//			List<MlAdapters> adapters = mlAdaptersRepository.getMlAdaptesByOrganization(source);
			List<MlAdapters> adapters = new ArrayList<>();
			List<ICIPDatasource> adprelateddatasources = new ArrayList<>();
			List<MlSpecTemplates> adprelatedspec = new ArrayList<>();
			List<ICIPDataset> adpImplMetods = new ArrayList<>();
			
			modNames.forEach(name -> {
				MlAdapters mlAdapter = mlAdaptersRepository.getMlAdapteByNameAndOrganization(name.toString(), source)
						.get(0);
				if (mlAdapter != null) {
					String updatedAPISpecTemp = mlAdapter.getApispec().replace(source, "{org}");
					mlAdapter.setApispec(updatedAPISpecTemp);
					adapters.add(mlAdapter);
				}
			});
			
			adapters.stream().forEach(adp -> {
				ICIPDatasource dsrc = datasourceService.getDatasourceByNameAndOrganization(adp.getConnectionid(),
						source);
				adprelateddatasources.add(dsrc);
				List<MlSpecTemplates> spec = mlSpecTemplatesRepository
						.getMlSpecTemplateByDomainnameAndOrganization(adp.getSpectemplatedomainname(), source);
				if (spec != null && !spec.isEmpty())
					spec.forEach(specTemp -> {
						String updatedSpecTemp = specTemp.getApispectemplate().replace(source, "{org}");
						specTemp.setApispectemplate(updatedSpecTemp);
						adprelatedspec.add(specTemp);
					});
				List<ICIPDataset2> iCIPDataset2ListFromDB = datasetRepository2
						.getDatasetsByAdapterNameAndOrganization(adp.getName(), source);
				if (iCIPDataset2ListFromDB != null && !iCIPDataset2ListFromDB.isEmpty())
					iCIPDataset2ListFromDB.forEach(name -> {
						adpImplMetods.add(datasetRepository.findByNameAndOrganization(name.getName(), source));
					});
			});
			jsnObj.add("mladapters", gson.toJsonTree(adapters));
			if (adprelateddatasources != null)
				jsnObj.add("mldatasource", gson.toJsonTree(adprelateddatasources));
			if (adprelatedspec != null)
				jsnObj.add("mlspectemplates", gson.toJsonTree(adprelatedspec));
			if (adpImplMetods != null && !adpImplMetods.isEmpty())
				jsnObj.add("mldatasets", gson.toJsonTree(adpImplMetods));
			joblogger.info(marker, "Exported adapters successfully");
		} catch (Exception ex) {
			joblogger.error(marker, "Error in exporting adapters");
			joblogger.error(marker, ex.getMessage());
		}
		return jsnObj;
	}

	public void importData(Marker marker, String target, JSONObject jsonObject) {
		Gson g = new Gson();
		try {
			joblogger.info(marker, "Importing adapters started");
			JsonArray adapters = g.fromJson(jsonObject.get("mladapters").toString(), JsonArray.class);
			datasourceServices.importData(marker, target, jsonObject);
			specService.importData(marker, target, jsonObject);
			datasetService.importData(marker, target, jsonObject);
			adapters.forEach(x -> {
				MlAdapters adp = g.fromJson(x, MlAdapters.class);
				MlAdapters adpPresent = mlAdaptersRepository.getMlAdapteByNameAndOrganization(adp.getName(), target).stream().findFirst().orElse(null);
				adp.setOrganization(target);
				adp.setLastmodifiedby(ICIPUtils.getUser(claim));
				adp.setLastmodifiedon(new Timestamp(System.currentTimeMillis()));
				adp.setCreatedby(ICIPUtils.getUser(claim));
				adp.setCreatedon(new Timestamp(System.currentTimeMillis()));
				adp.setId(null);
				try {
					if(adpPresent == null)
					mlAdaptersRepository.save(adp);
				} catch (DataIntegrityViolationException de) {
					joblogger.error(marker, "Error in importing duplicate adapter {}", adp.getName());
				}
			});
			joblogger.info(marker, "Imported adapters successfully");
		} catch (Exception ex) {
			joblogger.error(marker, "Error in importing adapters");
			joblogger.error(marker, ex.getMessage());
		}
	}

	@Override
	public Long getAdapterImplementationCount(String organization,String category,String spec,String connection,String query) {
		List<String> categoryList = category!= null ? Arrays.asList(category.split(",")) : null;
		List<String> specList = spec != null ? Arrays.asList(spec.split(",")) : null;
		List<String> connectionList = connection!=null ? Arrays.asList(connection.split(",")) : null;
		return mlAdaptersRepository.getAdaptersCountByOptionalParams(organization, categoryList, specList, connectionList, query);

	}

	@Override
	public Page<MlAdapters> getAdapterImplementation(String organization, String category, String spec,
			String connection, String query, Pageable pageable) {
		List<String> categoryList = category != null ? Arrays.asList(category.split(",")) : null;
		List<String> specList = spec!=null ? Arrays.asList(spec.split(",")) : null;
		List<String> connectionList=connection!=null ? Arrays.asList(connection.split(",")) : null;
		return mlAdaptersRepository.getAdaptersByOptionalParams(organization, categoryList, specList, connectionList, query, pageable);
	}

}