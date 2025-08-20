package com.lfn.icip.icipwebeditor.job.service;

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
import com.lfn.icip.icipwebeditor.service.IICIPOutputArtifactsService;

import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;
import lombok.extern.log4j.Log4j2;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

@Log4j2
@Service("remoteoutputartifactsservice")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RefreshScope
public class ICIPRemoteOutputArtifactsService implements IICIPOutputArtifactsService {
	@Autowired
	private ICIPRemoteExecutorJob remoteJob;
	@Autowired
	private IICIPDatasourceService dsService;
	
	@EssedumProperty("icip.certificateCheck")
	private String certificateCheck;
	/** The Constant logger. */
	private static final org.slf4j.Logger logger = LoggerFactory.getLogger(ICIPRemoteStopJobService.class);
	String taskIds;
	@Override
	public JSONObject findOutputArtifacts(ICIPJobsPartial job) throws EssedumException {
		// TODO Auto-generated method stub
		return RemoteOutputArtifactsJobs(job);
	}
	public JSONObject RemoteOutputArtifactsJobs(ICIPJobsPartial job) throws EssedumException {
		org.json.JSONObject jobMetaData = new org.json.JSONObject(job.getJobmetadata());
		taskIds = jobMetaData.getString("taskId");
		ICIPDatasource dsObject = dsService.getDatasource(jobMetaData.getString("datasourceName"),
				job.getOrganization());
		org.json.JSONObject connDetails = new org.json.JSONObject(dsObject.getConnectionDetails());
		
		JSONObject messages = getOutputArtifacts(taskIds,connDetails);
		logger.info(messages.toString());
		logger.info("output artifacts is :"+messages.toString());
		return messages;
		

}
	private JSONObject getOutputArtifacts(String taskIds, JSONObject connDetails)throws EssedumException {
		// TODO Auto-generated method stub
		logger.info("Inside getOutputArtifacts");
		String url = connDetails.get("Url").toString() + "/" + taskIds + "/getOutputArtifacts";
		logger.info("getOutputArtifacts URL " + url);
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		// Check for null SSLContext
		if (sslContext != null) {
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
			OkHttpClient client = newBuilder.build();
			Request requestokHttp = new Request.Builder().url(url).addHeader("accept", "application/json").build();
			logger.info("getOutputArtifacts request " + requestokHttp.toString());
			Response response = null;
			try {
				response = client.newCall(requestokHttp).execute();
				logger.info("getOutputArtifacts response " + response);
				logger.info("getOutputArtifacts response code " + response.code());
				logger.info("getO response body " + response.body());
				if (response.code() == 200) {
					JSONObject responsebody = new JSONObject(response.body().string());

					return responsebody;
				} else if (response.code() == 400) {
					throw new EssedumException("Remote get OutputArtifacts  for taskid " + taskIds);
					} else {
						throw new EssedumException("Remote get OutputArtifacts  for  " + taskIds + " Response Code "
								+ response.code() + "Response Body" + response.body());
					}


		} catch (Exception e) {
			throw new EssedumException("Error in getOutputArtifacts:" + e.getMessage() + "Task Id is:" + taskIds);

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

