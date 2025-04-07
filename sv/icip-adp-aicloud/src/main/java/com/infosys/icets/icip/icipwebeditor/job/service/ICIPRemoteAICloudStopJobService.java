package com.infosys.icets.icip.icipwebeditor.job.service;

import java.io.IOException;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

import org.json.JSONObject;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;
import com.infosys.icets.icip.icipwebeditor.model.ICIPJobsPartial;
import com.infosys.icets.icip.icipwebeditor.service.IICIPJobRuntimeLoggerService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPStopJobService;

import ch.qos.logback.classic.Logger;
import lombok.extern.log4j.Log4j2;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

@Log4j2
@Service("aicloudstopjobservice")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RefreshScope
public class ICIPRemoteAICloudStopJobService implements IICIPStopJobService {
	
	@LeapProperty("icip.certificateCheck")
	private String certificateCheck;
	
	@Autowired
	private ICIPRemoteAICloudJob aicloudJob;

	@Autowired
	private IICIPDatasourceService dsService;
	/** The Constant logger. */
	private static final org.slf4j.Logger logger = LoggerFactory.getLogger(ICIPRemoteAICloudStopJobService.class);

	 String trialIds;
	public ICIPJobsPartial stopPipelineJobs(ICIPJobsPartial job) throws LeapException {
		return stopAicloudPipelineJobs(job);
	}

	public ICIPJobsPartial stopAicloudPipelineJobs(ICIPJobsPartial job) throws LeapException {
		org.json.JSONObject jobMetaData = new org.json.JSONObject(job.getJobmetadata());
		 trialIds = jobMetaData.getString("trialId");
		ICIPDatasource dsObject = dsService.getDatasource(jobMetaData.getString("datasourceName"),
				job.getOrganization());
		org.json.JSONObject connDetails = new org.json.JSONObject(dsObject.getConnectionDetails());
		String UserId = connDetails.get("userId").toString();
		JSONObject messages = terminateJob(trialIds, UserId, connDetails);
		logger.info(messages.getString("message"));

		return job;

	}

	public JSONObject terminateJob(String trialIds, String UserId, JSONObject connDetails) throws LeapException {
		String url = connDetails.get("Url").toString() + "/api/v1/pipelines/trial/terminate/"+trialIds;
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		if(sslContext != null) {
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
			OkHttpClient client = newBuilder.build();
			MediaType mediaType = MediaType.parse("application/json");
			RequestBody regBody = RequestBody.create(mediaType, "");
			Request requestokHttp = new Request.Builder().url(url).method("POST",regBody).addHeader("accept", "application/json")
					.addHeader("userId", connDetails.get("userId").toString()).addHeader("trialId", trialIds).build();
			Response response = null;
			try {
				response = client.newCall(requestokHttp).execute();
				if (response.code() == 200) {
					JSONObject responsebody = new JSONObject(response.body().string());
					return responsebody;
				} else if (response.code() == 400) {
					JSONObject responsebody = new JSONObject(response.body().string());
					JSONObject errorDetails = responsebody.getJSONObject("detail");
					String errorMsg = errorDetails.get("message").toString();
					String errorCode = errorDetails.get("code").toString();
					throw new LeapException("AICloud terminate pipeline  status for trialid " + trialIds + "with message:- "
							+ errorMsg + "and code " + errorCode);
	
				} else if(response.code() == 500){
					throw new LeapException("jobs already stopped");
				}
				else {
					throw new LeapException("AICloud terminate pipeline status for trialid " + trialIds + " Response Code "
							+ response.code());
	
				}
	
			} catch (IOException e) {
				log.error(e.getMessage(), e);
				throw new LeapException(
						"AICloud terminate pipeline status for trialid " + trialIds + "message" + e.getMessage());
	
			}
		}else {
			throw new LeapException("Failed to create SSLContext");
		}

	}

//	private TrustManager[] getTrustAllCerts() {
//		TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
//			@Override
//			public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) {
//			}
//
//			@Override
//			public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) {
//			}
//
//			@Override
//			public java.security.cert.X509Certificate[] getAcceptedIssuers() {
//				return new java.security.cert.X509Certificate[] {};
//			}
//		} };
//		return trustAllCerts;
//	}
	
	private TrustManager[] getTrustAllCerts() {
		logger.info("certificateCheck value: {}", certificateCheck);
		if("true".equalsIgnoreCase(certificateCheck)) {
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
		}else {
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

}
