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

package com.infosys.icets.icip.dataset.rest;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import com.infosys.icets.ai.comm.lib.util.annotation.service.ConstantsService;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;

import org.apache.commons.codec.DecoderException;
import org.apache.commons.io.FilenameUtils;
import org.hibernate.TransactionException;
import org.hibernate.exception.JDBCConnectionException;
import org.json.JSONArray;
import org.json.JSONObject;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.spi.MappingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.jpa.JpaObjectRetrievalFailureException;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.infosys.icets.ai.comm.lib.util.Crypt;
import com.infosys.icets.ai.comm.lib.util.ICIPHeaderUtil;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.ai.comm.lib.util.exceptions.ApiError;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.iamp.usm.domain.DashConstant;
import com.infosys.icets.icip.dataset.constants.ICIPPluginConstants;
import com.infosys.icets.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDataset2;
import com.infosys.icets.icip.dataset.model.ICIPDatasetFiles;
import com.infosys.icets.icip.dataset.model.ICIPDatasetFormMapping;
import com.infosys.icets.icip.dataset.model.ICIPDatasetFormMapping2;
import com.infosys.icets.icip.dataset.model.ICIPDatasetIdsml;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.model.dto.ICIPDatasetDTO;
import com.infosys.icets.icip.dataset.model.dto.ICIPDatasourceSummary;
import com.infosys.icets.icip.dataset.service.IICIPDataset2Service;
import com.infosys.icets.icip.dataset.service.IICIPDatasetFormMappingService;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;
import com.infosys.icets.icip.dataset.service.IICIPDatasetIdsmlService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetFilesService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetPluginsService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasourcePluginsService;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSetServiceUtil.DATATYPE;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;
import com.infosys.icets.icip.icipwebeditor.event.model.InternalEvent;
import com.infosys.icets.icip.icipwebeditor.event.publisher.InternalEventPublisher;
import com.infosys.icets.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;
import com.infosys.icets.icip.icipwebeditor.fileserver.service.impl.FileServerService;

import io.micrometer.core.annotation.Timed;
import jakarta.persistence.EntityNotFoundException;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPDatasetController.
 *
 * @author icets
 */
@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/datasets")
@RefreshScope
public class ICIPDatasetController {

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "datasets";

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPDatasetController.class);

	/** The plugin service. */
	@Autowired
	private ICIPDatasetPluginsService pluginService;

	/** The datasource plugin service. */
	@Autowired
	private ICIPDatasourcePluginsService datasourcePluginService;

	/** The i ICIP dataset service. */
	@Autowired
	private ICIPDatasetService datasetService;
	
	@Autowired
	private ConstantsService dashConstantService;

	/** The i ICIP dataset 2 service. */
	@Autowired
	private IICIPDataset2Service dataset2Service;

	/** The i ICIP datasource service. */
	@Autowired
	private IICIPDatasourceService datasourceService;

	/** The ds util. */
	@Autowired
	IICIPDataSetServiceUtilFactory dsUtil;

	/** The dataset file service. */
	@Autowired
	private ICIPDatasetFilesService datasetFileService;

	/** The Internal Event Publisher. */
	@Autowired
	private InternalEventPublisher publisher;

	/** The fileserver service. */
	@Autowired
	private FileServerService fileserverService;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;
	
	/** The Constant EXCEPTION. */
	private static final String EXCEPTION = "Exception";
	
	/** The encryption key. */
	@LeapProperty("application.uiconfig.enckeydefault")
	private static String enckeydefault;
	
	@LeapProperty("icip.pyJobServer")
	private String jobServer;
	
	/** The scheduler status. */
	@LeapProperty("icip.scheduler.pause.status")
	private String schedulerPauseStatus;

	@LeapProperty("icip.multivariateUrl")
	private String multivariateUrl;
	
	@Autowired
	private IICIPDatasetIdsmlService idsmlService;

	@Autowired
	private IICIPDatasetFormMappingService datasetFormService;
	
	
	/**
	 * Gets the datasetform.
	 *
	 * @param org the name,org
	 * @return the datasetform
	 */
	@GetMapping(value= "/datasetform/{name}/{org}")
	public List<ICIPDatasetFormMapping> fetchDatasetFormMapping(@PathVariable(name="name") String datasetName,
			@PathVariable(name="org") String org){
		return datasetFormService.fetchDatasetFormMapping(datasetName, org);
		
	}
	/**
	 * Gets the datasets.
	 *
	 * @param org the org
	 * @return the datasets
	 */
	@GetMapping("/all/{org}")
	public ResponseEntity<List<ICIPDataset>> getDatasets(@PathVariable(name = "org", required = true) String org) {
		List<ICIPDataset> datasets = encryptDatasetAttributes(datasetService.getDatasetsByOrg(org));
		return new ResponseEntity<>(datasets, new HttpHeaders(), HttpStatus.OK);
	}
	
	@GetMapping("/datasetByView/{viewType}/{org}")
	public ResponseEntity<List<ICIPDataset>> datasetByView(@PathVariable(name = "viewType", required = true) String viewType,
			@PathVariable(name = "org", required = true) String org) {
		List<ICIPDataset> datasets = datasetService.getDatasetByViewsAndOrg(viewType, org);
		return new ResponseEntity<>(datasets, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the dataset details forexp.
	 *
	 * @param org the org
	 * @return the dataset details forexp
	 */
	@GetMapping("/exp/{org}")
	public ResponseEntity<List<ICIPDataset>> getDatasetDetailsForexp(
			@PathVariable(name = "org", required = true) String org) {
		List<ICIPDataset> datasets = encryptDatasetAttributes(datasetService.getDatasetForExp(org));
		return new ResponseEntity<>(datasets, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasets.
	 *
	 * @param name the name
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @return the datasets
	 */
	@GetMapping("/search/{name}/{org}")
	public ResponseEntity<List<ICIPDataset>> getDatasets(@PathVariable("name") String name,
			@PathVariable(name = "org", required = true) String org,
			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
			@RequestParam(name = "size", defaultValue = "5", required = false) String size) {
		List<ICIPDataset> datasets = encryptDatasetAttributes(datasetService.searchDatasets(name, org, Integer.parseInt(page), Integer.parseInt(size)));
		return new ResponseEntity<>(datasets, new HttpHeaders(), HttpStatus.OK);
	}
	
	@GetMapping("/listIndexNames/byOrg/{org}")
	public ResponseEntity<List<String>> listIndexNames(@PathVariable(name = "org") String org) {
		return new ResponseEntity<>(datasetService.listIndexNames(org), new HttpHeaders(), HttpStatus.OK);
	}

	@PostMapping("/updateIndexNameOrSummary/{datasetId}/{org}")
	public ResponseEntity<ICIPDataset2> updateIndexNameOrSummary(@PathVariable(name = "datasetId") String datasetId,
			@PathVariable(name = "org") String org, @RequestBody Map<String, String> updateIndexNameOrSummary) {
		return new ResponseEntity<>(
				encryptDataset2Attributes(
						datasetService.updateIndexNameOrSummary(datasetId, org, updateIndexNameOrSummary)),
				new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasets by search.
	 *
	 * @param org    the org
	 * @param search the search
	 * @param page   the page
	 * @param size   the size
	 * @return the datasets by search
	 */
	@GetMapping("/search/{org}")
	public ResponseEntity<List<ICIPDataset>> getDatasetsBySearch(
			@PathVariable(name = "org", required = true) String org,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
			@RequestParam(name = "size", defaultValue = "5", required = false) String size) {
		List<ICIPDataset> datasets = encryptDatasetAttributes(datasetService.searchDatasets(search, org, Integer.parseInt(page), Integer.parseInt(size)));
		return new ResponseEntity<>(datasets, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasets count.
	 *
	 * @param name   the name
	 * @param org    the org
	 * @param search the search
	 * @return the datasets count
	 */
	@GetMapping("/search/len/{name}/{org}")
	public ResponseEntity<Long> getDatasetsCount(@PathVariable("name") String name,
			@PathVariable(name = "org", required = true) String org,
			@RequestParam(name = "search", required = false) String search) {
		return new ResponseEntity<>(datasetService.searchDatasetsLen(name, org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasets count.
	 *
	 * @param org    the org
	 * @param search the search
	 * @return the datasets count
	 */
	@GetMapping("/len/{org}")
	public ResponseEntity<Long> getDatasetsCountByOrg(@PathVariable(name = "org", required = true) String org,
			@RequestParam(name = "search", required = false) String search) {
		return new ResponseEntity<>(datasetService.searchDatasetsLen(search, org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasets by group.
	 *
	 * @param group the group
	 * @param org   the org
	 * @return the datasets by group
	 */
	@GetMapping("/all/{group}/{org}")
	public ResponseEntity<List<ICIPDataset>> getDatasetsByGroup(@PathVariable(name = "group") String group,
			@PathVariable(name = "org", required = true) String org) {
		List<ICIPDataset> datasets = encryptDatasetAttributes(datasetService.getDatasetsByGroupAndOrg(org, group));
		return new ResponseEntity<>(datasets, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the paginated datasets by group.
	 *
	 * @param group  the group
	 * @param org    the org
	 * @param page   the page
	 * @param size   the size
	 * @param search the search
	 * @return the paginated datasets by group
	 */
	@GetMapping("/all/paginated/{group}/{org}")
	public ResponseEntity<List<ICIPDataset>> getPaginatedDatasetsByGroup(@PathVariable(name = "group") String group,
			@PathVariable(name = "org", required = true) String org,
			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
			@RequestParam(name = "size", defaultValue = "12", required = false) String size,
			@RequestParam(name = "interfacetype") String interfacetype,
			@RequestParam(name = "search", required = false) String search) {
		List<ICIPDataset> datasets = encryptDatasetAttributes(datasetService.getPaginatedDatasetsByGroupAndOrg(org, group, search,interfacetype,
				Integer.parseInt(page), Integer.parseInt(size)));
		return new ResponseEntity<>(datasets, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasets by type.
	 *
	 * @param type   the type
	 * @param org    the org
	 * @param page   the page
	 * @param size   the size
	 * @param search the search
	 * @return the datasets by type
	 */
	@GetMapping("/all/type/{type}/{org}")
	public ResponseEntity<List<ICIPDataset2>> getDatasetsByType(@PathVariable(name = "type") String type,
			@PathVariable(name = "org", required = true) String org,
			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
			@RequestParam(name = "size", defaultValue = "12", required = false) String size,
			@RequestParam(required = false, name = "search") String search) {
		List<ICIPDataset2> datasets = encryptDataset2Attributes(dataset2Service.getDatasetsByOrgAndType(org, type, search, Integer.parseInt(page),
				Integer.parseInt(size)));
		return new ResponseEntity<>(datasets, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasets by org and datasource.
	 *
	 * @param org        the org
	 * @param datasource the datasource
	 * @return the datasets by org and datasource
	 */
	@GetMapping("/datasource/{organization}")
	public ResponseEntity<List<ICIPDataset2>> getDatasetsByOrgAndDatasource(
			@PathVariable(name = "organization") String org,
			@RequestParam(name = "datasource", required = true) String datasource) {
		List<ICIPDataset2> datasets = encryptDataset2Attributes(dataset2Service.getDatasetsByOrgAndDatasource(org, datasource));
		return new ResponseEntity<>(datasets, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasets len by org and datasource.
	 *
	 * @param org        the org
	 * @param search     the search
	 * @param datasource the datasource
	 * @return the datasets len by org and datasource
	 */
	@GetMapping("/datasource/len/{organization}")
	public ResponseEntity<Long> getDatasetsLenByOrgAndDatasource(@PathVariable(name = "organization") String org,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "datasource", required = true) String datasource) {
		return new ResponseEntity<>(dataset2Service.getDatasetsLenByOrgAndDatasourceAndSearch(org, datasource, search),
				new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the paginated datasets by org and datasource.
	 *
	 * @param org        the org
	 * @param datasource the datasource
	 * @param page       the page
	 * @param size       the size
	 * @param search     the search
	 * @return the paginated datasets by org and datasource
	 */
	@GetMapping("/datasource/paginated/{organization}")
	public ResponseEntity<List<ICIPDataset2>> getPaginatedDatasetsByOrgAndDatasource(
			@PathVariable(name = "organization") String org,
			@RequestParam(name = "datasource", required = true) String datasource,
			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
			@RequestParam(name = "size", defaultValue = "12", required = false) String size,
			@RequestParam(name = "search", required = false) String search) {
		List<ICIPDataset2> datasets = encryptDataset2Attributes(dataset2Service.getPaginatedDatasetsByOrgAndDatasource(org, datasource, search,
				Integer.parseInt(page), Integer.parseInt(size)));
		return new ResponseEntity<>(datasets, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the dataset.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the dataset
	 */
	@GetMapping("/{nameStr}/{org}")
	public ResponseEntity<ICIPDataset2> getDataset(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		logger.info(name, "and org is ", org);
		logger.info("fetching dataset {}", name);
		return new ResponseEntity<>(encryptDataset2Attributes(datasetService.getDataset2(name, org)), new HttpHeaders(), HttpStatus.OK);
	}

	

	/**
	 * Gets the dataset by name and org.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the dataset by name and org
	 */
	@GetMapping("/get/{nameStr}/{org}")
	public ResponseEntity<ICIPDataset> getDatasetByNameAndOrg(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		logger.info(name, "and org is ", org);
		logger.info("fetching dataset {}", name);
		return new ResponseEntity<>(encryptDatasetAttributes(datasetService.getDataset(name, org)), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Creates the dataset.
	 *
	 * @param idOrName   the id or name
	 * @param datasetDTO the dataset DTO
	 * @return the response entity
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws KeyManagementException             the key management exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws InvalidKeySpecException            the invalid key spec exception
	 * @throws InvalidAlgorithmParameterException the invalid algorithm parameter
	 *                                            exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws KeyStoreException                  the key store exception
	 * @throws ClassNotFoundException             the class not found exception
	 * @throws SQLException                       the SQL exception
	 * @throws DecoderException                   the decoder exception
	 * @throws IOException                        Signals that an I/O exception has
	 *                                            occurred.
	 * @throws URISyntaxException                 the URI syntax exception
	 * @throws UnsupportedOperationException      the unsupported operation
	 *                                            exception
	 */
	@PostMapping("/add")
	public ResponseEntity<ICIPDataset2> createDataset(@RequestBody ICIPDatasetDTO datasetDTO)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException,
			UnsupportedOperationException {
		
		logger.info(String.format("creating dataset %s", datasetDTO.getAlias()));
		datasetDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
		datasetDTO.setLastmodifieddate(Timestamp.from(Instant.now()));
		//datasetDTO.setName(datasetDTO.getName().trim());
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
		ICIPDataset dataset2save = pluginService.getDataSetService(dataset).updateDataset(dataset);
		dataset2save = dataset2save != null ? dataset2save : dataset;
		ICIPDataset2 result = datasetService.save(null, dataset2save);
		ICIPDataset2 encryptedResult = encryptDataset2Attributes(result);
		datasetDTO.setName(result.getName());
		saveFormTemplate(datasetDTO);
		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, encryptedResult.getName()))
		.body(encryptedResult);
	}
	
	@PostMapping("/save/{idOrName}")
	public ResponseEntity<ICIPDataset2> saveDataset(@PathVariable(name = "idOrName") String idOrName,
			@RequestBody ICIPDatasetDTO datasetDTO)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException,
			UnsupportedOperationException {
		logger.info("saving dataset {}", idOrName);
		datasetDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
		datasetDTO.setLastmodifieddate(Timestamp.from(Instant.now()));
		datasetDTO.setName(datasetDTO.getName().trim());
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
		ICIPDataset dataset2save = pluginService.getDataSetService(dataset).updateDataset(dataset);
		dataset2save = dataset2save != null ? dataset2save : dataset;
		ICIPDataset2 result = datasetService.save(idOrName, dataset2save);
		ICIPDataset2 encryptedResult = encryptDataset2Attributes(result);
		
		saveFormTemplate(datasetDTO);
		
//		try {
//			result.setAttributes(Crypt.encrypt(result.getAttributes(),enckeydefault));
//		} catch (InvalidKeyException | NoSuchPaddingException | IllegalBlockSizeException | BadPaddingException
//				| InvalidKeySpecException | NoSuchAlgorithmException | InvalidAlgorithmParameterException
//				| UnsupportedEncodingException e) {
//		
//			logger.error(e.getMessage(),e);
//			return new ResponseEntity<>(new HttpHeaders(), HttpStatus.BAD_REQUEST);
//		}

		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, encryptedResult.getName()))
		.body(encryptedResult);

	}
	
	@PostMapping(path = "/set/corelid")
	public ResponseEntity<ICIPDataset2> setCorelId(@RequestParam(name = "id") String id,
			@RequestParam(name = "corelid") String corelId,@RequestParam(name = "event") String eventName) throws InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, UnsupportedEncodingException{
		int id_ = Integer.parseInt(id);
		ICIPDataset dset = datasetService.getDataset(id_);
		JSONArray events = dset.getEvent_details() != null ? new JSONArray(dset.getEvent_details()) : new JSONArray();
		boolean eventFound = false;
        for (int i = 0; i < events.length(); i++) {
            JSONObject eventObj = events.getJSONObject(i);
            if (eventObj.getString("eventName").equalsIgnoreCase(eventName)) {
                eventObj.put("corelId", corelId);
                eventFound = true;
                break;
            }
        }
        if (!eventFound) {
            JSONObject newEvent = new JSONObject();
            newEvent.put("eventName", eventName);
            newEvent.put("corelId", corelId);
            events.put(newEvent);
        }
        dset.setEvent_details(events.toString());
		ICIPDataset2 result = datasetService.save(id, dset);
		ICIPDataset2 encryptedResult = encryptDataset2Attributes(result);
		result.setAttributes(Crypt.encrypt(result.getAttributes(),enckeydefault));
		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, encryptedResult.getName()))
				.body(encryptedResult);
    }
	
	void saveFormTemplate(ICIPDatasetDTO datasetDTO){
		List<ICIPDatasetFormMapping> formList = datasetFormService.fetchDatasetFormMapping(datasetDTO.getName(),datasetDTO.getOrganization());
		try {
		if(datasetDTO.getSchemajson()!=null) {
			JSONArray formArray = new JSONArray(datasetDTO.getSchemajson());
			formList.forEach(arr->{
				JSONArray newarr = new JSONArray(
						formArray.toList().stream().map(ele ->{
							return new JSONObject(new Gson().toJson(ele));
							})
								.filter(ele -> ele.getString("name").equals(arr.getFormtemplate().getName())).collect(Collectors.toList())
								.toArray());
				if(newarr.isEmpty()) {
					datasetFormService.deleteByFormtemplateAndDataset(arr.getFormtemplate(),datasetDTO.getName());
				}
			});
			formArray.forEach(arr->{
				JSONArray newarr = new JSONArray(
						formList.stream().map(ele -> new JSONObject(new Gson().toJson(ele)))
								.filter(ele -> new JSONObject(ele.get("formtemplate").toString()).get("name").equals(new JSONObject(arr.toString()).get("name"))).collect(Collectors.toList())
								.toArray());
				if(newarr.isEmpty()) {
					ICIPDatasetFormMapping2 form = new ICIPDatasetFormMapping2();
					form.setDataset(datasetDTO.getName());
					form.setFormtemplate(new JSONObject(arr.toString()).getString("name"));
					form.setOrganization(datasetDTO.getOrganization());
					datasetFormService.save(form);
				}
			});
		}
		}catch(Exception e) {
			logger.error("Error because of:{} at class:{} and line:{}",e.getMessage(),e.getStackTrace()[0].getClass(),e.getStackTrace()[0].getLineNumber());
			if(logger.isDebugEnabled()){
				logger.error("Error due to:",e);
			}
		}
	}


	/**
	 * Delete groups.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the response entity
	 */
	@DeleteMapping("/delete/{nameStr}/{org}")
	public ResponseEntity<Void> deleteGroups(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		logger.info("deleting dataset group {}", name);
		datasetService.delete(name, org);
		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, name)).build();
	}

	/**
	 * Test connection.
	 *
	 * @param datasetDTO the dataset DTO
	 * @return the response entity
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws KeyManagementException             the key management exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws InvalidKeySpecException            the invalid key spec exception
	 * @throws InvalidAlgorithmParameterException the invalid algorithm parameter
	 *                                            exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws KeyStoreException                  the key store exception
	 * @throws ClassNotFoundException             the class not found exception
	 * @throws SQLException                       the SQL exception
	 * @throws DecoderException                   the decoder exception
	 * @throws IOException                        Signals that an I/O exception has
	 *                                            occurred.
	 * @throws URISyntaxException                 the URI syntax exception
	 * @throws LeapException                      the leap exception
	 */
	@PostMapping(path = "/test")
	public ResponseEntity<String> testConnection(@RequestBody ICIPDatasetDTO datasetDTO) throws InvalidKeyException,
			KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeySpecException,
			InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException, KeyStoreException,
			ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException, LeapException {
		logger.info("testing dataset connection");
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
		ICIPDatasource datasource = datasourceService.getDatasource(datasetDTO.getDatasource().getName(),
				datasetDTO.getOrganization());
		dataset.setDatasource(datasource);

		try {
			if (pluginService.getDataSetService(dataset).testConnection(dataset))
				return new ResponseEntity<>("SUCCESS", new HttpHeaders(), HttpStatus.OK);
		} catch (LeapException e) {
			return new ResponseEntity<>(String.format("%s%s", "FAILED : ", e.getMessage()), new HttpHeaders(),
					HttpStatus.BAD_REQUEST);
		}
		return new ResponseEntity<>(String.format("%s", "FAILED : "), new HttpHeaders(), HttpStatus.BAD_REQUEST);
	}

	/**
	 * Gets the data 1.
	 *
	 * @param name       the name
	 * @param org        the org
	 * @param attributes the attributes
	 * @param limit      the limit
	 * @return the data 1
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws KeyManagementException             the key management exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws InvalidKeySpecException            the invalid key spec exception
	 * @throws InvalidAlgorithmParameterException the invalid algorithm parameter
	 *                                            exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws KeyStoreException                  the key store exception
	 * @throws ClassNotFoundException             the class not found exception
	 * @throws SQLException                       the SQL exception
	 * @throws DecoderException                   the decoder exception
	 * @throws IOException                        Signals that an I/O exception has
	 *                                            occurred.
	 * @throws URISyntaxException                 the URI syntax exception
	 */
	@GetMapping(path = "/viewData/{nameStr}/{org}")
	public ResponseEntity<String> getData1(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org,
			@RequestHeader(name = "attributes", required = false) String attributes,
			@RequestParam(required = false, name = "limit", defaultValue = "10") String limit)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		return getCompleteData(name, org, attributes, limit, false, false, 0, null, -1);
	}

	/**
	 * Gets the direct data 1.
	 *
	 * @param name       the name
	 * @param org        the org
	 * @param datasetDTO the dataset DTO
	 * @param limit      the limit
	 * @return the direct data 1
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws KeyManagementException             the key management exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws InvalidKeySpecException            the invalid key spec exception
	 * @throws InvalidAlgorithmParameterException the invalid algorithm parameter
	 *                                            exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws KeyStoreException                  the key store exception
	 * @throws ClassNotFoundException             the class not found exception
	 * @throws SQLException                       the SQL exception
	 * @throws DecoderException                   the decoder exception
	 * @throws IOException                        Signals that an I/O exception has
	 *                                            occurred.
	 * @throws URISyntaxException                 the URI syntax exception
	 */
	@PostMapping(path = "/direct/viewData/{name}/{org}")
	public ResponseEntity<String> getDirectData1(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String org, @RequestBody ICIPDatasetDTO datasetDTO,
			@RequestParam(required = false, name = "limit", defaultValue = "10") String limit)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {

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
		logger.info(datasetDTO.toString());
		modelmapper.addConverter(converter);
//		ICIPDatasetDTO datasetDTO = new ObjectMapper().readValue(dataset, ICIPDatasetDTO.class);
		ICIPDataset datasetstr = modelmapper.map(datasetDTO, ICIPDataset.class);
		String results = pluginService.getDataSetService(datasetstr).getDatasetData(datasetstr,
				new SQLPagination(0, Integer.parseInt(limit), null, 0), DATATYPE.DATA, String.class);
		return ResponseEntity.status(200).body(results);
	}

	/**
	 * Gets the data.
	 *
	 * @param name       the name
	 * @param org        the org
	 * @param attributes the attributes
	 * @param limit      the limit
	 * @return the data
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws KeyManagementException             the key management exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws InvalidKeySpecException            the invalid key spec exception
	 * @throws InvalidAlgorithmParameterException the invalid algorithm parameter
	 *                                            exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws KeyStoreException                  the key store exception
	 * @throws ClassNotFoundException             the class not found exception
	 * @throws SQLException                       the SQL exception
	 * @throws DecoderException                   the decoder exception
	 * @throws IOException                        Signals that an I/O exception has
	 *                                            occurred.
	 * @throws URISyntaxException                 the URI syntax exception
	 */
	@PostMapping(path = "/getData/{nameStr}/{org}")
	public ResponseEntity<String> getData(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org, @RequestBody(required = false) String attributes,
			@RequestParam(required = false, name = "limit", defaultValue = "10") String limit)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		return getCompleteData(name, org, attributes, limit, true, false, -1, null, -1);
	}

	@GetMapping(path = "/getAuditDataById/{org}/{name}/{id}")
	public ResponseEntity<String> getDataAudit(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String org, @RequestHeader(required = false) String attributes,
			@RequestParam(required = false, name = "limit", defaultValue = "10") String limit,
			@PathVariable(name = "id") String id)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {

		boolean justData = true;
		boolean asJSON = false;
		int page = -1;
		String sortEvent = null;
		int sortOrder = -1;
		long start = System.currentTimeMillis();
		try {
		ICIPDataset dataset = datasetService.getDataset(name, org);
		if (attributes != null) {
			attributes = Crypt.decrypt(attributes,enckeydefault);
			String attrs = populateAttributes(dataset.getAttributes(), attributes);
			dataset.setAttributes(attrs);
		}
		String results = getResultAudit(page, limit, sortEvent, sortOrder, dataset, justData, asJSON, id);
		logger.debug("Executed in {} ms", System.currentTimeMillis() - start);
		return new ResponseEntity<>(results, HttpStatus.OK);
		}
		catch (InvalidKeyException |IllegalBlockSizeException | SQLException |NoSuchPaddingException e) {
			logger.error("Exception {}:{}", e.getClass().getName(), e.getMessage());
			return new ResponseEntity<>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Gets the data as json.
	 *
	 * @param name       the name
	 * @param org        the org
	 * @param attributes the attributes
	 * @param limit      the limit
	 * @return the data as json
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws KeyManagementException             the key management exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws InvalidKeySpecException            the invalid key spec exception
	 * @throws InvalidAlgorithmParameterException the invalid algorithm parameter
	 *                                            exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws KeyStoreException                  the key store exception
	 * @throws ClassNotFoundException             the class not found exception
	 * @throws SQLException                       the SQL exception
	 * @throws DecoderException                   the decoder exception
	 * @throws IOException                        Signals that an I/O exception has
	 *                                            occurred.
	 * @throws URISyntaxException                 the URI syntax exception
	 */
	@GetMapping(path = "/getDataAsJson/{nameStr}/{org}")
	public ResponseEntity<String> getDataAsJson(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org,
			@RequestHeader(name = "attributes", required = false) String attributes,
			@RequestParam(required = false, name = "limit", defaultValue = "10") String limit)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		return getCompleteData(name, org, attributes, limit, true, true, -1, null, -1);
	}

	/**
	 * Gets the paginated data.
	 *
	 * @param name       the name
	 * @param org        the org
	 * @param attributes the attributes
	 * @param size       the size
	 * @param page       the page
	 * @param sortEvent  the sort event
	 * @param sortOrder  the sort order
	 * @return the paginated data
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws KeyManagementException             the key management exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws InvalidKeySpecException            the invalid key spec exception
	 * @throws InvalidAlgorithmParameterException the invalid algorithm parameter
	 *                                            exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws KeyStoreException                  the key store exception
	 * @throws ClassNotFoundException             the class not found exception
	 * @throws SQLException                       the SQL exception
	 * @throws DecoderException                   the decoder exception
	 * @throws IOException                        Signals that an I/O exception has
	 *                                            occurred.
	 * @throws URISyntaxException                 the URI syntax exception
	 */
	@GetMapping(path = "/getPaginatedData/{nameStr}/{org}")
	public ResponseEntity<String> getPaginatedData(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org,
			@RequestHeader(name = "attribute", required = false) String attributes,
			@RequestParam(required = false, name = "size", defaultValue = "10") String size,
			@RequestParam(required = false, name = "page", defaultValue = "0") String page,
			@RequestParam(required = false, name = "sortEvent") String sortEvent,
			@RequestParam(required = false, name = "sortOrder", defaultValue = "-1") String sortOrder)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		return getCompleteData(name, org, attributes, size, true, false, Integer.parseInt(page), sortEvent,
				Integer.parseInt(sortOrder));
	}

	/**
	 * Gets the dataset data count.
	 *
	 * @param name       the name
	 * @param org        the org
	 * @param attributes the attributes
	 * @return the dataset data count
	 */
	@GetMapping(path = "/getDatasetDataCount/{nameStr}/{org}")
	public ResponseEntity<?> getDatasetDataCount(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org,
			@RequestHeader(name = "attributes", required = false) String attributes) {
		try {
			ICIPDataset dataset = datasetService.getDataset(name, org);
			if (attributes != null) {
				attributes = Crypt.decrypt(attributes,enckeydefault);
				String attrs = populateAttributes(dataset.getAttributes(), attributes);
				dataset.setAttributes(attrs);
			}
			return new ResponseEntity<>(pluginService.getDataSetService(dataset).getDataCount(dataset), HttpStatus.OK);
		}
		catch(SQLException e){
			return ResponseEntity.status(400).body("Issue with query, please check dataset");
			}
		catch (Exception ex) {
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Gets the dataset len by group.
	 *
	 * @param group  the group
	 * @param org    the org
	 * @param search the search
	 * @return the dataset len by group
	 */
	@GetMapping("/all/len/{group}/{org}")
	public ResponseEntity<Long> getDatasetLenByGroup(@PathVariable(name = "group") String group,
			@PathVariable(name = "org") String org, @RequestParam(required = false, name = "search") String search) {
		return new ResponseEntity<>(datasetService.getDatasetLenByGroupAndOrg(group, org, search), new HttpHeaders(),
				HttpStatus.OK);
	}

	/**
	 * Extract schema.
	 *
	 * @param datasetName the dataset name
	 * @param org         the org
	 * @return the response entity
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws KeyManagementException             the key management exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws InvalidKeySpecException            the invalid key spec exception
	 * @throws InvalidAlgorithmParameterException the invalid algorithm parameter
	 *                                            exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws KeyStoreException                  the key store exception
	 * @throws DecoderException                   the decoder exception
	 * @throws SQLException                       the SQL exception
	 * @throws URISyntaxException                 the URI syntax exception
	 * @throws IOException                        Signals that an I/O exception has
	 *                                            occurred.
	 */
	@GetMapping(path = "/extractSchema/{name}/{org}")
	public ResponseEntity<String> extractSchema(@PathVariable(name = "name") String datasetName,
			@PathVariable(name = "org") String org)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, DecoderException, SQLException, URISyntaxException, IOException {
		logger.info("extracting schema");
		ICIPDataset dataset = datasetService.getDataset(datasetName, org);
		return ResponseEntity.status(200)
				.body(pluginService.getDataSetServiceSql(dataset).extractSchema(dataset).toString());
	}

	/**
	 * Generate file ID.
	 *
	 * @param org the org
	 * @return the response entity
	 */
	@GetMapping("/generate/fileid")
	public ResponseEntity<String> generateFileID(@RequestParam("org") String org) {
		try {
			return new ResponseEntity<>(fileserverService.generateFileID(org, "filedataset"), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>("Server Error", HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * File upload.
	 *
	 * @param fileid   the fileid
	 * @param org      the org
	 * @param file     the file
	 * @param metadata the metadata
	 * @return the response entity
	 * @throws URISyntaxException the URI syntax exception
	 * @throws IOException        Signals that an I/O exception has occurred.
	 */
	@PostMapping(value = "/upload/{fileid}/{org}")
	public ResponseEntity<Map<String, String>> fileUpload(@PathVariable("fileid") String fileid,
			@PathVariable("org") String org, @RequestParam("file") MultipartFile file,
			@RequestPart(value = "chunkMetadata") String metadata) throws URISyntaxException, IOException {

		Map<String, String> ds;
		try {
			ObjectMapper mapper = new ObjectMapper();
			ICIPChunkMetaData chunkMetadata = mapper.readValue(metadata, ICIPChunkMetaData.class);
			ds = fileserverService.fileUploadHelper(fileid, org, file, chunkMetadata,"false");
		} catch (Exception e) {
			logger.error("error in uploading file {} : {}", file.getName(), e);
			return new ResponseEntity<>(new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
		return new ResponseEntity<>(ds, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the types.
	 *
	 * @return the types
	 */
	@GetMapping("/types")
	public ResponseEntity<String> getTypes() {
		return new ResponseEntity<>(pluginService.listAllPlugins().toString(), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Send request.
	 *
	 * @param datasetDTO the dataset DTO
	 * @return the response entity
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws KeyManagementException             the key management exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws InvalidKeySpecException            the invalid key spec exception
	 * @throws InvalidAlgorithmParameterException the invalid algorithm parameter
	 *                                            exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws KeyStoreException                  the key store exception
	 * @throws ClassNotFoundException             the class not found exception
	 * @throws SQLException                       the SQL exception
	 * @throws DecoderException                   the decoder exception
	 * @throws IOException                        Signals that an I/O exception has
	 *                                            occurred.
	 * @throws URISyntaxException                 the URI syntax exception
	 */
	@PostMapping("/request")
	public ResponseEntity<String> sendRequest(@RequestBody ICIPDatasetDTO datasetDTO)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
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
		return new ResponseEntity<>(pluginService.getDataSetService(dataset).getDatasetData(dataset,
				new SQLPagination(0, 10, null, 0), DATATYPE.DATA, String.class), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Copy datasets.
	 *
	 * @param from      the from
	 * @param to        the to
	 * @param projectId the project id
	 * @return the response entity
	 */
	@GetMapping("/copy/{from}/{to}")
	@Timed
	public ResponseEntity<Boolean> copyDatasets(@PathVariable("from") String from, @PathVariable("to") String to,
			@RequestParam(name = "projectId", required = true) int projectId) {
		return new ResponseEntity<>(datasetService.copy(null, from, to, projectId), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Save chunks.
	 *
	 * @param datasetname  the datasetname
	 * @param organization the organization
	 * @param metadata     the metadata
	 * @param file         the file
	 * @return the response entity
	 */
	@PostMapping(value = "/saveChunks/{name}/{org}", consumes = { "multipart/form-data" })
	public ResponseEntity<ICIPDatasetFiles> saveChunks(@PathVariable(value = "name") String datasetname,
			@PathVariable(value = "org") String organization, @RequestPart("chunkMetadata") String metadata,
			@RequestPart("file") MultipartFile file, @RequestHeader("Project") int projectId	
			) {
		logger.info("request to save dataset file with name : {} to {} and org : {}", file, datasetname, organization);
		try {
			ObjectMapper mapper = new ObjectMapper();
			ICIPChunkMetaData chunkMetaData = mapper.readValue(metadata, ICIPChunkMetaData.class);
			String id = ICIPUtils.removeSpecialCharacter(chunkMetaData.getFileGuid());
			ICIPDatasetFiles datasetFile = datasetFileService.findById(id);
//			if(file.getOriginalFilename().toLowerCase().endsWith(".csv")) {
//				CSVReader csvReader = new CSVReader (new InputStreamReader (file.getInputStream ())); 
//				String[] nextLine;
//				while ((nextLine = csvReader.readNext()) != null) {
//					for (var e : nextLine) {
//						if(e.startsWith("=") || e.startsWith("+") || e.startsWith("-")
//		            		   || e.startsWith("@")) {
//							throw new LeapException("CSV files containing formula are not allowed");           	   
//						}
//					}
//				}
//			}
//			else if (file.getOriginalFilename().toLowerCase().endsWith(".xlsx")) {
//				Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(file.getBytes()));
//				Sheet datatypeSheet = workbook.getSheetAt(0);
//				Iterator<Row> iterator = datatypeSheet.iterator();
//				while (iterator.hasNext()) {
//					Row currentRow = iterator.next();
//					Iterator<Cell> cellIterator = currentRow.iterator();
//					while (cellIterator.hasNext()) {
//						Cell currentCell = cellIterator.next();
//						if(currentCell.getCellType().toString().equals("FORMULA")) {
//								throw new LeapException("Excel files containing formula are not allowed");           	   
//							}
//					}
//				}
//
//			}
			HashMap<String, Object> obj = datasetFileService.saveFile(file, chunkMetaData, organization, id, projectId, "upload");
			if (file.getSize() == 0) {
				logger.info("The uploaded file is empty");
				return new ResponseEntity<>(datasetFile, HttpStatus.CONFLICT);
			}
			if (obj != null && Boolean.valueOf(obj.get("complete").toString()) && obj.get("path") != null) {
				Path path = (Path) obj.get("path");
				String filename = path.getFileName().toString();
				try {
					datasetFileService.delete(
							datasetFileService.findByNameAndOrgAndFilename(datasetname, organization, filename));
				} catch (Exception ne) {
					logger.error("Error in deleting previous file");
				}
				String header = datasetFileService.getHeaders(path);
				datasetFile = new ICIPDatasetFiles();
				datasetFile.setDatasetname(datasetname);
				datasetFile.setFilepath(path.toString());
				datasetFile.setHeaders(header);
				datasetFile.setFilename(path.getFileName().toString());
				datasetFile.setId(id);
				datasetFile.setOrganization(organization);
				datasetFile.setUploadedAt(new Timestamp(new Date().getTime()));
				JsonObject jsonObject = new JsonObject();
				jsonObject.addProperty("totalcount", chunkMetaData.getTotalCount());
				jsonObject.addProperty("filename", chunkMetaData.getFileName());
				datasetFile.setMetadata(new Gson().toJson(jsonObject));
				datasetFileService.save(datasetFile);
			}
			
			
			return new ResponseEntity<>(datasetFile, HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Get filenames.
	 *
	 * @param datasetname  the datasetname
	 * @param organization the organization
	 * @return the response entity
	 */
	@GetMapping("/uploadedfiles/{name}/{org}")
	public ResponseEntity<List<ICIPDatasetFiles>> getUploadedFiles(@PathVariable(value = "name") String datasetname,
			@PathVariable(value = "org") String organization) {
		logger.info("request to read dataset files with datasetname : {} and org : {}", datasetname, organization);
		try {
			return new ResponseEntity<>(datasetFileService.getFiles(datasetname, organization), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}
	
	@GetMapping("/uploadedTemplateFiles/{org}")
	public ResponseEntity<List<ICIPDatasetFiles>> uploadedTemplateFiles(
			@PathVariable(value = "org") String organization) {
		logger.info("Request to read template files with org : {}", organization);
		try {
			return new ResponseEntity<>(datasetFileService.getTemplateFiles(organization), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Get files by id.
	 *
	 * @param id the id
	 * @return the response entity
	 */
	@GetMapping("/files/{id}")
	public ResponseEntity<ICIPDatasetFiles> getFileById(@PathVariable(value = "id") String id) {
		logger.info("request to get dataset files with id : {} ", id);
		try {
			return new ResponseEntity<>(datasetFileService.findById(id), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
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
	 */
	@GetMapping(path = "/getData")
	public ResponseEntity<?> getAllObjects(@RequestParam(required = true, name = "datasetName") String datasetName,
			@RequestParam(required = true, name = "schemaName") String schemaName,
			@RequestParam(required = true, name = "projectName") String projectName,
			@RequestParam(required = false, name = "size", defaultValue = "10") String size,
			@RequestParam(required = false, name = "page", defaultValue = "0") String page,
			@RequestParam(required = false, name = "sortEvent") String sortEvent,
			@RequestParam(required = false, name = "sortOrder", defaultValue = "-1") String sortOrder) {
		ResponseEntity<?> resp;
		try {
			resp = new ResponseEntity<>(
					pluginService.getAllObjects(datasetName, schemaName, projectName, size, page, sortEvent, sortOrder),
					new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			logger.error(EXCEPTION, e);
		}
		return resp;
	}

	/**
	 * Gets the objects count.
	 *
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @return the objects count
	 */
	@GetMapping(path = "/getCount")
	public ResponseEntity<String> getObjectsCount(
			@RequestParam(required = true, name = "datasetName") String datasetName,
			@RequestParam(required = true, name = "projectName") String projectName) {
		ResponseEntity<String> resp;
		try {
			resp = new ResponseEntity<>(pluginService.getObjectsCount(datasetName, projectName), new HttpHeaders(),
					HttpStatus.OK);
		} catch (Exception e) {
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			logger.error(EXCEPTION, e);
		}
		return resp;
	}

	/**
	 * Gets the searched objects.
	 *
	 * @param datasetName        the dataset name
	 * @param projectName        the project name
	 * @param size               the size
	 * @param page               the page
	 * @param sortEvent          the sort event
	 * @param sortOrder          the sort order
	 * @param searchParams       the search params
	 * @param selectClauseParams the select clause params
	 * @return the searched objects
	 */
	@GetMapping(path = "/fileData")
	public ResponseEntity<?> getfileData(@RequestParam(required = true, name = "datasetName") String datasetName,
			@RequestParam(required = true, name = "fileName") String fileName,
	        @RequestParam(required = true, name = "org") String org)
			 {
		ResponseEntity<?> resp;
		try {
			
			resp = new ResponseEntity<>(pluginService.getS3FileData(datasetService.getDataset(datasetName, org),
					fileName), new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			logger.error(EXCEPTION, e);
		}
		return resp;
	}
	
	@GetMapping(path = "/fileInfo")
	public ResponseEntity<?> getFileInfo(@RequestParam(required = true, name = "datasetName") String datasetName,
			@RequestParam(required = true, name = "fileName") String fileName,
	        @RequestParam(required = true, name = "org") String org)
			 {
		ResponseEntity<?> resp;
		try {
			resp = new ResponseEntity<>(pluginService.getS3FileInfo(datasetService.getDataset(datasetName, org),
					fileName), new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			logger.error(EXCEPTION, e);
		}
		return resp;
	}
	
	@PostMapping(path = "/deleteFile")
	public ResponseEntity<String> deleteFile(@RequestParam(required = true, name = "fileName") String fileName, 
			@RequestParam(required = true, name = "datasetName") String Name, 
			@RequestParam(required = true, name = "org") String org){
	
		ResponseEntity<String> resp;
		try {
			resp = new ResponseEntity<>(pluginService.deleteS3file(datasetService.getDataset(Name, org),
					fileName), new HttpHeaders(),
					HttpStatus.OK);
		} catch (Exception e) {
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			logger.error(EXCEPTION, e);
		}
		return resp;
	}
	
	@GetMapping(path = "/searchData")
	public ResponseEntity<?> getSearchedObjects(@RequestParam(required = true, name = "datasetName") String datasetName,
			@RequestParam(required = true, name = "projectName") String projectName,
			@RequestParam(required = false, name = "size", defaultValue = "10") String size,
			@RequestParam(required = false, name = "page", defaultValue = "0") String page,
			@RequestParam(required = false, name = "sortEvent") String sortEvent,
			@RequestParam(required = false, name = "sortOrder", defaultValue = "-1") String sortOrder,
			@RequestParam(required = false, name = "searchParams") String searchParams,
			@RequestParam(required = false, name = "queryParams") String queryParams,
			@RequestHeader(required = false, name = "selectClauseParams") String selectClauseParams) {
		ResponseEntity<?> resp;
		try {
//			if (searchParams != null) {
//				searchParams = Crypt.decrypt(searchParams,enckeydefault);
//			}
			JSONObject extraParams = new JSONObject();
			extraParams.put("dbResp", "0");
			extraParams.put("params", queryParams);
			if (selectClauseParams != null && !selectClauseParams.trim().isEmpty()) {
				selectClauseParams = Crypt.decrypt(selectClauseParams,enckeydefault);
				extraParams.put("selectClauseParams", selectClauseParams);
			}
			resp = new ResponseEntity<>(pluginService.getSearchedObjects(datasetService.getDataset(datasetName, projectName), projectName, size, page,
					sortEvent, sortOrder, searchParams, extraParams), new HttpHeaders(), HttpStatus.OK);
		}
			catch(SQLException e){
			return ResponseEntity.status(400).body("Issue with query, please check dataset");
			
			}catch (Exception e) {
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			logger.error(EXCEPTION, e);
		}
		return resp;
	}

	/**
	 * Gets the search data count.
	 *
	 * @param datasetName  the dataset name
	 * @param projectName  the project name
	 * @param searchParams the search params
	 * @return the search data count
	 */
	@GetMapping(path = "/searchDataCount")
	public ResponseEntity<?> getSearchDataCount(@RequestParam(required = true, name = "datasetName") String datasetName,
			@RequestParam(required = true, name = "projectName") String projectName,
			@RequestParam(required = false, name = "searchParams") String searchParams,
			@RequestParam(required = false, name = "queryParams") String queryParams) {
		ResponseEntity<?> resp;
		try {
//			if (searchParams != null) {
//				searchParams = Crypt.decrypt(searchParams,enckeydefault);
//			}
			JSONObject extraParams = new JSONObject();
			extraParams.put("params", queryParams);
			
			resp = new ResponseEntity<>(pluginService.getSearchDataCount(datasetService.getDataset(datasetName, projectName), projectName, searchParams, extraParams),
					new HttpHeaders(), HttpStatus.OK);
		}
		catch(SQLException e){
			
			return ResponseEntity.status(400).body("Issue with query, please check dataset");
			
		}
		
		catch (Exception e) {
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			logger.error(EXCEPTION, e);
		}
		return resp;
	}

	/**
	 * Load Dataset.
	 *
	 * @param body        the body
	 * @param datasetname the datasetname
	 * @param id          the id
	 * @param org         the org
	 * @param projectId   the project id
	 * @param overwrite   the overwrite
	 * @return the response entity
	 */
	@PostMapping("/load-dataset/{datasetname}/{id}/{projId}/{overwrite}/{org}")
	public ResponseEntity<?> loadDataset(@RequestBody ArrayList<Map<String, ?>> body,
			@PathVariable(value = "datasetname") String datasetname, @PathVariable(value = "id") String id,
			@PathVariable(value = "org") String org, @PathVariable(value = "projId") int projectId,
			@PathVariable(value = "overwrite") boolean overwrite) {
		schedulerPauseStatus = checkStatus("icip.scheduler.pause.status","Core");
		if(schedulerPauseStatus.equalsIgnoreCase("false")) {
			logger.info("Load Dataset : To load {} - job file : {}", datasetname, body);
			try {
				Map params = new HashMap<>();
				params.put("data", body);
				params.put("id", id);
				params.put("org", org);
				params.put("dataset", datasetname);
				params.put("projectId", projectId);
				params.put("overwrite", overwrite);
				params.put("submittedBy", ICIPUtils.getUser(claim));
				InternalEvent event = new InternalEvent(this, "Load Dataset", org, params,
						com.infosys.icets.icip.dataset.jobs.ICIPLoadDataset.class);
				publisher.getApplicationEventPublisher().publishEvent(event);
				logger.info("Load Dataset : Dataset loaded ");
				return new ResponseEntity<>(true, new HttpHeaders(), HttpStatus.OK);
			} catch (EntityNotFoundException | JpaObjectRetrievalFailureException | EmptyResultDataAccessException
					| DataAccessResourceFailureException | JDBCConnectionException | TransactionException
					| JpaSystemException e) {
				logger.error("Exception {}:{}", e.getClass().getName(), e.getMessage());
				return new ResponseEntity<>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
			}
		} else {
			return new ResponseEntity<>("Scheduler Paused", HttpStatus.CONFLICT);
		}
	}

	private String checkStatus(String key, String org) {
		String resVal = "false";
		DashConstant res = dashConstantService.getByKeys(key,org);
		if(res != null) {
			resVal = res.getValue();
		}
		return resVal;
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
	@GetMapping(path = "/downloadFullCsvData")
	public ResponseEntity<?> getDownloadCsv(@RequestParam(required = true, name = "datasetName") String datasetName,
			@RequestParam(required = true, name = "projectName") String projectName) {
		ResponseEntity<?> resp;
		try {
			resp = new ResponseEntity<>(pluginService.getDownloadFullCsv(datasetName,projectName), new HttpHeaders(), HttpStatus.OK);	
			} catch (Exception e) {
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			logger.error(EXCEPTION, e);
		}
		return resp;
	}
	
	@GetMapping(path = "/downloadCsvData")
	public ResponseEntity<?> getDownloadCsv(@RequestParam(required = true, name = "datasetName") String datasetName,
			@RequestParam(required = true, name = "projectName") String projectName,
			@RequestParam(required = true, name = "chunkSize") String chunkSize,
			@RequestParam(required = true, name = "apiCount") String apiCount,
			@RequestParam(required = false, name = "sortEvent") String sortEvent,
			@RequestParam(required = false, name = "sortOrder", defaultValue = "-1") String sortOrder,
			@RequestHeader(required = false, name = "searchParams") String searchParams,
			@RequestHeader(required = true, name = "fieldsToDownload") String fieldsToDownload) {
		ResponseEntity<?> resp;
		try {
			searchParams = Crypt.decrypt(searchParams,enckeydefault);
			fieldsToDownload = Crypt.decrypt(fieldsToDownload,enckeydefault);
			resp = new ResponseEntity<>(pluginService.getDownloadCsv(datasetName, projectName, chunkSize, apiCount,
					sortEvent, sortOrder, searchParams, fieldsToDownload), new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			logger.error(EXCEPTION, e);
		}
		return resp;
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
	 * @param columnName   the column name
	 * @param dateFilter   the date filter
	 * @return the tickets for range
	 */
	@GetMapping(path = "/gettickets")
	public ResponseEntity<?> getTicketsForRange(@RequestParam(required = true, name = "datasetName") String datasetName,
			@RequestParam(required = true, name = "projectName") String projectName,
			@RequestParam(required = false, name = "size", defaultValue = "10") String size,
			@RequestParam(required = false, name = "page", defaultValue = "0") String page,
			@RequestParam(required = false, name = "sortEvent") String sortEvent,
			@RequestParam(required = false, name = "sortOrder", defaultValue = "-1") String sortOrder,
			@RequestHeader(required = false, name = "searchParams") String searchParams,
			@RequestParam(required = false, name = "columnName") String columnName,
			@RequestParam(required = false, name = "dateFilter") String dateFilter) {
		ResponseEntity<?> resp;
		try {
			searchParams = Crypt.decrypt(searchParams,enckeydefault);
			resp = new ResponseEntity<>(pluginService.getTicketsForRange(datasetName, projectName, size, page,
					sortEvent, sortOrder, searchParams, "0", columnName, dateFilter), new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			logger.error(EXCEPTION, e);
		}
		return resp;
	}

	/**
	 * Save entry.
	 *
	 * @param action      the action
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @param rowData     the row data
	 * @return the response entity
	 */
	@PostMapping(path = "/saveEntry")
	public ResponseEntity<String> saveEntry(@RequestParam(required = true, name = "action") String action,
			@RequestParam(required = true, name = "datasetName") String datasetName,
			@RequestParam(required = true, name = "projectName") String projectName, @RequestBody String rowData) {
		ResponseEntity<String> resp;
		try {
			resp = new ResponseEntity<>(pluginService.saveEntry(rowData, action, datasetName, projectName),
					new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			logger.error(EXCEPTION, e);
		}
		return resp;
	}

	/**
	 * Checks if is table present.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the response entity
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws SQLException             the SQL exception
	 */
	@GetMapping(path = "/istablepresent/{datasetname}/{org}")
	public ResponseEntity<Boolean> isTablePresent(@PathVariable(name = "datasetname") String name,
			@PathVariable(name = "org") String org) throws NoSuchAlgorithmException, SQLException {
		ICIPDataset dataset = datasetService.getDataset(name, org);
		Gson gson = new Gson();
		JsonObject attr = gson.fromJson(dataset.getAttributes(), JsonElement.class).getAsJsonObject();
		String tablename = attr.get("tableName").getAsString();
		return new ResponseEntity<>(dsUtil.getDataSetUtil(dataset.getDatasource().getType().toLowerCase() + "ds")
				.isTablePresent(dataset, tablename), HttpStatus.OK);
	}

	/**
	 * Extract table schema.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the response entity
	 */
	@GetMapping(path = "/extracttableschema/{datasetname}/{org}")
	public ResponseEntity<String> extractTableSchema(@PathVariable(name = "datasetname") String name,
			@PathVariable(name = "org") String org) {
		ICIPDataset dataset = datasetService.getDataset(name, org);
		Gson gson = new Gson();
		JsonObject attr = gson.fromJson(dataset.getAttributes(), JsonElement.class).getAsJsonObject();
		String tablename = attr.get("tableName").toString();
		return new ResponseEntity<>(dsUtil.getDataSetUtilSql(dataset.getDatasource().getType().toLowerCase() + "ds")
				.extractTableSchema(dataset, tablename), HttpStatus.OK);
	}

	/**
	 * Gets the datasets by org and schema.
	 *
	 * @param org    the org
	 * @param schema the schema
	 * @return the datasets by org and schema
	 */
	@GetMapping("/schema/{organization}")
	public ResponseEntity<List<ICIPDataset2>> getDatasetsByOrgAndSchema(@PathVariable(name = "organization") String org,
			@RequestParam(name = "schema", required = true) String schema) {
		List<ICIPDataset2> datasets = encryptDataset2Attributes(dataset2Service.getDatasetsByOrgAndSchema(org, schema));
		return new ResponseEntity<>(datasets, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Tag details.
	 *
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @param data        the data
	 * @return the response entity
	 */
	@PostMapping(path = "/tagDetails")
	public ResponseEntity<?> tagDetails(@RequestParam(required = true, name = "datasetName") String datasetName,
			@RequestParam(required = true, name = "projectName") String projectName, @RequestBody String data) {
		ResponseEntity<?> resp;
		try {
			resp = new ResponseEntity<>(pluginService.tagDetails(datasetName, projectName, data), new HttpHeaders(),
					HttpStatus.OK);
		} catch (Exception e) {
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			logger.error(EXCEPTION, e);
		}
		return resp;
	}

	/**
	 * Gets the datasets name.
	 *
	 * @param org the org
	 * @return the datasets name
	 */
	@GetMapping("/dataset")
	public ResponseEntity<List<NameAndAliasDTO>> getDatasetsName(
			@RequestParam(required = true, name = "org") String org) {
		return new ResponseEntity<>(datasetService.getDatasetNamesByOrg(org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the all datasets.
	 *
	 * @param datasetIdList the dataset id list
	 * @return the all datasets
	 */
	@GetMapping("/getDatasetList/{datasetIdList}")
	public ResponseEntity<List<ICIPDataset>> getAllDatasets(
			@PathVariable(required = true, name = "datasetIdList") Integer[] datasetIdList) {
		List<ICIPDataset> iCIPDatasetList = new ArrayList<>();
		for (Integer datasetId : datasetIdList) {
			ICIPDataset dataset = datasetService.getDataset(datasetId);
				try {
					dataset.setAttributes(Crypt.encrypt(dataset.getAttributes(),enckeydefault));
				} catch (InvalidKeyException | NoSuchPaddingException | IllegalBlockSizeException | BadPaddingException
					| InvalidKeySpecException | NoSuchAlgorithmException | InvalidAlgorithmParameterException
					| UnsupportedEncodingException e) {

					logger.error(e.getMessage(),e);
					return new ResponseEntity<>(new HttpHeaders(), HttpStatus.BAD_REQUEST);
				}
			iCIPDatasetList.add(dataset);
		}
		return new ResponseEntity<>(encryptDatasetAttributes(iCIPDatasetList), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasets by org and datasource.
	 *
	 * @param org        the org
	 * @param datasource the datasource
	 * @return the datasets by org and datasource
	 */
	@GetMapping("/dsetNames/{organization}")
	public ResponseEntity<List<ICIPDataset2>> getDatasetNamesByOrgAndDatasource(
			@PathVariable(name = "organization") String org,
			@RequestParam(name = "datasource", required = true) String datasource) {
		List<ICIPDataset2> datasets = encryptDataset2Attributes(datasetService.getDatasetsByOrgAndDatasource(org, datasource));
		return new ResponseEntity<>(datasets, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Update SQL.
	 *
	 * @param datasetName the dataset name
	 * @param org         the org
	 * @param table       the table
	 * @param data        the data
	 * @return the response entity
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	@PostMapping(path = "/update/{datasetname}/{table}/{org}")
	public ResponseEntity<Boolean> updateSQL(@PathVariable("datasetname") String datasetName,
			@PathVariable("org") String org, @PathVariable("table") String table, @RequestBody HashMap data)
			throws SQLException, NoSuchAlgorithmException {
		Gson gson = new Gson();
		Set keys = data.keySet();
		Iterator keysIterator = keys.iterator();
		while (keysIterator.hasNext()) {
			StringBuilder newData = new StringBuilder();
			String newHash = gson.toJson(data);
			JsonElement ele = gson.fromJson(newHash, JsonElement.class);
			JsonObject obj = ele.getAsJsonObject();
			Set<String> arraySet = obj.keySet();
			Iterator arrayIterator = arraySet.iterator();
			StringBuilder colData = new StringBuilder();
			while (arrayIterator.hasNext()) {
				String newkey = arrayIterator.next().toString();
				String value = obj.get(newkey).toString();
				colData.append("`").append(newkey).append("`, ");
				newData.append(value).append(", ");
			}
			newData = newData.replace(newData.length() - 2, newData.length(), "");
			colData = colData.replace(colData.length() - 2, colData.length(), "");
			String query = "REPLACE INTO `" + table + "` (" + colData + ") VALUES (" + newData + ")";
			ICIPDataset ds = getDataset(datasetName, org, query);
			dsUtil.getDataSetUtilSql("mysqlds").executeUpdate(ds, null);
		}
		return new ResponseEntity<>(true, HttpStatus.OK);

	}

	/**
	 * Delete SQL.
	 *
	 * @param datasetName the dataset name
	 * @param org         the org
	 * @param table       the table
	 * @param data        the data
	 * @return the response entity
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	@PostMapping(path = "/delete/{datasetname}/{table}/{org}")
	public ResponseEntity<Boolean> deleteSQL(@PathVariable("datasetname") String datasetName,
			@PathVariable("org") String org, @PathVariable("table") String table, @RequestBody HashMap data)
			throws SQLException, NoSuchAlgorithmException {

		Gson gson = new Gson();
		Set keys = data.keySet();
		Iterator keysIterator = keys.iterator();
		while (keysIterator.hasNext()) {
			String newHash = gson.toJson(data);
			JsonElement ele = gson.fromJson(newHash, JsonElement.class);
			JsonObject obj = ele.getAsJsonObject();
			Set<String> arraySet = obj.keySet();
			Iterator arrayIterator = arraySet.iterator();
			StringBuilder colData = new StringBuilder();
			while (arrayIterator.hasNext()) {
				String newkey = arrayIterator.next().toString();
				String value = obj.get(newkey).toString();
				colData.append(newkey).append("=").append(value).append(" AND ");
			}
			colData = colData.replace(colData.length() - 5, colData.length(), "");
			String query = "DELETE FROM `" + table + "` WHERE " + colData;
			ICIPDataset ds = getDataset(datasetName, org, query);
			dsUtil.getDataSetUtilSql("mysqlds").executeUpdate(ds, null);
		}
		return new ResponseEntity<>(true, HttpStatus.OK);

	}

	/**
	 * Handle all.
	 *
	 * @param ex the ex
	 * @return the response entity
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Object> handleAll(Exception ex) {
		logger.error(ex.getMessage(), ex);
		Throwable rootcause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred");
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Populate attributes.
	 *
	 * @param actual   the actual
	 * @param incoming the incoming
	 * @return the string
	 */
	public static String populateAttributes(String actual, String incoming) {
		JSONObject newAttrs = new JSONObject(incoming);
		JSONObject actualAttrs = new JSONObject(actual);
		Iterator<String> keysItr = newAttrs.keys();
		while (keysItr.hasNext()) {
			String key = keysItr.next();
			String newValue = newAttrs.get(key).toString();
			actualAttrs.put(key, newValue);
		}
		return actualAttrs.toString();
	}

	/**
	 * Gets the complete data.
	 *
	 * @param name       the name
	 * @param org        the org
	 * @param attributes the attributes
	 * @param limit      the limit
	 * @param justData   the just data
	 * @param asJSON     the as JSON
	 * @param page       the page
	 * @param sortEvent  the sort event
	 * @param sortOrder  the sort order
	 * @return the complete data
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws KeyManagementException             the key management exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws InvalidKeySpecException            the invalid key spec exception
	 * @throws InvalidAlgorithmParameterException the invalid algorithm parameter
	 *                                            exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws KeyStoreException                  the key store exception
	 * @throws ClassNotFoundException             the class not found exception
	 * @throws SQLException                       the SQL exception
	 * @throws DecoderException                   the decoder exception
	 * @throws IOException                        Signals that an I/O exception has
	 *                                            occurred.
	 * @throws URISyntaxException                 the URI syntax exception
	 */
	ResponseEntity<String> getCompleteData(String name, String org, String attributes, String limit, boolean justData,
			boolean asJSON, int page, String sortEvent, int sortOrder)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		long start = System.currentTimeMillis();
		ICIPDataset2 dataset2 = datasetService.getDataset2(name, org);
		ICIPDataset dataset = datasetService.getDataset(name, org);
		String instance=null;
		if (attributes != null) {
			attributes = Crypt.decrypt(attributes,enckeydefault);
			String attrs = populateAttributes(dataset.getAttributes(), attributes);
			dataset.setAttributes(attrs);
			JSONObject attributesFromDataset = new JSONObject(dataset.getAttributes());
			instance = attributesFromDataset.optString(ICIPPluginConstants.INSTANCE_DS);
		}
		ICIPDatasource datasource = new ICIPDatasource();		
		if(instance!=null && !instance.isEmpty()) {
			datasource = datasourceService.getDatasource(instance,
					dataset2.getOrganization());
		}else {
			datasource = datasourceService.getDatasource(dataset2.getDatasource(),dataset2.getOrganization());
		}
		dataset.setDatasource(datasource);
		String results = getResult(page, limit, sortEvent, sortOrder, dataset, justData, asJSON);
		logger.debug("Executed in {} ms", System.currentTimeMillis() - start);
		return ResponseEntity.status(200).body(results);
	}

	/**
	 * Check if task is supported.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the response entity
	 */
	@GetMapping(path = "/checkIfSupported/{nameStr}/{org}")
	public ResponseEntity<String> checkIfTaskIsSupported(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		JSONArray responseArr = new JSONArray();
		ResponseEntity<String> response;
		try {

			ICIPDataset dataset = datasetService.getDataset(name, org);
			ICIPDatasource datasource = datasourceService.getDatasource(dataset.getDatasource().getId());
			if (!dataset.getType().equals("r"))
				responseArr.put(
						datasourcePluginService.getDataSourceService(datasource).isUploadDataSupported(datasource));
			if (dataset.getSchema() == null)
				responseArr.put(
						datasourcePluginService.getDataSourceService(datasource).isExtractSchemaSupported(datasource));
			responseArr.put(datasourcePluginService.getDataSourceService(datasource).isMacroBaseSupported(datasource));
			responseArr.put(datasourcePluginService.getDataSourceService(datasource)
					.isTableCreationUsingSchemaSupported(datasource));
			if (dataset.getSchema()!=null && dataset.getSchema().getSchemavalue()!=null && dataset.getSchema().getSchemavalue()!="[]")
				responseArr.put(new JSONObject("{Generate Form : true}"));
			
			response = new ResponseEntity<String>(responseArr.toString(), new HttpHeaders(), HttpStatus.OK);

		} catch (Exception ex) {
			logger.error(ex.getMessage());
			response = new ResponseEntity<String>(ex.getMessage(), HttpStatus.BAD_REQUEST);
		}
		return response;
	}

	/**
	 * Check if visualization is supported.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the response entity
	 */
	@GetMapping(path = "/isVisualizationSupported/{nameStr}/{org}")
	public ResponseEntity<String> checkIfVisualizationIsSupported(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		JSONArray responseArr = new JSONArray();
		ResponseEntity<String> response;
		try {

			ICIPDataset dataset = datasetService.getDataset(name, org);
			ICIPDatasource datasource = datasourceService.getDatasource(dataset.getDatasource().getId());
			responseArr.put(datasourcePluginService.getDataSourceService(datasource)
					.isDatasetVisualizationSupported(datasource));
			responseArr
					.put(datasourcePluginService.getDataSourceService(datasource).isTabularViewSupported(datasource));

			response = new ResponseEntity<String>(responseArr.toString(), new HttpHeaders(), HttpStatus.OK);

		} catch (Exception ex) {
			logger.error(ex.getMessage());
			response = new ResponseEntity<String>(ex.getMessage(), HttpStatus.BAD_REQUEST);
		}

		return response;
	}

	/**
	 * Gets the result.
	 *
	 * @param page      the page
	 * @param limit     the limit
	 * @param sortEvent the sort event
	 * @param sortOrder the sort order
	 * @param dataset   the dataset
	 * @param justData  the just data
	 * @param asJSON    the as JSON
	 * @return the result
	 * @throws SQLException the SQL exception
	 */
	private String getResult(int page, String limit, String sortEvent, int sortOrder, ICIPDataset dataset,
			boolean justData, boolean asJSON) throws SQLException {
		ICIPDataset2 dataset2 = datasetService.getDataset2(dataset.getName(), dataset.getOrganization());

		ICIPDatasource datasource = new ICIPDatasource();
		JSONObject attributesFromDataset = new JSONObject(dataset.getAttributes());
		String instance = attributesFromDataset.optString(ICIPPluginConstants.INSTANCE_DS);
		if(instance!=null && !instance.isEmpty()) {
			datasource = datasourceService.getDatasource(instance,
					dataset2.getOrganization());
		}else {
			datasource = datasourceService.getDatasource(dataset2.getDatasource(),
					dataset2.getOrganization());
		}
		dataset.setDatasource(datasource);
		if (asJSON) {
			return pluginService.getDataSetService(dataset).getDatasetData(dataset,
					new SQLPagination(page, Integer.parseInt(limit), sortEvent, sortOrder), DATATYPE.JSONHEADER,
					String.class);

		}
		if (justData) {
			return pluginService.getDataSetService(dataset).getDatasetData(dataset,
					new SQLPagination(page, Integer.parseInt(limit), sortEvent, sortOrder), DATATYPE.DATA,
					String.class);
		}
		return pluginService.getDataSetService(dataset).getDatasetData(dataset,
				new SQLPagination(page, Integer.parseInt(limit), sortEvent, sortOrder), DATATYPE.GRAPHDATA,
				String.class);
	}

	/**
	 * @param page
	 * @param limit
	 * @param sortEvent
	 * @param sortOrder
	 * @param dataset
	 * @param justData
	 * @param asJSON
	 * @return
	 * @throws SQLException
	 */

	private String getResultAudit(int page, String limit, String sortEvent, int sortOrder, ICIPDataset dataset,
			boolean justData, boolean asJSON, String id) throws SQLException {
		ICIPDataset2 dataset2 = datasetService.getDataset2(dataset.getName(), dataset.getOrganization());

		ICIPDatasource datasource = datasourceService.getDatasource(dataset2.getDatasource(),
				dataset2.getOrganization());
		dataset.setDatasource(datasource);
		return pluginService.getDataSetService(dataset).getDatasetDataAudit(dataset,
				new SQLPagination(page, Integer.parseInt(limit), sortEvent, sortOrder), DATATYPE.JSONHEADER, id,
				String.class);
	}

	/**
	 * Gets the dataset.
	 *
	 * @param datasetName the dataset name
	 * @param org         the org
	 * @param query       the query
	 * @return the dataset
	 */
	private ICIPDataset getDataset(String datasetName, String org, String query) {
		ICIPDataset ds = datasetService.getDataset(datasetName, org);
		Gson gson = new Gson();
		JsonObject jsonObject = gson.fromJson(ds.getAttributes(), JsonElement.class).getAsJsonObject();
		jsonObject.addProperty("Query", query);
		ds.setAttributes(jsonObject.toString());
		return encryptDatasetAttributes(ds);
	}

	/**
	 * Gets the datasets by org and datasource.
	 *
	 * @param org        the org
	 * @param datasource the datasource
	 * @return the datasets by org and datasource
	 */
	@GetMapping("/dset/{organization}")
	public ResponseEntity<List<NameAndAliasDTO>> getDatasetNamesByOrgAndDatasourceAlia(
			@PathVariable(name = "organization") String org,
			@RequestParam(name = "datasource", required = true) String datasource) {
		return new ResponseEntity<>(datasetService.getNamesByOrgAndDatasourceAlias(org, datasource), new HttpHeaders(),
				HttpStatus.OK);
	}

	/**
	 * Gets dataset views by name and org.
	 *
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @return dataset views by name and org
	 */
	@GetMapping("/getViews/{datasetName}/{projectName}")
	public ResponseEntity<String> getViewsByNameAndOrg(@PathVariable(name = "datasetName") String datasetName,
			@PathVariable(name = "projectName") String projectName) {
		String datasetViews = datasetService.getViewsByNameAndOrg(datasetName, projectName);
		return new ResponseEntity<>(datasetViews, new HttpHeaders(), HttpStatus.OK);
	}

	
	/**
	 * Save views.
	 *
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @param views       the views
	 * @return the response entity
	 */
	@PostMapping(path = "/saveViews")
	public ResponseEntity<String> saveViews(@RequestParam(required = true, name = "datasetName") String datasetName,
			@RequestParam(required = true, name = "projectName") String projectName, @RequestBody String views) {
		ResponseEntity<String> resp;
		try {
			String reStr = datasetService.saveViews(views, datasetName, projectName);
			resp = new ResponseEntity<>(reStr, new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			logger.error(EXCEPTION, e);
		}
		return resp;
	}

	/**
	 * Save views.
	 *
	 * @param id     the id
	 * @param config the config
	 * @return the response entity
	 * @throws LeapException 
	 */
	@PostMapping("/save/archival-config/{id}")
	public ResponseEntity<ICIPDataset2> saveViews(@PathVariable("id") int id, @RequestBody String config) throws LeapException {
		ICIPDataset2 dataset = datasetService.saveArchivalConfig(id, config);
		try {
			return new ResponseEntity<>(encryptDataset2Attributes(datasetService.saveArchivalConfig(id, config)), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(EXCEPTION, e);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
		
//		return new ResponseEntity<>(dataset, HttpStatus.OK);
	}

	/**
	 * Delete entry.
	 *
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @param rowData     the row data
	 * @return the response entity
	 */
	@PostMapping(path = "/deleteEntry")
	public ResponseEntity<String> deleteEntry(@RequestParam(required = true, name = "datasetName") String datasetName,
			@RequestParam(required = true, name = "projectName") String projectName, @RequestBody String rowData) {
		ResponseEntity<String> resp;
		try {
			String reStr = pluginService.saveEntry(rowData, "delete", datasetName, projectName);
			resp = new ResponseEntity<>(reStr, new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			logger.error(EXCEPTION, e);
		}
		return resp;
	}

	/**
	 * Gets the dashboard source details.
	 *
	 * @param dashboardId the dashboard id
	 * @return the dashboard source details
	 */
	@GetMapping(path = "/getDashboard/{dashboardId}")
	public ResponseEntity<?> getDashboardSourceDetails(@PathVariable(name = "dashboardId") String dashboardId) {
		ResponseEntity<?> resp;
		try {

			ICIPDataset dataset = datasetService.getDatasetByDashboard(Integer.parseInt(dashboardId));
			resp = new ResponseEntity<>(dataset, new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			logger.error("Error in getting dataset from dashboard", e);
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
		}
		return resp;
	}

	/**
	 * Gets dataset extras.
	 *
	 * @param dataset      name the dataset name
	 * @param organization the organization
	 * @return the dataset extras
	 */
	@GetMapping(path = "/getExtras/{property}/{uniqueId}/{datasetName}/{organization}")
	public ResponseEntity<List<Object>> getDatasetExtras(@PathVariable(name = "property") String propertyDetails,
			@PathVariable(name = "uniqueId") String uniqueId, @PathVariable(name = "datasetName") String datasetName,
			@PathVariable(name = "organization") String organization) {
		ResponseEntity<List<Object>> resp;
		try {
			List<Object> extras = pluginService.getRowExtras(propertyDetails, uniqueId, datasetName, organization)
					.toList();
			resp = new ResponseEntity<List<Object>>(extras, new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			logger.error("Error in getting dataset extras", e);
			List<Object> extras = new ArrayList<>();
			extras.add(e.getMessage());
			resp = new ResponseEntity<List<Object>>(extras, HttpStatus.BAD_REQUEST);
		}
		return resp;
	}
	
	private String getCheckFormulaFlag(String processName, String organization) {
		String formulaCheck = "true";
		if(processName!=null && !processName.isEmpty() && !processName.toLowerCase().equals("null") && !processName.toLowerCase().equals("undefined")) {
			DashConstant formulaCheckConstant = dashConstantService.getByKeys("icm_"+processName+"_checkFormulae", organization);
			if(formulaCheckConstant!=null) {
				formulaCheck = formulaCheckConstant.getValue();
			}
		}
		return formulaCheck;
	}
	
	private List<String> checkFileUploadValidations(String processName, String organization) {
		List<String> validationList = new ArrayList<>();
		String validationStr = "";
		String itemStr = "";
		if(processName!=null && !processName.isEmpty() && !processName.toLowerCase().equals("null") && !processName.toLowerCase().equals("undefined")) {
			itemStr = "icm_"+processName+"_fileUploadValidations";
		}
		else {
			itemStr = "fileUploadValidations";
		}
		DashConstant validationConstant = dashConstantService.getByKeys(itemStr, organization);
		if(validationConstant!=null) {
			validationStr = validationConstant.getValue();
			if(validationStr!=null && !validationStr.isBlank()) {
				JSONObject validations = new JSONObject(validationStr);
				validationList.add(validations.getString("allowedEmbeddedFileExtensions"));
				validationList.add(validations.getString("maxFileEmbeddingDepth"));
			}
		}
		return validationList;
	}

	@PostMapping(value = "/upload")
	public ResponseEntity<List<Map<String, String>>> uploadformio(@RequestPart("file") MultipartFile[] files,
			@RequestParam("org") String org, @RequestParam("datasetName") String datasetName,
			@RequestParam("uniqueId") String uniqueId,@RequestParam(name="process", required = false) String process) throws Exception {
		List<Map<String, String>> overallMetadata = new ArrayList<>();
		final List<JSONObject> rowObjs = new ArrayList<JSONObject>();
		//   JSONArray jsonArray = new JSONArray(selectedRoles);
		// for (Object obj : jsonArray) {
		//     JSONObject jsonObject = (JSONObject) obj;
		//     rowObjs.add(jsonObject);
		// }
		for (MultipartFile file : files) {
			Map<String, String> metadata = new HashMap<>();
		
				List<String> validations = checkFileUploadValidations(process, org);
		String formulaCheck = getCheckFormulaFlag(process, org);
		
		// List<String> roles = rowObjs.stream()
		// 		  .filter(entry -> entry.get("fileName").equals(file.getOriginalFilename()))
		// 		  .flatMap(entry -> ((JSONArray) entry.get("roles")).toList().stream()) // Convert to List and stream
		// 		  .map(Object::toString) // Extract string values from each object
		// 		  .collect(Collectors.toList());		
		//String endUserDatasetName =  dashConstantService.findByKeys("icm_end_user_portal_dataset", org);
		if(validations.size()>0) {
			metadata = fileserverService.generateReqsAndUpload(org, file, "formio", 0, 1, formulaCheck, Arrays.asList(validations.get(0).split(",")), Integer.parseInt(validations.get(1)));
		}
		else {
			metadata = fileserverService.generateReqsAndUpload(org, file, "formio", 0, 1, formulaCheck, null, null);
		}
		if (!metadata.containsKey("Error:")) {
			overallMetadata.add(metadata);
		}
		}
		
			JSONArray extras = pluginService.getRowExtras("_extras", uniqueId, datasetName, org);
//			JSONArray endUserExtras = pluginService.getRowExtras("_extras", endUserUniqueId, endUserDatasetName, org);
			if (extras != null && !extras.isEmpty() && extras.getJSONObject(0) != null
					&& !extras.getJSONObject(0).isEmpty() && extras.getJSONObject(0).getString("_extras") != null) {
				extras = new JSONArray(extras.getJSONObject(0).getString("_extras"));
			} else {
				extras = new JSONArray();
			}
				for (Map<String, String> map  : overallMetadata) {
		            JSONObject jsonObject = new JSONObject(map);
		            extras.put(jsonObject);
		        }
				pluginService.saveEntry(new JSONObject().put("_extras", extras)
						.put("BID", uniqueId).toString(), "update", datasetName, org);
		return new ResponseEntity<>(overallMetadata, HttpStatus.OK);
	}

	@PostMapping(value = "/attachmentupload")
	public ResponseEntity<Map<String, Map<String, String>>> attachmentupload(@RequestPart("file") MultipartFile file,
			@RequestParam("org") String org, @RequestParam(name = "process", required = false) String process,
			@RequestParam(name="uploaded_by", required =false) String uploadedBy) throws Exception {
		String fileid = fileserverService.generateFileID(org, "formio");
		ICIPChunkMetaData metadata = new ICIPChunkMetaData(file.getOriginalFilename(), 0, 1, file.getSize(),
				FilenameUtils.getExtension(file.getOriginalFilename()), fileid, "formio");
		List<String> validations = checkFileUploadValidations(process, org);
		String formulaCheck = getCheckFormulaFlag(process, org);
		if(validations.size()>0) {
			fileserverService.fileUploadHelper(fileid, org, file, metadata, formulaCheck, Arrays.asList(validations.get(0).split(",")), Integer.parseInt(validations.get(1)));
		}
		else {
			fileserverService.fileUploadHelper(fileid, org, file, metadata, formulaCheck);
		}
		Map<String, Map<String, String>> responseMap = new HashMap<String, Map<String, String>>();
		Map<String, String> dataMap = new HashMap<String, String>();
		dataMap.put("fileId", fileid);
		dataMap.put("fileName", file.getOriginalFilename());
		dataMap.put("fileType", file.getContentType());
		dataMap.put("fileSize", String.valueOf(file.getSize()));
		dataMap.put("uploadedOn", DateTimeFormatter.ISO_INSTANT.format(Instant.now().truncatedTo(ChronoUnit.SECONDS)));
		if(uploadedBy != null) {
		dataMap.put("uploadedBy", uploadedBy);
		}else {
		dataMap.put("uploadedBy", ICIPUtils.getUser(claim));
		}
		responseMap.put("data", dataMap);
		return new ResponseEntity<>(responseMap, HttpStatus.OK);
	}
	/**
	 * Gets dataset attachments.
	 *
	 * @param dataset      name the dataset name
	 * @param organization the organization
	 * @return the dataset attachments
	 */
	@GetMapping(path = "/getDatasetAttachments/{uniqueId}/{datasetName}/{organization}")
	public ResponseEntity<List<Object>> getDatasetAttachments(@PathVariable(name = "uniqueId") String uniqueId,
			@PathVariable(name = "datasetName") String datasetName,
			@PathVariable(name = "organization") String organization) {
		ResponseEntity<List<Object>> resp;
		try {
			List<Object> attachments = pluginService.getDatasetAttachments(uniqueId, datasetName, organization)
					.toList();
			resp = new ResponseEntity<List<Object>>(attachments, new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			logger.error("Error in getting dataset attachments", e);
			List<Object> attachments = new ArrayList<>();
			attachments.add(e.getMessage());
			resp = new ResponseEntity<List<Object>>(attachments, HttpStatus.BAD_REQUEST);
		}
		return resp;
	}

	/**
	 * Gets dataset attachments.
	 *
	 * @param fileId      the file ID
	 * @param uniqueId      the unique ID
	 * @param dataset      the dataset name
	 * @param organization the organization
	 * @return the dataset extras
	 */
	@DeleteMapping(path = "/deleteDatasetFile/{fileId}/{uniqueId}")
	public ResponseEntity<List<Object>> deleteDatasetAttachments(@PathVariable(name = "fileId") String fileId, 
			@PathVariable(name = "uniqueId") String uniqueId,
			@RequestParam(name = "datasetName") String datasetName,
			@RequestParam(name = "organization") String organization) {
		ResponseEntity<List<Object>> resp;
		try {
			JSONArray respArr = new JSONArray();
			JSONObject respObj = new JSONObject();
			JSONArray extras = pluginService.getRowExtras("_extras", uniqueId, datasetName, organization);
			if (extras != null && !extras.isEmpty() && extras.getJSONObject(0) != null
					&& !extras.getJSONObject(0).isEmpty() && extras.getJSONObject(0).getString("_extras") != null) {
				if (!extras.isEmpty() && extras.getJSONObject(0).has("Error:")) {
					logger.error("Error:", "Error while deleting file : "+extras.getJSONObject(0).getString("Error:"));
					respArr.put(respObj.put("Error:", "Error while deleting file : "+extras.getJSONObject(0).getString("Error:")));
				} else {
					extras = new JSONArray(extras.getJSONObject(0).getString("_extras"));
					JSONArray newExtras = new JSONArray(extras.toList().stream().map(ele-> new JSONObject(new Gson().toJson(ele))).filter(ele-> !ele.getString("fileId").equals(fileId)).collect(Collectors.toList()).toArray());
					pluginService.saveEntry(new JSONObject().put("_extras", newExtras)
							.put("BID", uniqueId).toString(), "update", datasetName, organization);
					respArr.put(respObj.put("_extras", newExtras.toString()));
				}
			}
			else {
				logger.error("Error:", "Some error ocurred while deleting file");
				respArr.put(respObj.put("Error:", "Some error ocurred while deleting file"));
			}
			resp = new ResponseEntity<List<Object>>(respArr.toList(), new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			logger.error("Error while deleting dataset file ", e);
			JSONArray respArr = new JSONArray();
			JSONObject respObj = new JSONObject();
			respArr.put(respObj.put("Error:","Error while deleting file :"+e.getMessage()));
			resp = new ResponseEntity<List<Object>>(respArr.toList(), HttpStatus.BAD_REQUEST);
		}
		return resp;
	}
	
	@PostMapping(value = "/generateFormTemplate")
	public ResponseEntity<String> generateFormTemplate(@RequestParam("datasetName") String datasetName,
			@RequestParam("org") String org, @RequestBody String templateDetails) throws Exception {
		String formTemplateResp = datasetService.generateFormTemplate(new JSONObject(templateDetails), datasetName, org);
		return new ResponseEntity<>(formTemplateResp, HttpStatus.OK);
	}
	
	private List<ICIPDataset> encryptDatasetAttributes(List<ICIPDataset> datasetList) {
		for (ICIPDataset dataset : datasetList) {
			if (dataset != null) {
				try {
					if (dataset.getAttributes() != null)
						dataset.setAttributes(Crypt.encrypt(dataset.getAttributes(), enckeydefault));
				} catch (Exception e) {
					logger.error("Error in encrypting dataset attributes : {}", dataset.getName());
					logger.error(e.getMessage());
				}
			}
		}
		return datasetList;
	}
	
	private List<ICIPDataset2> encryptDataset2Attributes(List<ICIPDataset2> datasetList) {
		for (ICIPDataset2 dataset : datasetList) {
			if (dataset != null) {
				try {
					if (dataset.getAttributes() != null)
						dataset.setAttributes(Crypt.encrypt(dataset.getAttributes(), enckeydefault));
				} catch (Exception e) {
					logger.error("Error in encrypting dataset attributes : {}", dataset.getName());
					logger.error(e.getMessage());
				}
			}
		}
		return datasetList;
	}
	
	private ICIPDataset encryptDatasetAttributes(ICIPDataset dataset) {
			if (dataset != null) {
				try {
					if (dataset.getAttributes() != null)
						dataset.setAttributes(Crypt.encrypt(dataset.getAttributes(), enckeydefault));
				} catch (Exception e) {
					logger.error("Error in encrypting dataset attributes : {}", dataset.getName());
					logger.error(e.getMessage());
				}
			}
		return dataset;
	}
	
	private ICIPDataset2 encryptDataset2Attributes(ICIPDataset2 dataset) {
			if (dataset != null) {
				try {
					if (dataset.getAttributes() != null)
						dataset.setAttributes(Crypt.encrypt(dataset.getAttributes(), enckeydefault));
				} catch (Exception e) {
					logger.error("Error in encrypting dataset attributes : {}", dataset.getName());
					logger.error(e.getMessage());
				}
			}
		return dataset;
	}
   
	
	@PostMapping(path = "/idsmldata/save")
	public ResponseEntity<String> saveIdsmlData(@RequestParam(name = "dataset_id") String datasetId,
    		@RequestParam(name = "org") String org,@RequestParam(required = true, name = "toSave") String toSave,
    		@RequestBody String idsmlData) throws Exception{
    	try {
    		ICIPDatasetIdsml result = idsmlService.saveIdsmlData(datasetId, org, toSave, idsmlData);
        	return ResponseEntity.status(200).body(new JSONObject(result).toString());
    	} catch (Exception e) {
			logger.error(e.getMessage());
			return ResponseEntity.status(500).body(e.getMessage());
    	}
    }
	
	@PostMapping(path = "/idsmldata/update")
	public ResponseEntity<String> updateIdsmlData(@RequestParam(name = "dataset_id") String datasetId,
    		@RequestParam(name = "org") String org,@RequestParam(required = true, name = "toSave") String toSave,
    		@RequestBody String idsmlData) throws Exception{
    	try {
    		ICIPDatasetIdsml result = idsmlService.updateIdsmlData(datasetId, org, toSave, idsmlData);
        	return ResponseEntity.status(200).body(new JSONObject(result).toString());
    	} catch (Exception e) {
			logger.error(e.getMessage());
			return ResponseEntity.status(500).body(e.getMessage());
    	}
    }
	
	@GetMapping(path = "/list/stories")
	public ResponseEntity<String> saveIdsmlData(@RequestParam(name = "dataset_id") String datasetId,
			@RequestParam(name = "org") String org) throws Exception {
		try {
			List<ICIPDatasetIdsml> result = idsmlService.getChartListByDataset(datasetId, org);
			return ResponseEntity.status(200).body(new JSONArray(result).toString());
		} catch (Exception e) {
			logger.error(e.getMessage());
			return ResponseEntity.status(500).body(e.getMessage());
		}
	}
	@PostMapping(path = "/jobExecutor")
    public ResponseEntity<String> pyjob(@RequestParam(name = "org") String org){
        return new ResponseEntity<>(jobServer, HttpStatus.OK );
    }
	@PostMapping(path = "/multivariateUrl")
    public ResponseEntity<String> multivariate(@RequestParam(name = "org") String org){
        return new ResponseEntity<>(multivariateUrl, HttpStatus.OK );
    }
	
	@GetMapping("/getDoc/{org}")
	public ResponseEntity<?> getByDatasourceType(@PathVariable(name = "org") String org, 
			@RequestParam(required = false, name = "search") String search,
			@RequestParam(name = "docViewType", required = false) String docViewType,
			@RequestParam(name = "page", defaultValue = "1", required = false) String page,
			@RequestParam(name = "size", defaultValue = "10", required = false) String size) {
		Pageable paginate = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));
		return new ResponseEntity<>(datasetService.getDoc(docViewType, org, paginate), new HttpHeaders(),
				HttpStatus.OK);
	}
	
	@GetMapping("/getDocCount/{org}")
	public ResponseEntity<?> getCountByDatasourceType(@PathVariable(name = "org") String org,
			@RequestParam(name = "docViewType", required = false) String docViewType) {
		return new ResponseEntity<>(datasetService.getDocCount(docViewType, org), new HttpHeaders(),
				HttpStatus.OK);
	}
	
	@PostMapping(value = "/saveTemplateChunks/{org}/{name}", consumes = { "multipart/form-data" })
	public ResponseEntity<ICIPDatasetFiles> saveTemplateChunks(
			@PathVariable(value = "org") String organization,
			@PathVariable(value = "name") String name,
			@RequestPart("chunkMetadata") String metadata,
			@RequestPart("file") MultipartFile file,
			@RequestHeader("Project") int projectId	) {
		logger.info("request to save dataset file with name : {} and org : {}", file, organization);
		try {
			ObjectMapper mapper = new ObjectMapper();
			ICIPChunkMetaData chunkMetaData = mapper.readValue(metadata, ICIPChunkMetaData.class);
			String id = ICIPUtils.removeSpecialCharacter(chunkMetaData.getFileGuid());
			ICIPDatasetFiles datasetFile = datasetFileService.findById(id);
			HashMap<String, Object> obj = datasetFileService.saveFile(file, chunkMetaData, organization, id, projectId, "docTemplate");
			if (file.getSize() == 0) {
				logger.info("The uploaded file is empty");
				return new ResponseEntity<>(datasetFile, HttpStatus.CONFLICT);
			}
			if (obj != null && Boolean.valueOf(obj.get("complete").toString()) && obj.get("path") != null) {
				Path path = (Path) obj.get("path");
				String filename = path.getFileName().toString();
				try {
					datasetFileService.delete(
							datasetFileService.findByNameAndOrgAndFilename("Document_"+name, organization, filename));
				} catch (Exception ne) {
					logger.error("Error in deleting previous file");
				}
				String header = datasetFileService.getHeaders(path);
				datasetFile = new ICIPDatasetFiles();
				datasetFile.setDatasetname("Document_"+name);
				datasetFile.setFilepath(path.toString());
				datasetFile.setHeaders(header);
				datasetFile.setFilename(path.getFileName().toString());
				datasetFile.setId(id);
				datasetFile.setOrganization(organization);
				datasetFile.setUploadedAt(new Timestamp(new Date().getTime()));
				JsonObject jsonObject = new JsonObject();
				jsonObject.addProperty("totalcount", chunkMetaData.getTotalCount());
				jsonObject.addProperty("filename", chunkMetaData.getFileName());
				datasetFile.setMetadata(new Gson().toJson(jsonObject));
				datasetFileService.save(datasetFile);
			}
			return new ResponseEntity<>(datasetFile, HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}
	
	@GetMapping("/filter/advanced/count")
	public ResponseEntity<Long> getDatasetsCountForAdvancedFilter(
			@RequestParam(value = "organization") String organization,
			@RequestParam(value = "aliasOrName", required = false) String aliasOrName,
			@RequestParam(value = "types", required = false) List<String> types,
			@RequestParam(value = "tags", required = false) List<String> tags,
			@RequestParam(value = "knowledgeBases", required = false) List<String> knowledgeBases) {
		logger.info("Advance Filter -Count called : {}", organization);
		Long results = datasetService.getDatasetsCountForAdvancedFilter(organization, aliasOrName, types, tags,
				knowledgeBases);
		return ResponseEntity.status(200).body(results);
	}

	@GetMapping("/filter/advanced/list")
	public ResponseEntity<List<ICIPDataset>> getDatasetsForAdvancedFilter(
			@RequestParam(value = "organization") String organization,
			@RequestParam(value = "aliasOrName", required = false) String aliasOrName,
			@RequestParam(value = "types", required = false) List<String> types,
			@RequestParam(value = "tags", required = false) List<String> tags,
			@RequestParam(value = "knowledgeBases", required = false) List<String> knowledgeBases,
			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
			@RequestParam(name = "size", defaultValue = "8", required = false) String size) {
		logger.info("Advance Filter -List called : {}", organization);
		List<ICIPDataset> results = datasetService.getDatasetsCountForAdvancedFilter(organization, aliasOrName, types,
				tags, knowledgeBases, page, size);
		return ResponseEntity.status(200).body(results);
	}
	
	@GetMapping("/filter/advanced/types")
	public ResponseEntity<List<String>> getDatasetTypesForAdvancedFilter(
			@RequestParam(value = "organization") String organization) {
		logger.info("Advance Filter -Types List called : {}", organization);
		List<String> results = datasetService.getDatasetTypesForAdvancedFilter(organization);
		return ResponseEntity.status(200).body(results);
	}
	
	@GetMapping("/fetchDatasetForSchemaAliasAndOrganization")
	public ResponseEntity<List<ICIPDataset>> getDatasetForSchemaAlias(
			@RequestParam(value = "org", required = true) String org,
			@RequestParam(value = "schemaAlias", required = true) String schemaAlias) {
		logger.info("Fetching Datasets for Schema : {} ,Org : {}", schemaAlias, org);
		List<ICIPDataset> resultsFetchDatasetForSchemaNameAndOrganization = pluginService
				.getDatasetForSchemaAlias(schemaAlias, org);
		if (resultsFetchDatasetForSchemaNameAndOrganization == null)
			resultsFetchDatasetForSchemaNameAndOrganization = new ArrayList<>();
		return ResponseEntity.status(200).body(resultsFetchDatasetForSchemaNameAndOrganization);
	}

	@GetMapping("/fetchNavigationDetailsBySchemaNameAndOrganization")
	public ResponseEntity<List<ICIPDatasourceSummary>> getNavigationDetailsBySchemaNameAndOrganization(
			@RequestParam(value = "org", required = true) String org,
			@RequestParam(value = "schemaName", required = true) String schemaName) {
		logger.info("Fetching Navigation Details for Schema : {} ,Org : {}", schemaName, org);
		List<ICIPDatasourceSummary> resultsForNavigationDetailsBySchemaNameAndOrganization = dataset2Service
				.getNavigationDetailsBySchemaNameAndOrganization(schemaName, org);
		return ResponseEntity.status(200).body(resultsForNavigationDetailsBySchemaNameAndOrganization);
	}
	
	@GetMapping(path = "/getDataFromDatasets")
	public List<?> getSearchedObjects(@RequestParam(required = true, name = "org") String organization,
			@RequestParam(required = true, name = "datasetName") String datasetName,
			@RequestParam(required = true, name = "api") String dropdownName,
			@RequestParam(required = true, name = "limit") String limit,
			@RequestParam(required = false, name = "searchParams") String searchParams) throws SQLException{
		List<Object> statement;
		List<Object> response = new ArrayList<Object>();
		
		JSONObject curDropdown = new JSONObject();
		curDropdown.put("selectClauseParams", dropdownName);
		
		logger.info("Fetching "+dropdownName+" from dataset "+datasetName+" with searchParams "+searchParams);
		
		ICIPDataset dataset = datasetService.getDataset(datasetName, organization);
		if(searchParams != null) {
			JSONObject mappedObject = new JSONObject();
			JSONObject filterJson = new JSONObject();
			String[] temp = null;
			String[] searchArray = searchParams.split(",");
			List<JSONObject> condList = new ArrayList<>();
			JSONObject mappedOrObject = new JSONObject();
			List<JSONObject> ListOrObject = new ArrayList<>();
			
			for(int i=0;i<searchArray.length;i++){
				temp = searchArray[i].split(":");
				
				filterJson.put("property", temp[0]);
				filterJson.put("equality","=");
				filterJson.put("value", temp[1]);
				condList.add(filterJson);
			}
			mappedOrObject.put("or", condList);
			ListOrObject.add(mappedOrObject);
			mappedObject.put("and", ListOrObject);
			
			String search = mappedObject.toString();
			statement = pluginService.getSearchedObjects(dataset, organization, limit, "0", null, "-1", search, curDropdown);
		}
		else {
			statement=pluginService.getSearchedObjects(dataset, organization, limit, "0", null, "-1", null, curDropdown);
		}
		
		if(dropdownName.contains(",")){
			for(int i=0;i<statement.size();i++) {
				response.add((HashMap<String, String>)statement.get(i));
			}
		}
		else {
			for(int i=0;i<statement.size();i++) {
				response.add((((HashMap<String, String>)statement.get(i)).get(dropdownName)));
			}
		}
		
		List<Object> responseList = new ArrayList<>(new HashSet<>(response));
		
		logger.info("FETCHED RESPONSE SUCCESSFULLY");
		
		return responseList;

	}
	
	/**
	 * Create S3 Dataset.
	 *
	 * @param bucket         the bucket
	 * @param org            the org
	 * @param datasourceName the datasourceName
	 * @param org            the org
	 * @param path           the path
	 * @param file           the file
	 * @return the response entity
	 */
	@PostMapping("/createS3Dataset")
	public ResponseEntity<?> createS3Dataset(@RequestParam(required = true, name = "bucket") String bucket,
			@RequestParam(required = true, name = "org") String org,
			@RequestParam(required = true, name = "datasourceName") String datasourceName,
			@RequestParam(required = true, name = "path") String path, @RequestPart("file") MultipartFile file,
			@RequestHeader Map<String, String> headers)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException,
			UnsupportedOperationException {
		try {

			JSONObject S3DatasetJSONObject = datasetService.createS3Dataset(bucket, path, org, datasourceName, file, headers);
			return new ResponseEntity<>(S3DatasetJSONObject, new HttpHeaders(), HttpStatus.OK);
		} catch (EntityNotFoundException | JpaObjectRetrievalFailureException | EmptyResultDataAccessException
				| DataAccessResourceFailureException | JDBCConnectionException | TransactionException
				| JpaSystemException | UnsupportedOperationException e) {
			logger.error("Exception {}:{}", e.getClass().getName(), e.getMessage());
			Map<String, Object> response = new HashMap<>();
			response.put("status", "error");
			response.put("errorDesc", e.getMessage());
			return new ResponseEntity<>(response, new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}
	
	/**
	 * Create S3 Folder Dataset.
	 *
	 * @param bucket         the bucket
	 * @param org            the org
	 * @param datasourceName the datasourceName
	 * @param org            the org
	 * @param path           the path
	 * @param file           the file
	 * @return the response entity
	 */
	@PostMapping("/createS3FolderDataset")
	public ResponseEntity<?> createS3FolderDataset(@RequestParam(required = true, name = "bucket") String bucket,
			@RequestParam(required = true, name = "org") String org,
			@RequestParam(required = true, name = "datasourceName") String datasourceName,
			@RequestParam(required = true, name = "datasetAlias") String datasetAlias,
			@RequestParam(required = true, name = "path") String path, @RequestPart("files") List<MultipartFile> files,
			@RequestHeader Map<String, String> headers)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException,
			UnsupportedOperationException {
		try {
			JSONObject S3DatasetJSONObject = datasetService.createS3FolderDataset(bucket, path, org, datasourceName,
					files, datasetAlias, headers);
			return new ResponseEntity<>(S3DatasetJSONObject, new HttpHeaders(), HttpStatus.OK);
		} catch (EntityNotFoundException | JpaObjectRetrievalFailureException | EmptyResultDataAccessException
				| DataAccessResourceFailureException | JDBCConnectionException | TransactionException
				| JpaSystemException | UnsupportedOperationException e) {
			logger.error("Exception {}:{}", e.getClass().getName(), e.getMessage());
			Map<String, Object> response = new HashMap<>();
			response.put("status", "error");
			response.put("errorDesc", e.getMessage());
			return new ResponseEntity<>(response, new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}
	
}
