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

package com.lfn.icip.icipwebeditor.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.json.JSONObject;
import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.AdpModules;
import com.lfn.icip.icipwebeditor.model.ICIPGroupModel;
import com.lfn.icip.icipwebeditor.model.ICIPGroups;
import com.lfn.icip.icipwebeditor.service.ICIPMLAIWorkerConfigService;
import com.lfn.icip.icipwebeditor.service.ICIPMLToolsService;
import com.lfn.icip.icipwebeditor.service.ICIPPromptService;
import com.lfn.icip.icipwebeditor.service.IICIPIaiService;
import com.lfn.icip.icipwebeditor.service.IICIPNativeScriptService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPIaiService.
 *
 * @author essedum
 */
@Service
@Transactional
public class ICIPIaiService implements IICIPIaiService {
	
	private final Logger logger = LoggerFactory.getLogger(JobLogger.class);

	/** The exportJson. */
	private JsonObject exportJson = new JsonObject();

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(JobLogger.class);

	/** The pipeline service. */
	@Autowired
	private ICIPPipelineService pipelineService;

	/** The prompt service. */
	@Autowired
	private ICIPPromptService promtService;
	
	/** The groups service. */
	@Autowired
	private ICIPGroupsService groupsService;

	/** The group model service. */
	@Autowired
	private ICIPGroupModelService groupModelService;

	/** The event job mapping service. */
	@Autowired
	private ICIPEventJobMappingService eventJobMappingService;

	/** The script service. */
	@Autowired
	private ICIPScriptService scriptService;

	/** The chain service. */
	@Autowired
	private ICIPChainsService chainService;

	/** The binary file service. */
	@Autowired
	private ICIPBinaryFilesService binaryFileService;

	/** The native script service. */
	@Autowired
	private IICIPNativeScriptService nativeScriptService;
	
	/** The endpoint service. */
	@Autowired
	private ICIPMLFederatedEndpointService endpointService;
	
	/** The model service. */
	@Autowired
	private ICIPMLFederatedModelService modelService;
	
	/** The app service. */
	@Autowired
	private IICIPAppServiceImpl appService;
	
	/** The image service. */
	@Autowired
	private ICIPImageSavingServiceImpl imageService;
	
	/** The plugin service. */
	@Autowired
	private ICIPPluginService pluginService;
	
	/** The plugindetails service. */
	@Autowired
	private ICIPPluginDetailsService plugindetailsService;
	
	@Autowired
	private ICIPMLAIWorkerConfigService aiWorkerService;
	
	@Autowired
	private ICIPMLToolsService aiWorkerToolService;
	

	/**
	 * Copy blueprints.
	 *
	 * @param marker          the marker
	 * @param fromProjectName the from project name
	 * @param toProjectName   the to project name
	 * @return the boolean
	 */
	@Override
	public Boolean copyBlueprints(Marker marker, String fromProjectName, String toProjectName) {
		log.info(marker, "ICIP Iai is getting copied now-->");
		try {
		pipelineService.copy(marker, fromProjectName, toProjectName);
		} catch (Exception e) {
			log.error("Error in pipelineService Copy Blueprint {}", e.getMessage());
		}
		try {
		nativeScriptService.copy(marker, fromProjectName, toProjectName);
		} catch (Exception e) {
			log.error("Error in nativeScriptService Copy Blueprint {}", e.getMessage());
		}
		try {
		binaryFileService.copy(marker, fromProjectName, toProjectName);
		} catch (Exception e) {
			log.error("Error in binaryFileService Copy Blueprint {}", e.getMessage());
		}
		try {
		endpointService.copy(fromProjectName,toProjectName);
		} catch (Exception e) {
			log.error("Error in endpointService Copy Blueprint {}", e.getMessage());
		}
		try {
		modelService.copy(fromProjectName,toProjectName);
		} catch (Exception e) {
			log.error("Error in modelService Copy Blueprint {}", e.getMessage());
		}
		try {
		appService.copy(fromProjectName,toProjectName);
		} catch (Exception e) {
			log.error("Error in appService Copy Blueprint {}", e.getMessage());
		}
		try {
		imageService.copy(fromProjectName,toProjectName);
		} catch (Exception e) {
			log.error("Error in imageService Copy Blueprint {}", e.getMessage());
		}
		try {
		pluginService.copy(fromProjectName,toProjectName);
		} catch (Exception e) {
			log.error("Error in pluginService Copy Blueprint {}", e.getMessage());
		}
		try {
		plugindetailsService.copy(fromProjectName,toProjectName);
		} catch (Exception e) {
			log.error("Error in plugindetailsService Copy Blueprint {}", e.getMessage());
		}
		try {
			promtService.copy(fromProjectName, toProjectName);
		} catch (Exception e) {
			log.error("Error in promtService Copy Blueprint {}", e.getMessage());
		}
		
		List<Map> hashMapList = groupsService.copy(marker, fromProjectName, toProjectName);
	
		Map<String, List<ICIPGroupModel>> map = hashMapList.get(0);
		Map<ICIPGroups, ICIPGroups> groupMap = hashMapList.get(1);

		Map<ICIPGroupModel, ICIPGroupModel> groupModelMap = groupModelService.copy(marker, fromProjectName,
				toProjectName, groupMap);

		map.forEach((k, v) -> {
			if (v != null && !v.isEmpty()) {
				log.info(marker, "changing group {}", k);
				List<ICIPGroupModel> list = new ArrayList<>();
				v.parallelStream().forEach(model -> {
					log.info(marker, "mapping old groupmodel {} to new one", model.getId());
					model.setId(null);
					if (groupModelMap.containsKey(model)) {
						list.add(groupModelMap.get(model));
					}
				});
				ICIPGroups group = groupsService.getGroup(k, toProjectName);
				group.setGroupsModel(list);
				groupsService.save(group);
				log.info(marker, "group {} changed", k);
			}
		});
		try {
		eventJobMappingService.copy(marker, fromProjectName, toProjectName);
		} catch (Exception e) {
			log.error("Error in eventJobMappingService Copy Blueprint {}", e.getMessage());
		}
		try {
		scriptService.copy(marker, fromProjectName, toProjectName);
		} catch (Exception e) {
			log.error("Error in scriptService Copy Blueprint {}", e.getMessage());
		}
		try {
		chainService.copy(marker, fromProjectName, toProjectName);
		} catch (Exception e) {
			log.error("Error in chainService Copy Blueprint {}", e.getMessage());
		}
		log.info(marker, "ICIP Iai data copied");
		return true;
	}
	
	@Override
	public Boolean copytemplate(Marker marker, String fromProjectName, String toProjectName) {
		

		log.info(marker, "Mlpipeline is getting copied");
		try {
		pipelineService.copytemplate(marker, fromProjectName, toProjectName);
		}
		catch(Exception E) {
			log.error("Error in pipeline plaiservice");
			logger.error(E.getMessage());
		}

		log.info(marker, "Mlpipeline data is copied");

		log.info(marker, "MLGroupsModels is getting copied");

		try {
			groupModelService.copyTemplate(marker, fromProjectName, toProjectName);
		}
			catch(Exception E) {
				log.error("Error in MLGROUPSModel plaiservice");
				logger.error(E.getMessage());
			}
		

		log.info(marker, "MLGroups model data is copied");
		
		log.info(marker, "MLEventjob is getting copied");

		try{
			eventJobMappingService.copytemplate(marker, fromProjectName, toProjectName);
		}
	
		catch(Exception E) {
			log.error("Error in Events plaiservice");

			logger.error(E.getMessage());
		}
		log.info(marker, "MLEventjob is now copied");
		return true;
	}
	/**
	 * Delete project.
	 *
	 * @param marker  the marker
	 * @param project the project
	 */
	@Override
	public void deleteProject(Marker marker, String project) {
		groupModelService.delete(project);
		log.info(marker, "Deleted group mappings for project {}", project);
		nativeScriptService.delete(project);
		log.info(marker, "Deleted native-script pipelines for project {}", project);
		binaryFileService.delete(project);
		log.info(marker, "Deleted binary pipelines for project {}", project);
		pipelineService.delete(project);
		log.info(marker, "Deleted pipelines for project {}", project);
		groupsService.delete(project);
		log.info(marker, "Deleted groups for project {}", project);
		eventJobMappingService.delete(project);
		log.info(marker, "Deleted groups for project {}", project);
		scriptService.delete(project);
		log.info(marker, "Deleted script pipelines for project {}", project);
		chainService.delete(project);
		log.info(marker, "Deleted chain jobs for project {}", project);
	}

	/**
	 * Copy Group Models.
	 *
	 * @param marker          the marker
	 * @param fromProjectName the from project name
	 * @param toProjectName   the to project name
	 * @param datasets        the datasets
	 * @return the boolean
	 */
	@Override
	public Boolean copyGroupModels(Marker marker, String fromProjectName, String toProjectName, List<String> datasets) {
		log.info(marker, "ICIP Iai GroupModels are getting copied");
		groupModelService.copyGroupModel(marker, fromProjectName, toProjectName, datasets);
		log.info(marker, "ICIP Iai GroupModels data copied");
		return true;
	}

	/**
	 * Copy Group Models.
	 *
	 * @param marker          the marker
	 * @param fromProjectName the from project name
	 * @param toProjectName   the to project name
	 * @param pipelines       the pipelines
	 * @return the boolean
	 */
	@Override
	public Boolean copyPipelines(Marker marker, String fromProjectName, String toProjectName, List<String> pipelines) {
		log.info(marker, "ICIP Iai Pipelines are getting copied");
		pipelineService.copyPipelines(marker, fromProjectName, toProjectName, pipelines);
		log.info(marker, "ICIP Iai Pipelines data copied");
		return true;
	}

	@Override
	public Boolean exportModules(Marker marker, String source, JSONObject modules) {
		exportJson = new JsonObject();
		try {
			log.info(marker,"ICIP Iai is getting exported");
			modules.keySet().forEach(mod ->{
				switch(AdpModules.valueOf(mod.toString())) {
				case Pipelines:
					exportJson.add("Pipelines", pipelineService.export(marker, source, modules.getJSONArray(mod),"pipeline"));
					break;
				case Chains:
					exportJson.add("Chains", pipelineService.export(marker, source, modules.getJSONArray(mod),"chain"));
					break;
				case Endpoints:
					exportJson.add("Endpoints", endpointService.export(marker, source, modules.getJSONArray(mod)));
					break;
				case Models:
					exportJson.add("Models", modelService.export(marker, source, modules.getJSONArray(mod)));
					break;
				case Apps:
					exportJson.add("Apps", pipelineService.export(marker, source, modules.getJSONArray(mod),"App"));
					break;
				case Plugins:
					exportJson.add("Plugins", pluginService.export(marker, source, modules.getJSONArray(mod)));
					break;
				case JobManagement_Events:
					exportJson.add("JobManagement_Events", eventJobMappingService.export(marker, source, modules.getJSONArray(mod)));
					break;
				case Grouped_Jobs:
					exportJson.add("Grouped_Jobs", chainService.export(marker, source, modules.getJSONArray(mod)));
					break;
				case Prompt:
					exportJson.add("Prompt", promtService.export(marker, source, modules.getJSONArray(mod)));
					break;
				case AgenticSystems_Worker:
					exportJson.add("AgenticSystems_Worker", aiWorkerService.export(marker, source, modules.getJSONArray(mod)));
					break;
				case AgenticSystems_Tools:
					exportJson.add("AgenticSystems_Tools", aiWorkerToolService.export(marker, source, modules.getJSONArray(mod)));
					break;
				default:
					break;
				}
			});
			log.info(marker,"ICIP Iai data exported");
			return true;
		}
		catch(Exception ex) {
			log.error(marker,"Error in exporting IAI modules");
			return false;
		}
	}
	
	public JsonObject exportIai(Marker marker, String source, JSONObject modules) {
		if(exportModules(marker, source, modules)) {
			log.info("exported Data",exportJson);
			return exportJson;
		}
		else {
			return null;
		}
	}
	
	@Override
	public Boolean importModules(Marker marker, String target, JSONObject data) {
		try {
			log.info(marker,"ICIP Iai is getting imported");
			data.keySet().forEach(key ->{
				switch(AdpModules.valueOf(key.toString())) {
				case Pipelines:
					pipelineService.importData(marker, target, data.getJSONObject(key),"pipeline");
					break;
				case Chains:
					pipelineService.importData(marker, target, data.getJSONObject(key),"chain");
					break;
				case Endpoints:
					endpointService.importData(marker, target, data.getJSONObject(key));
					break;
				case Models:
					modelService.importData(marker, target, data.getJSONObject(key));
					break;
				case Apps:
					pipelineService.importData(marker, target, data.getJSONObject(key),"App");
					break;
				case Plugins:
					pluginService.importData(marker, target, data.getJSONObject(key));
					break;
				case JobManagement_Events:
					eventJobMappingService.importData(marker, target, data.getJSONObject(key));
					break;
				case Grouped_Jobs:
					chainService.importData(marker, target, data.getJSONObject(key));
					break;
				case Prompt:
					promtService.importData(marker, target, data.getJSONObject(key));
					break;
				case AgenticSystems_Worker:
					aiWorkerService.importData(marker, target, data.getJSONObject(key));
					break;
				case AgenticSystems_Tools:
					aiWorkerToolService.importData(marker, target, data.getJSONObject(key));
					break;
				default:
					break;	
				}
			});
			log.info(marker,"ICIP Iai data imported");
			return true;
		}
		catch(Exception ex) {
			
			return false;
		}
	}
}
