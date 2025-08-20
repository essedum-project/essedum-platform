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
import java.lang.reflect.InvocationTargetException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.python.jline.internal.Log;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.ai.comm.lib.util.service.dto.support.NameEncoderService;
import com.lfn.icip.dataset.config.WebConfigAIP;
import com.lfn.icip.dataset.constants.ICIPPluginConstants;
//import com.lfn.iamp.usm.domain.UsmPermissions;
//import com.lfn.iamp.usm.repository.UsmPermissionsRepository;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDataset2;
import com.lfn.icip.dataset.model.ICIPDatasetFormMapping;
import com.lfn.icip.dataset.model.ICIPDatasetFormMapping2;
import com.lfn.icip.dataset.model.ICIPDatasetTopic;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.model.ICIPSchemaForm;
import com.lfn.icip.dataset.model.ICIPSchemaRegistry;
import com.lfn.icip.dataset.model.MlAdapters;
import com.lfn.icip.dataset.repository.ICIPDatasetFormMappingRepository;
import com.lfn.icip.dataset.repository.ICIPDatasetRepository;
import com.lfn.icip.dataset.repository.ICIPDatasetRepository2;
import com.lfn.icip.dataset.repository.ICIPDatasetTopicRepository;
import com.lfn.icip.dataset.repository.ICIPSchemaFormRepository;
import com.lfn.icip.dataset.service.IICIPDatasetFormMappingService;
import com.lfn.icip.dataset.service.IICIPDatasetService;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.service.IICIPSchemaFormService;
import com.lfn.icip.dataset.service.IICIPSchemaRegistryService;
import com.lfn.icip.dataset.util.DynamicClassLoader;
import com.lfn.icip.icipwebeditor.v1.dto.BaseEntity;
import com.lfn.icip.icipwebeditor.v1.service.IICIPSearchable;

import javassist.CannotCompileException;
import javassist.ClassPool;
import javassist.CtClass;
import javassist.CtMethod;
import javassist.Modifier;
import javassist.NotFoundException;
import reactor.core.publisher.Flux;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HashMap;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.hibernate.TransactionException;
import org.hibernate.exception.JDBCConnectionException;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.spi.MappingContext;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.orm.jpa.JpaObjectRetrievalFailureException;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import com.amazonaws.ClientConfiguration;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.http.conn.ssl.SdkTLSSocketFactory;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.CompleteMultipartUploadRequest;
import com.amazonaws.services.s3.model.InitiateMultipartUploadRequest;
import com.amazonaws.services.s3.model.InitiateMultipartUploadResult;
import com.amazonaws.services.s3.model.PartETag;
import com.amazonaws.services.s3.model.UploadPartRequest;
import com.amazonaws.services.s3.model.UploadPartResult;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.icip.dataset.model.dto.ICIPDatasetDTO;
import com.lfn.icip.dataset.properties.ProxyProperties;
import com.lfn.icip.dataset.util.ICIPRestPluginUtils;
import com.lfn.icip.icipwebeditor.fileserver.service.impl.FileServerService;
import jakarta.persistence.EntityNotFoundException;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPDatasetService.
 *
 * @author essedum
 */
@Service("datasetservice")
public class ICIPDatasetService implements IICIPDatasetService,IICIPSearchable {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPDatasetService.class);

	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/** The dataset repository 2. */
	private ICIPDatasetRepository2 datasetRepository2;

	/** The datasource service. */
	private IICIPDatasourceService datasourceService;

	/** The schema registry service. */
	private IICIPSchemaRegistryService schemaRegistryService;

	/** The schema registry service. */
	private IICIPSchemaFormService schemaFormService;

	/** The dataset repository. */
	private ICIPDatasetRepository datasetRepository;

	/** The dataset repository. */
	private ICIPDatasetFormMappingRepository datasetFormRepository;

	/** The datasetformmapping repository. */
	private IICIPDatasetFormMappingService datasetFormMappingService;
	
	/** The datasettopic repository. */
	private ICIPDatasetTopicRepository icipDatasetTopicRepository;
	
	/** The usmpermissionrepo. */
//	@Autowired
//	private UsmPermissionsRepository usmpermissionrepo;

	/** The ncs. */
	private NameEncoderService ncs;
	
	final String TYPE="DATASET";
	
	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;
	
	@EssedumProperty("icip.certificateCheck")
	private String certificateCheck;
	
	/** The File Server Service. */
	private FileServerService fileserverService;
		
	/** The Constant OAUTH. */
	public static final String OAUTH = "oauth";
	
	/** The proxy properties. */
	private ProxyProperties proxyProperties;
	
	private WebConfigAIP webClientObj;

	/**
	 * Instantiates a new ICIP dataset service.
	 *
	 * @param datasetRepository     the dataset repository
	 * @param datasetRepository2    the dataset repository 2
	 * @param datasourceService     the datasource service
	 * @param schemaRegistryService the schema registry service
	 * @param ncs                   the ncs
	 */
	public ICIPDatasetService(ICIPDatasetRepository datasetRepository, ICIPDatasetRepository2 datasetRepository2,
			IICIPDatasourceService datasourceService, IICIPSchemaRegistryService schemaRegistryService,
			NameEncoderService ncs, ICIPDatasetFormMappingRepository datasetFormRepository,
			IICIPSchemaFormService schemaFormService,
			ICIPDatasetTopicRepository icipDatasetTopicRepository,
			IICIPDatasetFormMappingService datasetFormMappingService,
			ProxyProperties proxyProperties,FileServerService fileserverService,
			WebConfigAIP webClientObj
			) {
		super();
		this.datasetRepository = datasetRepository;
		this.datasetRepository2 = datasetRepository2;
		this.datasourceService = datasourceService;
		this.schemaRegistryService = schemaRegistryService;
		this.ncs = ncs;
		this.datasetFormRepository = datasetFormRepository;
		this.schemaFormService = schemaFormService;
		this.datasetFormMappingService=datasetFormMappingService;
		this.icipDatasetTopicRepository = icipDatasetTopicRepository;
		this.proxyProperties = proxyProperties;
		this.fileserverService = fileserverService;
		this.webClientObj = webClientObj;
	}

	/**
	 * Gets the dataset.
	 *
	 * @param id the id
	 * @return the dataset
	 */
	@Override
	public ICIPDataset getDataset(Integer id) {
		Optional<ICIPDataset> s = datasetRepository.findById(id);
		if (s.isPresent())
			return s.get();
		return null;
	}

	/**
	 * Gets the dataset for exp.
	 *
	 * @param org the org
	 * @return the dataset for exp
	 */
	@Override
	public List<ICIPDataset> getDatasetForExp(String org) {
		return datasetRepository.findByExp(org);
	}

	/**
	 * Gets the dataset.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the dataset
	 */
	@Override
	public ICIPDataset2 getDatasetObject(String name, String org) {
		return datasetRepository2.findDatasetByNameAndOrganization(name, org);
	}
	
	@Override
	public ICIPDataset2 getDatasetByOrgAndAlias2(String datasetName, String org) {
		return datasetRepository2.getDatasetByOrgAndAlias2(datasetName, org);
	}

	@Override
	public ICIPDataset getDatasetByOrgAndAlias(String datasetName, String org) {
		return datasetRepository.getDatasetByOrgAndAlias(datasetName, org);
	}

	/**
	 * Gets the dataset.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the dataset
	 */
	@Override
	public ICIPDataset getDataset(String name, String org) {
		return datasetRepository.findByNameAndOrganization(name, org);
	}

	/**
	 * Gets the dataset 2.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the dataset 2
	 */
	@Override
	public ICIPDataset2 getDataset2(String name, String org) {
		return datasetRepository2.findDatasetByNameAndOrganization(name, org);
	}

	@Override
	public ICIPDataset2 save(ICIPDataset iCIPDataset) {
		return datasetRepository2.save(iCIPDataset);
	}

	/**
	 * Save.
	 *
	 * @param idOrName         the id or name
	 * @param iCIPDataset2Save the i CIP dataset 2 save
	 * @return the ICIP dataset
	 */
	@Override
	public ICIPDataset2 save(String idOrName, ICIPDataset iCIPDataset2Save) {
		return save(idOrName, iCIPDataset2Save, logger, null, -1, false);
	}

	/**
	 * Save.
	 *
	 * @param idOrName         the id or name
	 * @param iCIPDataset2Save the i CIP dataset 2 save
	 * @param skip             the skip
	 * @return the ICIP dataset 2
	 */
	@Override
	public ICIPDataset2 save(String idOrName, ICIPDataset iCIPDataset2Save, boolean skip) {
		return save(idOrName, iCIPDataset2Save, logger, null, -1, skip);
	}

	/**
	 * Save.
	 *
	 * @param idOrName         the id or name
	 * @param iCIPDataset2Save the i CIP dataset 2 save
	 * @param logger           the logger
	 * @param marker           the marker
	 * @param datasetProjectId the dataset project id
	 * @param skip             the skip
	 * @return the ICIP dataset
	 */
	@Override
	public ICIPDataset2 save(String idOrName, ICIPDataset iCIPDataset2Save, Logger logger, Marker marker,
			int datasetProjectId, boolean skip) {
		ICIPDataset2 iCIPDataset = new ICIPDataset2();
		try {
			if (StringUtils.isNumeric(idOrName)) {
				Integer id = Integer.parseInt(idOrName);
				ICIPDataset fetched = getDataset(id);
				if (fetched != null) {
					iCIPDataset.setId(fetched.getId());
				}
			}
		} catch (NumberFormatException e) {
			logger.error(marker, "Exception : {}", e.getMessage());
		}
		logger.info(marker, "saving dataset {} to {}", iCIPDataset2Save.getAlias(), iCIPDataset2Save.getOrganization());
		iCIPDataset.setDescription(iCIPDataset2Save.getDescription());
		String data = iCIPDataset2Save.getAttributes();
		if (datasetProjectId != -1) {
			data = populateParamsDetails(marker, data, "{'projectId':'" + datasetProjectId + "'}");
		}
		if (iCIPDataset2Save.getName() == null || iCIPDataset2Save.getName().trim().isEmpty()) {
//			if(iCIPDataset2Save.getInterfacetype().equals("adapter")) {
//				iCIPDataset.setName(createMethodName(iCIPDataset2Save));
//			}
//			else {
			iCIPDataset.setName(createName(iCIPDataset2Save.getOrganization(), iCIPDataset2Save.getAlias()));
//			}			
		} else {
			iCIPDataset.setName(iCIPDataset2Save.getName());
		}
		iCIPDataset.setAttributes(data);
		String ds = iCIPDataset2Save.getDatasource() != null ? iCIPDataset2Save.getDatasource().getName() : null;

		iCIPDataset.setDatasource(ds);
		String sc = iCIPDataset2Save.getSchema() != null ? iCIPDataset2Save.getSchema().getName() : null;
		iCIPDataset.setSchema(sc);
		iCIPDataset.setOrganization(iCIPDataset2Save.getOrganization());
		iCIPDataset.setType(iCIPDataset2Save.getType());
		iCIPDataset.setDashboard(iCIPDataset2Save.getDashboard());
		iCIPDataset.setExpStatus(iCIPDataset2Save.getExpStatus());
		iCIPDataset.setAlias(iCIPDataset2Save.getAlias() != null && !iCIPDataset2Save.getAlias().trim().isEmpty()
				? iCIPDataset2Save.getAlias()
				: iCIPDataset2Save.getName());
		iCIPDataset.setLastmodifiedby(iCIPDataset2Save.getLastmodifiedby());
		iCIPDataset.setLastmodifieddate(iCIPDataset2Save.getLastmodifieddate());
		iCIPDataset.setArchivalConfig(iCIPDataset2Save.getArchivalConfig());
		iCIPDataset.setIsArchivalEnabled(iCIPDataset2Save.getIsArchivalEnabled());
		iCIPDataset.setIsApprovalRequired(iCIPDataset2Save.getIsApprovalRequired());
		iCIPDataset.setIsAuditRequired(iCIPDataset2Save.getIsAuditRequired());
		iCIPDataset.setIsPermissionManaged(iCIPDataset2Save.getIsPermissionManaged());
		iCIPDataset.setIsInboxRequired(iCIPDataset2Save.getIsInboxRequired());
		iCIPDataset.setMetadata(iCIPDataset2Save.getMetadata());
		iCIPDataset.setModeltype(iCIPDataset2Save.getModeltype());
		iCIPDataset.setTaskdetails(iCIPDataset2Save.getTaskdetails());
		iCIPDataset.setSchemajson(iCIPDataset2Save.getSchemajson());
		iCIPDataset.setTags(iCIPDataset2Save.getTags());
		iCIPDataset.setViews(iCIPDataset2Save.getViews());
		iCIPDataset.setInterfacetype(iCIPDataset2Save.getInterfacetype());
		iCIPDataset.setAdaptername(iCIPDataset2Save.getAdaptername());
		iCIPDataset.setIsadapteractive(iCIPDataset2Save.getIsadapteractive());
		iCIPDataset.setIndexname(iCIPDataset2Save.getIndexname());
		iCIPDataset.setSummary(iCIPDataset2Save.getSummary());
		if(iCIPDataset2Save.getEvent_details()!=null) {
			iCIPDataset.setEvent_details(iCIPDataset2Save.getEvent_details());
		}
		logger.info("________________>>>>>>>>>>>>>>>{}", iCIPDataset.getId());
		ICIPDataset2 result = null;
		try {
			result = datasetRepository2.save(iCIPDataset);
		} catch (Exception E) {
			Log.error("Error in saving the dataset2 {}", iCIPDataset.getName());
		}
//		if (iCIPDataset.getIsApprovalRequired() != null && iCIPDataset.getIsApprovalRequired()) {
//			UsmPermissions usmp = new UsmPermissions();
//			usmp.setModule("cip");
//			String permission = "dataset-" + result.getName() + "-approve";
//			usmp.setPermission(permission);
//			logger.info(usmp.toString());
//			usmpermissionrepo.save(usmp);
//		}
		Optional<ICIPDataset2> fetched = datasetRepository2.findById(result.getId());
		ICIPDataset2 dset = null;
		if (fetched.isPresent()) {
			dset = fetched.get();
		}

		return dset;
	}

	public void addnewdatasourceandorg(String ds, String org, String neworg) {
		// TODO Auto-generated method stub
		ICIPDatasource datasource = datasourceService.getDatasourceByNameAndOrganization(ds, org);
		datasource.setId(null);
		datasource.setOrganization(neworg);
		try {
			datasourceService.savedatasource(datasource);
		} catch (Exception E) {
			logger.error("Error to save datasource-{}-- {}", ds, E.getMessage());

		}
	}

	/**
	 * Populate attribute details.
	 *
	 * @param marker the marker
	 * @param data   the data
	 * @param param  the param
	 * @return the string
	 */
	public String populateParamsDetails(Marker marker, String data, String param) {
		try {
			String paramsKeyword = "params";
			JSONObject dataObject = new JSONObject(data);
			if (dataObject.has(paramsKeyword)) {
				JSONObject userParams = new JSONObject(param);
				JSONArray userParamsNames = userParams.names();
				JSONObject params = new JSONObject();
				params = populateParamsDetailsChild(paramsKeyword, dataObject, params);
				if (userParamsNames != null && params.names() != null && params.names().length() > 0) {
					for (int j = 0; j < userParamsNames.length(); j++) {
						String key = (String) userParamsNames.get(j);
						if (params.has(key)) {
							params.put(key, userParams.get(key));
						}
					}
					dataObject.put(paramsKeyword, params.toString());
				}
			}
			return dataObject.toString();
		} catch (JSONException e) {
			logger.error(marker, "Error - {}", e.getMessage());
		}
		return null;
	}

	/**
	 * Populate params details child.
	 *
	 * @param paramsKeyword the params keyword
	 * @param dataObject    the data object
	 * @param params        the params
	 * @return the JSON object
	 */
	private JSONObject populateParamsDetailsChild(String paramsKeyword, JSONObject dataObject, JSONObject params) {
		try {
			String paramsString = (String) dataObject.get(paramsKeyword);
			if (!paramsString.trim().isEmpty()) {
				params = new JSONObject(paramsString);
			}
		} catch (Exception ex) {
			params = (JSONObject) dataObject.get(paramsKeyword);
		}
		return params;
	}

	/**
	 * Delete.
	 *
	 * @param name the name
	 * @param org  the org
	 */
	@Override
	public void delete(String name, String org) {
		ICIPDataset iCIPDataset = datasetRepository.findByNameAndOrganization(name, org);
		ICIPDatasetFormMapping iCIPDatasetFormMapping = datasetFormRepository.findByDatasetAndOrganization(name,org);
		List<ICIPDatasetTopic> iCIPDatasetTopic = icipDatasetTopicRepository.findByDatasetidAndOrganization(name, org);
		if (iCIPDataset != null && iCIPDatasetFormMapping == null) {
			logger.info("deleting dataset ");
			datasetRepository.delete(iCIPDataset);
			if (iCIPDatasetTopic != null && !iCIPDatasetTopic.isEmpty())
				icipDatasetTopicRepository.deleteAll(iCIPDatasetTopic);
		}
		else{
			logger.info("deleting dataset ");
			datasetFormRepository.delete(iCIPDatasetFormMapping);
			datasetRepository.delete(iCIPDataset);
			if (iCIPDatasetTopic != null && !iCIPDatasetTopic.isEmpty())
				icipDatasetTopicRepository.deleteAll(iCIPDatasetTopic);
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
		List<ICIPDataset> dsets = datasetRepository.findByOrganization(fromProjectId);
		dsets.stream().forEach(ds -> {
			ds.setOrganization(toProjectId);
			datasetRepository.save(ds);
		});
		return true;
	}

	/**
	 * Copy.
	 *
	 * @param marker           the marker
	 * @param fromProjectId    the from project id
	 * @param toProjectId      the to project id
	 * @param datasetProjectId the dataset project id
	 * @return true, if successful
	 */
	@Override
	public boolean copy(Marker marker, String fromProjectId, String toProjectId, int datasetProjectId) {
		List<ICIPDataset> dsets = datasetRepository.findByOrganization(fromProjectId);
		List<ICIPDataset> toDsets = dsets.parallelStream().map(dset -> {
			dset.setId(null);
			dset.setOrganization(toProjectId);
			return dset;
		}).collect(Collectors.toList());
		toDsets.stream().forEach(dset -> {
			ICIPDataset dataset = getDataset(dset.getName(), dset.getOrganization());
			String id = null;
			if (dataset != null) {
				dset.setId(dataset.getId());
				id = dataset.getId().toString();
			}
			ICIPDatasource datasource = datasourceService.getDatasource(dset.getDatasource().getName(), toProjectId);
			dset.setDatasource(datasource);
			if (dset.getSchema() != null) {
				ICIPSchemaRegistry schema = schemaRegistryService.getSchema(dset.getSchema().getName(), toProjectId);
				dset.setSchema(schema);
			} else {
				dset.setSchema(null);
			}
			try {
				save(id, dset, joblogger, marker, datasetProjectId, false);
			} catch (Exception e) {
				joblogger.error("Error in saving dataset : {}", dset.getName());
				joblogger.error(e.getMessage());
			}
		});
		return true;
	}

	@Override
	public boolean copytemplate(Marker marker, String fromProjectId, String toProjectId, int datasetProjectId) {
		List<ICIPDataset> dsets = datasetRepository.findByInterfacetypeAndOrganization("template", fromProjectId);
		logger.info("Length of dataset with template {}---{}", dsets.size());

		List<ICIPDataset> toDsets = dsets.parallelStream().map(dset -> {
			dset.setId(null);
			dset.setOrganization(toProjectId);
			return dset;
		}).collect(Collectors.toList());

		toDsets.stream().forEach(dset -> {
			try {
				ICIPDataset dataset = getDataset(dset.getName(), dset.getOrganization());
				logger.info("Got the dataset at 479");

				String id = null;
				if (dataset != null) {
					dset.setId(dataset.getId());
					id = dataset.getId().toString();
				}
				ICIPDatasource datasource = datasourceService.getDatasource(dset.getDatasource().getName(),
						fromProjectId);
				logger.info("Got the datasource at 488");

				dset.setDatasource(datasource);
				if (dset.getSchema() != null) {
					ICIPSchemaRegistry schema = schemaRegistryService.getSchema(dset.getSchema().getName(),
							fromProjectId);
					logger.info("Got the schema at 494");

						dset.setSchema(schema);
						ICIPSchemaRegistry schematoadd = new ICIPSchemaRegistry();
						schematoadd.setAlias(schema.getAlias());
						schematoadd.setDescription(schema.getDescription());
						schematoadd.setOrganization(toProjectId);
						schematoadd.setLastmodifiedby(schema.getLastmodifiedby());
						schematoadd.setName(schema.getName());
						schematoadd.setLastmodifieddate(schema.getLastmodifieddate());
						schematoadd.setSchemavalue(schema.getSchemavalue());

					List<ICIPSchemaForm> schemaForm = (schemaFormService.fetchSchemaForm(schema.getName(),
							fromProjectId));
					logger.info("Got the schemaform at 508");

					try {
						schemaRegistryService.save(schema.getName(), toProjectId, schematoadd);
					} catch (Exception e) {
						joblogger.error("Error in saving schema registrty in dataset service");
						joblogger.error(e.getMessage());
					}
					for (int forindex = 0; forindex < schemaForm.size(); ++forindex) {

						ICIPSchemaForm formindex = schemaForm.get(forindex);
						formindex.setOrganization(toProjectId);
						formindex.setId(null);
						try {
							ICIPSchemaForm result = schemaFormService.save(formindex);
						} catch (Exception e) {
							joblogger.error("Error in saving schema forms in dataset service");						
							joblogger.error(e.getMessage());
						}
					}

				} else {
					dset.setSchema(null);
				}
				try {
					addnewdatasourceandorg(dset.getDatasource().getName(), fromProjectId, toProjectId);
				} catch (Exception e) {
					joblogger.error("Error in saving datasources in dataset service ");
					joblogger.error(e.getMessage());
				}
				
				try {
					save(null, dset, joblogger, marker, datasetProjectId, false);
				} catch (Exception e) {
					joblogger.error("Error in saving dataset : {}", dset.getName());
					joblogger.error(e.getMessage());
				}
				try {
					addnewDatasetFormMapping(dset.getName(), fromProjectId, toProjectId);
				} catch (Exception e) {
					joblogger.error("Error in saving DatasetFormMapping ");
					joblogger.error(e.getMessage());
				}
			} catch (Exception err) {
				logger.error("Error occured in the for loop datasets");
			}
		});
		return true;
	}


	public void addnewDatasetFormMapping(String dataset, String fromProjectId, String toProjectId) {
		// TODO Auto-generated method stubICIP
		List<ICIPDatasetFormMapping> datasetformmapping = datasetFormRepository.getByDatasetAndOrganization(dataset,
				fromProjectId);
		List<ICIPDatasetFormMapping> toForms = datasetformmapping.parallelStream().map(form -> {
			form.setId(null);
			form.setOrganization(toProjectId);
			return form;
		}).collect(Collectors.toList());
		toForms.stream().forEach(form -> {
			ICIPDatasetFormMapping schemaform = datasetFormMappingService.findByDatasetAndFormtemplateAndOrganization(
					form.getDataset(), form.getFormtemplate(), form.getOrganization());
			String id = null;
			if (schemaform != null) {
				form.setId(schemaform.getId());
				id = schemaform.getId().toString();
			}
			try {
				ICIPDatasetFormMapping2 newForm = new ICIPDatasetFormMapping2();
				newForm.setDataset(form.getDataset());
				newForm.setFormtemplate(form.getFormtemplate().getName());
				newForm.setOrganization(toProjectId);
				datasetFormMappingService.save(newForm);
			} catch (Exception e) {
				joblogger.error("Error in saving Form mapping : {}", form.getId());
				joblogger.error(e.getMessage());
			}
		});

	}

	/**
	 * Gets the datasets by org.
	 *
	 * @param organization the organization
	 * @return the datasets by org
	 */
	public List<ICIPDataset> getDatasetsByOrg(String organization) {
		return datasetRepository.findByOrganization(organization);
	}
	
	public List<ICIPDataset> getDatasetByViewsAndOrg(String viewType, String organization) {
		return datasetRepository.findByViewsAndOrganization(viewType,organization);
	}
	
	public List<ICIPDataset> getDatasetsByOrgandPage(String organization,String search,Pageable paginate, Boolean isTemplate) {
//		return datasetRepository.findByOrganization(organization,paginate);
		if(!search.isEmpty()) {
			return datasetRepository.findByOrganization(organization,search,paginate);
		}
		else if(isTemplate == true) {
			return datasetRepository.findByOrganizationWithTemplate(organization,search,paginate);
		}
		else {
		return datasetRepository.findByOrganization(organization,paginate);
		}
	}
	
	@Override
	public Long getAllDatasetsCountByOrganisation(String project,String query,Boolean isTemplate) {
		Long datasetListCount;
		if(isTemplate == true) {
			datasetListCount = datasetRepository.getAllDatasetsCountByOrgAndTemplate(project,query);
			return datasetListCount;
		}else {
			datasetListCount = datasetRepository.getAllDatasetsCountByOrg(project,query);
			return datasetListCount;
		}
	}
	
	@Override
	public Long getAllDatasetsCountByOrganisationAndDatasource(String project,String query,String datasource) {
		Long datasetListCount;
		datasetListCount = datasetRepository.getAllDatasetsCountByOrgAndDatasource(project,query,datasource);
		return datasetListCount;
	}
	
	@Override
	public List<ICIPDataset> getAllDatasetsByDatasource(String project,String datasource,String search, Pageable paginate) {
		if(!search.isEmpty()) {
			return datasetRepository.getAllDatasetsByDatasourceAndSearch(project,datasource,search,paginate);
		}else {
			return datasetRepository.getAllDatasetsByDatasource(project,datasource,paginate);
		}
	}

	/**
	 * Gets the datasets by group and org.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @return the datasets by group and org
	 */
	@Override
	public List<ICIPDataset> getDatasetsByGroupAndOrg(String organization, String groupName) {
		return datasetRepository.findByOrganizationByGroups(organization, groupName);
	}

	/**
	 * Search datasets.
	 *
	 * @param name         the name
	 * @param organization the organization
	 * @param page         the page
	 * @param size         the size
	 * @return the list
	 */
	@Override
	public List<ICIPDataset> searchDatasets(String name, String organization, int page, int size) {
		if (name == null || name.equals("null") || name.trim().isEmpty())
			return datasetRepository.findByOrganization(organization, PageRequest.of(page, size));
		else
			return datasetRepository.searchByName(name, organization, PageRequest.of(page, size));
	}

	/**
	 * Search datasets len.
	 *
	 * @param name         the name
	 * @param organization the organization
	 * @return the long
	 */
	@Override
	public Long searchDatasetsLen(String name, String organization) {
		if (name == null || name.equals("null") || name.trim().isEmpty())
			return datasetRepository.countByOrganization(organization);
		else
			return datasetRepository.countLengthByName(name, organization);

	}

	/**
	 * Gets the dataset len by group and org.
	 *
	 * @param group  the group
	 * @param org    the org
	 * @param search the search
	 * @return the dataset len by group and org
	 */
	@Override
	public Long getDatasetLenByGroupAndOrg(String group, String org, String search) {
		if (search == null || search.trim().isEmpty()) {
			return datasetRepository.getDatasetLenByGroupAndOrg(group, org);
		} else {
			return datasetRepository.getDatasetLenByGroupAndOrgAndSearch(group, org, search);
		}
	}

	/**
	 * Gets the paginated datasets by group and org.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @param search       the search
	 * @param page         the page
	 * @param size         the size
	 * @return the paginated datasets by group and org
	 */
	@Override
	public List<ICIPDataset> getPaginatedDatasetsByGroupAndOrg(String organization, String groupName, String search,
			String interfacetype, int page, int size) {
		if (search == null || search.trim().isEmpty()) {
			if (!interfacetype.equals("null"))
				return datasetRepository.findByOrganizationByGroupsByInterfacetype(organization, groupName,
						interfacetype, PageRequest.of(page, size));
			return datasetRepository.findByOrganizationByGroups(organization, groupName, PageRequest.of(page, size));
		} else {
			return datasetRepository.findByOrganizationByGroupsAndSearch(organization, groupName, search, interfacetype,
					PageRequest.of(page, size));
		}
	}

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	@Override
	public void delete(String project) {
		datasetRepository.deleteByProject(project);
	}

	/**
	 * Process script.
	 *
	 * @param dataset the dataset
	 * @param script  the script
	 * @return the JSON array
	 * @throws NotFoundException         the not found exception
	 * @throws CannotCompileException    the cannot compile exception
	 * @throws IOException               Signals that an I/O exception has occurred.
	 * @throws IllegalAccessException    the illegal access exception
	 * @throws InvocationTargetException the invocation target exception
	 * @throws NoSuchMethodException     the no such method exception
	 */
	@Override
	public JSONArray processScript(JSONArray dataset, JSONArray script)
			throws NotFoundException, CannotCompileException, IOException, IllegalAccessException,
			InvocationTargetException, NoSuchMethodException {
		ClassPool cp = ClassPool.getDefault();
		CtClass cc;
		String className = "com.lfn.icip.dataset.util.CustomSCriptAdapter";
		new DynamicClassLoader(null);
		logger.info("Processing script");
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < script.length(); i++) {
			sb.append(script.get(i).toString()).append("\n");
		}
		cc = cp.get(className);
		cc.defrost();
		CtMethod m = cc.getDeclaredMethod("processRows");
		m.insertAfter(sb.toString());
		m.setModifiers(m.getModifiers() | Modifier.VARARGS);
		byte[] b = cc.toBytecode();
		DynamicClassLoader loader = new DynamicClassLoader(ICIPDatasetService.class.getClassLoader());
		Class c = loader.defineClass(className, b);
		c.getMethod("execute", net.minidev.json.JSONArray.class).invoke(null, dataset);
		return dataset;
	}

	/**
	 * Cast dynamic class.
	 *
	 * @param type  the type
	 * @param value the value
	 * @return the object
	 * @throws ParseException the parse exception
	 */
	@Override
	public Object castDynamicClass(String type, String value) throws ParseException {
		type = type.toUpperCase().trim();
		if (value != null && !value.equalsIgnoreCase("null") && !value.isEmpty()) {
			if (type.equalsIgnoreCase("VARCHAR") || type.equalsIgnoreCase("TEXT") || type.equalsIgnoreCase("CHAR")
					|| type.equalsIgnoreCase("LONGVARCHAR") || type.equalsIgnoreCase("STRING")) {
				return value;
			} else if (type.equalsIgnoreCase("INT") || type.equalsIgnoreCase("INTEGER")
					|| type.equalsIgnoreCase("NUMBER")) {
				return Integer.parseInt(value);
			} else if (type.equalsIgnoreCase("FLOAT")) {
				return Float.parseFloat(value);
			} else if (type.equalsIgnoreCase("DOUBLE")) {
				return Double.parseDouble(value);
			} else if (type.equalsIgnoreCase("BOOLEAN") || type.equalsIgnoreCase("TINYINT")) {
				return Boolean.parseBoolean(value);
			} else if (type.equalsIgnoreCase("TIMESTAMP") || type.equalsIgnoreCase("DATETIME")) {

				knownPatterns(value);

			} else if (type.equalsIgnoreCase("DATE")) {
				SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
				java.util.Date parsedDate;
				parsedDate = dateFormat.parse(value.substring(0, 9).replace("T", " "));
				return new Timestamp(parsedDate.getTime());
			} else {
				return value;
			}
		}
		return null;
	}

	/**
	 * Known patterns.
	 *
	 * @param value the value
	 * @return the timestamp
	 */
	Timestamp knownPatterns(String value) {
		if (!value.equals("0001-01-01T00:00:00Z")) {
			List<SimpleDateFormat> knownPatterns = new ArrayList<>();
			knownPatterns.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
			knownPatterns.add(new SimpleDateFormat("MM/dd/yyyy HH:mm:ss"));
			knownPatterns.add(new SimpleDateFormat("MM-dd-yyyy HH:mm:ss"));
			knownPatterns.add(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm.ss'Z'"));
			knownPatterns.add(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"));
			knownPatterns.add(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"));
			knownPatterns.add(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss"));
			knownPatterns.add(new SimpleDateFormat("yyyy-MM-dd' 'HH:mm:ss"));
			knownPatterns.add(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX"));
			knownPatterns.add(new SimpleDateFormat("yyyy-MM-dd hh:mm:ss a"));
			knownPatterns.add(new SimpleDateFormat("MM/dd/yyyy"));
			knownPatterns.add(new SimpleDateFormat("MM/dd/yyyy hh:mm:ss a"));
			knownPatterns.add(new SimpleDateFormat("MM-dd-yyyy"));
			knownPatterns.add(new SimpleDateFormat("MM-dd-yyyy hh:mm:ss a"));
			for (SimpleDateFormat pattern : knownPatterns) {
				java.util.Date parsedDate;
				try {
					parsedDate = new Date(pattern.parse(value).getTime());
					return new java.sql.Timestamp(parsedDate.getTime());
				} catch (Exception e) {
					logger.error("error while parsing date", e);
				}
			}
		} else {
			return null;
		}
		return null;
	}

	/**
	 * Gets the read write dataset names by org.
	 *
	 * @param org the org
	 * @return the read write dataset names by org
	 */
	public List<NameAndAliasDTO> getReadWriteDatasetNamesByOrg(String org) {
		return datasetRepository.findByOrganizationAndType(org, "rw");
	}

	/**
	 * Gets the dataset names by org.
	 *
	 * @param org the org
	 * @return the dataset names by org
	 */
	public List<NameAndAliasDTO> getDatasetNamesByOrg(String org) {
		return datasetRepository.getByOrganization(org);
	}

	/**
	 * Copy selected.
	 *
	 * @param marker           the marker
	 * @param fromProjectId    the from project id
	 * @param toProjectId      the to project id
	 * @param datasetProjectId the dataset project id
	 * @param datasets         the datasets
	 * @param toDatasource     the to datasource
	 * @return true, if successful
	 */
	@Override
	public boolean copySelected(Marker marker, String fromProjectId, String toProjectId, int datasetProjectId,
			List<String> datasets, String toDatasource) {
		List<ICIPDataset> dsets = datasetRepository.findByOrganization(fromProjectId);
		ICIPDatasource datasource = datasourceService.getDatasource(toDatasource, toProjectId);
		List<ICIPDataset> toDsets = dsets.parallelStream().map(dset -> {
			if (datasets.contains(dset.getName())) {
				dset.setId(null);
				dset.setOrganization(toProjectId);
				dset.setDatasource(datasource);
				return dset;
			} else {

				return null;
			}
		}).collect(Collectors.toList());
		toDsets.stream().forEach(dset -> {
			if (dset != null) {
				ICIPDataset dataset = getDataset(dset.getName(), dset.getOrganization());
				String id = null;
				if (dataset != null) {
					joblogger.info(marker, "{} already exists", dset.getAlias());

					// dset.setId(dataset.getId());
					// id = dataset.getId().toString();
				} else {
					if (dset.getSchema() != null) {
						ICIPSchemaRegistry schema = schemaRegistryService.getSchema(dset.getSchema().getName(),
								toProjectId);
						if (schema == null) {
							schemaRegistryService.copySelected(marker, fromProjectId, toProjectId,
									dset.getSchema().getName());
						}
						dset.setSchema(schema);
					} else {
						dset.setSchema(null);
					}
					try {
						save(id, dset, joblogger, marker, datasetProjectId, false);
					} catch (Exception e) {
						joblogger.error("Error in saving dataset : {}", dset.getName());
						joblogger.error(e.getMessage());
					}
				}
			}
		});
		return true;
	}

	/**
	 * Gets the datasets by org and datasource.
	 *
	 * @param org        the org
	 * @param datasource the datasource
	 * @return the datasets by org and datasource
	 */
	@Override
	public List<ICIPDataset2> getDatasetsByOrgAndDatasource(String org, String datasource) {
		return datasetRepository2.findByOrganizationAndDatasource(org, datasource);
	}

	/**
	 * Update exp status.
	 *
	 * @param datasetId the dataset id
	 * @param status    the status
	 * @return the ICIP dataset
	 */
	@Override
	public ICIPDataset updateExpStatus(Integer datasetId, String status) {
		ICIPDataset dataset = getDataset(datasetId);
		if (dataset != null) {

			if (dataset.getExpStatus() == 1 && status.equals("approved")) {
				dataset.setExpStatus(3);
			} else if (dataset.getExpStatus() == 2 && status.equals("approved")) {
				dataset.setExpStatus(4);
			} else if (dataset.getExpStatus() == 3 && status.equals("rejected")) {
				dataset.setExpStatus(1);
			} else if (dataset.getExpStatus() == 4 && status.equals("rejected")) {
				dataset.setExpStatus(2);
			}
			datasetRepository.save(dataset);
		}

		return dataset;
	}

	/**
	 * Creates the name.
	 *
	 * @param org   the org
	 * @param alias the alias
	 * @return the string
	 */
	@Override
	public String createName(String org, String alias) {
		boolean uniqueName = true;
		String name = null;
		do {
			name = ncs.nameEncoder(org, alias);
			uniqueName = datasetRepository.countByName(name) == 0;
		} while (!uniqueName);
		logger.info(name);
		return name;
	}

	public String createMethodName(ICIPDataset dataset) {
		boolean uniqueName = true;
		String name = null;
		do {
			name = dataset.getAlias() + "$" + dataset.getDatasource().getId() + "$" + dataset.getOrganization();
			uniqueName = datasetRepository.countByName(name) == 0;
		} while (!uniqueName);
		logger.info(name);
		return name;
	}

	/**
	 * Gets the name and alias.
	 *
	 * @param group the group
	 * @param org   the org
	 * @return the name and alias
	 */
	@Override
	public List<NameAndAliasDTO> getNameAndAlias(String group, String org) {
		return datasetRepository.getNameAndAlias(group, org);
	}

	/**
	 * Gets the names by org and datasource alias.
	 *
	 * @param org        the org
	 * @param datasource the datasource
	 * @return the names by org and datasource alias
	 */
	@Override
	public List<NameAndAliasDTO> getNamesByOrgAndDatasourceAlias(String org, String datasource) {
		return datasetRepository2.getNamesByOrgAndDatasourceAlias(org, datasource);
	}

	/**
	 * Gets the views by name and org.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the views by name and org
	 */
	@Override
	public String getViewsByNameAndOrg(String name, String org) {
		ICIPDataset dataset = datasetRepository.getViewsByNameAndOrg(name, org);
		if (dataset != null) {
			return dataset.getViews();
		}
		return "Error: Dataset not found";
	}

	/**
	 * Save views.
	 *
	 * @param views       the views
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @return the string
	 */
	@Override
	public String saveViews(String views, String datasetName, String projectName) {
		ICIPDataset dataset = datasetRepository.findByNameAndOrganization(datasetName, projectName);
		if (dataset != null) {
			dataset.setViews(views);
			ICIPDataset datasetResponse = datasetRepository.save(dataset);
			if (datasetResponse.getViews().equals(views))
				return "View(s) saved successfully";
			return "Error: Some error occurred while saving view(s)";
		}
		return "Error: Dataset not found";
	}

	/**
	 * Gets the dataset by dashboard.
	 *
	 * @param dashboardId the dashboard id
	 * @return the dataset by dashboard
	 */
	@Override
	public ICIPDataset getDatasetByDashboard(Integer dashboardId) {
		return datasetRepository.findByDashboard(dashboardId);
	}

	/**
	 * Save archival config.
	 *
	 * @param id     the id
	 * @param config the config
	 * @return the ICIP dataset 2
	 * @throws EssedumException the essedum exception
	 */
	@Override
	public ICIPDataset2 saveArchivalConfig(int id, String config) throws EssedumException {
		ICIPDataset2 dataset = datasetRepository2.findById(id).orElse(null);
		if (dataset != null) {
			dataset.setArchivalConfig(config);
			return datasetRepository2.save(dataset);
		}
		throw new EssedumException("dataset unavailable");
	}

	@Override
	public List<ICIPDataset> getDatasetBySchemaAndOrganization(ICIPSchemaRegistry schema, String projectName) {
		return datasetRepository.findBySchemaAndOrganization(schema, projectName);
	}

	@Override
	public String generateFormTemplate(JSONObject templateDetails, String datasetName, String projectName) {
		try {
			logger.info("Generating form template");
			ICIPDataset dataset = datasetRepository.findByNameAndOrganization(datasetName, projectName);
			ICIPSchemaRegistry schema = dataset.getSchema();
			List<String> fieldNames = Arrays.asList(templateDetails.getString("fieldNames").split(","));
			JSONArray schemaCols = new JSONArray(schema.getSchemavalue());
			List<JSONObject> schemaColList = new ArrayList<>();
			for (int i = 0; i < schemaCols.length(); i++) {
				schemaColList.add(schemaCols.getJSONObject(i));
			}
			schemaColList = schemaColList.stream().filter(ele -> fieldNames.contains(ele.getString("recordcolumnname")))
					.collect(Collectors.toList());
			Collections.sort(schemaColList, Comparator.comparing(
					item -> fieldNames.indexOf(new JSONObject(item.toString()).getString("recordcolumnname"))));
			List<String> tmplTags = Arrays.asList(templateDetails.getString("templateTags").split(","));
			var templateTagsObj = new Object() {
				String templateTagsStr = "[";
			};
			tmplTags.stream().forEach(ele -> templateTagsObj.templateTagsStr += "\"" + ele + "\",");
			templateTagsObj.templateTagsStr = templateTagsObj.templateTagsStr.substring(0,
					templateTagsObj.templateTagsStr.length() - 1);
			templateTagsObj.templateTagsStr += "]";
			var formTemplateObj = new Object() {
				String formTemplateStr = "{\"components\": [{\"label\": \"Columns\",\"columns\": [";
			};
			schemaColList.stream().forEach(ele -> {
				String colType = ele.getString("columntype").toLowerCase();
				String compStr = "{\"components\": [{";
				if (colType.equals("bigint") || colType.equals("int") || colType.equals("double")
						|| colType.equals("float"))
					compStr += "\"label\": \"" + ele.getString("recordcolumndisplayname")
							+ "\",\"mask\": false,\"tableView\": false,\"delimiter\": false,\"requireDecimal\": false,\"inputFormat\": \"plain\",\"key\": \""
							+ ele.getString("recordcolumnname") + "\",\"type\": \"number\",\"input\": true";
				else if (colType.equals("binary") || colType.equals("bit") || colType.equals("boolean"))
					compStr += "\"label\": \"" + ele.getString("recordcolumndisplayname")
							+ "\",\"tableView\": false,\"key\": \"" + ele.getString("recordcolumnname")
							+ "\",\"type\": \"checkbox\",\"input\": true,\"defaultValue\": false";
				else if (colType.equals("text"))
					compStr += "\"label\": \"" + ele.getString("recordcolumndisplayname")
							+ "\",\"autoExpand\": false,\"tableView\": true,\"key\": \""
							+ ele.getString("recordcolumnname") + "\",\"type\": \"textarea\",\"input\": true";
				else if (colType.equals("date") || colType.equals("datetime"))
					compStr += "\"label\": \"" + ele.getString("recordcolumndisplayname")
							+ "\",\"tableView\": false,\"enableMinDateInput\": false,\"datePicker\": {\"disableWeekends\": false,\"disableWeekdays\": false},\"enableMaxDateInput\": false,\"key\": \""
							+ ele.getString("recordcolumnname")
							+ "\",\"type\": \"datetime\",\"input\": true,\"widget\": {\"type\": \"calendar\",\"displayInTimezone\": \"viewer\",\"locale\": \"en\",\"useLocaleSettings\": false,\"allowInput\": true,\"mode\": \"single\",\"enableTime\": true,\"noCalendar\": false,\"format\": \"yyyy-MM-dd hh:mm a\",\"hourIncrement\": 1,\"minuteIncrement\": 1,\"time_24hr\": false,\"minDate\": null,\"disableWeekends\": false,\"disableWeekdays\": false,\"maxDate\": null}";
				else if (colType.equals("file"))
					compStr += "\"label\": \"" + ele.getString("recordcolumndisplayname")
							+ "\",\"tableView\": false,\"storage\": \"url\",\"webcam\": false,\"fileTypes\": [{\"label\": \"\",\"value\": \"\"}],\"key\": \""
							+ ele.getString("recordcolumnname") + "\",\"type\": \"file\",\"input\": true,\"url\":\""
							+ templateDetails.getString("origin") + "/api/datasets/attachmentupload?org=" + projectName
							+ "\"";
				else
					compStr += "\"label\": \"" + ele.getString("recordcolumndisplayname")
							+ "\",\"tableView\": true,\"key\": \"" + ele.getString("recordcolumnname")
							+ "\",\"type\": \"textfield\",\"input\": true";
				if (ele.getBoolean("isrequired") == true && !colType.equals("binary") && !colType.equals("bit")
						&& !colType.equals("boolean"))
					compStr += ",\"validate\": {\"required\": true}";
				compStr += "}],\"offset\": 0,\"push\": 0,\"pull\": 0,\"size\": \"md\",\"currentWidth\": 4,\"width\": 4},";
				formTemplateObj.formTemplateStr += compStr;
			});
			formTemplateObj.formTemplateStr = formTemplateObj.formTemplateStr.substring(0,
					formTemplateObj.formTemplateStr.length() - 1);
			formTemplateObj.formTemplateStr += "],\"key\": \"columns\",\"type\": \"columns\",\"input\": false,\"tableView\": false},{\"label\": \"Submit\",\"action\": \"custom\",\"showValidations\": false,\"disableOnInvalid\": true,\"tableView\": false,\"key\": \"submit\",\"type\": \"button\",\"input\": true,\"custom\": \"let clickCountsubmit = Number(document.getElementById('formio-btnclk-submit').innerHTML); document.getElementById('formio-btnclk-submit').innerHTML=(clickCountsubmit+1);\"}]}";
			JSONObject templateObj = new JSONObject(formTemplateObj.formTemplateStr);
			logger.info("Saving form template");
//			String schemaFormTemplatesStr = schema.getFormtemplate();
//			if(schemaFormTemplatesStr!=null && !schemaFormTemplatesStr.isBlank()) {
//				schemaFormTemplatesStr = new JSONArray(schemaFormTemplatesStr).put(templateObj).toString();
//			}
//			else {
//				schemaFormTemplatesStr = new JSONArray().put(templateObj).toString();
//			}
//			schema.setFormtemplate(schemaFormTemplatesStr);
			ICIPSchemaForm newForm = new ICIPSchemaForm();
			newForm.setName(templateDetails.getString("templateName"));
			newForm.setOrganization(projectName);
			newForm.setSchemaname(schema.getName());
			newForm.setFormtemplate(formTemplateObj.formTemplateStr);
			ICIPSchemaForm savedForm = schemaFormService.save(newForm);

//			ICIPDatasetFormMapping formMapping = new ICIPDatasetFormMapping();
//			formMapping.setDataset(dataset.getName());
//			formMapping.setOrganization(projectName);
//			formMapping.setFormtemplate(savedForm);
//			datasetFormRepository.save(formMapping);
//			schemaRegistryService.save(schema.getName(),projectName,schema);
//			String datasetFormTemplatesStr = dataset.getSchemajson();
//			if(datasetFormTemplatesStr!=null && !datasetFormTemplatesStr.isBlank()) {
//				datasetFormTemplatesStr = new JSONArray(datasetFormTemplatesStr).put(templateObj).toString();
//			}
//			else {
//				datasetFormTemplatesStr = new JSONArray().put(templateObj).toString();
//			}
//			dataset.setSchemajson(datasetFormTemplatesStr);
//			datasetRepository.save(dataset);
			return formTemplateObj.formTemplateStr;
		} catch (Exception e) {
			logger.error("Error while generating form template " + e);
			return "ERROR:Error while generating form template " + e.getMessage();
		}
	}

	@Override
	public Flux<BaseEntity> getObjectByIDTypeAndOrganization(String type, Integer id, String organization) {
return Flux.just(datasetRepository.findById((id)).get()).defaultIfEmpty(new ICIPDataset()).map(s->{
	BaseEntity entity= new BaseEntity();
	entity.setAlias(s.getAlias());
	entity.setData(new JSONObject(s).toString());
	entity.setDescription(s.getDescription());
	entity.setId(s.getId());
	entity.setType(TYPE);
	return entity;		
	});
	}

	@Override
	public Flux<BaseEntity>  getAllObjectsByOrganization(String organization, String search, Pageable page) {
	return Flux.fromIterable(datasetRepository.findByOrganization(organization,search, page)).parallel().map(s->{
		BaseEntity entity= new BaseEntity();
		entity.setAlias(s.getAlias());
		entity.setData(new JSONObject(s).toString());
		entity.setDescription(s.getDescription());
		entity.setId(s.getId());
		entity.setType(TYPE);
		return entity;		
	}).sequential()	;
	
	}

	@Override
	public String getType() {
	
		return TYPE;
	}
	
	public JsonObject export(Marker marker, String source, JSONArray modNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			joblogger.info(marker,"Exporting dataset started");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			
//			List<ICIPDataset> datasets = datasetRepository.findByOrganization(source);
			List<ICIPDataset> datasets = new ArrayList<>();
			List<ICIPDatasetFormMapping> formmappings = new ArrayList<>();
			List<ICIPDatasource> dsetrelateddatasources = new ArrayList<>();
			List<ICIPSchemaRegistry> dsetrelatedschemas = new ArrayList<>();
			List<ICIPSchemaForm> dsetrelatedschemaform = new ArrayList<>();
			
			modNames.forEach(alias -> {
				datasets.add(datasetRepository.findByAliasAndOrganization(alias.toString(), source).get(0));
			});
			
			datasets.stream().forEach(dset -> {
				List<ICIPDatasetFormMapping> forms = datasetFormRepository.getByDatasetAndOrganization(dset.getName(),source);
				formmappings.addAll(forms);
				ICIPDatasource dsrc = datasourceService.getDatasourceByNameAndOrganization(dset.getDatasource().getName(), source);
				dsetrelateddatasources.add(dsrc);
				if(dset.getSchema() != null) {
					ICIPSchemaRegistry sch = schemaRegistryService.getSchemaByAliasAndOrganization(dset.getSchema().getName(), source);
					dsetrelatedschemas.add(sch);
					List<ICIPSchemaForm> templates = schemaFormService.fetchSchemaForm(dset.getSchema().getName(), source);
					dsetrelatedschemaform.addAll(templates);
				}
			});
			
			jsnObj.add("mldatasets", gson.toJsonTree(datasets));
			jsnObj.add("mldatasetformmapping", gson.toJsonTree(formmappings));
			if(dsetrelateddatasources != null)
				jsnObj.add("dsetrelateddatasources", gson.toJsonTree(dsetrelateddatasources));
			if(dsetrelatedschemas != null)
				jsnObj.add("dsetrelatedschemas", gson.toJsonTree(dsetrelatedschemas));
			if(dsetrelatedschemaform != null)
				jsnObj.add("dsetrelatedschemaform", gson.toJsonTree(dsetrelatedschemaform));
			
			joblogger.info(marker, "Exported dataset successfully");
		}
		catch(Exception ex) {
			joblogger.error(marker,"Error in exporting datasets");
			joblogger.error(marker, ex.getMessage());
		}
		return jsnObj;
	}

	public void importData(Marker marker, String target, JSONObject jsonObject) {
		Gson g = new Gson();
		try {
			joblogger.info(marker, "Importing Datasets Started");
			JsonArray datasets = g.fromJson(jsonObject.get("mldatasets").toString(), JsonArray.class);
			datasets.forEach(x -> {
				ICIPDataset dset = g.fromJson(x, ICIPDataset.class);
				ICIPDataset dsetPresent = datasetRepository.findByNameAndOrganization(dset.getName(), target);
				ICIPDataset2 dsetTosave = new ICIPDataset2();
				ICIPDatasource datasource = dset.getDatasource();
				ICIPSchemaRegistry schema = dset.getSchema();
				ICIPDatasource dsrc = datasourceService.getDatasource(dset.getDatasource().getName(),target);
				if(dsrc == null) {
					datasource.setOrganization(target);
					datasource.setActivetime(new Timestamp(System.currentTimeMillis()));
					datasource.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));
					datasource.setLastmodifiedby(ICIPUtils.getUser(claim));
					datasource.setId(null);
					datasourceService.savedatasource(datasource);
				}
				if(schema == null) {
					dsetTosave.setSchema(null);
				}
				else {
					ICIPSchemaRegistry sch = schemaRegistryService.getSchemaByAliasAndOrganization(dset.getSchema().getName(), target);
					if(sch == null) {
						schema.setOrganization(target);
						schema.setLastmodifiedby(ICIPUtils.getUser(claim));
						schema.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));
						schema.setId(null);
						schemaRegistryService.save(schema.getName(), target, schema);
					}
					dsetTosave.setSchema(dset.getSchema().getName());
				}
				dsetTosave.setAdaptername(dset.getAdaptername());
				dsetTosave.setAlias(dset.getAlias());
				dsetTosave.setArchivalConfig(dset.getArchivalConfig());
				dsetTosave.setAttributes(dset.getAttributes());
				dsetTosave.setDashboard(dset.getDashboard());
				dsetTosave.setDatasource(datasource.getName());
				dsetTosave.setDescription(dset.getDescription());
				dsetTosave.setExpStatus(dset.getExpStatus());
				dsetTosave.setInterfacetype(dset.getInterfacetype());
				dsetTosave.setIsadapteractive(dset.getIsadapteractive());
				dsetTosave.setIsApprovalRequired(dset.getIsApprovalRequired());
				dsetTosave.setIsArchivalEnabled(dset.getIsArchivalEnabled());
				dsetTosave.setIsAuditRequired(dset.getIsAuditRequired());
				dsetTosave.setIsInboxRequired(dset.getIsInboxRequired());
				dsetTosave.setIsPermissionManaged(dset.getIsPermissionManaged());
				dsetTosave.setLastmodifiedby(ICIPUtils.getUser(claim));
				dsetTosave.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));
				dsetTosave.setMetadata(dset.getMetadata());
				dsetTosave.setModeltype(dset.getModeltype());
				dsetTosave.setName(dset.getName());
				dsetTosave.setOrganization(target);
				
				dsetTosave.setSchemajson(dset.getSchemajson());
				dsetTosave.setTags(dset.getTags());
				dsetTosave.setTaskdetails(dset.getTaskdetails());
				dsetTosave.setType(dset.getType());
				dsetTosave.setViews(dset.getViews());
				dsetTosave.setId(null);
				try {
					if(dsetPresent == null) 
						datasetRepository2.save(dsetTosave);
				}
				catch(DataIntegrityViolationException de) {
					joblogger.error(marker, "Error in importing duplicate dataset {}",dset.getAlias());
				}
			});
			JsonArray datasetforms = g.fromJson(jsonObject.get("mldatasetformmapping").toString(), JsonArray.class);
			datasetforms.forEach(x -> {
				ICIPDatasetFormMapping form = g.fromJson(x, ICIPDatasetFormMapping.class);
				ICIPDatasetFormMapping formPresent = datasetFormRepository.findByDatasetAndFormtemplateAndOrganization(form.getDataset(), form.getFormtemplate(), target);
				form.setOrganization(target);
				form.setId(null);
				try {
					if(formPresent == null)
					datasetFormRepository.save(form);
				}
				catch(DataIntegrityViolationException de) {
					joblogger.error(marker, "Error in importing duplicate datasetform");
				}
			});
			joblogger.info(marker, "Imported Datasets Successfully");
		}
		catch(Exception ex) {
			joblogger.error(marker, "Error in importing Datasets");
			joblogger.error(marker, ex.getMessage());
		}
	}

	public List<NameAndAliasDTO> getDatasetBasicDetailsByOrg(String org) {
		return datasetRepository2.getDatasetBasicDetailsByOrg(org);
	}

	public List<ICIPDataset> getDatasetsByOrgandViews(String project, String views){
		return datasetRepository.getDatasetsByOrgandViews(project,views);
	}

	public List<String> listIndexNames(String org) {
		return datasetRepository2.listIndexNames(org);
	}

	public ICIPDataset2 updateIndexNameOrSummary(String name, String org,
			Map<String, String> updateIndexNameOrSummary) {
		ICIPDataset2 datasetFromDb = datasetRepository2.findDatasetByNameAndOrganization(name, org);
		if (updateIndexNameOrSummary.containsKey(ICIPPluginConstants.INDEX_NAME)) {
			datasetFromDb.setIndexname(updateIndexNameOrSummary.get(ICIPPluginConstants.INDEX_NAME));
		}
		if (updateIndexNameOrSummary.containsKey(ICIPPluginConstants.SUMMARY)) {
			datasetFromDb.setSummary(updateIndexNameOrSummary.get(ICIPPluginConstants.SUMMARY));
		}
		return datasetRepository2.save(datasetFromDb);
	}
	
	@Override
	public List<ICIPDataset> getDoc(String docViewType, String org, Pageable paginate) {
		List<String> docTypeList = new ArrayList();
		if(docViewType != null) {
			docTypeList = Arrays.asList(docViewType.split(","));
			docTypeList = docTypeList.stream().map(e -> e+" View").collect(Collectors.toList());
		}
		return datasetRepository.getDocByDatasourceType(docTypeList, org, paginate);
	}
	
	@Override
	public Long getDocCount(String docViewType, String org) {
		List<String> docTypeList = new ArrayList();
		if(docViewType != null) {
			docTypeList = Arrays.asList(docViewType.split(","));
			docTypeList = docTypeList.stream().map(e -> e+" View").collect(Collectors.toList());
		}
		return datasetRepository.getCountByDatasourceType(docTypeList, org);
	}

	public Long getDatasetsCountForAdvancedFilter(String organization, String aliasOrName, List<String> types,
			List<String> tags, List<String> knowledgeBases) {
		Long resultDatasetsCountForAdvancedFilter;
		if (tags == null || tags.isEmpty()) {
			if (knowledgeBases == null || knowledgeBases.isEmpty()) {
				resultDatasetsCountForAdvancedFilter = datasetRepository
						.getDatasetsCountForAdvancedFilterTypes(organization, aliasOrName, types);
			} else {
				resultDatasetsCountForAdvancedFilter = datasetRepository
						.getDatasetsCountForAdvancedFilterTypesAndKnowledgeBases(organization, aliasOrName, types,
								knowledgeBases);
			}
		} else {
			List<ICIPDataset> datasetsForCount = null;
			if (knowledgeBases == null || knowledgeBases.isEmpty()) {
				datasetsForCount = datasetRepository.getDatasetsForAdvancedFilterTypes(organization, aliasOrName,
						types);
			} else {
				datasetsForCount = datasetRepository.getDatasetsForAdvancedFilterTypesAndKnowledgeBases(organization,
						aliasOrName, types, knowledgeBases);
			}
			if (datasetsForCount == null || datasetsForCount.isEmpty()) {
				datasetsForCount = new ArrayList<>();
				resultDatasetsCountForAdvancedFilter = (long) datasetsForCount.size();
			} else {
				List<ICIPDataset> filteredDatasets = filterDatasets(datasetsForCount, tags);
				resultDatasetsCountForAdvancedFilter = (long) filteredDatasets.size();
			}
		}
		return resultDatasetsCountForAdvancedFilter;
	}
	
	public static List<ICIPDataset> filterDatasets(List<ICIPDataset> datasetsForCount, List<String> tags) {
		Set<ICIPDataset> uniqueDatasets = new HashSet<>();

		for (ICIPDataset dataset : datasetsForCount) {
			for (String tag : tags) {
				if (dataset.getTags() != null && dataset.getTags().startsWith("[") && dataset.getTags().contains(tag)) {
					uniqueDatasets.add(dataset);
					break;
				}
			}
		}
		return new ArrayList<>(uniqueDatasets);
	}

	public List<ICIPDataset> getDatasetsCountForAdvancedFilter(String organization, String aliasOrName,
			List<String> types, List<String> tags, List<String> knowledgeBases, String page, String size) {
		Pageable paginate = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));
		List<ICIPDataset> datasets = null;
		if (tags == null || tags.isEmpty()) {
			if (knowledgeBases == null || knowledgeBases.isEmpty()) {
				datasets = datasetRepository.getDatasetsForAdvancedFilterTypesPageable(organization, aliasOrName, types,
						paginate);
			} else {
				datasets = datasetRepository.getDatasetsForAdvancedFilterTypesAndKnowledgeBasesPageable(organization,
						aliasOrName, types, knowledgeBases, paginate);
			}
			if (datasets == null)
				return new ArrayList<>();
			else
				return datasets;
		} else {
			if (knowledgeBases == null || knowledgeBases.isEmpty()) {
				datasets = datasetRepository.getDatasetsForAdvancedFilterTypes(organization, aliasOrName, types);
			} else {
				datasets = datasetRepository.getDatasetsForAdvancedFilterTypesAndKnowledgeBases(organization,
						aliasOrName, types, knowledgeBases);
			}
			if (datasets == null || datasets.isEmpty()) {
				return new ArrayList<>();
			} else {
				List<ICIPDataset> filteredDatasets = filterDatasetsByTagsAndPageable(datasets, tags, paginate);
				if (filteredDatasets == null)
					return new ArrayList<>();
				else
					return filteredDatasets;
			}

		}
	}
	
	public static List<ICIPDataset> filterDatasetsByTagsAndPageable(List<ICIPDataset> datasetsForCount,
			List<String> tags, Pageable pageable) {
		// Filter datasets by tags
		List<ICIPDataset> filteredDatasets = filterDatasets(datasetsForCount, tags);

		// Applying pagination manually
		int start = (int) pageable.getOffset();
		int end = Math.min((start + pageable.getPageSize()), filteredDatasets.size());

		if (start > end) {
			return new ArrayList<>();
		}

		return filteredDatasets.subList(start, end);
	}

	public List<String> getDatasetTypesForAdvancedFilter(String organization) {
		List<String> datasetTypes = datasetRepository.getDatasetTypesForAdvancedFilter(organization);
		if (datasetTypes == null)
			return new ArrayList<>();
		else
			return datasetTypes;
	}
	
	public boolean callDatasetTestMethodToUploadFile(ICIPDatasetDTO dataset, Map<String, String> headers) {
		WebClient webClient = webClientObj.webClient();
		try {
			String respFileUpload = webClient.post().uri("api/aip/datasets/test")
					.header("Authorization", headers.get("authorization")).header("Project", headers.get("project"))
					.header("RoleName", headers.get("rolename")).header("RoleId", headers.get("roleid"))
					.header("ProjectName", headers.get("projectname")).contentType(MediaType.APPLICATION_JSON)
					.bodyValue(dataset).retrieve().bodyToMono(String.class).block();
			logger.info("FileUpload Stats:{}", respFileUpload);
			if (respFileUpload != null && respFileUpload.equalsIgnoreCase("SUCCESS")) {
				return true;
			} else {
				return false;
			}
		} catch (Exception e1) {
			logger.error("Error in DatasetTestMethodToUploadFile: " + e1.getMessage());
			return false;
		}
	}
	
	@SuppressWarnings("deprecation")
	public boolean uploadToS3(ICIPDataset dataset) {
		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		String accessKey = connectionDetails.optString("accessKey");
		String secretKey = connectionDetails.optString("secretKey");
		String region = connectionDetails.optString("Region");
		URL endpointUrl = null;
		try {
			endpointUrl = new URL(connectionDetails.optString("url"));
			logger.info("endpointUrl " + endpointUrl);
		} catch (MalformedURLException e1) {
			logger.error("Upload DATASOURCE URL not correct" + e1.getMessage());
		}
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		ClientConfiguration clientConfiguration = new ClientConfiguration();
		ConnectionSocketFactory factory = new SdkTLSSocketFactory(sslContext, (hostname, session) -> true);
		clientConfiguration.getApacheHttpClientConfig().setSslSocketFactory(factory);
		JSONObject attr = new JSONObject(dataset.getAttributes());
		String bucketName = attr.optString("bucket");
		logger.info("bucketName " + bucketName);
		String uploadFilePath = attr.optString("path");
		String objectKey;
		if (uploadFilePath != null && !uploadFilePath.isEmpty()) {
			objectKey = attr.optString("path") + "/" + attr.optString("object");
		} else
			objectKey = attr.optString("object");
		logger.info("objectKey " + objectKey);
		String uploadFile = attr.optString("uploadFile");
		File localFilePath = new File(uploadFile);
		BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
		AmazonS3 s3Client = AmazonS3ClientBuilder.standard().withClientConfiguration(clientConfiguration)
				.withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(endpointUrl.toString(), region))
				.withCredentials(new AWSStaticCredentialsProvider(credentials)).build();
		long partSize = 100L * 1024 * 1024;
		ExecutorService executorService = Executors.newCachedThreadPool();
		try {
			InitiateMultipartUploadRequest initRequest = new InitiateMultipartUploadRequest(bucketName, objectKey);
			InitiateMultipartUploadResult initResponse = s3Client.initiateMultipartUpload(initRequest);
			String uploadId = initResponse.getUploadId();
			List<PartETag> partETags = new ArrayList<>();
			long contentLength = localFilePath.length();
			long filePosition = 0;
			List<CompletableFuture<PartETag>> futures = new ArrayList<>();
			for (int i = 1; filePosition < contentLength; i++) {
				long partSizeRemaining = Math.min(partSize, contentLength - filePosition);
				UploadPartRequest uploadRequest = new UploadPartRequest().withBucketName(bucketName).withKey(objectKey)
						.withUploadId(uploadId).withPartNumber(i).withFileOffset(filePosition).withFile(localFilePath)
						.withPartSize(partSizeRemaining);
				CompletableFuture<PartETag> future = CompletableFuture.supplyAsync(() -> {
					try {
						UploadPartResult uploadPartResult = s3Client.uploadPart(uploadRequest);
						return uploadPartResult.getPartETag();
					} catch (Exception e) {
						logger.error(e.getMessage());
						return null;
					}
				}, executorService);
				futures.add(future);
				filePosition += partSizeRemaining;
			}
			CompletableFuture<Void> allOf = CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
			allOf.thenRunAsync(() -> {
				futures.forEach(future -> {
					try {
						PartETag partETag = future.get();
						if (partETag != null) {
							partETags.add(partETag);
						}
					} catch (Exception e) {
						e.getMessage();
					}
				});
				CompleteMultipartUploadRequest completeRequest = new CompleteMultipartUploadRequest(bucketName,
						objectKey, uploadId, partETags);
				s3Client.completeMultipartUpload(completeRequest);
				logger.info("File Uploaded successfully");
			});
			logger.info("File Upload Initiated");
			return true;
		} catch (Exception e) {
			logger.error("Error occurred in upload method", e);
			return false;
		}
	}

	private TrustManager[] getTrustAllCerts() {
		logger.info("certificateCheck value: {}", certificateCheck);
		if ("true".equalsIgnoreCase(certificateCheck)) {
			try {
				// Load the default trust store
				TrustManagerFactory trustManagerFactory = TrustManagerFactory
						.getInstance(TrustManagerFactory.getDefaultAlgorithm());
				trustManagerFactory.init((KeyStore) null);
				// Get the trust managers from the factory
				TrustManager[] trustManagers = trustManagerFactory.getTrustManagers();

				// Ensure we have at least one X509TrustManager
				for (TrustManager trustManager : trustManagers) {
					if (trustManager instanceof X509TrustManager) {
						return new TrustManager[] { (X509TrustManager) trustManager };
					}
				}
			} catch (KeyStoreException e) {
				logger.info(e.getMessage());
			} catch (NoSuchAlgorithmException e) {
				logger.info(e.getMessage());
			}
			throw new IllegalStateException("No X509TrustManager found. Please install the certificate in keystore");
		} else {
			TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
				@Override
				public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) {
				}

				@Override
				public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) {
				}

				@Override
				public java.security.cert.X509Certificate[] getAcceptedIssuers() {
					return new java.security.cert.X509Certificate[] {};
				}
			} };
			return trustAllCerts;
		}
	}

	private SSLContext getSslContext(TrustManager[] trustAllCerts) {
		SSLContext sslContext = null;
		try {
			sslContext = SSLContext.getInstance("TLSv1.2");
			sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
		} catch (KeyManagementException | NoSuchAlgorithmException e) {
			logger.error(e.getMessage(), e);
		}
		return sslContext;
	}

	public JSONObject createS3Dataset(String bucket, String path, String org, String datasourceName,
			MultipartFile file, Map<String, String> headers) {
		try {
			// upload file to fileserver
			Map<String, String> fileDetails = fileserverService.uploadTemp(file);
			ICIPDatasource datasource = datasourceService.getDatasource(datasourceName, org);
			// create dataset
			Map<String, Object> attributes = new HashMap<>();
			attributes.put("bucket", bucket);
			attributes.put("path", path);
			attributes.put("uploadFile", fileDetails.get("uploadFilePath"));
			attributes.put("Cacheable", "false");
			attributes.put("object", fileDetails.get("object"));

			String fileName = fileDetails.get("object").split("\\.")[0];

			ICIPDatasetDTO datasetDTO = new ICIPDatasetDTO();
			datasetDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
			datasetDTO.setLastmodifieddate(Timestamp.from(Instant.now()));
			datasetDTO.setAlias(fileName);
			datasetDTO.setAttributes(attributes);
			datasetDTO.setType("r");
			datasetDTO.setDatasource(datasource);
			datasetDTO.setOrganization(org);
			datasetDTO.setViews("Video View");
			datasetDTO.setIsApprovalRequired(false);
			datasetDTO.setIsPermissionManaged(false);
			datasetDTO.setIsInboxRequired(false);
			datasetDTO.setIsAuditRequired(false);
			logger.info(String.format("creating dataset %s", datasetDTO.getAlias()));
			datasetDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
			datasetDTO.setLastmodifieddate(Timestamp.from(Instant.now()));
			ModelMapper modelmapper = new ModelMapper();
			Converter<Map<String, String>, String> converter = new Converter<>() {
				@Override
				public String convert(MappingContext<Map<String, String>, String> attr) {
					JSONObject jObj = new JSONObject();
					attr.getSource().entrySet().stream().forEach(entry -> {
						jObj.put(entry.getKey(), entry.getValue());
					});
					return jObj.toString();
				}
			};
			modelmapper.addConverter(converter);
			ICIPDataset dataset = modelmapper.map(datasetDTO, ICIPDataset.class);
			ICIPDataset dataset2save = updateDataset(dataset);
			dataset2save = dataset2save != null ? dataset2save : dataset;
			ICIPDataset2 result = save(null, dataset2save);
			datasetDTO.setName(result.getName());
			saveFormTemplate(datasetDTO);

			Boolean uploadStatus = callDatasetTestMethodToUploadFile(datasetDTO, headers);
			JSONObject response = new JSONObject();
			if (uploadStatus == true)
				response.put("status", "success");
			else
				response.put("status", "error");
			response.put("datasetId", datasetDTO.getName());
			response.put("datasetTableId", result.getId());
			response.put("fileName", fileName);

			logger.info("Dataset Created : File is successfully uploaded");
			return response;
		} catch (EntityNotFoundException | JpaObjectRetrievalFailureException | EmptyResultDataAccessException
				| DataAccessResourceFailureException | JDBCConnectionException | TransactionException
				| JpaSystemException | UnsupportedOperationException e) {
			logger.error("Exception {}:{}", e.getClass().getName(), e.getMessage());
			Map<String, Object> response = new HashMap<>();
			response.put("status", "error");
			response.put("errorDesc", e.getMessage());
			return null;
		}
	}

	void saveFormTemplate(ICIPDatasetDTO datasetDTO) {
		List<ICIPDatasetFormMapping> formList = datasetFormMappingService.fetchDatasetFormMapping(datasetDTO.getName(),
				datasetDTO.getOrganization());
		try {
			if (datasetDTO.getSchemajson() != null) {
				JSONArray formArray = new JSONArray(datasetDTO.getSchemajson());
				formList.forEach(arr -> {
					JSONArray newarr = new JSONArray(formArray.toList().stream().map(ele -> {
						return new JSONObject(new Gson().toJson(ele));
					}).filter(ele -> ele.getString("name").equals(arr.getFormtemplate().getName()))
							.collect(Collectors.toList()).toArray());
					if (newarr.isEmpty()) {
						datasetFormMappingService.deleteByFormtemplateAndDataset(arr.getFormtemplate(),
								datasetDTO.getName());
					}
				});
				formArray.forEach(arr -> {
					JSONArray newarr = new JSONArray(
							formList.stream().map(ele -> new JSONObject(new Gson().toJson(ele)))
									.filter(ele -> new JSONObject(ele.get("formtemplate").toString()).get("name")
											.equals(new JSONObject(arr.toString()).get("name")))
									.collect(Collectors.toList()).toArray());
					if (newarr.isEmpty()) {
						ICIPDatasetFormMapping2 form = new ICIPDatasetFormMapping2();
						form.setDataset(datasetDTO.getName());
						form.setFormtemplate(new JSONObject(arr.toString()).getString("name"));
						form.setOrganization(datasetDTO.getOrganization());
						datasetFormMappingService.save(form);
					}
				});
			}
		} catch (Exception e) {
			logger.error("Error because of:{} at class:{} and line:{}", e.getMessage(), e.getStackTrace()[0].getClass(),
					e.getStackTrace()[0].getLineNumber());
			if (logger.isDebugEnabled()) {
				logger.error("Error due to:", e);
			}
		}
	}

	public ICIPDataset updateDataset(ICIPDataset dataset) {
		boolean isTokenUpdated = false;
		ICIPDatasource datasource = dataset.getDatasource();
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		JSONObject authDetailsObj = new JSONObject(connectionDetails.optString("AuthDetails", "{}"));
		String authType = connectionDetails.optString("AuthType");
		String noProxyString = connectionDetails.optString("NoProxy");

		String authToken = null, tokenExp = connectionDetails.optString("tokenExpirationTime");
		JSONObject tokenObj = null;

		if (authType.equalsIgnoreCase(OAUTH) && (tokenExp.isEmpty()
				|| new Timestamp(Instant.now().toEpochMilli()).after(Timestamp.valueOf(tokenExp)))) {

			try {
				authToken = ICIPRestPluginUtils.getAuthToken(authDetailsObj, noProxyString, proxyProperties);

				Timestamp tokenExpirationTime = null;
				tokenObj = new JSONObject(authToken);
				if (authDetailsObj.has("tokenElement") && authDetailsObj.optString("tokenElement").length() > 0) {
					authToken = tokenObj.optString(authDetailsObj.optString("tokenElement"));
				}
				if (tokenObj.has("expires_in") && !tokenObj.get("expires_in").toString().isEmpty()) {
					tokenExpirationTime = new Timestamp(
							Instant.now().toEpochMilli() + tokenObj.getLong("expires_in") * 1000);
					connectionDetails.put("access_token", authToken);
					connectionDetails.put("tokenExpirationTime", tokenExpirationTime);
					datasource.setConnectionDetails(connectionDetails.toString());
					dataset.setDatasource(datasource);
					logger.info("access token updated in datasource connection details");
					isTokenUpdated = true;
				}
			} catch (JSONException | IOException | URISyntaxException jse) {
				logger.error("exception: ", jse);
			}
		} else {
			isTokenUpdated = false;
		}

		return dataset;
	}

	public JSONObject createS3FolderDataset(String bucket, String path, String org, String datasourceName,
			List<MultipartFile> files, String datasetAlias, Map<String, String> headers) {
		try {
			// upload file to fileserver
			ICIPDatasource datasource = datasourceService.getDatasource(datasourceName, org);
			// create dataset
			Map<String, Object> attributes = new HashMap<>();
			attributes.put("bucket", bucket);
			attributes.put("path", path);
			attributes.put("Cacheable", "false");

			ICIPDatasetDTO datasetDTO = new ICIPDatasetDTO();
			datasetDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
			datasetDTO.setLastmodifieddate(Timestamp.from(Instant.now()));
			datasetDTO.setAlias(datasetAlias);
			datasetDTO.setAttributes(attributes);
			datasetDTO.setType("r");
			datasetDTO.setDatasource(datasource);
			datasetDTO.setOrganization(org);
			datasetDTO.setViews("Folder View");
			datasetDTO.setIsApprovalRequired(false);
			datasetDTO.setIsPermissionManaged(false);
			datasetDTO.setIsInboxRequired(false);
			datasetDTO.setIsAuditRequired(false);
			logger.info(String.format("creating dataset %s", datasetDTO.getAlias()));
			datasetDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
			datasetDTO.setLastmodifieddate(Timestamp.from(Instant.now()));
			ModelMapper modelmapper = new ModelMapper();
			Converter<Map<String, String>, String> converter = new Converter<>() {
				@Override
				public String convert(MappingContext<Map<String, String>, String> attr) {
					JSONObject jObj = new JSONObject();
					attr.getSource().entrySet().stream().forEach(entry -> {
						jObj.put(entry.getKey(), entry.getValue());
					});
					return jObj.toString();
				}
			};
			modelmapper.addConverter(converter);
			ICIPDataset dataset = modelmapper.map(datasetDTO, ICIPDataset.class);
			ICIPDataset dataset2save = updateDataset(dataset);
			dataset2save = dataset2save != null ? dataset2save : dataset;
			ICIPDataset2 result = save(null, dataset2save);
			datasetDTO.setName(result.getName());
			saveFormTemplate(datasetDTO);
			Boolean uploadStatus = false;
			if (files != null && !files.isEmpty())
				for (MultipartFile file : files) {
					Map<String, String> fileDetails = fileserverService.uploadTemp(file);
					attributes.put("object", fileDetails.get("object"));
					attributes.put("uploadFile", fileDetails.get("uploadFilePath"));
					datasetDTO.setAttributes(attributes);
					uploadStatus = callDatasetTestMethodToUploadFile(datasetDTO, headers);
					uploadStatus = uploadToS3(dataset);
				}
			JSONObject response = new JSONObject();
			if (uploadStatus == true)
				response.put("status", "success");
			else
				response.put("status", "no files to upload");
			response.put("datasetId", datasetDTO.getName());
			response.put("datasetTableId", result.getId());
			response.put("folderPath", path);

			logger.info("Folder Dataset Created");
			return response;
		} catch (EntityNotFoundException | JpaObjectRetrievalFailureException | EmptyResultDataAccessException
				| DataAccessResourceFailureException | JDBCConnectionException | TransactionException
				| JpaSystemException | UnsupportedOperationException e) {
			logger.error("Exception {}:{}", e.getClass().getName(), e.getMessage());
			Map<String, Object> response = new HashMap<>();
			response.put("status", "error");
			response.put("errorDesc", e.getMessage());
			return null;
		}
	}
	
}
