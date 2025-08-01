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

import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

import org.json.JSONObject;
import org.json.JSONArray;
import org.python.jline.internal.Log;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.core.env.Environment;
//import org.springframework.core.task.TaskExecutor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
//import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.ai.comm.lib.util.logger.JobLogger;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.NameEncoderService;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDataset2;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.model.ICIPPartialDatasource;
import com.infosys.icets.icip.dataset.model.dto.ICIPDatasoureNameAliasTypeDTO;
import com.infosys.icets.icip.dataset.repository.ICIPDatasetRepository;
import com.infosys.icets.icip.dataset.repository.ICIPDatasetRepository2;
import com.infosys.icets.icip.dataset.repository.ICIPDatasourceRepository;
import com.infosys.icets.icip.dataset.repository.ICIPPartialDatasourceRepository;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;
import com.infosys.icets.icip.dataset.util.DecryptPassword;
import com.infosys.icets.icip.icipwebeditor.event.publisher.InternalEventPublisher;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChains;
import com.infosys.icets.icip.icipwebeditor.v1.dto.BaseEntity;
import com.infosys.icets.icip.icipwebeditor.v1.service.IICIPSearchable;

import jakarta.transaction.Transactional;
import reactor.core.publisher.Flux;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPDatasourceService.
 *
 * @author icets
 */

@Service("connectionservice")
@RefreshScope
public class ICIPDatasourceService implements IICIPDatasourceService, IICIPSearchable {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPDatasourceService.class);

	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/** The datasource repository. */
	private ICIPDatasourceRepository datasourceRepository;

	/** The partial datasource repository. */
	private ICIPPartialDatasourceRepository partialDatasourceRepository;

	/** The dataset repository. */
	private ICIPDatasetRepository datasetRepository;

	/** The dataset repository. */
	private ICIPDatasetRepository2 datasetRepository2;

	/** The environment. */
	private Environment environment;

	/** The plugin service. */
	@Autowired
	ICIPDatasourcePluginsService pluginService;

	/** The dset plugin service. */
	@Autowired
	ICIPDatasetPluginsService dsetPluginService;

	/** The event service. */
	@Autowired
	private InternalEventPublisher eventService;

	

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	/** The ncs. */
	private NameEncoderService ncs;

	/** The Constants. */
	private static final String PSTR = "password";

	/** The Constant VAULT. */
	private static final String VAULT = "_vault";

	/** The Constant AUTHDETAILS. */
	private static final String AUTHDETAILS = "AuthDetails";

	/** The Constant AUTHPARAMS. */
	private static final String AUTHPARAMS = "authParams";

	/** The Constant AUTHTYPE. */
	private static final String AUTHTYPE = "AuthType";

	/** The Constant BASICAUTH. */
	private static final String BASICAUTH = "BasicAuth";

	/** The Constant OAUTH. */
	private static final String OAUTH = "OAuth";

	/** The Constant CLIENTSECRET. */
	private static final String CLIENTSECRET = "client_secret";

	/** The Access Token. */
	private static final String ACCESSTOKEN = "access_token";

	/** The Constant KEYWORD. */
	private static final String KEYWORD = "@datasourcepass";

	final String TYPE = "CONNECTION";
	/** The key. */
	private String key;

	/**
	 * Instantiates a new ICIP datasource service.
	 *
	 * @param key                         the key
	 * @param datasourceRepository        the datasource repository
	 * @param datasetRepository           the dataset repository
	 * @param datasetRepository2          the dataset repository 2
	 * @param environment                 the environment
	 * @param ncs                         the ncs
	 * @param partialDatasourceRepository the partial datasource repository
	 */
	public ICIPDatasourceService(@Value("${encryption.key}") String key, ICIPDatasourceRepository datasourceRepository,
			ICIPDatasetRepository datasetRepository, ICIPDatasetRepository2 datasetRepository2, Environment environment,
			NameEncoderService ncs, ICIPPartialDatasourceRepository partialDatasourceRepository) {
		super();
		this.key = key;
		this.datasourceRepository = datasourceRepository;
		this.datasetRepository = datasetRepository;
		this.datasetRepository2 = datasetRepository2;
		this.environment = environment;
		this.ncs = ncs;
		this.partialDatasourceRepository = partialDatasourceRepository;
	}

	/**
	 * Gets the datasource.
	 *
	 * @param id the id
	 * @return the datasource
	 */
	@Override
	public ICIPDatasource getDatasource(Integer id) {
		Optional<ICIPDatasource> s = datasourceRepository.findById(id);
		if (s.isPresent())
			return s.get();
		return null;
	}

	/**
	 * Search datasources.
	 *
	 * @param name         the name
	 * @param organization the organization
	 * @return the list
	 */
	@Override
	public List<ICIPDatasource> searchDatasources(String name, String organization) {
		return datasourceRepository.searchByName(name, organization);
	}

	/**
	 * Gets the datasource.
	 *
	 * @param name         the name
	 * @param organization the organization
	 * @return the datasource
	 */
	public ICIPDatasource getDatasource(String name, String organization) {
		return datasourceRepository.findByNameAndOrganization(name, organization);
	}

	/**
	 * Gets the datasource by type.
	 *
	 * @param type         the type
	 * @param organization the organization
	 * @return the datasource by type
	 */
	@Override
	public List<ICIPDatasource> getDatasourceByType(String type, String organization) {
		return datasourceRepository.findByTypeAndOrganization(type, organization);
	}
	
	@Override
	public List<ICIPDatasource> getForModelsTypeAndOrganization(String type, String organization) {
		return datasourceRepository.getForModelsTypeAndOrganization(type, organization);
	}

	/**
	 * Gets the paginated datasource by type and search.
	 *
	 * @param type         the type
	 * @param organization the organization
	 * @param search       the search
	 * @param page         the page
	 * @param size         the size
	 * @return the paginated datasource by type and search
	 */
	@Override
	public List<ICIPDatasource> getPaginatedDatasourceByTypeAndSearch(String type, String organization,
			String interfacetype, String search, int page, int size) {
		if (search == null || search.trim().isEmpty()) {
			if (!interfacetype.equals("null"))
				return datasourceRepository.findByTypeAndOrganizationAndInterfacetype(type, organization, interfacetype,
						PageRequest.of(page, size));
			return datasourceRepository.findByTypeAndOrganization(type, organization, PageRequest.of(page, size));
		} else {
			ICIPDatasource ds = new ICIPDatasource();
			ds.setType(type);
			ds.setOrganization(organization);
			ds.setAlias(search);
			if (interfacetype != null)
				ds.setInterfacetype(interfacetype);
			ExampleMatcher matcher = ExampleMatcher.matching().withMatcher("alias",
					match -> match.ignoreCase().contains());
			Example<ICIPDatasource> example = Example.of(ds, matcher);
			return datasourceRepository.findAll(example, PageRequest.of(page, size)).toList();
		}
	}

	/**
	 * Save.
	 *
	 * @param idOrName               the id or name
	 * @param iCIPDatasource2Save    the i CIP datasource 2 save
	 * @param datasourcePluginServce the datasource plugin servce
	 * @return the ICIP datasource
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	@Override
	public ICIPDatasource save(String idOrName, ICIPDatasource iCIPDatasource2Save) throws NoSuchAlgorithmException {
		ICIPDatasource iCIPDatasource = new ICIPDatasource();
		String connDetails = iCIPDatasource2Save.getConnectionDetails();
		String url = new JSONObject(iCIPDatasource2Save.getConnectionDetails()).has("url")
				? new JSONObject(iCIPDatasource2Save.getConnectionDetails()).get("url").toString()
				: "";
		String userName = new JSONObject(iCIPDatasource2Save.getConnectionDetails()).has("userName")
				? new JSONObject(iCIPDatasource2Save.getConnectionDetails()).get("userName").toString()
				: "";
		String password = new JSONObject(iCIPDatasource2Save.getConnectionDetails()).has("password")
				? new JSONObject(iCIPDatasource2Save.getConnectionDetails()).get("password").toString()
				: "";
		if ((url.contains("Authentication=ActiveDirectoryServicePrincipal"))
				|| (url.contains("authentication=ActiveDirectoryServicePrincipal"))) {
			url += ";AADSecurePrincipalId=" + userName + ";AADSecurePrincipalSecret=" + password;
		}
		JSONObject connection = new JSONObject(connDetails);
		connection.keySet().parallelStream().forEach(key -> {
			if (connection.has(key + VAULT) && connection.getBoolean(key + VAULT)) {
				connection.put(key, connection.optString(key + "_vault_key"));
			}
		});
		connDetails = connection.toString();
		try {
			ICIPDatasource fetched = null;
			logger.debug("fetching datasource");
			try {
				fetched = getDatasource(Integer.parseInt(idOrName));
			} catch (NumberFormatException ex) {
				fetched = getDatasource(idOrName, iCIPDatasource2Save.getOrganization());
			}
			logger.debug("Fetched Datasource : {}", fetched);
			if (fetched != null) {
				iCIPDatasource.setId(fetched.getId());
			}
		} catch (Exception e) {
			logger.error(e.getMessage());
		}
		iCIPDatasource2Save = pluginService.getDataSourceService(iCIPDatasource2Save).setHashcode(true,
				iCIPDatasource2Save);
		iCIPDatasource2Save.setConnectionDetails(connDetails);
		if (iCIPDatasource2Save.getName() == null || iCIPDatasource2Save.getName().trim().isEmpty()) {
			String name = createName(iCIPDatasource2Save.getOrganization(), iCIPDatasource2Save.getAlias());
			iCIPDatasource.setName(name);
		} else {
			iCIPDatasource.setName(iCIPDatasource2Save.getName());
		}
		iCIPDatasource.setConnectionDetails(
				new JSONObject(iCIPDatasource2Save.getConnectionDetails()).put("url", url).toString());
		iCIPDatasource.setDescription(iCIPDatasource2Save.getDescription());
		// iCIPDatasource.setConnectionDetails(iCIPDatasource2Save.getConnectionDetails());
		iCIPDatasource.setType(iCIPDatasource2Save.getType());
		iCIPDatasource.setOrganization(iCIPDatasource2Save.getOrganization());
		iCIPDatasource.setSalt(iCIPDatasource2Save.getSalt());
		iCIPDatasource.setDshashcode(iCIPDatasource2Save.getDshashcode());
		iCIPDatasource.setLastmodifiedby(iCIPDatasource2Save.getLastmodifiedby());
		iCIPDatasource.setLastmodifieddate(iCIPDatasource2Save.getLastmodifieddate());
		iCIPDatasource.setExtras(iCIPDatasource2Save.getExtras());
		iCIPDatasource
				.setAlias(iCIPDatasource2Save.getAlias() != null && !iCIPDatasource2Save.getAlias().trim().isEmpty()
						? iCIPDatasource2Save.getAlias()
						: iCIPDatasource2Save.getName());
		iCIPDatasource.setActivetime(iCIPDatasource2Save.getLastmodifieddate());
		iCIPDatasource.setCategory(iCIPDatasource2Save.getCategory());
		iCIPDatasource.setInterfacetype(iCIPDatasource2Save.getInterfacetype());
		iCIPDatasource.setFordataset(iCIPDatasource2Save.getFordataset());
		iCIPDatasource.setForruntime(iCIPDatasource2Save.getForruntime());
		iCIPDatasource.setForadapter(iCIPDatasource2Save.getForadapter());
		iCIPDatasource.setFormodel(iCIPDatasource2Save.getFormodel());
		iCIPDatasource.setForpromptprovider(iCIPDatasource2Save.getForpromptprovider());
		iCIPDatasource.setForendpoint(iCIPDatasource2Save.getForendpoint());
		iCIPDatasource.setForapp(iCIPDatasource2Save.getForapp());

		logger.info("saving datasource ");
		iCIPDatasource = datasourceRepository.save(iCIPDatasource);
		ExecutorService executor = Executors.newFixedThreadPool(1);
		executor.submit(new DatasourceSave(iCIPDatasource.clone()));
		executor.shutdown();

		return iCIPDatasource;

	}

	/**
	 * Delete.
	 *
	 * @param name the name
	 * @param org  the org
	 */
	@Override
	@Transactional
	public void delete(String name, String org) {
		ICIPDatasource iCIPDatasourceFetched = datasourceRepository.findByNameAndOrganization(name, org);
		if (iCIPDatasourceFetched != null) {
			logger.info("deleting datasets");
			List<ICIPDataset2> datasets = datasetRepository2.findByOrganizationAndDatasource(org,
					iCIPDatasourceFetched.getName());
			datasets.forEach(dataset -> {
				ICIPDataset iCIPDataset = datasetRepository.findByNameAndOrganization(dataset.getName(), org);
				if (iCIPDataset != null) {
					datasetRepository.delete(iCIPDataset);
				}
			});
			logger.info("deleting datasoure");

			//List<ICIPMLFederatedRuntime> listConnection = icipmlfedRepo.findByConnid(iCIPDatasourceFetched.getId());
			//icipmlfedRepo.deleteAll(listConnection);
			datasourceRepository.delete(iCIPDatasourceFetched);
		}
	}

	/**
	 * Gets the datasources by org and name.
	 *
	 * @param org  the org
	 * @param name the name
	 * @return the datasources by org and name
	 */
	@Override
	public List<ICIPDatasource> getDatasourcesByOrgAndName(String org, String name) {
		return datasourceRepository.getAllByOrganizationAndName(org, name);
	}

	@Override
	public ICIPDatasource getDatasourceByNameAndOrganization(String name, String org) {
		return datasourceRepository.findByNameAndOrganization(name, org);
	}

	/**
	 * Gets the datasources by group and org.
	 *
	 * @param org   the org
	 * @param group the group
	 * @return the datasources by group and org
	 */
	@Override
	public List<ICIPDatasource> getDatasourcesByGroupAndOrg(String org, String group) {
		return datasourceRepository.findByOrganizationAndGroups(org, group);
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
		List<ICIPDatasource> dsets = datasourceRepository.findByOrganization(fromProjectId);
		dsets.stream().forEach(ds -> {
			ds.setOrganization(toProjectId);
			datasourceRepository.save(ds);
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
		List<ICIPDatasource> dsources = datasourceRepository.findByOrganization(fromProjectId);
		List<ICIPDatasource> toDsource = dsources.parallelStream().map(dsource -> {
			dsource.setId(null);
			dsource.setOrganization(toProjectId);
			return dsource;
		}).collect(Collectors.toList());
		toDsource.stream().forEach(dsource -> {
			if (getDatasource(dsource.getName(), dsource.getOrganization()) == null) {
				try {
					datasourceRepository.save(dsource);
				} catch (DataIntegrityViolationException e) {
					joblogger.error(marker, e.getMessage());
				}
			}
		});
		return true;
	}

	public Boolean copytemplate(Marker marker, String fromProjectName, String toProjectName) {

		List<ICIPDatasource> dsources = datasourceRepository.findByInterfacetypeAndOrganization("template",
				fromProjectName);
		logger.info("Length of datasources with template {}---{}", dsources.size());
		List<ICIPDatasource> toDsource = dsources.parallelStream().map(dsource -> {
			dsource.setId(null);
			dsource.setOrganization(toProjectName);
			return dsource;
		}).collect(Collectors.toList());
		toDsource.stream().forEach(dsource -> {
			if (getDatasource(dsource.getName(), dsource.getOrganization()) == null) {
				try {
					datasourceRepository.save(dsource);
				} catch (DataIntegrityViolationException e) {
					Log.error("Error in saving dataosource in service");
					joblogger.error(marker, e.getMessage());
				}
			}
		});
		return true;

	}

	/**
	 * Find by organization.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	public List<ICIPDatasource> findByOrganization(String organization) {
		return datasourceRepository.findByOrganization(organization);
	}

	/**
	 * Gets the datasource count by type.
	 *
	 * @param type         the type
	 * @param organization the organization
	 * @param search       the search
	 * @return the datasource count by type
	 */
	@Override
	public Long getDatasourceCountByType(String type, String organization, String search) {
		if (search == null || search.trim().isEmpty()) {
			return datasourceRepository.countByTypeAndOrganization(type, organization);
		} else {
			ICIPDatasource ds = new ICIPDatasource();
			ds.setType(type);
			ds.setOrganization(organization);
			ds.setAlias(search);
			ExampleMatcher matcher = ExampleMatcher.matching().withMatcher("alias",
					match -> match.ignoreCase().contains());
			Example<ICIPDatasource> example = Example.of(ds, matcher);
			Long count = datasourceRepository.count(example);
			return count;
		}
	}

	/**
	 * Gets the datasource count by type.
	 *
	 * @param type         the type
	 * @param organization the organization
	 * @param search       the search
	 * @return the datasource count by type
	 */
	@Override
	public Long getDatasourceCountByInterfacetype(String type, String interfacetype, String organization,
			String search) {
		if (search == null || search.trim().isEmpty()) {
			return datasourceRepository.countByInterfacetypeAndOrganization(type, interfacetype, organization);
		} else {
			ICIPDatasource ds = new ICIPDatasource();
			ds.setType(interfacetype);
			ds.setOrganization(organization);
			ds.setAlias(search);
			ExampleMatcher matcher = ExampleMatcher.matching().withMatcher("alias",
					match -> match.ignoreCase().contains());
			Example<ICIPDatasource> example = Example.of(ds, matcher);
			Long count = datasourceRepository.count(example);
			return count;
		}
	}

	/**
	 * Gets the datasource by name search.
	 *
	 * @param name the name
	 * @param org  the org
	 * @param type the type
	 * @param page the page
	 * @param size the size
	 * @return the datasource by name search
	 */
	@Override
	public List<ICIPDatasource> getDatasourceByNameSearch(String name, String org, String type, int page, int size) {
		return datasourceRepository.getDatasourceByNameSearch(name, org, type, PageRequest.of(page, size));
	}

	/**
	 * Gets the datasource count by name and type.
	 *
	 * @param name the name
	 * @param type the type
	 * @param org  the org
	 * @return the datasource count by name and type
	 */
	@Override
	public Long getDatasourceCountByNameAndType(String name, String type, String org) {
		return datasourceRepository.countByTypeAndNameAndOrganization(name, org, type);
	}

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	@Override
	public void delete(String project) {
		logger.info("deleting datasets");
		datasetRepository.deleteByProject(project);
		logger.info("deleting datasoure");
		datasourceRepository.deleteByProject(project);
	}

	/**
	 * Find name by organization.
	 *
	 * @param org the org
	 * @return the list
	 */
	@Override
	public List<NameAndAliasDTO> findNameAndAliasByOrganization(String org) {
		return datasourceRepository.getNameAndAliasByOrganization(org);
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
			uniqueName = datasourceRepository.countByName(name) == 0;
		} while (!uniqueName);
		logger.info(name);
		return name;
	}

	/**
	 * Copy selected.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @param datasources   the datasources
	 * @return true, if successful
	 */
	@Override
	public boolean copySelected(Marker marker, String fromProjectId, String toProjectId, String datasources) {
		ICIPDatasource datasource = datasourceRepository.findByNameAndOrganization(datasources, fromProjectId);
		ICIPDatasource toDatasource = new ICIPDatasource();
		toDatasource.setId(null);
		toDatasource.setOrganization(toProjectId);
		toDatasource.setConnectionDetails(datasource.getConnectionDetails());
		toDatasource.setDescription(datasource.getDescription());
		toDatasource.setName(datasource.getName());
		toDatasource.setSalt(datasource.getSalt());
		toDatasource.setType(datasource.getType());
		if (getDatasource(toDatasource.getName(), toDatasource.getOrganization()) == null) {
			try {
				datasourceRepository.save(toDatasource);
			} catch (DataIntegrityViolationException e) {
				joblogger.error(marker, e.getMessage());
			}
		}
		return true;
	}

	/**
	 * The Class DatasourceSave.
	 */
	private class DatasourceSave implements Runnable {

		/** The i CIP datasource 2 save. */
		private ICIPDatasource iCIPDatasource2Save;

		/**
		 * Instantiates a new datasource save.
		 *
		 * @param ds the ds
		 */
		public DatasourceSave(ICIPDatasource ds) {
			this.iCIPDatasource2Save = ds;
		}

		/**
		 * Run.
		 */
		@Override
		public void run() {
			JSONObject connectionDetails = new JSONObject(iCIPDatasource2Save.getConnectionDetails());
			Object[] obj = DecryptPassword.getValue(environment, PSTR, connectionDetails);
			String pstr = (String) obj[0];
			boolean vaultFlag = (boolean) obj[1];
			JSONObject saltObj = new JSONObject();
			if (!vaultFlag && !pstr.isEmpty() && !pstr.startsWith("enc") && !pstr.equals(KEYWORD)) {
				logger.debug("encrypting...");
				String[] encrytedDet = DecryptPassword.encrypt(pstr, key);
				connectionDetails.put(PSTR, encrytedDet[0]);
				iCIPDatasource2Save.setSalt(encrytedDet[1]);
				iCIPDatasource2Save.setConnectionDetails(connectionDetails.toString());
			}
			if (iCIPDatasource2Save.getCategory().equalsIgnoreCase("rest")) {
				JSONObject authDetais = new JSONObject(connectionDetails.optString(AUTHDETAILS));
				if (connectionDetails.optString(AUTHTYPE).equalsIgnoreCase(BASICAUTH)) {
					String password = authDetais.optString(PSTR);
					if (!password.isEmpty() && !pstr.equals(KEYWORD) && !password.startsWith("enc")
							&& !(authDetais.has(PSTR + VAULT) && authDetais.getBoolean(PSTR + VAULT))) {
						String[] encrytedpwd = DecryptPassword.encrypt(password, key);
						authDetais.put(PSTR, encrytedpwd[0]);
						connectionDetails.put(AUTHDETAILS, authDetais);
//						saltObj.put(PSTR, encrytedpwd[1]);
						iCIPDatasource2Save.setSalt(encrytedpwd[1]);
					}
				} else if (connectionDetails.optString(AUTHTYPE).equalsIgnoreCase(OAUTH)) {
					JSONObject authParams = new JSONObject(authDetais.optString(AUTHPARAMS));
					String cSecret = authParams.optString(CLIENTSECRET);
					String authToken = connectionDetails.optString(ACCESSTOKEN);
					if (!cSecret.isEmpty() && !pstr.equals(KEYWORD) && !cSecret.startsWith("enc")
							&& !(authParams.has(CLIENTSECRET + VAULT) && authParams.getBoolean(CLIENTSECRET + VAULT))) {
						String[] encSecret = DecryptPassword.encrypt(cSecret, key);
						authParams.put(CLIENTSECRET, encSecret[0]);
						authDetais.put(AUTHPARAMS, authParams);
						connectionDetails.put(AUTHDETAILS, authDetais);
						saltObj.put(CLIENTSECRET, encSecret[1]);
						iCIPDatasource2Save.setSalt(saltObj.toString());
					}
					if (!authToken.isEmpty() && !authToken.startsWith("enc")
							&& !(authParams.has(ACCESSTOKEN + VAULT) && authParams.getBoolean(ACCESSTOKEN + VAULT))) {
						String[] encToken = DecryptPassword.encrypt(authToken, key);
						connectionDetails.put(ACCESSTOKEN, encToken[0]);
						saltObj.put(ACCESSTOKEN, encToken[1]);
						iCIPDatasource2Save.setSalt(saltObj.toString());
					}
				}
				iCIPDatasource2Save.setConnectionDetails(connectionDetails.toString());

			}

			datasourceRepository.save(iCIPDatasource2Save);
		}

	}

	/**
	 * Find name by organization.
	 *
	 * @param org the org
	 * @return the list
	 */
	@Override
	public List<String> findNameByOrganization(String org) {
		return datasourceRepository.getNameByOrganization(org);
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
		return null;
	}

	/**
	 * Gets the partial datasource.
	 *
	 * @param name    the name
	 * @param project the project
	 * @return the partial datasource
	 */
	@Override
	public ICIPPartialDatasource getPartialDatasource(String name, String project) {
		return partialDatasourceRepository.findByNameAndOrganization(name, project);
	}

	@Override
	public List<ICIPDataset> getDatasetsByDatasource(ICIPDatasource datasource, String organization) {
		return datasetRepository.findByDatasourceAndOrganization(datasource, organization);
	}

	@Override
	public List<String> getAdapterTypes() {
		return datasourceRepository.getAdapterTypes();
	}

	@Override
	public List<ICIPDatasource> getAdaptersByOrg(String org) {
		return datasourceRepository.findByInterfacetypeAndOrganization("adapter", org);
	}

	@Override
	public List<ICIPDatasource> findAllByTypeAndOrganization(String type, String project) {
		return datasourceRepository.findAllByTypeAndOrganization(type, project);
	}

	@Override
	public ICIPDatasource savedatasource(ICIPDatasource datasource) {
		return datasourceRepository.save(datasource);
		// TODO Auto-generated method stub

	}

	@Override
	public Flux<BaseEntity> getObjectByIDTypeAndOrganization(String type, Integer id, String organization) {
		return Flux.just(datasourceRepository.findById((id)).get()).doOnError(err -> {
			logger.error(err.getLocalizedMessage());
		}).defaultIfEmpty(new ICIPDatasource()).map(s -> {
			BaseEntity entity = new BaseEntity();
			entity.setAlias(s.getAlias());
			entity.setData(new JSONObject(s).toString());
			entity.setDescription(s.getDescription());
			entity.setId(s.getId());
			entity.setType(TYPE);
			return entity;
		});

	}

	@Override
	public Flux<BaseEntity> getAllObjectsByOrganization(String organization, String search, Pageable page) {
		return Flux.fromIterable(datasourceRepository.findAllByOrganization(organization, search, page))
				.defaultIfEmpty(new ICIPDatasource()).parallel().map(s -> {
					BaseEntity entity = new BaseEntity();
					entity.setAlias(s.getAlias());
					entity.setData(new JSONObject(s).toString());
					entity.setDescription(s.getDescription());
					entity.setId(s.getId());
					entity.setType(TYPE);
					return entity;
				}).sequential();
	}

	@Override
	public String getType() {

		return TYPE;
	}

	@Override
	public List<String> getDatasourcesTypeByOrganization(String org) {
		return datasourceRepository.getDatasourcesTypeByOrganization(org);
	}

	@Override
	public ICIPDatasource getDatasourceByTypeAndAlias(String type, String alias, String organization) {
		return datasourceRepository.findByTypeAndAliasAndOrganization(type, alias, organization);
	}

	@Override
	public Boolean checkAlias(String alias, String org) {
		List<ICIPDatasource> iCIPDatasourceList = datasourceRepository.checkAlias(alias, org);
		if (iCIPDatasourceList == null || iCIPDatasourceList.isEmpty()) {
			return false;
		} else if (iCIPDatasourceList.size() > 0) {
			return true;
		} else {
			return false;
		}
	}

	public JsonObject export(Marker marker, String source, JSONArray modNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			joblogger.info(marker, "Exporting Datasources Started");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			List<ICIPDatasource> datasources = new ArrayList<>();
			modNames.forEach(alias -> {
				datasources.add(datasourceRepository.findAllByAliasAndOrganization(alias.toString(), source).get(0));
			});

//			List<ICIPDatasource> datasources = datasourceRepository.findByOrganization(source);;
			jsnObj.add("mldatasource", gson.toJsonTree(datasources));
			joblogger.info(marker, "Exported Datasources Successfully");
		} catch (Exception ex) {
			joblogger.error(marker, "Error in exporting Datasources");
			joblogger.error(marker, ex.getMessage());
		}
		return jsnObj;
	}

	public void importData(Marker marker, String target, JSONObject jsonObject) {
		Gson g = new Gson();
		try {
			joblogger.info(marker, "Importing Datasources Started");
			JsonArray datasources = g.fromJson(jsonObject.get("mldatasource").toString(), JsonArray.class);
			datasources.forEach(x -> {
				ICIPDatasource dsrc = g.fromJson(x, ICIPDatasource.class);
				if (dsrc != null) {
					ICIPDatasource dsrcPresent = datasourceRepository.findByNameAndOrganization(dsrc.getName(), target);
					dsrc.setOrganization(target);
					dsrc.setActivetime(new Timestamp(System.currentTimeMillis()));
					dsrc.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));
					dsrc.setLastmodifiedby(ICIPUtils.getUser(claim));
					dsrc.setId(null);

					try {
						if (dsrcPresent == null)
							datasourceRepository.save(dsrc);
					} catch (DataIntegrityViolationException de) {
						joblogger.error(marker, "Error in importing duplicate datasource {}", dsrc.getAlias());
					}
				}
			});
			joblogger.info(marker, "Imported Datasources Successfully");
		} catch (Exception ex) {
			joblogger.error(marker, "Error in importing Datasources");
			joblogger.error(marker, ex.getMessage());
		}
	}

	public List<ICIPDatasource> findByNameAndOrg(String name, String org) {
		return datasourceRepository.findByNameAndOrg(name, org);
	}

	public List<ICIPDatasoureNameAliasTypeDTO> getPromptsProviderByOrg(String org) {
		return datasourceRepository.getPromptsProviderByOrg(org);
	}

	public List<ICIPDatasource> getForEndpointConnectionsByOrg(String org) {
		return datasourceRepository.getForEndpointConnectionsByOrg(org);
	}

	@Override
	public ICIPDatasource findAllByAliasAndOrganization(String alias, String org) {
		return datasourceRepository.findAllByAliasAndOrganization(alias, org).get(0);
	}

	@Override
	public Page<ICIPDatasource> getDataSourceByOptionalParameters(String org, String type, String nameOrAlias,
			Pageable pageabl) {
		List<String> types = type != null ? Arrays.asList(type.split(",")) : null;
		return datasourceRepository.findDataSourceByOptionalParameters(org, types, nameOrAlias, pageabl);
	}

	@Override
	public Long getDataSourceCountByOptionalParameters(String org, String type, String nameOrAlias) {
		List<String> types = type != null ? Arrays.asList(type.split(",")) : null;
		return datasourceRepository.countByOptionalParameters(org, types, nameOrAlias);
	}
}
