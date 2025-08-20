package com.lfn.icip.icipwebeditor.job.service;

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

import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.icipwebeditor.model.ICIPJobsPartial;
import com.lfn.icip.icipwebeditor.service.IICIPStopJobService;

import lombok.extern.log4j.Log4j2;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
@Log4j2
@Service("remotestopjobservice")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RefreshScope
public class ICIPRemoteStopJobService implements IICIPStopJobService {
	@Autowired
	private ICIPRemoteExecutorJob remoteJob;
	@Autowired
	private IICIPDatasourceService dsService;
	@EssedumProperty("icip.certificateCheck")
	private String certificateCheck;
	/** The Constant logger. */
	private static final org.slf4j.Logger logger = LoggerFactory.getLogger(ICIPRemoteStopJobService.class);
	String taskIds;
	String tag;

	// @Override
	public ICIPJobsPartial stopPipelineJobs(ICIPJobsPartial job) throws EssedumException {
		// TODO Auto-generated method stub
		return stopRemotePipelineJobs(job);
	}

	public ICIPJobsPartial stopRemotePipelineJobs(ICIPJobsPartial job) throws EssedumException {
		org.json.JSONObject jobMetaData = new org.json.JSONObject(job.getJobmetadata());
		taskIds = jobMetaData.getString("taskId");
		tag = jobMetaData.getString("tag");
		ICIPDatasource dsObject = dsService.getDatasource(jobMetaData.getString("datasourceName"),
				job.getOrganization());
		org.json.JSONObject connDetails = new org.json.JSONObject(dsObject.getConnectionDetails());
		String UserId = connDetails.get("userId").toString();
		JSONObject messages = terminateJob(taskIds, UserId, connDetails, tag);
		logger.info(messages.toString());
		return job;

	}

	private JSONObject terminateJob(String taskIds, String userId, JSONObject connDetails, String tag)
			throws EssedumException {
		// TODO Auto-generated method stub
		logger.info("Inside Remote Terminate Job");
		String url = connDetails.get("Url").toString() + "/" + taskIds + "/stop";
		logger.info("Remote terminate job url :" + url);
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		if (sslContext != null) {
		OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
		newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
		newBuilder.hostnameVerifier((hostname, session) -> true);
		OkHttpClient client = newBuilder.build();
		MediaType mediaType = MediaType.parse("application/json");
		JSONObject bodyObject = new JSONObject();
		Request requestokHttp = new Request.Builder().url(url).addHeader("accept", "application/json").build();
		logger.info("terminate job request " + requestokHttp);
		try {
			Response response = client.newCall(requestokHttp).execute();
			logger.info("response: "+response);			
			logger.info("terminatejob response " + response);
			logger.info("terminate job response code " + response.code());
			if (response.code() == 200) {

				if (tag.equals("CHAIN")) {
					JSONObject responsebody = new JSONObject();
					responsebody.put("Job Status", "CANCELLED");
			        logger.info("JOBS TERMINATED SUCCESSFULLY");

					return responsebody;
				} else {
					String responseString = response.body().string();
					logger.info("else string body :"+responseString);
					JSONObject responsebody = new JSONObject(responseString);
					logger.info("JOBS TERMINATED SUCCESSFULLY");
					return responsebody;
				}

			} else
				return new JSONObject(response);

		} catch (Exception e) {
			throw new EssedumException("Error in terminateJob:" + e.getMessage() + "Task Id is:" + taskIds);
		}
		} else {
			throw new EssedumException("SSLContext is null, could not create a secure connection.");
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

}
