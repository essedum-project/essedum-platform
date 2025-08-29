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

import java.io.IOException;
import java.lang.reflect.Field;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.json.CDL;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.model.ICIPSchemaRegistry;
import com.lfn.icip.dataset.model.dto.ICIPDataAuditResponse;
import com.lfn.icip.dataset.service.IICIPDatasetPluginsService;
import com.lfn.icip.dataset.service.IICIPSchemaRegistryService;
import com.lfn.icip.dataset.service.util.ICIPDataSetServiceUtilSqlAbstract;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.DATATYPE;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;
import com.lfn.icip.dataset.service.util.IICIPMlopsServiceUtil;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDatasetPluginsService.
 *
 * @author essedum
 */
@Service
public class ICIPDatasetPluginsService implements IICIPDatasetPluginsService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPDatasetPluginsService.class);

	/** The dataset factory. */
	private IICIPDataSetServiceUtilFactory datasetFactory;

	/** The data set list. */
	private List<IICIPDataSetServiceUtil> dataSetList;

	/** The dataset service. */
	private ICIPDatasetService datasetService;

	/** The schema registry service. */
	private ICIPSchemaRegistryService schemaRegistryService;
	/** The Constant UNAME. */
	private static final String UNAME = "userName";
	/** The Constant PSTR. */
	private static final String PSTR = "password";

	/** The Constant EMPTYRESULTSET. */
	private static final String EMPTYRESULTSET = "Query returned empty results set";

	/** The Constant ERROR. */
	private static final String ERROR = "Error: ";

	/** The Constant ERRORDOWNLOAD. */
	private static final String ERRORDOWNLOAD = "Error: No records found to download";

	/** The Constant QUERY. */
	private static final String QUERY = "Query";
	@Autowired 
	IICIPSchemaRegistryService schemaService;
	

	/**
	 * Instantiates a new ICIP dataset plugins service.
	 *
	 * @param datasetFactory        the dataset factory
	 * @param dataSetList           the data set list
	 * @param datasetService        the dataset service
	 * @param schemaRegistryService the schema registry service
	 */
	public ICIPDatasetPluginsService(IICIPDataSetServiceUtilFactory datasetFactory,
			List<IICIPDataSetServiceUtil> dataSetList, ICIPDatasetService datasetService,
			ICIPSchemaRegistryService schemaRegistryService) {
		super();
		this.datasetFactory = datasetFactory;
		this.dataSetList = dataSetList;
		this.datasetService = datasetService;
		this.schemaRegistryService = schemaRegistryService;
	}

	/**
	 * Gets the data set service.
	 *
	 * @param dataset the dataset
	 * @return the data set service
	 */
	@Override
	public IICIPDataSetServiceUtil getDataSetService(ICIPDataset dataset) {
		return datasetFactory.getDataSetUtil(dataset.getDatasource().getType().toLowerCase() + "ds");
	}
	
	@Override
	public IICIPMlopsServiceUtil getDataSetService(ICIPDatasource datasource) {
		return datasetFactory.getMlopsUtil(datasource.getType().toLowerCase() + "ds");
	}

	/**
	 * Gets the data set service sql.
	 *
	 * @param dataset the dataset
	 * @return the data set service sql
	 */
	@Override
	@Transactional
	public ICIPDataSetServiceUtilSqlAbstract getDataSetServiceSql(ICIPDataset dataset) {

		ICIPDataSetServiceUtilSqlAbstract result = datasetFactory
				.getDataSetUtilSql(dataset.getDatasource().getType().toLowerCase() + "ds");

		return result;
	}

	/**
	 * List all plugins.
	 *
	 * @return the JSON array
	 */
	@Override
	public JSONArray listAllPlugins() {
		JSONArray jarr = new JSONArray();
		dataSetList.stream().forEach(plugin -> jarr.put(plugin.getJson()));
		return jarr;
	}

	/**
	 * Test connection.
	 *
	 * @param dataset the dataset
	 * @return true, if successful
	 * @throws EssedumException the essedum exception
	 */
	@Override
	public boolean testConnection(ICIPDataset dataset) throws EssedumException {
		return datasetFactory.getDataSetUtil(String.format("%s%s", dataset.getDatasource().getType(), "ds"))
				.testConnection(dataset);
	}

	/**
	 * Extract schema.
	 *
	 * @param dataset the dataset
	 * @return the list
	 */
	@Override
	public List<String> extractSchema(ICIPDataset dataset) {
		logger.info("extracting schema for {}", dataset.getName());
		return datasetFactory.getDataSetUtilSql(String.format("%s%s", dataset.getDatasource().getType(), "ds"))
				.extractSchema(dataset);
	}

	/**
	 * Gets the all objects.
	 *
	 * @param datasetName the dataset name
	 * @param schemaName  the schema name
	 * @param projectName the project name
	 * @param size        the size
	 * @param page        the page
	 * @param sortEvent   the sort event
	 * @param sortOrder   the sort order
	 * @return the all objects
	 * @throws SQLException          the SQL exception
	 * @throws NumberFormatException the number format exception
	 */
	@Override
	public List<Object> getAllObjects(String datasetName, String schemaName, String projectName, String size,
			String page, String sortEvent, String sortOrder) throws SQLException {
		String resultStr = "";
		JSONArray resultList = new JSONArray();
		ICIPSchemaRegistry schema = schemaRegistryService.getSchema(schemaName, projectName);
		if (schema != null) {
			String schemaValue = schema.getSchemavalue();
			if (schemaValue == null || schemaValue.isEmpty()) {
				resultStr = "Schema values not found";
				resultList.put(new JSONObject().put(ERROR, resultStr));
			} else {
				resultStr = schemaValue;
				resultStr = resultStr.substring(1, resultStr.length() - 1);
				if (resultStr != null && !resultStr.isEmpty()) {
					String[] schemValueList = resultStr.split("},");
					List<JSONObject> schemaObjList = new ArrayList<>();
					for (String ele : schemValueList) {
						ele = ele + "}";
						JSONObject jObj = new JSONObject(ele);
						schemaObjList.add(jObj);
					}
					HashMap<String, String> schemaMap = new HashMap<>();
					for (JSONObject itrJObj : schemaObjList) {
						schemaMap.put((String) itrJObj.get("recordcolumnname"),
								(String) itrJObj.get("recordcolumndisplayname"));
					}

					ICIPDataset dataset = datasetService.getDataset(datasetName, projectName);
					if (dataset != null) {
						String results;

						results = this.getDataSetService(dataset)
								.getDatasetData(dataset, new SQLPagination(Integer.parseInt(page),
										Integer.parseInt(size), sortEvent, Integer.parseInt(sortOrder)), DATATYPE.DATA,
										String.class);
						if (results != null && !results.isEmpty()) {
							results = results.substring(1, results.length() - 1);
							if (results != null && !results.isEmpty()) {
								String[] qryResList = results.split("},");
								List<JSONObject> qryObjList = new ArrayList<>();
								for (String ele : qryResList) {
									ele = ele + "}";
									JSONObject jObj = new JSONObject(ele);
									qryObjList.add(jObj);
								}
								for (JSONObject jObj : qryObjList) {
									JSONObject resObj = new JSONObject();
									Iterator<String> objKeySet = jObj.keys();
									while (objKeySet.hasNext()) {
										String ky = objKeySet.next();
										if (schemaMap.containsKey(ky)) {
											resObj.put(schemaMap.get(ky), jObj.get(ky));
										}
									}
									resultList.put(resObj);
								}
							} else {
								resultStr = EMPTYRESULTSET;
								resultList.put(new JSONObject().put(ERROR, resultStr));
							}
						} else {
							resultStr = EMPTYRESULTSET;
							resultList.put(new JSONObject().put(ERROR, resultStr));
						}
					}
				}
			}
		}
		return resultList.toList();
	}
	
	
	/**
	 * Gets the objects count.
	 *
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @return the objects count
	 * @throws SQLException 
	 */
	@Override
	public String getObjectsCount(String datasetName, String projectName) throws SQLException {
		ICIPDataset dataset = datasetService.getDataset(datasetName, projectName);
		return this.getDataSetService(dataset).getDataCount(dataset).toString();
	}
	
	@Override
	public String searchDatasetData(ICIPDataset dataset, String projectName, String size, String page,
			String sortEvent, String sortOrder, String searchParams, JSONObject extraParams) throws SQLException {
		
		
		switch(dataset.getDatasource().getCategory()) {
			
		case "SQL":
			return this.getSearchedObjects(dataset, projectName, size, page, sortEvent, sortOrder, searchParams, extraParams).toString();	
			
		case "REST":
			JSONObject attributes = new JSONObject(dataset.getAttributes());
			//convert searchParams into rest acceptable format
			attributes.put("EssedumParams", searchParams);
			dataset.setAttributes(attributes.toString());
		default :
			return this.getDataSetService(dataset).getDatasetData(dataset,
					null, DATATYPE.DATA, String.class);
		}
		
	}
	
	/**
	 * Gets the searched objects.
	 *
	 * @param datasetName  the dataset name
	 * @param projectName  the project name
	 * @param size         the size
	 * @param page         the page
	 * @param sortEvent    the sort event
	 * @param sortOrder    the sort order
	 * @param searchParams the search params
	 * @param extraParams  the extra params
	 * @return the searched objects
	 * @throws SQLException          the SQL exception
	 * @throws NumberFormatException the number format exception
	 */
	@Override
	public List<Object> getSearchedObjects(ICIPDataset dataset, String projectName, String size, String page,
			String sortEvent, String sortOrder, String searchParams, JSONObject extraParams) throws SQLException {
		JSONArray resultList = new JSONArray();
		try {
			if (dataset != null) {
				ICIPSchemaRegistry schema = dataset.getSchema();
				final List<String> allowedProps = new ArrayList<>(this.extractAllowedProps(schema,
						dataset.getIsInboxRequired() != null ? dataset.getIsInboxRequired() : false,
						dataset.getIsApprovalRequired() != null ? dataset.getIsApprovalRequired() : false));
				if (!allowedProps.isEmpty() && allowedProps.get(0).startsWith(ERROR)) {
					resultList.put(new JSONObject().put(ERROR, allowedProps.get(0).substring(6)));
				} else {
					JSONObject attributes = new JSONObject(dataset.getAttributes());
					attributes.put("allowedProps", String.join("=#@-@#=", allowedProps));
					attributes.put("searchParams", searchParams);
					if(extraParams.has("params")) {
						if(attributes.get("params").toString().isEmpty() || new JSONObject(attributes.get("params").toString()).isEmpty())
							attributes.put("params", extraParams.get("params"));
						else {
							JSONObject params = new JSONObject(attributes.get("params"));
							Iterator<String> keysItr = new JSONObject(extraParams.get("params")).keys();
							while (keysItr.hasNext()) {
								String key = keysItr.next();
								String newValue = extraParams.get(key).toString();
								params.append(key, newValue);
							}
							attributes.put("params", params);
						}
					}						
					if (extraParams.has("selectClauseParams"))
						attributes.put("selectClauseParams", extraParams.get("selectClauseParams"));
					dataset.setAttributes(attributes.toString());
					String results = this.getDataSetService(dataset).getDatasetData(dataset,
							new SQLPagination(Integer.parseInt(page), Integer.parseInt(size), sortEvent,
									Integer.parseInt(sortOrder)),
							DATATYPE.DATA, String.class);
					if (extraParams.has("dbResp") && extraParams.getString("dbResp").equals("1")) {
						List<Object> dbRespList = new ArrayList<>();
						dbRespList.add(results);
						if (!allowedProps.isEmpty())
							dbRespList.add(allowedProps.toString());
						else
							dbRespList.add("Allow all properties");
						return dbRespList;
					} else {
						if (results != null && !results.trim().isEmpty()) {
							results = results.substring(1, results.length() - 1);
							if (results != null && !results.trim().isEmpty()) {
								results = "[" + results + "]";
								JsonElement element = JsonParser.parseString(results);
								JsonArray resultArray = element.getAsJsonArray();
								for (JsonElement jEle : resultArray) {
									Set<String> objKeySet;
									if (!allowedProps.isEmpty())
										objKeySet = jEle.getAsJsonObject().keySet().stream()
												.filter(kyEle -> allowedProps.stream()
														.anyMatch(ele -> ele.equalsIgnoreCase(kyEle)))
												.collect(Collectors.toSet());
									else
										objKeySet = jEle.getAsJsonObject().keySet();
									JSONObject resObj = new JSONObject();
                                    for (String objKy : objKeySet) {
                                        JSONObject jObj = new JSONObject(jEle.getAsJsonObject().toString());
                                        resObj.put(objKy, jObj.get(objKy));
                                    }
                                    resultList.put(resObj);
								}
							} else {
								logger.info(EMPTYRESULTSET);
								resultList = new JSONArray();
							}
						} else {
							logger.info(EMPTYRESULTSET);
							resultList = new JSONArray();
						}
					}
				}
			} else {
				resultList.put(new JSONObject().put(ERROR, dataset.getAlias() + " dataset not found"));
			}
			return resultList.toList();
		} catch (Exception ex) {
			logger.error("Error: Error in fetching dataset results {}", ex.getMessage(), ex);
			resultList.put(new JSONObject().put(ERROR, "Error in fetching dataset results " + ex.getMessage()));
			return resultList.toList();
		}
	}
	
	public List<Object> getS3FileData(ICIPDataset dataset, String fileName) {
		// TODO Auto-generated method stub
		String[] valuesArray = fileName.split(",");
		JSONArray results = new JSONArray();
		JSONArray filedata = null;
		for(String value: valuesArray) {
			filedata = this.getDataSetService(dataset).getFileData(dataset,value);
			results.put(filedata);
		}
		
        return results.toList();
     }
	
	public List<Object> getS3FileInfo(ICIPDataset dataset, String fileName) {
		String[] valuesArray = fileName.split(",");
		JSONArray results = new JSONArray();
		JSONArray filedata = null;
		for(String value: valuesArray) {
			filedata = this.getDataSetService(dataset).getFileInfo(dataset,value);
			results.put(filedata);
		}
        return results.toList();
    }
	/*The following method is similar to getSearchedObjects but it returns
	  List<LinkedHashMap> to maintain column order of resultset*/
	@Override
	public List<Object> getSearchedData(ICIPDataset dataset, String projectName, String size, String page,
			String sortEvent, String sortOrder, String searchParams, JSONObject extraParams) throws SQLException {
		
		List<Object> resultList = new ArrayList<>();
		
		try {
			if (dataset != null) {
				ICIPSchemaRegistry schema = dataset.getSchema();
				final List<String> allowedProps = new ArrayList<>(this.extractAllowedProps(schema,
						dataset.getIsInboxRequired() != null ? dataset.getIsInboxRequired() : false,
						dataset.getIsApprovalRequired() != null ? dataset.getIsApprovalRequired() : false));
				 
				LinkedHashMap<String, Object> rowMap = new LinkedHashMap<>();
				
				if (!allowedProps.isEmpty() && allowedProps.get(0).startsWith(ERROR)) {
					rowMap.put(ERROR, allowedProps.get(0).substring(6));
					resultList.add(rowMap);
				} else {
					JSONObject attributes = new JSONObject(dataset.getAttributes());
					attributes.put("allowedProps", String.join("=#@-@#=", allowedProps));
					attributes.put("searchParams", searchParams);
					if(extraParams.has("params")) {
						if(new JSONObject(attributes.get("params").toString()).isEmpty())
							attributes.put("params", extraParams.get("params"));
						else {
							JSONObject params = new JSONObject(attributes.get("params"));
							Iterator<String> keysItr = new JSONObject(extraParams.get("params")).keys();
							while (keysItr.hasNext()) {
								String key = keysItr.next();
								String newValue = extraParams.get(key).toString();
								params.append(key, newValue);
							}
							attributes.put("params", params);
						}
					}						
					if (extraParams.has("selectClauseParams"))
						attributes.put("selectClauseParams", extraParams.get("selectClauseParams"));
					dataset.setAttributes(attributes.toString());
					String results = this.getDataSetService(dataset).getDatasetData(dataset,
							new SQLPagination(Integer.parseInt(page), Integer.parseInt(size), sortEvent,
									Integer.parseInt(sortOrder)),
							DATATYPE.DATA, String.class);
					
//					if(extraParams.has("dbResp") && extraParams.getString("dbResp").equals("1")) {
//						JsonArray dbRespList = new ArrayList<>();
//						dbRespList.add(results);
//						if (!allowedProps.isEmpty())
//							dbRespList.add(allowedProps.toString());
//						else
//							dbRespList.add("Allow all properties");
//						return dbRespList;
//					}
//					else {
					
						if(results==null || results.isEmpty()) {
							logger.info("no records were fetched by query!");
							return null;
						}
					
						JsonArray jsonArr = JsonParser.parseString(results).getAsJsonArray();
						
						if(jsonArr!=null && !jsonArr.isEmpty()) {
							
							for(JsonElement jsonEle : jsonArr){
								
								Set<String> objKeySet;
								if (!allowedProps.isEmpty())
									objKeySet = jsonEle.getAsJsonObject().keySet().stream()
											.filter(kyEle -> allowedProps.stream()
													.anyMatch(ele -> ele.equalsIgnoreCase(kyEle)))
											.collect(Collectors.toSet());
								else
									objKeySet = jsonEle.getAsJsonObject().keySet();
								
								LinkedHashMap<String, Object> row = new LinkedHashMap<>();
								JsonObject rowObj = jsonEle.getAsJsonObject();
								objKeySet.forEach( key -> {
									
									if(rowObj.get(key).isJsonNull() || rowObj.get(key)==null) {
										row.put(key, null);
									}
									else
										row.put(key, rowObj.get(key).toString().replaceAll("^\"|\"$", ""));
								});
								resultList.add(row);
							}
							
						}else {
							logger.info(EMPTYRESULTSET);
							resultList = new ArrayList<>();
						}
					//}
				}
			} else {		
				LinkedHashMap<String, Object> rowObject = new LinkedHashMap<>();
				rowObject.put(ERROR, "dataset is null!");
				resultList.add(rowObject);
			}
			
		} catch (Exception ex) {
			logger.error("Error: Error in fetching dataset results {}", ex.getMessage(), ex);
			LinkedHashMap<String, Object> errObject = new LinkedHashMap<>();
			errObject.put(ERROR, "Error in fetching dataset results " + ex.getMessage());
			resultList.add(errObject);
		}
		return resultList;
	}

	/**
	 * Gets the search data count.
	 *
	 * @param datasetName  the dataset name
	 * @param projectName  the project name
	 * @param searchParams the search params
	 * @return the search data count
	 */
	@Override
	public String getSearchDataCount(ICIPDataset dataset , String projectName, String searchParams, JSONObject extraParams) throws SQLException {
		String searchObjCount = "";
		try {
			if (dataset != null) {
				ICIPSchemaRegistry schema = dataset.getSchema();
				final List<String> allowedProps = new ArrayList<>(this.extractAllowedProps(schema,
						dataset.getIsInboxRequired() != null ? dataset.getIsInboxRequired() : false,
						dataset.getIsApprovalRequired() != null ? dataset.getIsApprovalRequired() : false));
				if (!allowedProps.isEmpty() && allowedProps.get(0).startsWith(ERROR)) {
					searchObjCount = allowedProps.get(0);
				} else {
					try {
						JSONObject attributes = new JSONObject(dataset.getAttributes());
						if(extraParams.has("params")) {
							if (attributes.has("params")) {
							if(attributes.get("params").toString().isEmpty() || new JSONObject(attributes.get("params").toString()).isEmpty())
								attributes.put("params", extraParams.get("params"));
							else {
								String paramsString = attributes.getString("params");
								JSONObject params = new JSONObject(paramsString);
								Iterator<String> keysItr = new JSONObject(extraParams.get("params")).keys();
								while (keysItr.hasNext()) {
									String key = keysItr.next();
									if(extraParams.has(key)) {
									String newValue = extraParams.get(key).toString();
									params.append(key, newValue);
									}
								}
								attributes.put("params", params);
							}
						}
						}
						attributes.put("allowedProps", String.join("=#@-@#=", allowedProps));
						attributes.put("searchParams", searchParams);
						dataset.setAttributes(attributes.toString());
						Long searchCount = this.getDataSetService(dataset).getDataCount(dataset);
						if (searchCount != null) {
							searchObjCount = searchCount.toString();
						} else {
							searchObjCount = "0";
						}
					} catch (NumberFormatException e) {
						logger.error("Error: Error in fetching result count for dataset {} {}", dataset.getAlias(),
								e.getMessage(), e);
						searchObjCount = "Error: Error in fetching result count for dataset " + dataset.getAlias() + " "
								+ e.getMessage();
					}
				}
			} else {
				searchObjCount = "Error: Dataset not found";
			}
			return searchObjCount;
		} catch (Exception ex) {
			logger.error("Error: Error in fetching result count for dataset {} {}", dataset.getAlias(), ex.getMessage(), ex);
			searchObjCount = "Error: Error in fetching result count for dataset " + dataset.getAlias() + " " + ex.getMessage();
			return searchObjCount;
		}
	}

	/**
	 * Extracts recordColumnNames from schema.
	 *
	 * @param schema  the ICIPSchemaRegistry object
	 * @param inbox   the inbox
	 * @param approve the approve
	 * @return the set of recordColumnNames
	 */
	private Set<String> extractAllowedProps(ICIPSchemaRegistry schema, boolean inbox, boolean approve) {
		Set<String> allowedProps = new HashSet<>();
		try {
			if (schema == null) {
				logger.info("Schema not found");
			} else {
				String schemaValue = schema.getSchemavalue();
				if (schemaValue == null || schemaValue.trim().isEmpty()) {
					logger.error("Error: Schema value not found or Schema value is empty");
					allowedProps.add("Error: Schema value not found or Schema value is empty");
				} else {
					if (inbox) {
                    String inboxSchemaValue=schemaService.fetchSchemaValue("CAMUNDA_SCHEMA", "Core");
						if(!inboxSchemaValue.isEmpty())
						{
							JSONArray temp = new JSONArray(schemaValue);
                      	new	JSONArray(inboxSchemaValue).forEach(ele->{temp.put(ele);});
                      	temp.put(new JSONObject("{\"columntype\":\"varchar\",\"columnorder\":0,\"recordcolumnname\":\"BID\",\"recordcolumndisplayname\":\"BID\",\"isunique\":false,\"isrequired\":false,\"isencrypted\":false}").toMap());
                      	schemaValue=temp.toString();
							}
						}
					String schemaValueContents = schemaValue;
					schemaValueContents = schemaValueContents.substring(1, schemaValueContents.length() - 1);
					if (schemaValueContents != null && !schemaValueContents.trim().isEmpty()) {
						allowedProps = Arrays.asList(schemaValueContents.split("},")).stream()
								.map(ele -> new JSONObject(ele + "}")).filter(ele -> ele != null && !ele.isEmpty())
								.map(ele -> ele.get("recordcolumnname").toString()).collect(Collectors.toSet());
					
						}

					}

				}
				return allowedProps;
		} catch (Exception ex) {
			logger.error("Error: Error in extracting allowed properties from schema {}", ex.getMessage(), ex);
			allowedProps.add("Error: Error in extracting allowed properties from schema " + ex.getMessage());
			return allowedProps;
		}
	}

	/**
	 * Gets the download csv.
	 *
	 * @param datasetName      the dataset name
	 * @param projectName      the project name
	 * @param chunkSize        the chunk size
	 * @param apiCount         the api count
	 * @param sortEvent        the sort event
	 * @param sortOrder        the sort order
	 * @param searchParams     the search params
	 * @param fieldsToDownload the fields to download
	 * @return the download csv
	 */
	public String getDownloadFullCsv(String datasetName, String projectName) {
		String resultCsv = "";
		String apiCount="0";
		String sortEvent=null;
		String sortOrder="-1";
		String searchParams="{and:[]}";
		JSONObject extraParams= new JSONObject();
		try {
			ICIPDataset dataset = datasetService.getDataset(datasetName,projectName);
			String objCount = getSearchDataCount(dataset, projectName, searchParams, extraParams);
			String chunkSize=objCount;
			if (objCount == null) {
				resultCsv = ERRORDOWNLOAD;
			} else if (objCount.startsWith(ERROR)) {
				resultCsv = objCount;
			} else {
//				extraParams = new JSONObject();
				extraParams.put("dbResp", "1");
				String selectClause="*";
				extraParams.put("selectClauseParams",selectClause );
				List<Object> objList = getSearchedObjects(dataset, projectName, chunkSize, apiCount, sortEvent,
						sortOrder, searchParams, extraParams);
				Object results = objList.get(0);
				if (objList.size() == 1 && results != null && results.toString().substring(1).startsWith("Error: ")) {
					resultCsv = results.toString().substring(1, results.toString().length() - 1);
				} else {
					String allowedPropsStr = objList.get(1).toString();
					HashSet<String> allowedProps = new HashSet<>();
					if (!allowedPropsStr.equals("Allow all properties"))
						allowedProps = new HashSet<>(
								Arrays.asList(allowedPropsStr.substring(1, allowedPropsStr.length() - 1).split(", ")));
					if (results != null) {
						if (results.toString() != null && !results.toString().isEmpty()) {
							resultCsv = downloadCsvChild(apiCount, results.toString(), allowedProps);
						} else {
							resultCsv = ERRORDOWNLOAD;
						}
					} else {
						resultCsv = ERRORDOWNLOAD;
					}
				}
			}
		} catch (Exception e) {
			logger.error("Error while fetching download objects ", e);
			resultCsv = "Error: Error while fetching download objects " + e.getMessage();
		}
		return resultCsv;
	}
	
	@Override
	public String getDownloadCsv(String datasetName, String projectName, String chunkSize, String apiCount,
			String sortEvent, String sortOrder, String searchParams, String fieldsToDownload) {
		String resultCsv = "";
		JSONObject extraParams= new JSONObject();
		try {
			ICIPDataset dataset = datasetService.getDataset(datasetName,projectName);
			String objCount = getSearchDataCount(dataset, projectName, searchParams, extraParams);
			if (objCount == null) {
				resultCsv = ERRORDOWNLOAD;
			} else if (objCount.startsWith(ERROR)) {
				resultCsv = objCount;
			} else {
//				extraParams = new JSONObject();
				extraParams.put("dbResp", "1");
				String selectClause=fieldsToDownload.substring(1, fieldsToDownload.length()-1).equals("")?"*":fieldsToDownload.substring(1, fieldsToDownload.length()-1);
				extraParams.put("selectClauseParams",selectClause );
				List<Object> objList = getSearchedObjects(dataset, projectName, chunkSize, apiCount, sortEvent,
						sortOrder, searchParams, extraParams);
				Object results = objList.get(0);
				if (objList.size() == 1 && results != null && results.toString().substring(1).startsWith("Error: ")) {
					resultCsv = results.toString().substring(1, results.toString().length() - 1);
				} else {
					String allowedPropsStr = objList.get(1).toString();
					HashSet<String> allowedProps = new HashSet<>();
					if (!allowedPropsStr.equals("Allow all properties"))
						allowedProps = new HashSet<>(
								Arrays.asList(allowedPropsStr.substring(1, allowedPropsStr.length() - 1).split(", ")));
					if (results != null) {
						if (dataset.getViews().equals("Csv View")) {
							resultCsv = downloadCsvChild1(apiCount, results.toString(), allowedProps);
						}
						else if (results.toString() != null && !results.toString().isEmpty()) {
							resultCsv = downloadCsvChild(apiCount, results.toString(), allowedProps);
						} else {
							resultCsv = ERRORDOWNLOAD;
						}
					} else {
						resultCsv = ERRORDOWNLOAD;
					}
				}
			}
		} catch (Exception e) {
			logger.error("Error while fetching download objects ", e);
			resultCsv = "Error: Error while fetching download objects " + e.getMessage();
		}
		return resultCsv;
	}

	/**
	 * Download csv child.
	 *
	 * @param apiCount     the api count
	 * @param res          the res
	 * @param allowedProps the allowed props
	 * @return the string
	 */
	private String downloadCsvChild(String apiCount, String res, HashSet<String> allowedProps) {
		String resultCsv;
		JSONObject output;
		try {
			String formattedRes = "{\"Tickets\":" + res + "}";
			output = new JSONObject(formattedRes);
			JSONArray docs = output.getJSONArray("Tickets");
			JSONArray jarr = new JSONArray();
			docs.forEach(obj -> {
				JSONObject jsondata = new JSONObject(obj.toString());
				if (!allowedProps.isEmpty()) {
					final JSONObject tempdata = new JSONObject(jsondata.toString());
					Map<String, Object> filteredMap = tempdata.keySet().stream()
							.filter(prop -> allowedProps.contains(prop))
							.collect(Collectors.toMap(ele -> ele, ele -> tempdata.get(ele), (k, v) -> k + ":" + v));
					jsondata = new JSONObject(filteredMap);
				}
				final JSONObject jsonobj = new JSONObject(jsondata.toString());
				jsonobj.keySet().stream().forEach(prop -> {
					if (jsonobj.isNull(prop))
						jsonobj.put(prop, "");
				});
				jarr.put(jsonobj);
			});
			String csv = "";
			if (Integer.parseInt(apiCount) == 0) {
				csv = CDL.toString(jarr);
			} else {
				csv = CDL.toString(jarr.getJSONObject(0).names(), jarr);
			}
			resultCsv = csv;
		} catch (Exception e) {
			logger.error("Error while fetching download objects ", e);
			resultCsv = "Error: Error while fetching download objects " + e.getMessage();
		}
		return resultCsv;
	}
	
	
	private String downloadCsvChild1(String apiCount, String res, HashSet<String> allowedProps) {
		String resultCsv;
		JSONObject output;
		JSONArray docs = null;
		try {
			String formattedRes = res;
			JSONArray jsonArray = new JSONArray(formattedRes);
			 for (int i = 0; i < jsonArray.length(); i++) {
				 JSONObject rowObject = jsonArray.getJSONObject(i);
		            Iterator<String> keys = rowObject.keys();
		            while (keys.hasNext()) {
		                String key = keys.next();
		                docs = rowObject.getJSONArray(key);
			 } 
			 }
			JSONArray jarr = new JSONArray();
			docs.forEach(obj -> {
				JSONObject jsondata = new JSONObject(obj.toString());
				if (!allowedProps.isEmpty()) {
					final JSONObject tempdata = new JSONObject(jsondata.toString());
					Map<String, Object> filteredMap = tempdata.keySet().stream()
							.filter(prop -> allowedProps.contains(prop))
							.collect(Collectors.toMap(ele -> ele, ele -> tempdata.get(ele), (k, v) -> k + ":" + v));
					jsondata = new JSONObject(filteredMap);
				}
				final JSONObject jsonobj = new JSONObject(jsondata.toString());
				jsonobj.keySet().stream().forEach(prop -> {
					if (jsonobj.isNull(prop))
						jsonobj.put(prop, "");
				});
				jarr.put(jsonobj);
			});
			String csv = "";
			if (Integer.parseInt(apiCount) == 0) {
				csv = CDL.toString(jarr);
			} else {
				csv = CDL.toString(jarr.getJSONObject(0).names(), jarr);
			}
			resultCsv = csv;
		} catch (Exception e) {
			logger.error("Error while fetching download objects ", e);
			resultCsv = "Error: Error while fetching download objects " + e.getMessage();
		}
		return resultCsv;
	}
	/**
	 * Tag details.
	 *
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @param data        the data
	 * @return the string
	 */
	@Override
	public String tagDetails(String datasetName, String projectName, String data) {
		ICIPDataset dataset = null;
		String resStr = "";
		try {
			dataset = datasetService.getDataset(datasetName, projectName);
			if (dataset != null) {
				resStr = getDataSetServiceSql(dataset).applyTag(dataset, data);
				if (resStr.startsWith("update ")) {
					ICIPDataset ds = getDataset(resStr, projectName, datasetName);
					try {
						datasetFactory.getDataSetUtilSql(dataset.getDatasource().getType().toLowerCase() + "ds")
								.executeUpdate(ds, null);
						logger.info("Tag applied successfully");
						resStr = "Tag applied successfully";
					} catch (SQLException e) {
						logger.error("Error while applying tag: ", e);
						resStr = ERROR + e.getMessage();
					}
				} else if (!resStr.startsWith("Error: ")) {
					logger.error("Error while applying tag: Uncaught exception");
					resStr = ERROR + "Uncaught exception";
				}
			} else {
				logger.error("Error while applying tag: Dataset not found");
				resStr = ERROR + "Dataset not found";
			}
		} catch (Exception e) {
			logger.error("Error while applying tag: ", e);
			resStr = ERROR + e.getMessage();
		}
		return resStr;
	}

	/**
	 * Gets the dataset.
	 *
	 * @param query       the query
	 * @param projName    the proj name
	 * @param datasetName the dataset name
	 * @return the dataset
	 */
	private ICIPDataset getDataset(String query, String projName, String datasetName) {
		ICIPDataset ds = datasetService.getDataset(datasetName, projName);
		Gson gson = new Gson();
		JsonObject jsonObject = gson.fromJson(ds.getAttributes(), JsonElement.class).getAsJsonObject();
		jsonObject.addProperty(QUERY, query);
		ds.setAttributes(jsonObject.toString());
		return ds;
	}

	/**
	 * Gets the tickets for range.
	 *
	 * @param datasetName  the dataset name
	 * @param projectName  the project name
	 * @param size         the size
	 * @param page         the page
	 * @param sortEvent    the sort event
	 * @param sortOrder    the sort order
	 * @param searchParams the search params
	 * @param dbResp       the db resp
	 * @param columnName   the column name
	 * @param dateFilter   the date filter
	 * @return the tickets for range
	 * @throws SQLException          the SQL exception
	 * @throws NumberFormatException the number format exception
	 */
	@Override
	public SortedMap<String, Integer> getTicketsForRange(String datasetName, String projectName, String size,
			String page, String sortEvent, String sortOrder, String searchParams, String dbResp, String columnName,
			String dateFilter) throws SQLException {
		ICIPDataset dataset = datasetService.getDataset(datasetName,projectName);
		JSONObject extraParams= new JSONObject();
		String totalCount = getSearchDataCount(dataset, projectName, searchParams, extraParams);
//		extraParams = new JSONObject();
		extraParams.put("dbResp", "0");
		List<Object> tickets = getSearchedObjects(dataset, projectName, totalCount, "0", sortEvent, sortOrder,
				searchParams, extraParams);
		SortedMap<String, Integer> mapper = new TreeMap<>();
		String currKey = "";

		for (Object ticket : tickets) {
			String date = ticket.toString().substring(ticket.toString().indexOf(columnName + "=") + 12,
					ticket.toString().indexOf(columnName + "=") + 31);
			if (date != null) {
				if (dateFilter.equals("month")) {
					currKey = date.substring(0, 10);
				} else {
					if (dateFilter.equals("year")) {
						currKey = date.substring(0, 8) + "01";
					} else {
						if (dateFilter.equals("all")) {
							currKey = date.substring(0, 4) + "-01-01";
						}
					}
				}
			}
			if (mapper.containsKey(currKey)) {
				mapper.put(currKey, mapper.get(currKey) + 1);
			} else {
				mapper.put(currKey, 1);
			}
		}
		return mapper;
	}

	/**
	 * Save entry.
	 *
	 * @param rowData     the row data
	 * @param action      the action
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @return the string
	 */

	@Override
	public String saveEntry(String rowData, String action, String datasetName, String projectName) {
		logger.info("Saving {} dataset entry", datasetName);

		ICIPDataAuditResponse resp1 = new ICIPDataAuditResponse();
		String resp = "";
		try {
			ICIPDataset dataset = datasetService.getDataset(datasetName, projectName);
			if (action.equalsIgnoreCase("create") || action.equalsIgnoreCase("insert")) // for normal new entry and
																						// approved new entry
			{

				resp1 = getDataSetServiceSql(dataset).addEntry(dataset, rowData);
				if (resp1 != null)
					resp = resp1.getResponse();
			} else if (action.equalsIgnoreCase("assign")) // for approve case
			{
				resp1 = getDataSetServiceSql(dataset).assignEntry(dataset, rowData);
				if (resp1 != null)
					resp = resp1.getResponse();
			} else if (dataset.getIsApprovalRequired()) {
				boolean check = getDataSetServiceSql(dataset).checkUnderApproval(dataset, rowData, action,
						dataset.getIsApprovalRequired());
				if (check) {
					logger.error("Error while performing action on  dataset entry: row under approval stage ");
					return resp;
				} else {

					if (action.equalsIgnoreCase("update")) // update under approve case
					{
						resp = getDataSetServiceSql(dataset).approveupdateEntry(dataset, rowData);
					} else if (action.equalsIgnoreCase("delete")) // delete under approve case
					{
						resp = getDataSetServiceSql(dataset).deleteEntry(dataset, rowData,
								dataset.getIsApprovalRequired());
					}
				}

			} else if (action.equalsIgnoreCase("update") && !dataset.getIsApprovalRequired()) // update without approval
																								// required
			{
				resp1 = getDataSetServiceSql(dataset).updateEntry(dataset, rowData);
			} else if (action.equalsIgnoreCase("delete") && !dataset.getIsApprovalRequired()) // delete without approval
																								// required
			{
				resp = getDataSetServiceSql(dataset).deleteEntry(dataset, rowData, false);
			}

			else {

				resp = "Error: Invalid action value";
				logger.error("Error while saving {} dataset entry: Invalid action value", datasetName);
			}
		} catch (Exception ex) {
			resp = ERROR + ex.getMessage();
			logger.error("Error while saving {} dataset entry: {}", datasetName, ex.getMessage(), ex);
		}
		return resp;
	}

	/**
	 * 
	 */

	@Override
	public List<ICIPDataset> getDatasetForSchemaAlias(String schemaAlias, String projectName) {
		ICIPSchemaRegistry schema = schemaRegistryService.getSchemaByAliasAndOrganization(schemaAlias, projectName);
		if (schema == null)
			return null;

		return datasetService.getDatasetBySchemaAndOrganization(schema, projectName);

	}

	@Override
	public JSONArray getRowExtras(String propertyDetails, String unqId, String datasetName, String organization) {
		ICIPDataset dataset = datasetService.getDataset(datasetName, organization);
		return getDataSetServiceSql(dataset).getRowExtras(dataset, unqId, propertyDetails);
	}

	public JSONArray getDatasetAttachments(String uniqueId, String datasetName, String organization) {
		ICIPDataset dataset = datasetService.getDataset(datasetName, organization);
		ICIPSchemaRegistry schema = dataset.getSchema();
		JSONArray schemaValue = new JSONArray(schema.getSchemavalue());
		List<JSONObject> schemaValueList = new ArrayList<>();
		for (int i = 0; i < schemaValue.length(); i++) {
			schemaValueList.add(schemaValue.getJSONObject(i));
		}
		List<String> fileTypeCols = schemaValueList.stream().filter(ele -> ele.getString("columntype").equals("file"))
				.map(ele -> ele.getString("recordcolumnname")).collect(Collectors.toList());
		String properties = fileTypeCols.toString();
		properties = properties.substring(1, properties.length() - 1);
		return getDataSetServiceSql(dataset).getRowExtras(dataset, uniqueId, properties);

	}

	public String deleteS3file(ICIPDataset dataset, String fileName) {
		try {
		this.getDataSetService(dataset).deleteFiledata(dataset,fileName);
		return("Success, File Deleted");
		}catch(Exception e) {
	        throw new RuntimeException("Failed, File Not Deleted", e);
        }
		
	}

}
