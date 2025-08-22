package com.infosys.icets.icip.mlops.rest.service.impl;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.ssl.SSLContextBuilder;
import org.apache.http.ssl.TrustStrategy;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.infosys.icets.icip.dataset.constants.ICIPPluginConstants;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetPluginsService;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPMLFederatedModelDTO;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPMLFederatedModelsRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPMLFederatedModelService;

@Service
public class ICIPMlOpsRestAdapterService {

	/** The leap url. */
	@Value("${LEAP_ULR}")
	private String referer;
	
	/** The icip pathPrefix. */
	@Value("${icip.pathPrefix}")
	private String icipPathPrefix;
	
	@Autowired
	private ICIPDatasetPluginsService pluginService;
	
	@Autowired
	private IICIPMLFederatedModelService fedModelService;
	
	@Autowired
	private IICIPDatasourceService datasourceService;
	
	@Autowired
	private ICIPMLFederatedModelsRepository fedModelRepo;

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPMlOpsRestAdapterService.class);

	public String callGetMethod(String adaptername, String methodname, String org, Map<String, String> headers,
			Map<String, String> params) throws ClientProtocolException, IOException, URISyntaxException,
			NoSuchAlgorithmException, KeyStoreException, KeyManagementException {
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info("referer generated:{}", host);
		} else {
			logger.info("referer taken from headers:{}", host);
		}
		SSLContextBuilder builder = new SSLContextBuilder();
		builder.loadTrustMaterial(null, new TrustStrategy() {
			@Override
			public boolean isTrusted(X509Certificate[] chain, String authType) throws CertificateException {
				return true;
			}
		});
		SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(builder.build());
		CloseableHttpClient httpClient = HttpClients.custom().setSSLSocketFactory(sslsf).build();
		HttpGet httpGet = new HttpGet(
				host + icipPathPrefix + "/adapters/" + adaptername + "/" + methodname + "/" + org);
		for (Map.Entry<String, String> header : headers.entrySet()) {
			httpGet.addHeader(header.getKey(), header.getValue());
		}
		List<NameValuePair> nvpList = new ArrayList<>(params.size());
		for (Map.Entry<String, String> param : params.entrySet()) {
			nvpList.add(new BasicNameValuePair(param.getKey(), param.getValue()));
		}
		URI paramsUri = new URIBuilder(httpGet.getURI()).addParameters(nvpList).build();
		httpGet.setURI(paramsUri);
		return EntityUtils.toString(httpClient.execute(httpGet).getEntity());
	}

	public String callPostMethod(String adaptername, String methodname, String org, Map<String, String> headers,
			Map<String, String> params, String body) throws ClientProtocolException, IOException, URISyntaxException,
			NoSuchAlgorithmException, KeyStoreException, KeyManagementException {
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info("referer generated:{}", host);
		} else {
			logger.info("referer taken from headers:{}", host);
		}
		SSLContextBuilder builder = new SSLContextBuilder();

		builder.loadTrustMaterial(null, new TrustStrategy() {
			@Override
			public boolean isTrusted(X509Certificate[] chain, String authType) throws CertificateException {
				return true;
			}
		});
		SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(builder.build());
		CloseableHttpClient httpClient = HttpClients.custom().setSSLSocketFactory(sslsf).build();
		HttpPost httpPost = new HttpPost(
				host + icipPathPrefix + "/adapters/" + adaptername + "/" + methodname + "/" + org);
		for (Map.Entry<String, String> header : headers.entrySet()) {
			if (!"Content-Length".equalsIgnoreCase(header.getKey()))
				httpPost.addHeader(header.getKey(), header.getValue());
		}
		List<NameValuePair> nvpList = new ArrayList<>(params.size());
		for (Map.Entry<String, String> param : params.entrySet()) {
			nvpList.add(new BasicNameValuePair(param.getKey(), param.getValue()));
		}
		URI paramsUri = new URIBuilder(httpPost.getURI()).addParameters(nvpList).build();
		httpPost.setURI(paramsUri);

		HttpEntity bodyEntity = new StringEntity(body);
		httpPost.setEntity(bodyEntity);

		return EntityUtils.toString(httpClient.execute(httpPost).getEntity());
	}

	public String callDeleteMethod(String adaptername, String methodname, String org, Map<String, String> headers,
			Map<String, String> params) throws ClientProtocolException, IOException, URISyntaxException,
			NoSuchAlgorithmException, KeyStoreException, KeyManagementException {
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info("referer generated:{}", host);
		} else {
			logger.info("referer taken from headers:{}", host);
		}
		SSLContextBuilder builder = new SSLContextBuilder();
		builder.loadTrustMaterial(null, new TrustStrategy() {
			@Override
			public boolean isTrusted(X509Certificate[] chain, String authType) throws CertificateException {
				return true;
			}
		});
		SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(builder.build());
		CloseableHttpClient httpClient = HttpClients.custom().setSSLSocketFactory(sslsf).build();
		HttpDelete httpDelete = new HttpDelete(
				host + icipPathPrefix + "/adapters/" + adaptername + "/" + methodname + "/" + org);
		for (Map.Entry<String, String> header : headers.entrySet()) {
			httpDelete.addHeader(header.getKey(), header.getValue());
		}
		List<NameValuePair> nvpList = new ArrayList<>(params.size());
		for (Map.Entry<String, String> param : params.entrySet()) {
			nvpList.add(new BasicNameValuePair(param.getKey(), param.getValue()));
		}
		URI paramsUri = new URIBuilder(httpDelete.getURI()).addParameters(nvpList).build();
		httpDelete.setURI(paramsUri);

		return EntityUtils.toString(httpClient.execute(httpDelete).getEntity());
	}

	private String getHostFromHeader(Map<String, String> headers) {
		String hostFromHeader = null;
		hostFromHeader = headers.get(ICIPPluginConstants.REFERER_TITLE_CASE);
		if (hostFromHeader == null || hostFromHeader.isEmpty()) {
			hostFromHeader = headers.get(ICIPPluginConstants.REFERER_LOWER_CASE);
		}
		return hostFromHeader;
	}

	public ResponseEntity<?> getS3FileData(String modelName, String fileName, String org) {
		try {
			ICIPDataset datasetForModel = new ICIPDataset();
			ICIPDatasource datasource = new ICIPDatasource();
			List<ICIPMLFederatedModel> iCIPMLFederatedModels = fedModelRepo.getModelByModelNameAndOrganisation(modelName, org);
			ICIPMLFederatedModel iCIPMLFederatedModel = iCIPMLFederatedModels.getFirst();
			datasource = datasourceService.getDatasource(iCIPMLFederatedModel.getDatasource(), org);
			datasetForModel.setDatasource(datasource);
			datasetForModel.setOrganization(org);
			datasetForModel.setAttributes(iCIPMLFederatedModel.getAttributes());
			return new ResponseEntity<>(pluginService.getS3FileData(datasetForModel, fileName), new HttpHeaders(),
					HttpStatus.OK);
		} catch (Exception e) {
			logger.error("EXCEPTION:", e);
			return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public ResponseEntity<?> uploadModel(ICIPMLFederatedModel requestBody, String fileUploaded) {
		try {
			ICIPDataset datasetForModel = new ICIPDataset();
			ICIPDatasource datasource = datasourceService.getDatasource(requestBody.getDatasource(),
					requestBody.getOrganisation());
			datasetForModel.setDatasource(datasource);
			datasetForModel.setOrganization(requestBody.getOrganisation());
			datasetForModel.setAttributes(requestBody.getAttributes());
			Boolean fileAttached = false;
			List<Object> data = new ArrayList<>();
			if (fileUploaded != null && !fileUploaded.isBlank()) {
				try {
					data = pluginService.getS3FileData(datasetForModel, fileUploaded);
					fileAttached = true;
				} catch (Exception exc) {
					return new ResponseEntity<>("FAILED", HttpStatus.INTERNAL_SERVER_ERROR);
				}
			}

			if (!fileAttached || data.get(0) == null) {
				Boolean testSuccess = false;
				try {
					testSuccess = pluginService.getDataSetService(datasetForModel).testConnection(datasetForModel);
				} catch (Exception e) {
					return new ResponseEntity<>("FAILED", HttpStatus.INTERNAL_SERVER_ERROR);
				}
				if (testSuccess)
					return new ResponseEntity<>("SUCCESS", new HttpHeaders(), HttpStatus.OK);
				else
					return new ResponseEntity<>("FAILED", HttpStatus.INTERNAL_SERVER_ERROR);
			} else {
				return new ResponseEntity<>(
						"Model already present in the specified path, Please upload a different file",
						HttpStatus.BAD_REQUEST);
			}
		} catch (Exception e) {
			logger.error("EXCEPTION:", e);
			return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
