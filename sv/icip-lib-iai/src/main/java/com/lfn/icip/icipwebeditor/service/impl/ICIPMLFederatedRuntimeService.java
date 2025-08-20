package com.lfn.icip.icipwebeditor.service.impl;

import java.io.IOException;
import java.net.URL;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.repository.ICIPDatasourceRepository;
import com.lfn.icip.icipwebeditor.exception.NoUnassignedPortFoundException;
import com.lfn.icip.icipwebeditor.exception.ResourceNotFoundException;
import com.lfn.icip.icipwebeditor.exception.RuntimeListNotFoundException;
import com.lfn.icip.icipwebeditor.exception.RuntimeNotAssignedException;
import com.lfn.icip.icipwebeditor.exception.RuntimePortsNotSavedException;
import com.lfn.icip.icipwebeditor.model.AssignRuntime;
import com.lfn.icip.icipwebeditor.model.ICIPApps;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedRuntime;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedRuntimeModel;
import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;
import com.lfn.icip.icipwebeditor.model.PortPayload;
import com.lfn.icip.icipwebeditor.model.ValidatePorts;
import com.lfn.icip.icipwebeditor.model.dto.ICIPRuntimeParams;
import com.lfn.icip.icipwebeditor.repository.ICIPAppsRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedRuntimeRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPStreamingServicesRepository;

import java.util.Optional;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.extern.log4j.Log4j2;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import org.springframework.data.domain.Page;

@Log4j2
@Service
public class ICIPMLFederatedRuntimeService {

	/** The logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPMLFederatedRuntimeService.class);

	@Value("${port_automation_app_url}")
	private String port_automation_app_url;

	@EssedumProperty("icip.certificateCheck")
	private String certificateCheck;

	@Autowired
	private ICIPMLFederatedRuntimeRepository icipMlFederatedRuntimeRepository;

	@Autowired
	private ICIPDatasourceRepository icipDatasourceRepository;

	@Autowired
	private ICIPAppsRepository appsRepository;

	@Autowired
	private ICIPStreamingServicesRepository streamingServicesRepository;

	public ICIPMLFederatedRuntime runtimeConfiguration(Integer id) {
		return icipMlFederatedRuntimeRepository.findById(id).get();
	}

	public Page<ICIPMLFederatedRuntime> getSortedPaginatedRuntime(Pageable pageable) {
		return icipMlFederatedRuntimeRepository.findAll(pageable);
	}

	public List<ICIPMLFederatedRuntime> getRuntimeList() {
		List<ICIPMLFederatedRuntime> runtimeList = null;
		try {
			runtimeList = icipMlFederatedRuntimeRepository.findAll();
		} catch (NullPointerException ex) {
			throw new NullPointerException(ex.getMessage());
		} catch (Exception ex) {
			throw new RuntimeListNotFoundException("There is no List from Runtimes");
		}

		return runtimeList;
	}

	@Transactional
	public void editPortforDatas(ICIPRuntimeParams runtimeParams, PortPayload portPayload) throws Exception {
		List<ICIPMLFederatedRuntime> lstOfPortsAssigned = icipMlFederatedRuntimeRepository
				.findByConnid(runtimeParams.getConnectionId())
				.orElseThrow(() -> new ResourceNotFoundException("Error in fetchin by connid"));
		java.util.Set<Integer> setOfNonDeleted = new HashSet<>();

		for (ICIPMLFederatedRuntime federatedRuntime : lstOfPortsAssigned) {
			if (!federatedRuntime.getIsAssigned()) {
				deletePortFromNginxConf(federatedRuntime.getConnport(), federatedRuntime.getConnendpoint());
				icipMlFederatedRuntimeRepository.delete(federatedRuntime);

			} else
				setOfNonDeleted.add(federatedRuntime.getConnport());
		}
		String availablePortsResponse = checkAvailablePorts(runtimeParams.getPortStartRange(),
				runtimeParams.getPortEndRange());
		JSONArray available_portsJSON = new JSONObject(availablePortsResponse).getJSONArray("available_ports");
		List<Integer> available_ports = new ArrayList<>();
		for (int i = 0; i < available_portsJSON.length(); i++) {
			int port = available_portsJSON.getInt(i);
			if (!setOfNonDeleted.contains(port))
				available_ports.add(port);
		}
		ICIPMLFederatedRuntime runtime = new ICIPMLFederatedRuntime();
		int range = runtimeParams.getPortEndRange() - runtimeParams.getPortStartRange() + 1;
		Integer startPortRange = runtimeParams.getPortStartRange();
		Integer exiStartPortRange = runtimeParams.getExiportStartRange();
		List<String> list = new ArrayList<>();
		logger.info("Available ports : {}", available_ports);
		// Integer startPortRange = runtimeParams.getPortStartRange();

		try {
			for (Integer port : available_ports) {
				ICIPMLFederatedRuntime runtimeOrg = new ICIPMLFederatedRuntime();
				runtimeOrg.setAppid(runtime.getAppid());

				ICIPDatasource ds = icipDatasourceRepository.findByIdAndOrganization(runtimeParams.getConnectionId(),
						runtimeParams.getOrganization());
				JSONObject dsJson = new JSONObject(ds.getConnectionDetails());
				String url = dsJson.optString("Url");
				// Define the regex pattern to match the base URL without port number

				String regex = "(http[s]?://[^:/]+)(:.*)?(/execute)";
				Pattern pattern = Pattern.compile(regex);
				Matcher matcher = pattern.matcher(url);
				String extractedBaseUrl = null;
				if (matcher.find()) {
					extractedBaseUrl = matcher.group(1); // Group 1 is the base URL without port

				} else {
					extractedBaseUrl = url;
				}
				String baseUrl = null;

				baseUrl = extractedBaseUrl + ":" + port;
				String randomaddress = UUID.randomUUID().toString();
				String connectionEndPoint = triggerProxyConfig2(baseUrl, randomaddress);
				JSONObject connEndPoint = new JSONObject(connectionEndPoint);
				String endpointId = connEndPoint.getString("finaladdress");
				System.out.println(extractedBaseUrl);

				if (exiStartPortRange != null)
					runtimeOrg.setExiPorts(exiStartPortRange++);

				runtimeOrg.setIcipApps(runtime.getIcipApps());
				runtimeOrg.setIcipDataSource(ds);
				runtimeOrg.setIcipStreamingServices(runtime.getIcipStreamingServices());
				runtimeOrg.setIsAssigned(portPayload.isAssigned());
				runtimeOrg.setPipelineid(runtime.getPipelineid());
				runtimeOrg.setConnid(runtimeParams.getConnectionId());
				runtimeOrg.setConnendpoint(endpointId);
				runtimeOrg.setConnport(port);
				if (portPayload.isExiPort())
					runtimeOrg.setIsEXIPorts(portPayload.isExiPort());

				runtimeOrg.setIsDefaultPorts(portPayload.isDefaultPort());
				ICIPMLFederatedRuntime dbsaved = icipMlFederatedRuntimeRepository.save(runtimeOrg);
				String json = String.format("{\"endpointId\": \"%s\", \"port\": \"%s\"}", endpointId, port);
				list.add(json);

			}

		} catch (NullPointerException ex) {
			throw new NullPointerException(ex.getMessage());
		} catch (Exception ex) {
			throw new RuntimePortsNotSavedException(ex.getMessage());
		}
		try {
			if (list.isEmpty() == false) {
				for (String s : list) {
					updateRoutes(s);
				}
			}

		} catch (Exception ex) {
			throw new Exception("Ports are not Mapped to the file : " + ex.getMessage());
		}

	}

	private String deletePortFromNginxConf(Integer connport, String connendpoint) {
		// TODO Auto-generated method stub
		String jsonBody = String.format("{\"port\": \"%s\", \"Url_Port\": \"%s\"}", connport, connendpoint);
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		// Create OkHttp client
		OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
		newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
		newBuilder.hostnameVerifier((hostname, session) -> true);
		OkHttpClient client = newBuilder.build();

		// Create RequestBody
		okhttp3.MediaType mediaType = okhttp3.MediaType.parse("application/json");
		okhttp3.RequestBody body = okhttp3.RequestBody.create(mediaType, jsonBody);

		// Create request for updating Nginx configuration
		Request requestUpdate = new Request.Builder().url(port_automation_app_url + "/delete_ServerFromNginx")
				.post(body) // Change
				// method
				// to
				// POST
				.build();

		try (Response responseUpdate = client.newCall(requestUpdate).execute()) {
			String responseBody = responseUpdate.body().string();
			// Check if the response was successful
			if (!responseUpdate.isSuccessful()) {
				return responseBody;
			}
			return responseBody;
		} catch (IOException e) {
			e.printStackTrace();
			return "Error";
		}
	}

	@Transactional
	public void addPorts(ICIPRuntimeParams runtimeParams, PortPayload portPayload) throws Exception {

		ICIPMLFederatedRuntime runtime = new ICIPMLFederatedRuntime();
		// int range = runtimeParams.getPortEndRange() -
		// runtimeParams.getPortStartRange() + 1;
		String availablePortsResponse = checkAvailablePorts(runtimeParams.getPortStartRange(),
				runtimeParams.getPortEndRange());
		JSONArray available_portsJSON = new JSONObject(availablePortsResponse).getJSONArray("available_ports");
		List<Integer> available_ports = new ArrayList<>();
		for (int i = 0; i < available_portsJSON.length(); i++) {
			int port = available_portsJSON.getInt(i);
			available_ports.add(port);
		}
		logger.info("Available ports : {}", available_ports);
		// Integer startPortRange = runtimeParams.getPortStartRange();
		Integer exiStartPortRange = runtimeParams.getExiportStartRange();
		List<String> list = new ArrayList<>();

		try {
			for (Integer port : available_ports) {
				ICIPMLFederatedRuntime runtimeOrg = new ICIPMLFederatedRuntime();
				runtimeOrg.setAppid(runtime.getAppid());

				ICIPDatasource ds = icipDatasourceRepository.findByIdAndOrganization(runtimeParams.getConnectionId(),
						runtimeParams.getOrganization());
				JSONObject dsJson = new JSONObject(ds.getConnectionDetails());
				String url = dsJson.optString("Url");
				// Define the regex pattern to match the base URL without port number

				String regex = "(http[s]?://[^:/]+)(:.*)?(/execute)";
				Pattern pattern = Pattern.compile(regex);
				Matcher matcher = pattern.matcher(url);
				String extractedBaseUrl = null;
				if (matcher.find()) {
					extractedBaseUrl = matcher.group(1); // Group 1 is the base URL without port

				} else {
					extractedBaseUrl = url;
				}
				String baseUrl = null;

				baseUrl = extractedBaseUrl + ":" + port;
				String randomaddress = UUID.randomUUID().toString();
				String connectionEndPoint = triggerProxyConfig2(baseUrl, randomaddress);
				JSONObject connEndPoint = new JSONObject(connectionEndPoint);
				String endpointId = connEndPoint.getString("finaladdress");
				System.out.println(extractedBaseUrl);

				if (exiStartPortRange != null)
					runtimeOrg.setExiPorts(exiStartPortRange++);

				runtimeOrg.setIcipApps(runtime.getIcipApps());
				runtimeOrg.setIcipDataSource(ds);
				runtimeOrg.setIcipStreamingServices(runtime.getIcipStreamingServices());
				runtimeOrg.setIsAssigned(portPayload.isAssigned());
				runtimeOrg.setPipelineid(runtime.getPipelineid());
				runtimeOrg.setConnid(runtimeParams.getConnectionId());
				runtimeOrg.setConnendpoint(endpointId);
				runtimeOrg.setConnport(port);
				if (portPayload.isExiPort())
					runtimeOrg.setIsEXIPorts(portPayload.isExiPort());

				runtimeOrg.setIsDefaultPorts(portPayload.isDefaultPort());
				ICIPMLFederatedRuntime dbsaved = icipMlFederatedRuntimeRepository.save(runtimeOrg);
				String json = String.format("{\"endpointId\": \"%s\", \"port\": \"%s\"}", endpointId, port);
				list.add(json);
			}

		} catch (NullPointerException ex) {
			throw new NullPointerException(ex.getMessage());
		} catch (Exception ex) {
			throw new RuntimePortsNotSavedException(ex.getMessage());
		}
		try {
			if (list.isEmpty() == false) {
				for (String s : list) {
					updateRoutes(s);
				}
			}

		} catch (Exception ex) {
			throw new Exception("Ports are not Mapped to the file : " + ex.getMessage());
		}

	}

	public List<Integer> validatePorts(ValidatePorts validatePorts) {
		String availablePortsResponse = checkAvailablePorts(
				Integer.parseInt(validatePorts.getPortDetails().getStartport()),
				Integer.parseInt(validatePorts.getPortDetails().getEndport()));
		JSONArray available_portsJSON = new JSONObject(availablePortsResponse).getJSONArray("available_ports");
		List<Integer> available_ports = new ArrayList<>();
		for (int i = 0; i < available_portsJSON.length(); i++) {
			int port = available_portsJSON.getInt(i);
			available_ports.add(port);
		}

		return available_ports;

	}

	public String updateRoutes(String routesInfo) {

		String jsonBody = routesInfo;
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		// Create OkHttp client
		OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
		newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
		newBuilder.hostnameVerifier((hostname, session) -> true);
		OkHttpClient client = newBuilder.connectTimeout(50, TimeUnit.SECONDS).readTimeout(50, TimeUnit.SECONDS)
				.writeTimeout(50, TimeUnit.SECONDS).build();

		// Create RequestBody
		okhttp3.MediaType mediaType = okhttp3.MediaType.parse("application/json");
		okhttp3.RequestBody body = okhttp3.RequestBody.create(mediaType, jsonBody);

		// Create request for updating Nginx configuration
		Request requestUpdate = new Request.Builder().url(port_automation_app_url + "/update_route").post(body) // Change
																												// method
																												// to
																												// POST
				.build();

		try (Response responseUpdate = client.newCall(requestUpdate).execute()) {
			String responseBody = responseUpdate.body().string();
			// Check if the response was successful
			if (!responseUpdate.isSuccessful()) {
				return responseBody;
			}
			return responseBody;
		} catch (IOException e) {
			e.printStackTrace();
			return "Error";
		}
	}

	public String triggerProxyConfig2(String url, String proxy_pass_address) {

		String jsonBody = String.format("{\"url\": \"%s\", \"proxy_pass_address\": \"%s\"}", url, proxy_pass_address);
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		// Create OkHttp client
		OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
		newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
		newBuilder.hostnameVerifier((hostname, session) -> true);
		OkHttpClient client = newBuilder.build();

		// Create RequestBody
		okhttp3.MediaType mediaType = okhttp3.MediaType.parse("application/json");
		okhttp3.RequestBody body = okhttp3.RequestBody.create(mediaType, jsonBody);

		// Create request for updating Nginx configuration
		Request requestUpdate = new Request.Builder().url(port_automation_app_url + "/update_nginx").post(body) // Change
																												// method
																												// to
																												// POST
				.build();

		try (Response responseUpdate = client.newCall(requestUpdate).execute()) {
			String responseBody = responseUpdate.body().string();
			// Check if the response was successful
			if (!responseUpdate.isSuccessful()) {
				return responseBody;
			}
			return responseBody;
		} catch (IOException e) {
			e.printStackTrace();
			return "Error";
		}
	}

	public String checkAvailablePorts(Integer startRange, Integer endRange) {

		String jsonBody = String.format("{\"startRange\": \"%s\", \"endRange\": \"%s\"}", startRange, endRange);
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		// Create OkHttp client
		OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
		newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
		newBuilder.hostnameVerifier((hostname, session) -> true);
		OkHttpClient client = newBuilder.build();

		// Create RequestBody
		okhttp3.MediaType mediaType = okhttp3.MediaType.parse("application/json");
		okhttp3.RequestBody body = okhttp3.RequestBody.create(mediaType, jsonBody);

		// Create request for updating Nginx configuration
		Request requestUpdate = new Request.Builder().url(port_automation_app_url + "/available_ports").post(body) // Change
																													// method
																													// to
																													// POST
				.build();

		try (Response responseUpdate = client.newCall(requestUpdate).execute()) {
			String responseBody = responseUpdate.body().string();
			// Check if the response was successful
			if (!responseUpdate.isSuccessful()) {
				return responseBody;
			}
			return responseBody;
		} catch (IOException e) {
			e.printStackTrace();
			return "Error";
		}
	}

	private TrustManager[] getTrustAllCerts() {
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
				public void checkClientTrusted(X509Certificate[] chain, String authType) {
					// Log the certificate chain and authType
					logger.info("checkClientTrusted called with authType: {}", authType);
					for (X509Certificate cert : chain) {
						logger.info("Client certificate: {}", cert.getSubjectDN());
					}
				}

				@Override
				public void checkServerTrusted(X509Certificate[] chain, String authType) {
					// Log the certificate chain and authType
					logger.info("checkServerTrusted called with authType: {}", authType);
					for (X509Certificate cert : chain) {
						logger.info("Server certificate: {}", cert.getSubjectDN());
					}
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
			log.error(e.getMessage(), e);
		}
		return sslContext;
	}

	public List<ICIPMLFederatedRuntime> findBySearch(Integer id, Integer connid, Integer connport, Boolean isEXIPorts,
			Integer exiPorts, Integer pipelineid, Integer appid, Integer connendpoint, Boolean isAssigned) {

		List<ICIPMLFederatedRuntime> getSearchList = icipMlFederatedRuntimeRepository.findBySearch(id, connid, connport,
				isEXIPorts, exiPorts, pipelineid, appid, connendpoint, isAssigned);
		return getSearchList;
	}

	@Transactional
	public Map<String, String> assignRuntime(AssignRuntime assignRuntime) {
		ICIPStreamingServices icipStreaming = streamingServicesRepository.findByName(assignRuntime.getName());
		String connectionAlias = null;
		if (assignRuntime.getJsonContent() != null) {
			JSONObject json_content = new JSONObject(assignRuntime.getJsonContent());
			JSONObject json_content1 = new JSONObject(json_content.getString("default_runtime").toString());
			connectionAlias = json_content1.getString("dsAlias");
		} else if (assignRuntime.getDefaultRuntime() != null) {
			connectionAlias = assignRuntime.getDefaultRuntime().split("-")[1];

		}

		logger.info("Connection Alias is : {} ", connectionAlias);
		Optional<ICIPDatasource> icipDS = icipDatasourceRepository.findByAlias(connectionAlias);
		if (assignRuntime.isApp()) {
			Optional<ICIPMLFederatedRuntime> icipmlOpt = null;
			Optional<ICIPMLFederatedRuntime> isPipelineExist = icipMlFederatedRuntimeRepository
					.findByPipelineid(assignRuntime.getCid());

			try {
				if (isPipelineExist.isEmpty()) {

					icipmlOpt = icipMlFederatedRuntimeRepository.findFirstUnassignedPort(icipDS.get().getId());
					// ICIPApps icipApps = new ICIPApps();
					if (icipmlOpt.isPresent()) {
						ICIPMLFederatedRuntime icipml = icipmlOpt.get();
						icipml.setPipelineid(assignRuntime.getCid());
						icipml.setIsAssigned(true);

						icipMlFederatedRuntimeRepository.save(icipml);
						String address = icipml.getConnendpoint();
						URL url = new URL(address);
						String endpoint = url.getPath(); // Gets the path component from the URL

						// icipApps.setJobName(assignRuntime.getName());
						// icipApps.setName(assignRuntime.getName());
						// icipApps.setOrganization(assignRuntime.getOrganization());
						// icipApps.setScope("pipeline");
						// icipApps.setStatus(null);
						// icipApps.setTryoutlink(icipml.getConnendpoint());
						// icipApps.setType("App");
						// icipApps.setVideoFile(null);
						// icipApps.setFile(null);

						// appsRepository.save(icipApps);

						// icipml.setAppid(icipApps.getId());
						if (assignRuntime.isApp()) {
							icipStreaming.setApp(assignRuntime.isApp());
							streamingServicesRepository.save(icipStreaming);

						}
						icipMlFederatedRuntimeRepository.save(icipml);

						return Map.of("url", icipml.getConnendpoint(), "address", endpoint);
					} else {
						return Map.of("Message", "Please Add Runtimes");
					}
				} else {
					return Map.of("Message", "Port is already Assigned");
				}
			} catch (Exception ex) {
				throw new NoUnassignedPortFoundException(
						"No Unassigned Ports are found for the connection Id" + assignRuntime.getCid());
			}

		} else {
			return Map.of("Message", "Pipeline is not an APP");
		}

	}

	public Map<String, String> assignedRuntime(Integer pipelineid) {

		try {

			Optional<ICIPMLFederatedRuntime> icipml = icipMlFederatedRuntimeRepository.findByPipelineid(pipelineid);
			if (icipml.isPresent() && icipml.get().getIsAssigned()) {

				return Map.of("connection-endpoint", icipml.get().getConnendpoint());
			} else {

				return Map.of("connection-endpoint", "");
			}

		} catch (Exception e) {

			return Map.of("connection-endpoint", "");
		}

	}

	@Transactional
	public void releasePort(Integer pipelineid) {
		Optional<ICIPMLFederatedRuntime> icipml = icipMlFederatedRuntimeRepository.findByPipelineid(pipelineid);
		if (icipml.isPresent()) {
			icipml.get().setPipelineid(null);
			icipml.get().setIsAssigned(false);
		}
		try {
			icipMlFederatedRuntimeRepository.save(icipml.get());
		} catch (NullPointerException | IllegalArgumentException e) {
			e.getMessage();
		}

		/*
		 * ICIPApps icipApps = appsRepository.findByJobName(pipelineName)
		 * .orElseThrow(() -> new ResourceNotFoundException("This App Does not Exist"));
		 * 
		 * try { appsRepository.delete(icipApps); } catch (IllegalArgumentException |
		 * EntityNotFoundException ex) { ex.getMessage(); }
		 */

	}

	public ICIPMLFederatedRuntime getRuntime(Integer id) {

		ICIPMLFederatedRuntime runtime = icipMlFederatedRuntimeRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Runtime with this id Not does not exist"));
		return runtime;
	}

	@Transactional
	public void deletePort(Integer appId) {

		// Optional<ICIPMLFederatedRuntime> runtimeRecord1 =
		// icipMlFederatedRuntimeRepository.findById(id);
		// Optional<ICIPMLFederatedRuntime> runtimeRecord2 =
		// icipMlFederatedRuntimeRepository.findByPipelineid(pipelineId);
		Optional<ICIPMLFederatedRuntime> runtimeRecord = icipMlFederatedRuntimeRepository.findByAppid(appId);
		icipMlFederatedRuntimeRepository.delete(runtimeRecord.get());

		ICIPApps icipApps = appsRepository.findById(appId)
				.orElseThrow(() -> new ResourceNotFoundException("This App Does not Exist"));

		try {
			appsRepository.delete(icipApps);
		} catch (IllegalArgumentException | EntityNotFoundException ex) {
			ex.getMessage();
		}

	}

	public String getAccessUrl(String pipelineName) {
		ICIPStreamingServices streamingServiceObject = streamingServicesRepository.findByName(pipelineName);
		String isApp = streamingServiceObject.getType();

		if (isApp.equalsIgnoreCase("app")) {
			Integer i = streamingServiceObject.getCid();
			Optional<ICIPMLFederatedRuntime> runtimeRecord = icipMlFederatedRuntimeRepository.findByPipelineid(i);
			return runtimeRecord.get().getConnendpoint();
		}
		return null;

	}

	public Map<String, Object> getConnectionId(Integer connid) {
		List<ICIPMLFederatedRuntime> listConnection = icipMlFederatedRuntimeRepository.findByConnid(connid).get();
		List<Integer> connport = new ArrayList<Integer>();
		List<Integer> exiports = new ArrayList<Integer>();
		Boolean isExiports = false;
		Boolean isDefaultports = false;
		for (ICIPMLFederatedRuntime runtime : listConnection) {
			connport.add(runtime.getConnport());
			exiports.add(runtime.getExiPorts());
			if (runtime.getIsEXIPorts() != null) {
				isExiports = true;
			} else {
				isExiports = false;
			}
			if (runtime.getIsDefaultPorts()) {
				isDefaultports = true;
			} else {
				isDefaultports = false;
			}
		}

		Map<String, Object> connections = new HashMap<>();
		connections.put("connport-startrange", connport.get(0));
		connections.put("connport-endrange", connport.get(connport.size() - 1));
		connections.put("exiport-startrange", exiports.get(0));
		connections.put("exiport-endrange", exiports.get(connport.size() - 1));
		connections.put("isDefaultPorts", isDefaultports);
		connections.put("isExiPorts", isExiports);
		return connections;
	}

	public Map<String, Object> getPorts(Integer connid) {
		List<ICIPMLFederatedRuntime> listConnection = icipMlFederatedRuntimeRepository.findByConnid(connid).get();
		List<Integer> ports = new ArrayList<Integer>();
		for (ICIPMLFederatedRuntime runtime : listConnection) {
			ports.add(runtime.getConnport());
		}
		return Map.of("available_ports", ports);
	}

	@Transactional
	public String deletePorts(String name, String org) throws Exception {
		try {
			ICIPDatasource iCIPDatasourceFetched = icipDatasourceRepository.findByNameAndOrganization(name, org);
			Optional<List<ICIPMLFederatedRuntime>> mlfederatedruntimes = icipMlFederatedRuntimeRepository
					.findByConnid(iCIPDatasourceFetched.getId());
			// deleting port automation ports
			if (iCIPDatasourceFetched != null && mlfederatedruntimes.isPresent()) {
				mlfederatedruntimes.get().forEach(mlfederatedruntime -> {
					deletePortFromNginxConf(mlfederatedruntime.getConnport(), mlfederatedruntime.getConnendpoint());
					icipMlFederatedRuntimeRepository.delete(mlfederatedruntime);
				});
			}
			return "Ports Deleted";
		} catch (Exception ex) {
			throw new Exception(ex.getMessage());
		}
	}
}
