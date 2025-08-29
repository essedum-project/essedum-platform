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
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.json.JSONObject;
import org.json.JSONArray;
import com.google.gson.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.AdpModules;
import com.lfn.icip.adapter.service.impl.MlAdaptersServiceImpl;
import com.lfn.icip.adapter.service.impl.MlInstancesServiceImpl;
import com.lfn.icip.adapter.service.impl.MlSpecTemplatesServiceImpl;
//import com.lfn.iamp.usm.domain.DashConstant;
//import com.lfn.iamp.usm.repository.DashConstantRepository;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.repository.ICIPDatasourceRepository;
import com.lfn.icip.dataset.service.IICIPAdpService;
import com.lfn.icip.dataset.service.IICIPDatasourcePluginsService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPAdpService.
 *
 * @author essedum
 */
@Service
@Transactional
@RefreshScope
public class ICIPAdpService implements IICIPAdpService {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(JobLogger.class);

	/** The exportJson. */
	private JsonObject exportJson = new JsonObject();

	/** The schema service. */
	@Autowired
	private ICIPSchemaRegistryService schemaService;

	/** The relationship service. */
	@Autowired
	private ICIPRelationshipService relationshipService;

	/** The dataset service. */
	@Autowired
	private ICIPDatasetService datasetService;

	/** The datasource service. */
	@Autowired
	private ICIPDatasourceService datasourceService;

	/** The dash constant repository. */
	@Autowired
	private ICIPSchemaFormService schemaFormService;

	/** The dash constant repository. */
	@Autowired
	private ICIPDatasetFormMappingService datasetFormMappingService;

	/** The dash constant repository. */
	@Autowired
	private ICIPMashupService mashupService;

	/** The datasource repository. */
	@Autowired
	private ICIPDatasourceRepository datasourceRepository;

	/** The datasource plugin servce. */
	@Autowired
	private IICIPDatasourcePluginsService datasourcePluginServce;

	/** The adapter service. */
	@Autowired
	private MlAdaptersServiceImpl adapterService;

	/** The instance service. */
	@Autowired
	private MlInstancesServiceImpl instancesService;

	/** The specTemplate service. */
	@Autowired
	private MlSpecTemplatesServiceImpl specService;

	/** The datasetFile service. */
	@Autowired
	private ICIPDatasetFilesService datasetFileService;

	/** The dash constant repository. */
//	@Autowired
//	private DashConstantRepository dashConstantRepository;

	/**
	 * Copy blueprints.
	 *
	 * @param marker          the marker
	 * @param fromProjectName the from project name
	 * @param toProjectName   the to project name
	 * @param projectId       the project id
	 * @return the boolean
	 */
	@Override
	public Boolean copyBlueprints(Marker marker, String fromProjectName, String toProjectName, int projectId) {
		log.info(marker, "ICIP Adp data is getting copied");
		try {
			schemaService.copy(marker, fromProjectName, toProjectName);
		} catch (Exception e) {
			log.error("Error in schemaService Copy Blueprint {}", e.getMessage());
		}
		try {
			datasourceService.copy(marker, fromProjectName, toProjectName);
		} catch (Exception e) {
			log.error("Error in datasourceService Copy Blueprint {}", e.getMessage());
		}
		try {
			datasetService.copy(marker, fromProjectName, toProjectName, projectId);
		} catch (Exception e) {
			log.error("Error in datasetService Copy Blueprint {}", e.getMessage());
		}
		try {
			schemaFormService.copy(marker, fromProjectName, toProjectName, projectId);
		} catch (Exception e) {
			log.error("Error in schemaFormService Copy Blueprint {}", e.getMessage());
		}
		try {
			datasetFormMappingService.copy(marker, fromProjectName, toProjectName, projectId);
		} catch (Exception e) {
			log.error("Error in datasetFormMappingService Copy Blueprint {}", e.getMessage());
		}
		try {
			mashupService.copy(marker, fromProjectName, toProjectName, projectId);
		} catch (Exception e) {
			log.error("Error in mashupService Copy Blueprint {}", e.getMessage());
		}
		try {
			adapterService.copy(fromProjectName, toProjectName);
		} catch (Exception e) {
			log.error("Error in adapterService Copy Blueprint {}", e.getMessage());
		}
		try {
			instancesService.copy(fromProjectName, toProjectName);
		} catch (Exception e) {
			log.error("Error in instancesService Copy Blueprint {}", e.getMessage());
			// TODO: handle exception
		}
		try {
			specService.copy(fromProjectName, toProjectName);
		} catch (Exception e) {
			log.error("Error in specService Copy Blueprint {}", e.getMessage());
		}
//		datasetFileService.copy(fromProjectName, toProjectName);
		log.info(marker, "ICIP Adp data copied");
		return true;
	}

	@Override
	public void copytemplate(Marker marker, String fromProjectName, String toProjectName, int datasetProjectId) {
		// TODO Auto-generated method stub
		log.info(marker, "ICIP Adp template data is getting copied");
		try {
			log.info(marker, "MLMASHUPS is gettig copied");
			mashupService.copy(marker, fromProjectName, toProjectName, datasetProjectId);
			log.info(marker, "MLMASHUPS is copied");
		} catch (Exception E) {
			log.error("Error in Mashups in ADP");
		}
		try {
			log.info(marker, "Mldatasource is getting copied");
			datasourceService.copytemplate(marker, fromProjectName, toProjectName);
			log.info(marker, "Mldatasource is  copied");
		} catch (Exception E) {
			log.error("Error in Datasource in ADP");
		}
		try {
			log.info(marker, "MLdataset is getting copied");
			datasetService.copytemplate(marker, fromProjectName, toProjectName, datasetProjectId);
			log.info(marker, "MLdataset is copied");
		} catch (Exception E) {
			log.error("Error in MLDataset in ADP");
		}

	}

	/**
	 * Test datasources.
	 *
	 * @param marker the marker
	 * @param zoneid the zoneid
	 * @param org    the org
	 * @return the boolean
	 * @throws SQLException the SQL exception
	 */
	@Override
	public Boolean testDatasources(Marker marker, String zoneid, String org) throws SQLException {
//		log.info(marker, "Updating datasourcetest status");
//		DashConstant constantLasttime = dashConstantRepository.findByKeys("icip.datasourcetest.lasttime", org);
//		if (constantLasttime != null) {
//			constantLasttime.setValue(Timestamp.from(Instant.now(Clock.system(ZoneId.of(zoneid)))).toString());
//			dashConstantRepository.save(constantLasttime);
//			DashConstant constantthreadcount = dashConstantRepository.findByKeys("icip.datasourcetest.threadcount",
//					org);
//			if (constantthreadcount != null) {
//				String threadcount = constantthreadcount.getValue();
//				DashConstant constantinactivetime = dashConstantRepository
//						.findByKeys("icip.datasourcetest.inactivetime", org);
//				String inactivetime = constantinactivetime.getValue();
//				DashConstant constanttimeout = dashConstantRepository.findByKeys("icip.datasourcetest.timeout", org);
//				if (constanttimeout != null) {
//					String timeout = constanttimeout.getValue();
//					log.info(marker, "All Datasources connection are being tested");
//					Map<Integer, Boolean> testedDatasourceMap = new HashMap<>();
//					List<Future<Boolean>> futures = new ArrayList<>(); // list of thread results
//					// Thread Pool Created
//					ThreadPoolExecutor executor = (ThreadPoolExecutor) Executors
//							.newFixedThreadPool(Integer.parseInt(threadcount));
//					datasourceRepository.findAllByModifiedDateAndActiveDateAndOrg(Integer.parseInt(inactivetime), org)
//							.parallelStream().forEach(datasource -> {
//								log.info(marker, "testing datasource {}-{}", datasource.getName(),
//										datasource.getOrganization());
//								Future<Boolean> futureResult = executor
//										.submit(() -> testedDatasourceMap.put(datasource.getId(), datasourcePluginServce
//												.getDataSourceService(datasource).testConnection(datasource)));
//								futures.add(futureResult); // adding future to list
//							});
//					log.info(marker, "checking test completion");
//					// checking future to complete
//					futures.parallelStream().forEach(future -> {
//						try {
//							future.get(Integer.parseInt(timeout), TimeUnit.SECONDS); // timeout added
//						} catch (InterruptedException | ExecutionException | TimeoutException e) {
//							log.error(marker, e.getMessage(), e);
//						}
//					});
//					log.info(marker, "updating active time in db");
//					// if all done, update db
//					testedDatasourceMap.forEach((id, status) -> {
//						Optional<ICIPDatasource> optionalDatasource = datasourceRepository.findById(id);
//						if (optionalDatasource.isPresent()) {
//							ICIPDatasource datasource = optionalDatasource.get();
//							if (Boolean.TRUE.equals(status)) {
//								datasource.setActivetime(Timestamp.from(Instant.now(Clock.system(ZoneId.of(zoneid)))));
//								datasourceRepository.save(datasource);
//								log.info(marker, "Updated active time for datasource {}-{}", datasource.getName(),
//										datasource.getOrganization());
//							} else {
//								log.error(marker, "Datasource {}-{} is inactive", datasource.getName(),
//										datasource.getOrganization());
//							}
//						} else {
//							log.error(marker, "Datasource not found with id : {}", id);
//						}
//					});
//					log.info(marker, "All Datasources have been tested");
//					return true;
//				} else {
//					log.error(marker, "icip.datasourcetest.timeout mapping is not available");
//					return false;
//				}
//			} else {
//				log.error(marker, "icip.datasourcetest.threadcount mapping is not available");
//				return false;
//			}
//		} else {
//			log.error(marker, "icip.datasourcetest.lasttime mapping is not available");
//			return false;
//		}
		return false;
	}

	/**
	 * Delete project.
	 *
	 * @param marker  the marker
	 * @param project the project
	 */
	@Override
	public void deleteProject(Marker marker, String project) {
		schemaService.delete(project);
		log.info(marker, "deleted schemas for project : {}", project);
		datasetService.delete(project);
		log.info(marker, "deleted datasets for project : {}", project);
		datasourceService.delete(project);
		log.info(marker, "deleted datasources for project : {}", project);
	}

	/**
	 * Copy datasets.
	 *
	 * @param marker          the marker
	 * @param fromProjectName the from project name
	 * @param toProjectName   the to project name
	 * @param projectId       the project id
	 * @param datasets        the datasets
	 * @param toDatasource    the to datasource
	 * @return the boolean
	 */
	@Override
	public Boolean bulkCopyDatasets(Marker marker, String fromProjectName, String toProjectName, int projectId,
			List<String> datasets, String toDatasource) {
		log.info(marker, "ICIP Adp data is getting copied");
		datasetService.copySelected(marker, fromProjectName, toProjectName, projectId, datasets, toDatasource);
		log.info(marker, "ICIP Adp data copied");
		return true;
	}

	@Override
	public Boolean exportModules(Marker marker, String source, JSONObject modules) {
		exportJson = new JsonObject();
		try {
			log.info(marker, "ICIP Adp data is getting exported");
			modules.keySet().forEach(mod -> {
				switch (AdpModules.valueOf(mod.toString())) {
				case Connections:
					exportJson.add("Connections", datasourceService.export(marker, source, modules.getJSONArray(mod)));
					break;
				case Datamodels_Schemas:
					JsonObject sch = new JsonObject();
					if(schemaService.export(marker, source, modules.getJSONArray(mod)) != null) {
						sch = schemaService.export(marker, source, modules.getJSONArray(mod));
					}
					exportJson.add("Datamodels_Schemas", sch);
					break;
				case Datamodels_Relationships:
					exportJson.add("Datamodels_Relationships", relationshipService.export(marker, source, modules.getJSONArray(mod)));
					break;
				case Datasets:
					exportJson.add("Datasets", datasetService.export(marker, source, modules.getJSONArray(mod)));
					break;
				case Adapters_SpecTemplates:
					exportJson.add("Adapters_SpecTemplates", specService.export(marker, source, modules.getJSONArray(mod)));
					break;
				case Adapters_Adapters:
					exportJson.add("Adapters_Adapters", adapterService.export(marker, source, modules.getJSONArray(mod)));
					break;
				case Adapters_Instances:
					exportJson.add("Adapters_Instances", instancesService.export(marker, source, modules.getJSONArray(mod)));
					break;
				case Mashups:
					exportJson.add("Mashups", mashupService.export(marker, source, modules.getJSONArray(mod)));
				default:
					break;
				}
			});
			log.info(marker, "ICIP Adp data exported");
			return true;
		} catch (Exception ex) {
			log.error(marker, "Error in exporting ADP modules");
			return false;
		}
	}
	
	public JsonObject exportAdp(Marker marker, String source, JSONObject modules) {
		if(exportModules(marker, source, modules)) {
			log.info("exported Data",exportJson);
			return exportJson;
		} else {
			return null;
		}
	}

	@Override
	public Boolean importModules(Marker marker, String target, JSONObject data) {
		try {
			log.info(marker, "ICIP Adp data is getting imported");
			data.keySet().forEach(key -> {
				switch (AdpModules.valueOf(key.toString())) {
				case Connections:
					datasourceService.importData(marker, target, data.getJSONObject(key));
					break;
				case Datamodels_Schemas:
					schemaService.importData(marker, target, data.getJSONObject(key));
					break;
				case Datamodels_Relationships:
					relationshipService.importData(marker, target, data.getJSONObject(key));
					break;
				case Datasets:
					datasetService.importData(marker, target, data.getJSONObject(key));
					break;
				case Adapters_SpecTemplates:
					specService.importData(marker, target, data.getJSONObject(key));
					break;
				case Adapters_Adapters:
					adapterService.importData(marker, target, data.getJSONObject(key));
					break;
				case Adapters_Instances:
					instancesService.importData(marker, target, data.getJSONObject(key));
					break;
				case Mashups:
					mashupService.importData(marker, target, data.getJSONObject(key));
					break;
				default:
					break;
				}
			});
			log.info(marker, "ICIP Adp data imported");
			return true;
		} catch (Exception ex) {
			log.error(marker, "Error in importing ADP modules");
			return false;
		}
	}
}
