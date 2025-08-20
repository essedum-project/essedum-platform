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

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONObject;
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

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.Crypt;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.adapter.service.MlInstancesService;
import com.lfn.icip.dataset.constants.ICIPPluginConstants;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDataset2;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.model.MlAdapters;
import com.lfn.icip.dataset.model.MlInstance;
import com.lfn.icip.dataset.model.MlSpecTemplates;
import com.lfn.icip.dataset.repository.ICIPDatasetRepository;
import com.lfn.icip.dataset.repository.ICIPDatasetRepository2;
import com.lfn.icip.dataset.repository.ICIPDatasourceRepository;
import com.lfn.icip.dataset.repository.MlAdaptersRepository;
import com.lfn.icip.dataset.repository.MlInstancesRepository;
import com.lfn.icip.dataset.repository.MlSpecTemplatesRepository;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.service.impl.ICIPDatasourceService;

/**
 * The Class MlInstancesServiceImpl.
 *
 * @author essedum
 */
@Service
@RefreshScope
public class MlInstancesServiceImpl implements MlInstancesService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(MlInstancesServiceImpl.class);

	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);
	
	/** The datasource service. */
	@Autowired
	private IICIPDatasourceService datasourceService;
	
	/** The mlSpecTemplatesRepository repository. */
	@Autowired
	private MlSpecTemplatesRepository mlSpecTemplatesRepository;
	
	/** The mlInstancesRepository repository. */
	private MlInstancesRepository mlInstancesRepository;
	
	@Autowired
	private MlSpecTemplatesServiceImpl specService;
	
	@Autowired
	private ICIPDatasourceService datasourceServices;
	
	/** The adapter service. */
	@Autowired
	private MlAdaptersServiceImpl adapterService;
	
	@Autowired
	private MlAdaptersRepository mlAdaptersRepository;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;
	
	/** The encryption key. */
	@EssedumProperty("application.uiconfig.enckeydefault")
	private static String enckeydefault;
	
	@Autowired
	private ICIPDatasourceRepository iCIPDatasourceRepository;
	
	@Autowired
	private ICIPDatasetRepository2 datasetRepository2;
	
	@Autowired
	private ICIPDatasetRepository datasetRepository;

	public MlInstancesServiceImpl(MlInstancesRepository mlInstancesRepository) {
		super();
		this.mlInstancesRepository = mlInstancesRepository;
	}

	@Override
	public MlInstance save(MlInstance mlInstance) {
		MlAdapters mladapters= mlAdaptersRepository.getMlAdapteByNameAndOrganization(mlInstance.getAdaptername(), mlInstance.getOrganization()).stream().findFirst().orElse(null);
		mlInstance.setCreatedon(Timestamp.from(Instant.now()));
		mlInstance.setLastmodifiedon(mlInstance.getCreatedon());
		mlInstance.setCreatedby(ICIPUtils.getUser(claim));
		return mlInstancesRepository.save(mlInstance);
	}

	@Override
	public MlInstance updateMlInstance(MlInstance mlInstance) {
		MlInstance mlInstanceFromDB = this.getMlInstanceByNameAndOrganization(mlInstance.getName(),
				mlInstance.getOrganization());
		if (mlInstanceFromDB != null) {
			mlInstanceFromDB.setLastmodifiedon(Timestamp.from(Instant.now()));
			mlInstanceFromDB.setLastmodifiedby(ICIPUtils.getUser(claim));
			mlInstanceFromDB.setConnectionid(mlInstance.getConnectionid());
			mlInstanceFromDB.setConnectionname(mlInstance.getConnectionname());
			mlInstanceFromDB.setDescription(mlInstance.getDescription());
			mlInstanceFromDB.setExecutiontype(mlInstance.getExecutiontype());
			if (mlInstance.getJobid() != null)
				mlInstanceFromDB.setJobid(mlInstance.getJobid().toString());
			mlInstanceFromDB.setRuntimename(mlInstance.getRuntimename());
			if (mlInstance.getStatus() != null)
				mlInstanceFromDB.setStatus(mlInstance.getStatus().toString());
			return mlInstancesRepository.save(mlInstanceFromDB);
		}
		return mlInstanceFromDB;
	}

	@Override
	public MlInstance getMlInstanceByNameAndOrganization(String name, String org) {
		return mlInstancesRepository.getMlInstanceByNameAndOrganization(name, org);
	}

	@Override
	public Long getMlInstanceCountByOrganization(String org, String adapterName, String connection, String query) {
		 List<String> adapterNamesList = adapterName!=null?Arrays.asList(adapterName.split(",")):null;
		 List<String> connectionsList = connection!=null?Arrays.asList(connection.split(",")):null;
		return mlInstancesRepository.getMlInstanceCountByOptionalParams(org, adapterNamesList, connectionsList, query);
	}
	
	@Override
	public List<MlInstance> getMlInstanceByOrganization(String org, String adapterName, String connection, String query, Pageable pageable) {
		List<String> adapterNamesList = adapterName!=null?Arrays.asList(adapterName.split(",")):null;
		List<String> connectionsList = connection!=null?Arrays.asList(connection.split(",")):null;
		return mlInstancesRepository.getMlInstanceByOptionalParams(org, adapterNamesList, connectionsList, query, pageable).getContent();
	}

	@Override
	public Map<String, String> deleteMlInstanceByNameAndOrganization(String name, String org) {
		MlInstance mlInstance = this.getMlInstanceByNameAndOrganization(name, org);
		Map<String, String> response = new HashMap<>();
		if (mlInstance != null) {
			mlInstancesRepository.delete(mlInstance);
		}
		response.put(ICIPPluginConstants.MESSAGE, ICIPPluginConstants.MESSAGE_SUCCESS);
		return response;
	}

	@Override
	public Map<String, Object> getFiltersByOrganization(String org) {
		List<MlInstance> mlInstances = mlInstancesRepository.getMlInstanceByOrganization(org);
		List<String> adapterFilters = new ArrayList<>();
		List<String> connectionFilters = new ArrayList<>();
		Map<String, Object> filters = new HashMap<>();
		mlInstances.forEach((ins -> {
			if (!adapterFilters.contains(ins.getAdaptername()))
				adapterFilters.add(ins.getAdaptername());
			if (!connectionFilters.contains(ins.getConnectionname()))
				connectionFilters.add(ins.getConnectionname());
		}));
		filters.put("adapters", adapterFilters);
		filters.put("connections", connectionFilters);
		return filters;
	}

	@Override
	public List<String> getMlInstanceNamesByAdapterNameAndOrganization(String adapterName, String org) {
		 return mlInstancesRepository.getMlInstanceByAdapterNameAndOrganization(adapterName,org);
	}
	
	@Override
	public List<String> getMlInstanceNamesByOrganization(String org) {
		return mlInstancesRepository.getMlInstanceNamesByOrganization(org);
	}
	
	public boolean copy(String fromProjectName, String toProjectId) {
		List<MlInstance> instanceList = mlInstancesRepository.getMlInstanceByOrganization(fromProjectName);
		instanceList.stream().forEach(instance -> {
			MlInstance ins = mlInstancesRepository.getMlInstanceByNameAndOrganization(instance.getName(),fromProjectName);
			try{
				ins.setId(null);
				ins.setOrganization(toProjectId);
				mlInstancesRepository.save(ins);
			}
			catch (Exception e) {
				joblogger.error("Error in Instances Copy Blueprint {}", e.getMessage());
			}
		});
		return true;
	}
	
	public JsonObject export(Marker marker, String source, JSONArray modNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			joblogger.info(marker, "Exporting intstance started");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			
//			List<MlInstance> instances = mlInstancesRepository.getMlInstanceByOrganization(source);
			List<MlInstance> instances = new ArrayList<>();
			List<MlAdapters> insrelatedadapters = new ArrayList<>();
			List<ICIPDatasource> insrelateddatasources = new ArrayList<>();
			List<MlSpecTemplates> insrelatedspec = new ArrayList<>();
			List<ICIPDataset> adpImplMetods = new ArrayList<>();
			modNames.forEach(name -> {
				instances.add(mlInstancesRepository.getMlInstanceByNameAndOrganization(name.toString(), source));
			});
			
			instances.stream().forEach(ins -> {
				ICIPDatasource dsrc = datasourceService.getDatasourceByNameAndOrganization(ins.getConnectionid(),source);
				insrelateddatasources.add(dsrc);
				MlAdapters adps = mlAdaptersRepository.getMlAdapteByNameAndOrganization(ins.getAdaptername(), source)
						.stream().findFirst().orElse(null);
				String updatedAPISpecTemp = adps.getApispec().replace(source, "{org}");
				adps.setApispec(updatedAPISpecTemp);
				insrelatedadapters.add(adps);
				if(adps!=null) {
					ICIPDatasource dsrcForAdapter = datasourceService.getDatasourceByNameAndOrganization(adps.getConnectionid(),source);
					insrelateddatasources.add(dsrcForAdapter);
					List<ICIPDataset2> iCIPDataset2ListFromDB = datasetRepository2
							.getDatasetsByAdapterNameAndOrganization(adps.getName(), source);
					if (iCIPDataset2ListFromDB != null && !iCIPDataset2ListFromDB.isEmpty())
						iCIPDataset2ListFromDB.forEach(name -> {
							adpImplMetods.add(datasetRepository.findByNameAndOrganization(name.getName(), source));
						});
				}
				MlSpecTemplates specs = mlSpecTemplatesRepository
						.getMlSpecTemplateByDomainnameAndOrganization(ins.getSpectemplatedomainname(), source).stream()
						.findFirst().orElse(null);
				String updatedSpecTemp = specs.getApispectemplate().replace(source, "{org}");
				specs.setApispectemplate(updatedSpecTemp);
				insrelatedspec.add(specs);
			});
			jsnObj.add("mlintstance", gson.toJsonTree(instances));
			jsnObj.add("mldatasource", gson.toJsonTree(insrelateddatasources));
			jsnObj.add("mladapters", gson.toJsonTree(insrelatedadapters));
			jsnObj.add("mlspectemplates", gson.toJsonTree(insrelatedspec));
			if (adpImplMetods != null && !adpImplMetods.isEmpty())
				jsnObj.add("mldatasets", gson.toJsonTree(adpImplMetods));
			joblogger.info(marker, "Exported intstance successfully");
		}
		catch(Exception ex) {
			joblogger.error(marker,"Error in exporting intstance");
			joblogger.error(marker, ex.getMessage());
		}
		return jsnObj;
	}

	public void importData(Marker marker, String target, JSONObject jsonObject) {
		Gson g = new Gson();
		try {
			joblogger.info(marker, "Importing intstance started");
			JsonArray instances = g.fromJson(jsonObject.get("mlintstance").toString(), JsonArray.class);
			datasourceServices.importData(marker, target, jsonObject);
			specService.importData(marker, target, jsonObject);
			adapterService.importData(marker, target, jsonObject);
			instances.forEach(x -> {
				MlInstance ins = g.fromJson(x, MlInstance.class);
				MlInstance insPresent = getMlInstanceByNameAndOrganization(ins.getName(), target);
				ins.setOrganization(target);
				ins.setLastmodifiedby(ICIPUtils.getUser(claim));
				ins.setLastmodifiedon(new Timestamp(System.currentTimeMillis()));
				ins.setCreatedby(ICIPUtils.getUser(claim));
				ins.setCreatedon(new Timestamp(System.currentTimeMillis()));
				ins.setId(null);
				try {
					if(insPresent == null)
					mlInstancesRepository.save(ins);
				}
				catch(DataIntegrityViolationException de) {
					joblogger.error(marker, "Error in importing duplicate intstance {}",ins.getName());
				}
			});
			joblogger.info(marker, "Imported intstance successfully");
		}
		catch(Exception ex) {
			joblogger.error(marker, "Error in importing intstance");
			joblogger.error(marker, ex.getMessage());
		}
	}
	

	@Override
	public Map<String, Object> getMethodsByInstanceAndOrganization(String instanceName, String org) {
		MlInstance mlInstanceFromDB = this.getMlInstanceByNameAndOrganization(instanceName, org);
		return encryptDataset2Attributes(
				datasetRepository2.getDatasetsByAdapterNameAndOrganization(mlInstanceFromDB.getAdaptername(), org),
				mlInstanceFromDB.getConnectionid(), org, instanceName, mlInstanceFromDB.getExecutiontype());
	}

	private Map<String, Object> encryptDataset2Attributes(List<ICIPDataset2> datasetList, String connectionName,
			String org, String instanceName, String executionType) {
		Map<String, Object> result = new HashMap<>();
		if (executionType != null && !executionType.isEmpty()
				&& ICIPPluginConstants.REMOTE.equalsIgnoreCase(executionType)) {
			ICIPDataset2 dataset2 = new ICIPDataset2();
			dataset2.setAlias(ICIPPluginConstants.REMOTE_LOWER_CASE);
			dataset2.setName(ICIPPluginConstants.REMOTE_LOWER_CASE);
			dataset2.setAdaptername(instanceName);
			dataset2.setDatasource(connectionName);
			dataset2.setOrganization(org);
			dataset2.setInterfacetype(ICIPPluginConstants.ADAPTER_LOWER_CASE);
			datasetList = new ArrayList<>();
			datasetList.add(dataset2);
			result.put(ICIPPluginConstants.LIST_OF_METHODS, datasetList);
			ICIPDatasource iCIPDatasource2 = iCIPDatasourceRepository.findByNameAndOrganization(connectionName, org);
			result.put(ICIPPluginConstants.CONNECTION_LOWER_CASE, iCIPDatasource2);
		} else {
			for (ICIPDataset2 dataset : datasetList) {
				if (dataset != null) {
					try {
						dataset.setAdaptername(instanceName);
						dataset.setDatasource(connectionName);
						if (dataset.getAttributes() != null)
							dataset.setAttributes(Crypt.encrypt(dataset.getAttributes(), enckeydefault));
					} catch (Exception e) {
						logger.error("Error in encrypting dataset attributes : {}", dataset.getName());
						logger.error(e.getMessage());
					}
				}
			}
			result.put(ICIPPluginConstants.LIST_OF_METHODS, datasetList);
			if (!datasetList.isEmpty()) {
				ICIPDatasource iCIPDatasource = iCIPDatasourceRepository.findByNameAndOrganization(connectionName, org);
				result.put(ICIPPluginConstants.CONNECTION_LOWER_CASE, iCIPDatasource);
			}
		}
		return result;
	}

	@Override
	public MlInstance getMlInstanceBySpectemplatedomainnameAndOrganizationAndOrderPriority(
			String spectemplatedomainname, String org, Integer orderPriority) {
		return mlInstancesRepository
				.getMlInstanceBySpectemplatedomainnameAndOrganizationAndOrderPriority(spectemplatedomainname, org,
						orderPriority)
				.stream().findFirst().orElse(null);
	}

	@Override
	public List<MlInstance> getMlInstanceBySpecTemDomNameAndOrg(String spectemplatedomainname, String org) {
		return mlInstancesRepository.getMlInstanceBySpecTemDomNameAndOrg(spectemplatedomainname, org);
	}

	@Override
	public List<MlInstance> changeOrderPriorityBySpecTemDomNameAndInstancNameAndOrg(String spectemplatedomainname,
			String instanceName, Integer orderPriority, String org) {
		List<MlInstance> mlInstanceList = mlInstancesRepository
				.getMlInstanceBySpecTemDomNameAndOrg(spectemplatedomainname, org);
		mlInstanceList = this.changePriority(instanceName, orderPriority, mlInstanceList);
		return mlInstancesRepository.saveAll(mlInstanceList);
	}

	public List<MlInstance> changePriority(String objNameToChange, Integer newPriority, List<MlInstance> allObjects) {
		int maxPriority = allObjects.size();

		MlInstance objToChange = null;
		for (MlInstance obj : allObjects) {
			if (obj.getName().equals(objNameToChange)) {
				objToChange = obj;
				break;
			}
		}

		for (MlInstance obj : allObjects) {
			if (obj.getOrderpriority() != null && obj.getOrderpriority() == newPriority) {
				obj.setOrderpriority(maxPriority + 1);
			}
		}

		objToChange.setOrderpriority(newPriority);

		Set<Integer> usedPriorities = new HashSet<>();
		for (MlInstance obj : allObjects) {
			if (obj.getOrderpriority() != null && obj.getOrderpriority() <= maxPriority) {
				usedPriorities.add(obj.getOrderpriority());
			}
		}

		for (MlInstance obj : allObjects) {
			if (obj.getOrderpriority() == null || obj.getOrderpriority() > maxPriority) {
				for (int i = 1; i <= maxPriority; i++) {
					if (!usedPriorities.contains(i)) {
						obj.setOrderpriority(i);
						usedPriorities.add(i);
						break;
					}
				}
			}
		}

		return allObjects;
	}

}