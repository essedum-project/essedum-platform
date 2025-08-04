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

package com.infosys.icets.icip.icipwebeditor.service.impl;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.sql.Blob;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.sql.rowset.serial.SerialBlob;

import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.ssl.NoopHostnameVerifier;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactoryBuilder;
import org.apache.hc.core5.ssl.SSLContextBuilder;
import org.apache.hc.core5.ssl.TrustStrategy;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.google.gson.Gson;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.annotation.service.ConstantsService;
import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.NameEncoderService;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.repository.ICIPDatasourceRepository;
import com.infosys.icets.icip.icipwebeditor.job.enums.RuntimeType;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedRuntime;
import com.infosys.icets.icip.icipwebeditor.model.ICIPStreamingServices;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPStreamingServices2DTO;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPStreamingServices3DTO;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPMLFederatedRuntimeRepository;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPStreamingServicesRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPNativeScriptService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPStreamingServiceService;
import com.infosys.icets.icip.icipwebeditor.util.ICIPPageRequestByExample;
import com.infosys.icets.icip.icipwebeditor.util.ICIPPageResponse;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPStreamingServiceService.
 *
 * @author icets
 */
@Service
@Transactional
public class ICIPStreamingServiceService implements IICIPStreamingServiceService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPStreamingServiceService.class);

	/** The streaming services repository. */
	private ICIPStreamingServicesRepository streamingServicesRepository;

	/** The native script service. */
	private IICIPNativeScriptService nativeScriptService;

	/** The binary files service. */
	private ICIPBinaryFilesService binaryFilesService;

	/** The ncs. */
	private NameEncoderService ncs;

	@LeapProperty("icip.pipelineScript.directory")
	private String pipelineScriptPath;

	/** The environment. */
	private Environment environment;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	@Autowired
	private ConstantsService constantService;

	@Autowired
	private GitHubService githubservice;

	@Autowired
	private ConstantsService constantsService;

	@Autowired
	ICIPMLFederatedRuntimeRepository icipmlfedRuntimeRepository;
	
	@Autowired
	private ICIPDatasourceRepository icipDatasourceRepository;

	/** The rest template. */
	private RestTemplate restTemplate;

	/**
	 * Instantiates a new ICIP streaming service service.
	 *
	 * @param streamingServicesRepository the streaming services repository
	 * @param nativeScriptService         the native script service
	 * @param binaryFilesService          the binary files service
	 * @param ncs                         the ncs
	 * @throws KeyStoreException 
	 * @throws NoSuchAlgorithmException 
	 * @throws KeyManagementException 
	 */
	public ICIPStreamingServiceService(ICIPStreamingServicesRepository streamingServicesRepository,
			IICIPNativeScriptService nativeScriptService, ICIPBinaryFilesService binaryFilesService,
			NameEncoderService ncs, Environment environment) throws KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		super();
		this.streamingServicesRepository = streamingServicesRepository;
		this.nativeScriptService = nativeScriptService;
		this.binaryFilesService = binaryFilesService;
		this.ncs = ncs;
		this.environment = environment;
		this.restTemplate = getResttemplate();
	}

	/**
	 * Find one.
	 *
	 * @param id the id
	 * @return the ICIP streaming services
	 */
	public ICIPStreamingServices findOne(Integer id) {
		logger.info("Fetching streaming service by Id {}", id);
		return streamingServicesRepository.findById(id).orElse(null);
	}

	/**
	 * Gets the ICIP streaming services.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP streaming services
	 */
	public ICIPStreamingServices getICIPStreamingServices(String name, String org) {
		return streamingServicesRepository.findByNameAndOrganization(name, org);
	}

	public List<ICIPStreamingServices> getAllByOrganization(String org) {
		return streamingServicesRepository.getAllByOrganization(org);
	}

	public String getICIPStreamingServicesByAlias(String alias, String org) {
		String result = null;
		ICIPStreamingServices pipeline = streamingServicesRepository.findByAliasAndOrganization(alias, org);
		if (pipeline == null)
			pipeline = streamingServicesRepository.findByAliasAndOrganization(alias, "Core");
		if (pipeline != null)
			result = pipeline.getName();
		return result;
	}

	/**
	 * Gets the ICIP streaming services refactored.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP streaming services refactored
	 */
	public ICIPStreamingServices getICIPStreamingServicesRefactored(String name, String org) {
		return streamingServicesRepository.findByNameAndOrganization(name, org);
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
		List<NameAndAliasDTO> dsets = streamingServicesRepository.findByOrganization(fromProjectId);

		dsets.stream().forEach(ds -> {
			ICIPStreamingServices dsObj = streamingServicesRepository.findByName(ds.getName());
			dsObj.setOrganization(toProjectId);
			streamingServicesRepository.save(dsObj);
		});
		return true;
	}

	/**
	 * Save.
	 *
	 * @param streamingServices the streaming services
	 * @return the ICIP streaming services
	 */
	public ICIPStreamingServices save(ICIPStreamingServices streamingServices) {
		return save(streamingServices, logger, null);
	}

	/**
	 * Save.
	 *
	 * @param streamingServices the streaming services
	 * @param logger            the logger
	 * @param marker            the marker
	 * @return the ICIP streaming services
	 */
	public ICIPStreamingServices save(ICIPStreamingServices streamingServices, Logger logger, Marker marker) {
		logger.info(marker, "Saving streaming service {}", streamingServices.getAlias());
		if (streamingServices.getName() == null || streamingServices.getName().trim().isEmpty()) {
			boolean uniqueName = true;
			String name = null;
			do {
				name = ncs.nameEncoder(streamingServices.getOrganization(), streamingServices.getAlias());
				uniqueName = streamingServicesRepository.countByName(name) == 0;
				logger.info(name);
			} while (!uniqueName);
			streamingServices.setName(name);
		}
		streamingServices
				.setAlias(streamingServices.getAlias() != null && !streamingServices.getAlias().trim().isEmpty()
						? streamingServices.getAlias()
						: streamingServices.getName());
		return streamingServicesRepository.save(streamingServices);
	}

	/**
	 * Update.
	 *
	 * @param streamingServices the streaming services
	 * @return the ICIP streaming services
	 * @throws IOException
	 * @throws GitAPIException
	 * @throws TransportException
	 * @throws InvalidRemoteException
	 * @throws SQLException
	 */
	public ICIPStreamingServices update(ICIPStreamingServices streamingServices)
			throws InvalidRemoteException, TransportException, GitAPIException, IOException, SQLException {
		return update(streamingServices, logger, null);
	}

	/**
	 * Update.
	 *
	 * @param streamingServices the streaming services
	 * @param logger            the logger
	 * @param marker            the marker
	 * @return the ICIP streaming services
	 * @throws IOException
	 * @throws GitAPIException
	 * @throws TransportException
	 * @throws InvalidRemoteException
	 * @throws SQLException
	 */
	public ICIPStreamingServices update(ICIPStreamingServices streamingServices, Logger logger, Marker marker)
			throws InvalidRemoteException, TransportException, GitAPIException, IOException, SQLException {
		ICIPStreamingServices fetched = streamingServicesRepository.getOne(streamingServices.getCid());
		if (streamingServices.getDescription() != null)
			fetched.setDescription(streamingServices.getDescription());
		if (streamingServices.getJsonContent() != null)
			fetched.setJsonContent(streamingServices.getJsonContent());
		if (streamingServices.getJobId() != null)
			fetched.setJobId(streamingServices.getJobId());
		if (streamingServices.getLastmodifiedby() != null)
			fetched.setLastmodifiedby(streamingServices.getLastmodifiedby());
		if (streamingServices.getType() != null)
			fetched.setType(streamingServices.getType());
		if (streamingServices.getPipelineMetadata() != null)
			fetched.setPipelineMetadata(streamingServices.getPipelineMetadata());
		if (fetched.getVersion() != null)
			fetched.setVersion(fetched.getVersion() + 1);
		else
			fetched.setVersion(0);
		fetched.setInterfacetype(streamingServices.getInterfacetype());
		fetched.setLastmodifieddate(streamingServices.getLastmodifieddate());
		fetched.setLastmodifiedby(streamingServices.getLastmodifiedby());
		fetched.setAlias(streamingServices.getAlias());
		fetched.setTags(streamingServices.getTags());
		fetched.setTemplate(streamingServices.isTemplate());
		fetched.setApp(streamingServices.isApp());
		logger.info(marker, "Updating streaming service {}", fetched.getName());

		String remoteScript = null;
		try {
			remoteScript = constantsService.getByKeys("icip.script.github.enabled", streamingServices.getOrganization())
					.getValue();
		} catch (NullPointerException ex) {
			remoteScript = "false";
		} catch (Exception ex) {
			logger.error(ex.getMessage());
		}

		if (remoteScript.equals("true")) {
			Git git = githubservice.getGitHubRepository(streamingServices.getOrganization());
			Boolean result = githubservice.pull(git);
			if (result != false) {
				byte[] jsonbytes = streamingServices.getJsonContent().getBytes();
				Blob blob = new SerialBlob(jsonbytes);
				githubservice.updateFileInLocalRepo(blob, streamingServices.getName(),
						streamingServices.getOrganization(), "pipeline.json");

				githubservice.push(git, "Script pushed");

			}

		}

		return streamingServicesRepository.save(fetched);
	}

	/**
	 * Delete.
	 *
	 * @param id the id
	 * @throws GitAPIException
	 * @throws SQLException
	 * @throws IOException
	 * @throws TransportException
	 * @throws InvalidRemoteException
	 */
	@Transactional
	public void delete(Integer id)
			throws InvalidRemoteException, TransportException, IOException, SQLException, GitAPIException {
		ICIPStreamingServices fetched = findOne(id);
		
		Optional<ICIPMLFederatedRuntime> icipFederatedRuntime =icipmlfedRuntimeRepository.findByPipelineid(id);
		
		if(icipFederatedRuntime.isPresent()) {
			ICIPMLFederatedRuntime fedruntime = icipFederatedRuntime.get();
			fedruntime.setIsAssigned(false);
			fedruntime.setPipelineid(null);
			
			icipmlfedRuntimeRepository.save(fedruntime);
			}
		if (fetched.getType().equalsIgnoreCase("Binary") || fetched.getType().equalsIgnoreCase("NativeScript")) {
			deleteEntityEntries(fetched);
		}
		else {
			deleteScript(fetched);
		}
		streamingServicesRepository.deleteById(id);
		logger.info("Deleting streaming service by Id {}", id);
	}

	/**
	 * Delete entity entries.
	 *
	 * @param fetched the fetched
	 * @throws GitAPIException
	 * @throws SQLException
	 * @throws IOException
	 * @throws TransportException
	 * @throws InvalidRemoteException
	 */
	private void deleteEntityEntries(ICIPStreamingServices fetched)
			throws InvalidRemoteException, TransportException, IOException, SQLException, GitAPIException {
		RuntimeType type = RuntimeType.valueOf(fetched.getType().toUpperCase());
		if (type.equals(RuntimeType.BINARY)) {
			binaryFilesService.deleteByNameAndOrg(fetched.getName(), fetched.getOrganization());
		}
		if (type.equals(RuntimeType.NATIVESCRIPT)) {
			nativeScriptService.deleteByNameAndOrg(fetched.getName(), fetched.getOrganization());
			if (fetched.getJsonContent() != null && !fetched.getJsonContent().isEmpty())
				deleteVirtualEnvironment(fetched);
		}
	}
	
	private void deleteVirtualEnvironment(ICIPStreamingServices fetched) {
		try {
			JSONObject json_content = new JSONObject(fetched.getJsonContent());
			JSONObject json_content1 = json_content.getJSONObject("default_runtime");
			if (json_content1 != null) {
				String dsName = json_content1.getString("dsName");
				ICIPDatasource iCIPDatasource = icipDatasourceRepository.findByNameAndOrganization(dsName,
						fetched.getOrganization());
				JSONObject connectionObj = new JSONObject(iCIPDatasource.getConnectionDetails());
				String url = connectionObj.getString("Url");
				String host = url;
				try {
					java.net.URL urlObj = new java.net.URL(url);
					host = urlObj.getProtocol() + "://" + urlObj.getHost();
					if (urlObj.getPort() != -1) {
						host += ":" + urlObj.getPort();
					}
				} catch (java.net.MalformedURLException e) {
					logger.warn("Invalid URL format: {}, using original URL", url);
					int pathStartIndex = url.indexOf("/", 8);
					if (pathStartIndex != -1) {
						host = url.substring(0, pathStartIndex);
					}
				}
				String deleteApiUrl = host + "/venvs";
				JSONArray requestBody = new JSONArray();
				requestBody.put("script_venv_" + fetched.getName());
				try {
					HttpHeaders headers = new HttpHeaders();
					headers.setContentType(MediaType.APPLICATION_JSON);
					HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);
					ResponseEntity<String> response = restTemplate.exchange(deleteApiUrl, HttpMethod.DELETE, entity,
							String.class);

					if (response.getStatusCode().is2xxSuccessful()) {
						logger.info("Successfully deleted virtual environment: script_venv_{}", fetched.getName());
					} else {
						logger.warn("Failed to delete virtual environment. Status: {}", response.getStatusCode());
					}

				} catch (Exception e) {
					logger.error("Error occurred while deleting virtual environment: {}", e.getMessage(), e);
				}
			}
		} catch (Exception exp) {
			logger.error("Error occurred while deleting virtual environment: {}", exp.getMessage(), exp);
		}
	}

	private RestTemplate getResttemplate() throws NoSuchAlgorithmException, KeyManagementException, KeyStoreException {
		TrustStrategy acceptingTrustStrategy = (X509Certificate[] chain, String authType) -> true;
		CloseableHttpClient httpClient = HttpClients.custom()
				.setConnectionManager(PoolingHttpClientConnectionManagerBuilder.create()
						.setSSLSocketFactory(SSLConnectionSocketFactoryBuilder.create()
								.setSslContext(
										SSLContextBuilder.create().loadTrustMaterial(acceptingTrustStrategy).build())
								.setHostnameVerifier(NoopHostnameVerifier.INSTANCE).build())
						.build())
				.build();
		HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
		requestFactory.setHttpClient(httpClient);
		return new RestTemplate(requestFactory);
	}

	/**
	 * Gets the streaming services.
	 *
	 * @param streamingServices the streaming services
	 * @return the streaming services
	 */
	public ICIPStreamingServices getStreamingServices(ICIPStreamingServices streamingServices) {
		logger.info("Fetching streaming services {}", streamingServices.getName());
		Example<ICIPStreamingServices> example = null;
		streamingServices.setDeleted(false);
		streamingServices.setCreatedDate(null);
		streamingServices.setLastmodifieddate(null);
//		ExampleMatcher matcher = ExampleMatcher.matching().withMatcher("name", match -> match.ignoreCase().exact())
//				.withMatcher("organization", match -> match.ignoreCase().exact())
//				.withMatcher("deleted", match -> match.ignoreCase().exact());
//
//		example = Example.of(streamingServices, matcher);
//		System.out.println("example----->");
//		logger.info(example.toString());
//		Optional<ICIPStreamingServices> optionalStreamingService = streamingServicesRepository.findOne(example);
		Optional<ICIPStreamingServices> optionalStreamingService = streamingServicesRepository
				.findByNameAndOrganizationAndDeleted(streamingServices.getName(), streamingServices.getOrganization(),
						streamingServices.isDeleted());
		logger.info(optionalStreamingService.toString());
		if (optionalStreamingService.isPresent()) {
			streamingServices = optionalStreamingService.get();
			logger.info("inside optional match");
			logger.info(streamingServices.toString());
		}
		return streamingServices;
	}

	/**
	 * Find by organization.
	 *
	 * @param fromProjectId the from project id
	 * @return the list
	 */
	@Override
	public List<NameAndAliasDTO> findByOrganization(String fromProjectId) {
		return streamingServicesRepository.findByOrganization(fromProjectId);
	}

	@Override
	public List<NameAndAliasDTO> findByInterfacetypeAndOrganization(String template, String fromProjectId) {
		// TODO Auto-generated method stub
		return streamingServicesRepository.findByInterfacetypeAndOrganization(template, fromProjectId);
	}

	/**
	 * Copy.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	@Override
	public boolean copy(String fromProjectId, String toProjectId) {
		logger.info("Fetching jobs for Entity {}", fromProjectId);
		List<NameAndAliasDTO> icGrps = streamingServicesRepository.findByOrganization(fromProjectId);
		icGrps.stream().forEach(grp -> {
			ICIPStreamingServices grpObj = streamingServicesRepository.findByName(grp.getName());
			grpObj.setCid(null);
			grpObj.setOrganization(toProjectId);
			streamingServicesRepository.save(grpObj);
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
		streamingServicesRepository.deleteByProject(project);
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
		return streamingServicesRepository.getNameAndAlias(group, org);
	}

	/**
	 * Gets the all.
	 *
	 * @param req the req
	 * @return the all
	 */
	@Override
	public ICIPPageResponse<ICIPStreamingServices2DTO> getAll(ICIPPageRequestByExample<ICIPStreamingServices2DTO> req) {
		logger.debug("Getting all streaming services");
		Example<ICIPStreamingServices> example = null;
		ICIPStreamingServices streamingServices = ICIPUtils.getModelMapper().map(req.getExample(),
				ICIPStreamingServices.class);
		if (streamingServices != null) {
			ExampleMatcher matcher = ExampleMatcher.matching().withMatcher("name", match -> match.ignoreCase().exact())
					.withMatcher("deleted", match -> match.ignoreCase().exact())
					.withMatcher("organization", match -> match.ignoreCase().exact());
			example = Example.of(streamingServices, matcher);
		}

		Page<ICIPStreamingServices2DTO> page;
		if (example != null) {
			page = streamingServicesRepository.findBy(example, req.toPageable());
		} else {
			page = streamingServicesRepository.findBy(req.toPageable());
		}

		return new ICIPPageResponse<>(page.getTotalPages(), page.getTotalElements() != 0 ? page.getTotalElements() : 2,
				page.getContent());
	}

	/**
	 * Gets the all pipelines.
	 *
	 * @return the all pipelines
	 */
	@Override
	public List<ICIPStreamingServices2DTO> getAllPipelines() {
		logger.debug("Getting all pipelines");
		return streamingServicesRepository.findBy();
	}

	/**
	 * Gets the all pipelines by org.
	 *
	 * @param org the org
	 * @return the all pipelines by org
	 */
	@Override
	public List<ICIPStreamingServices2DTO> getAllPipelinesByOrg(String org) {
		logger.debug("Getting all pipelines by organization");
		return streamingServicesRepository.getByOrganization(org);
	}

	/**
	 * Gets the all pipelines by type.
	 *
	 * @param type the type
	 * @param org  the org
	 * @return the all pipelines by type
	 */
	@Override
	public List<ICIPStreamingServices2DTO> getAllPipelinesByType(String type, String org, String interfacetype) {
		logger.debug("Getting all pipelines by type : {} and organization : {}", type, org);
		return streamingServicesRepository.getByTypeAndOrganizationAndInterfacetype(type, org, interfacetype);
	}

	@Override
	public List<ICIPStreamingServices2DTO> getAllPipelinesByInterfacetype(String interfacetype, String org) {
		logger.debug("Getting all pipelines by interfacetype : {} and organization : {}", interfacetype, org);
		return streamingServicesRepository.getByInterfacetypeAndOrganization(interfacetype, org);
	}

	/**
	 * Gets the streaming services by group and org.
	 *
	 * @param groupName    the group name
	 * @param organization the organization
	 * @param page         the page
	 * @param size         the size
	 * @return the streaming services by group and org
	 */
	@Override
	public List<ICIPStreamingServices3DTO> getStreamingServicesByGroupAndOrg(String groupName, String organization,
			int page, int size) {
		logger.debug("Getting all streaming services By Group : {} and Org : {}", groupName, organization);
		return streamingServicesRepository.ssgjResult(groupName, organization, PageRequest.of(page, size));
	}

	@Override
	public List<ICIPStreamingServices3DTO> getStreamingServicesByGroupAndOrgAndTemplate(String groupName,
			String organization, String interfacetype, int page, int size) {
		logger.debug("Getting all streaming services By Group : {} and Org : {}", groupName, organization);
		return streamingServicesRepository.ssgjTemplateResult(groupName, organization, interfacetype,
				PageRequest.of(page, size));
	}

	/**
	 * Gets the streaming services len by group and org.
	 *
	 * @param groupName    the group name
	 * @param organization the organization
	 * @return the streaming services len by group and org
	 */
	@Override
	public Long getStreamingServicesLenByGroupAndOrg(String groupName, String organization) {
		logger.debug("Getting streaming services length By Group : {} and Org : {}", groupName, organization);
		return streamingServicesRepository.ssgjResultLen(groupName, organization);
	}

	/**
	 * Gets the streaming services by group and org and search.
	 *
	 * @param groupName    the group name
	 * @param organization the organization
	 * @param search       the search
	 * @param page         the page
	 * @param size         the size
	 * @return the streaming services by group and org and search
	 */
	@Override
	public List<ICIPStreamingServices3DTO> getStreamingServicesByGroupAndOrgAndSearch(String groupName,
			String organization, String search, int page, int size) {
		logger.debug("Getting all streaming services By Group : {} and Org : {} and Search : {}", groupName,
				organization, search);
		return streamingServicesRepository.ssgjSearchResult(groupName, organization, search,
				PageRequest.of(page, size));
	}

	/**
	 * Gets the streaming services len by group and org and search.
	 *
	 * @param groupName    the group name
	 * @param organization the organization
	 * @param search       the search
	 * @return the streaming services len by group and org and search
	 */
	@Override
	public Long getStreamingServicesLenByGroupAndOrgAndSearch(String groupName, String organization, String search) {
		logger.debug("Getting streaming services length By Group : {} and Org : {} and Search : {}", groupName,
				organization, search);
		return streamingServicesRepository.ssgjSearchResultLen(groupName, organization, search);
	}

	/**
	 * Gets the all pipeline names by org.
	 *
	 * @param org the org
	 * @return the all pipeline names by org
	 */
	@Override
	public List<NameAndAliasDTO> getAllPipelineNamesByOrg(String org) {
		return streamingServicesRepository.findByOrganization(org);
	}

	@Override
	public String savePipelineJson(String name, String org, String pipelineJsonUnresolved) {

//		Files.createDirectories(path);
//		byte[] strToBytes = pipelineJson.getBytes();
//		Files.write(path, strToBytes);
//		JsonObject jsonObject = new JsonObject();
//		jsonObject.addProperty(JobConstants.RESTNODEID, id);
//		jsonObject.addProperty(IAIJobConstants.RESTNODEFILE, path.toAbsolutePath().toString());
//		return jsonObject;

		String pipelineJson = resolvePipelineJson(pipelineJsonUnresolved, org);

		FileOutputStream outputStream = null;
		String path = Paths.get(pipelineScriptPath, org + '/' + name).toString() + "/pipeline.json";
		try {
			Files.createDirectories(Paths.get(pipelineScriptPath, org + '/' + name));
			File fileObj = new File(path);
			if (!fileObj.exists())
				fileObj.createNewFile();
			logger.info("File created: " + fileObj.getName());
			outputStream = new FileOutputStream(path);
			byte[] strToBytes = pipelineJson.getBytes();
			outputStream.write(strToBytes);

		} catch (IOException e) {
			logger.error("An error occurred.");
		} finally {

			if (outputStream != null) {
				try {
					outputStream.close();
				} catch (IOException e) {
					logger.error(e.getMessage());
				}
			}
		}
		return pipelineScriptPath + org + '/' + name;

	}

	public String resolvePipelineJson(String pipelineJson, String organization) {
		// TODO Auto-generated method stub

		// resolving project name
		String keyword = "@projectname";
		String org = organization;
		pipelineJson = pipelineJson.replace(keyword, org);

		// resolving username
		String userKeyword = "@username";
		String userValue = "'" + ICIPUtils.getUser(claim) + "'";
		pipelineJson = pipelineJson.replace(userKeyword, userValue);
		// resolving datasource variables
		String keyword1 = "@datasourceurl";
		String key1 = "icip.dsurl";
		String keyword2 = "@datasourceuser";
		String key2 = "icip.dsuser";
		String keyword3 = "@datasourcepass";
		String key3 = "icip.dspass";
		pipelineJson = pipelineJson.replace(keyword1, getKeyValue(key1, org));
		pipelineJson = pipelineJson.replace(keyword2, getKeyValue(key2, org));
		pipelineJson = pipelineJson.replace(keyword3, getKeyValue(key3, org));

		return pipelineJson;
	}

	private String getKeyValue(String key, String org) {
		String variable;
		String value = constantService.findByKeys(key, org);
		if (value.trim().isEmpty()) {
			variable = environment.getProperty(key);
		} else {
			variable = value;
		}
		if (variable == null) {
			variable = "NOT_FOUND";
		}
		return variable;
	}

	/**
	 * Gets the all pipelines by type and group.
	 *
	 * @param type   the type
	 * @param org    the org
	 * @param group  the group
	 * @param search the search
	 * @return the all pipelines by type and group
	 */
	@Override
	public List<ICIPStreamingServices2DTO> getAllPipelinesByTypeAndGroup(String type, String org, String group,
			String search) {
		return streamingServicesRepository.getAllPipelinesByTypeAndGroup(type, org, group, search);
	}

	@Override
	public ICIPStreamingServices findbyNameAndOrganization(String name, String org) {

		return streamingServicesRepository.findByNameAndOrganization(name, org);
	}

	@Override
	public JSONObject getGeneratedScript(String name, String org) {
		try {
			Path path = Paths.get(pipelineScriptPath, org + '/' + name, name + "_generatedCode.py");
			JSONObject obj = new JSONObject();
			obj.append("script", ICIPUtils.readFile(path));
			obj.append("lastmodified", new File(path.toString()).lastModified());
			return obj;
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return null;
		}
	}

	@Override
	public List<String> getPipelinesTypeByOrganization(String org) {
		return streamingServicesRepository.getPipelinesTypeByOrganization(org);
	}

	@Override
	public List<ICIPStreamingServices2DTO> getAllPipelinesByTypeAndOrg(String project, Pageable paginate, String query,
			List<Integer> tags, String orderBy, String type, String interfacetype) {
		// TODO Auto-generated method stub
//		String typeliststring = "(";

		List<String> typeList = new ArrayList();
		if (type != null) {
			typeList = Arrays.asList(type.split(","));
		}
		if (typeList.size() < 1 || type.equals("undefined")) {
//			typeList.add("notRequired");
			type = "notRequired";
		}
//		else {
//			for (String i : typeList) {
//				typeliststring = typeliststring +"'" +i + "'"+",";
//			}
//			
//			type = typeliststring.substring(0, typeliststring.length() - 1)+")";
//		}
		List<String> projectList = new ArrayList();
		if (project.contains("Core,")) {
			projectList = Arrays.asList(project.split(","));
		} else {
			projectList.add(project);
		}
		List<ICIPStreamingServices2DTO> dtoList = new ArrayList<>();

		if (tags != null) {
			if (interfacetype.equalsIgnoreCase("App")) {
				dtoList = streamingServicesRepository.getAllPipelinesByTypeandOrgWithTagForApp(projectList, paginate,
						query, tags, type, interfacetype);
			} else {
				dtoList = streamingServicesRepository.getAllPipelinesByTypeandOrgWithTag(projectList, paginate, query,
						tags, type, interfacetype);
			}

		} else {
			if (interfacetype.equalsIgnoreCase("App")) {
				dtoList = streamingServicesRepository.getAllPipelinesByTypeandOrgForApps(projectList, paginate, query,
						type, interfacetype);
			} else {
				dtoList = streamingServicesRepository.getAllPipelinesByTypeandOrg(projectList, paginate, query, type,
						interfacetype);
			}
		}
		return dtoList;
	}

	@Override
	public List<ICIPStreamingServices2DTO> getAllTemplatesByTypeAndOrg(String project, Pageable paginate, String query,
			String orderBy, String type) {
		// TODO Auto-generated method stub
		String typeliststring = "(";

		List<String> typeList = new ArrayList();
		if (type != null) {
			typeList = Arrays.asList(type.split(","));
		}
		if (typeList.size() < 1 || type.equals("undefined")) {
//			typeList.add("notRequired");
			type = "notRequired";
		}
//		else {
//			for (String i : typeList) {
//				typeliststring = typeliststring +"'" +i + "'"+",";
//			}
//			
//			type = typeliststring.substring(0, typeliststring.length() - 1)+")";
//		}
		List<ICIPStreamingServices2DTO> dtoList = streamingServicesRepository.getAllTemplatesByTypeandOrg(project,
				paginate, query, type);
		return dtoList;
	}

	@Override
	public Long getPipelinesCountByTypeAndOrg(String project, String query, List<Integer> tags, String orderBy,
			String type, String interfacetype) {
		// TODO Auto-generated method stub
//		String typeliststring = "(";

		List<String> typeList = new ArrayList();
		if (type != null) {
			typeList = Arrays.asList(type.split(","));
		}
		if (typeList.size() < 1 || type.equals("undefined")) {

			type = "notRequired";
		}
		List<String> projectList = new ArrayList();
		if (project.contains("Core,")) {
			projectList = Arrays.asList(project.split(","));
		} else {
			projectList.add(project);
		}

		Long count;
		if (tags != null) {
			if (interfacetype.equalsIgnoreCase("App")) {
				count = streamingServicesRepository.getPipelinesCountByTypeandOrgWithTagForApps(projectList, query,
						tags, type, interfacetype);

			} else {
				count = streamingServicesRepository.getPipelinesCountByTypeandOrgWithTag(projectList, query, tags, type,
						interfacetype);
			}

		} else {
			if (interfacetype.equalsIgnoreCase("App")) {
				count = streamingServicesRepository.getPipelinesCountByTypeandOrgForApps(projectList, query, type,
						interfacetype);

			} else {
				count = streamingServicesRepository.getPipelinesCountByTypeandOrg(projectList, query, type,
						interfacetype);
			}
		}

		return count;
	}

	@Override
	public Long getTemplatesCountByTypeAndOrg(String project, String query, String orderBy, String type) {
		// TODO Auto-generated method stub
//		String typeliststring = "(";

		List<String> typeList = new ArrayList();
		if (type != null) {
			typeList = Arrays.asList(type.split(","));
		}
		if (typeList.size() < 1 || type.equals("undefined")) {
//			typeList.add("notRequired");
			type = "notRequired";
		}
//		else {
//			for (String i : typeList) {
//				typeliststring = typeliststring +"'" +i + "'"+",";
//			}
//			
//			type = typeliststring.substring(0, typeliststring.length() - 1)+")";
//		}
		Long count = streamingServicesRepository.getTemplatesCountByTypeandOrg(project, query, type);
		return count;
	}

	@Override
	public ICIPStreamingServices getTemplateByName(String name, String org) {
		return streamingServicesRepository.getTemplateByName(name, org);
	}

	public List<ICIPStreamingServices> getPipelinesByAliasAndOrg(String alias, String org) {
		logger.info(alias + "--->" + org);
		List<ICIPStreamingServices> pipelinelist = streamingServicesRepository.getByAliasAndOrganization(alias, org);
		logger.info(pipelinelist.toString());
		return pipelinelist;
	}

	@Override
	public JSONObject getAllScripts(String name, String org) {
		try {
			List<Path> filesInFolder = Files.walk(Paths.get(pipelineScriptPath, org + "/" + name))
					.filter(Files::isRegularFile).collect(Collectors.toList());
			JSONObject obj = new JSONObject();
			for (int i = 0; i < filesInFolder.size(); i++) {
				Path path = filesInFolder.get(i);
				int filesLength = path.toString().split("\\\\").length;
				logger.info("file in Folder");
				logger.info(path.toString().split("\\\\")[filesLength - 1]);
				obj.append("fileNames", path.toString().split("\\\\")[filesLength - 1]);
				obj.append("script", ICIPUtils.readFile(path));
			}
			return obj;
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return null;
		}
	}

	@Override
	public List<ICIPStreamingServices2DTO> getPipelineByNameAndOrg(String name, String org) {
		List<ICIPStreamingServices2DTO> dtoList = new ArrayList<>();
		dtoList = streamingServicesRepository.getPipelineByNameAndOrg(name, org);
		return dtoList;
	}

	public void deleteScript(ICIPStreamingServices fetched)
			throws IOException, SQLException, InvalidRemoteException, TransportException, GitAPIException {
		logger.info("deleting pipeline Script : ", fetched.getAlias());
		String remoteScript = null;
		try {
			remoteScript = constantsService.getByKeys("icip.script.github.enabled", fetched.getOrganization())
					.getValue();
		} catch (NullPointerException ex) {
			remoteScript = "false";
		} catch (Exception ex) {
			logger.error(ex.getMessage());
		}

		if (remoteScript.equals("true")) {
			Git git = githubservice.getGitHubRepository(fetched.getOrganization());

			Boolean result = githubservice.pull(git);

			githubservice.deleteFileFromLocalRepo(git, fetched.getName(), fetched.getOrganization());

			if (result == true) {
				githubservice.push(git, "Pipeline script deleted : " + fetched.getName());
				logger.info("Successfully deleted script from Git");
			}

		}
	}

}
