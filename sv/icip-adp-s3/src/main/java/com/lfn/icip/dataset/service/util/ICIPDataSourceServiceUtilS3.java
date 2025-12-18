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

package com.lfn.icip.dataset.service.util;

import java.io.*;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.github.cdimascio.dotenv.Dotenv;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.python.antlr.op.Load;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.amazonaws.AmazonClientException;
import com.amazonaws.ClientConfiguration;
import com.amazonaws.Protocol;
import com.amazonaws.SDKGlobalConfiguration;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.http.conn.ssl.SdkTLSSocketFactory;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.CompleteMultipartUploadRequest;
import com.amazonaws.services.s3.model.InitiateMultipartUploadRequest;
import com.amazonaws.services.s3.model.InitiateMultipartUploadResult;
import com.amazonaws.services.s3.model.PartETag;
import com.amazonaws.services.s3.model.UploadPartRequest;
import com.amazonaws.services.s3.model.UploadPartResult;
import com.amazonaws.services.s3.transfer.MultipleFileDownload;
import com.amazonaws.services.s3.transfer.TransferManager;
import com.amazonaws.services.s3.transfer.TransferManagerBuilder;
import com.azure.core.http.HttpClient;
import com.azure.core.http.okhttp.OkHttpAsyncHttpClientBuilder;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.dataset.model.ICIPDatasource;
import io.minio.ListObjectsArgs;
import io.minio.MinioClient;
import io.minio.Result;
import io.minio.messages.Item;
import okhttp3.OkHttpClient;
import org.yaml.snakeyaml.Yaml;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.AwsSessionCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ListBucketsResponse;

import java.security.*;
import javax.net.ssl.*;
import com.amazonaws.services.s3.model.*;
import com.google.api.gax.paging.Page;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.json.JSONArray;


@Component("s3source")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPDataSourceServiceUtilS3 extends ICIPDataSourceServiceUtil {

	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(ICIPDataSourceServiceUtilS3.class);
	@EssedumProperty("icip.certificateCheck")
	private String certificateCheck;

    /**
     * Test connection.
     *
     * @param datasource the datasource
     * @return true, if successful
     * @throws UnknownHostException
     */
    @Override
    public boolean testConnection(ICIPDatasource datasource) {
        JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
        String accessKey = connectionDetails.optString("accessKey");
        String secretKey = connectionDetails.optString("secretKey");
        String region = connectionDetails.optString("Region");
        String url = connectionDetails.optString("url");
        String sessionToken = connectionDetails.optString("sessionToken");
		String bucketName = connectionDetails.optString("StorageContainerName");
		logger.info("Testing connection for datasource with URL: {}", url);
        logger.debug("Extracted credentials - AccessKey: {}, Region: {}", accessKey, region);

        try {
            TrustManager[] trustAllCerts = getTrustAllCerts();
            SSLContext sslContext = getSslContext(trustAllCerts);

            if (sslContext == null) {
                logger.error("SSLContext initialization failed");
                throw new EssedumException("SSLContext could not be initialized");
            }

            logger.debug("SSLContext initialized successfully");

            OkHttpClient customHttpClient = new OkHttpClient.Builder()
                    .sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
                    .hostnameVerifier((hostname, session) -> true)
                    .build();

            if (url.contains("blob")) {
                logger.info("Detected Azure Blob Storage connection");
                String connectStr = String.format(
                        "DefaultEndpointsProtocol=https;AccountName=%s;AccountKey=%s;EndpointSuffix=core.windows.net",
                        accessKey, secretKey);

                HttpClient httpClient = new OkHttpAsyncHttpClientBuilder(customHttpClient).build();
                BlobServiceClient client = new BlobServiceClientBuilder()
                        .httpClient(httpClient)
                        .connectionString(connectStr)
                        .buildClient();

                client.listBlobContainers();
                logger.info("Azure Blob Storage connection successful");
                return true;

            } else if (url.contains("aws")) {
                logger.info("Detected AWS S3 connection");

                AwsCredentialsProvider credentialsProvider;

                if (sessionToken != null && !sessionToken.isEmpty()) {
                    // Use temporary session credentials
                    AwsSessionCredentials sessionCredentials = AwsSessionCredentials.create(accessKey, secretKey, sessionToken);
                    credentialsProvider = StaticCredentialsProvider.create(sessionCredentials);
                } else {
                    // Use basic credentials
                    AwsBasicCredentials basicCredentials = AwsBasicCredentials.create(accessKey, secretKey);
                    credentialsProvider = StaticCredentialsProvider.create(basicCredentials);
                }

                // Create S3 client
                S3Client s3Client = S3Client.builder()
                        .region(Region.of(region))
                        .credentialsProvider(credentialsProvider)
                        .build();

                // Test connection by listing buckets
                ListBucketsResponse bucketsResponse = s3Client.listBuckets(software.amazon.awssdk.services.s3.model.ListBucketsRequest.builder().build());
                logger.info("AWS S3 connection successful");
                logger.info("Buckets: {}", bucketsResponse.buckets().stream().map(b -> b.name()).toList());
                return true;

            } else if (url.contains("storage.googleapis.com") || url.contains("google")) {
                logger.info("Detected Google Cloud Storage connection");
				        InputStream inputStream = getClass().getClassLoader().getResourceAsStream("");
				ServiceAccountCredentials credentials = ServiceAccountCredentials.fromStream(inputStream);
				inputStream.close();
				return verifyGCSConnection( credentials,bucketName);

			} else {
                logger.info("Detected MinIO connection");
                MinioClient minioClient = MinioClient.builder()
                        .endpoint(url)
                        .credentials(accessKey, secretKey)
                        .httpClient(customHttpClient)
                        .build();

                minioClient.listBuckets();
                logger.info("MinIO connection successful");
                return true;
            }

        } catch (Exception ex) {
            logger.error("Connection test failed: {}", ex.getMessage(), ex);
        }

        logger.warn("Connection test returned false");
        return false;
    }


//    public ServiceAccountCredentials loadCredentials() throws IOException {
//        logger.info("Starting to load GCP Service Account credentials.");
//
//        InputStream inputStream = getClass().getClassLoader().getResourceAsStream("JsonData/service-account.json");
//        if (inputStream == null) {
//            logger.error("service-account.json not found in resources.");
//            throw new FileNotFoundException("service-account.json not found in resources");
//        }
//        logger.info("service-account.json found and loaded successfully: ");
//        logger.info("GCP_PRIVATE_KEY : {}", System.getenv("GCP_PRIVATE_KEY"));
//        logger.info("GCP_PRIVATE_KEY_ID : {}", System.getenv("GCP_PRIVATE_KEY_ID"));
//
//        String privateKey = System.getenv("GCP_PRIVATE_KEY");
//        String privateKeyId = System.getenv("GCP_PRIVATE_KEY_ID");
//        logger.info("private key : {}", privateKey);
//        ServiceAccountCredentials credentials;
//
//        if (privateKey != null && !privateKey.isEmpty()) {
//            logger.info("Environment variable GCP_PRIVATE_KEY found. Using dynamic private key.");
//            privateKey = privateKey.replace("\\n", "\n");
//
//            String jsonContent = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
//            inputStream.close();
//            logger.debug("Original service account JSON read successfully.");
//
//            Gson gson = new Gson();
//            JsonObject jsonObject = JsonParser.parseString(jsonContent).getAsJsonObject();
//            jsonObject.addProperty("private_key", privateKey);
//            jsonObject.addProperty("private_key_id",privateKeyId);
//
//            String modifiedJson = jsonObject.toString().replace("\\\"", "");
//            byte[] modifiedJsonBytes = modifiedJson.getBytes(StandardCharsets.UTF_8);
//            InputStream modifiedInputStream = new ByteArrayInputStream(modifiedJsonBytes);
//
//            credentials = ServiceAccountCredentials.fromStream(modifiedInputStream);
//            modifiedInputStream.close();
//            logger.info("ServiceAccountCredentials created using modified JSON.");
//        } else {
//            logger.warn("Environment variable GCP_PRIVATE_KEY not found. Using default service-account.json.");
//            credentials = ServiceAccountCredentials.fromStream(inputStream);
//            inputStream.close();
//            logger.info("ServiceAccountCredentials created using default JSON.");
//        }
//
//        logger.info("GCP Service Account credentials loaded successfully.");
//        return credentials;
//    }

    public static boolean verifyGCSConnection(ServiceAccountCredentials credentials, String bucketName) {
		try {
			TrustManager[] trustAllCerts = new TrustManager[]{
					new X509TrustManager() {
						public X509Certificate[] getAcceptedIssuers() {
							return null;
						}

						public void checkClientTrusted(X509Certificate[] certs, String authType) {
						}

						public void checkServerTrusted(X509Certificate[] certs, String authType) {
						}
					}
			};

			SSLContext sc = SSLContext.getInstance("SSL");
			sc.init(null, trustAllCerts, new SecureRandom());
			HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
			HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);

			// Connect to GCS
			JSONObject jsonObject;
			String projectId = null;
			if (credentials != null) {
				jsonObject = new JSONObject(credentials);
				projectId = jsonObject.optString("projectId");
			}
			Storage storage = StorageOptions.newBuilder()
					.setProjectId(projectId)
					.setCredentials(credentials)
					.build()
					.getService();

			JSONArray blobsList = new JSONArray();
			Page<Blob> blobs = storage.list(bucketName);
			for (Blob blob : blobs.iterateAll()) {
				blobsList.put(blob.getName());
			}
			logger.info("GCS connection successful. Buckets found: {}", blobsList.length());
			return true;
		} catch (Exception e) {
			logger.error("GCP connection failed: " + e.getMessage());
		return false;
		}
	}

/*
	@Override
	public boolean testConnection(ICIPDatasource datasource) {
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		String accessKey = connectionDetails.optString("accessKey");
		String secretKey = connectionDetails.optString("secretKey");
		String region = connectionDetails.optString("Region");
		String url = connectionDetails.optString("url");
		try {
			TrustManager[] trustAllCerts = getTrustAllCerts();
			SSLContext sslContext = getSslContext(trustAllCerts);
			OkHttpClient customHttpClient = new OkHttpClient.Builder()
					.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
					.hostnameVerifier((hostname, session) -> true).build();
			// Build the MinioClient with the provided connection details
			MinioClient minioClient = MinioClient.builder()
					.endpoint(url)
					.credentials(accessKey, secretKey)
					.httpClient(customHttpClient)
					.build();

			minioClient.listBuckets();
			return true;
		} catch (Exception ex) {
			logger.error("Connection test failed: " + ex.getMessage(), ex);
		}
		return false; // Return false if any exception occurs
	}

*/


			public JSONObject getJson() {
				JSONObject ds = super.getJson();
				try {
					ds.put("type", "S3");
					ds.put("category", "S3");
					ds.getJSONObject(ATTRIBUTES).remove("password");
					JSONObject attributes = ds.getJSONObject(ICIPDataSourceServiceUtil.ATTRIBUTES);
					attributes.put("accessKey", "");
					attributes.put("secretKey", "");
					attributes.put("sessionToken", "");
					attributes.put("url", "");
					attributes.put("Region", "");
					attributes.put("StorageContainerName", "");
					ds.put("attributes", attributes);
				} catch (JSONException e) {
					logger.error("plugin attributes mismatch", e);
				}
				return ds;
			}

			@Override
			public ICIPDatasource setHashcode(boolean isVault, ICIPDatasource datasource) throws NoSuchAlgorithmException {

				try {
				} catch (Exception e) {
					logger.error("Error while setting hashcode: ", e);
				}
				return datasource;
			}

			@Override
			public JSONObject isTabularViewSupported(ICIPDatasource datasource) {
				return new JSONObject("{Tabular View:true}");
			}

			@Override
			public String uploadFile(ICIPDatasource datasource, String attributes, String uploadFile) throws Exception {
				JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
				String accessKey = connectionDetails.optString("accessKey");
				logger.info("accessKey "+accessKey);
				String secretKey = connectionDetails.optString("secretKey");
				logger.info("secretKey "+secretKey);
				String region = connectionDetails.optString("Region");
				URL endpointUrl = null;
//		System.setProperty(SDKGlobalConfiguration.DISABLE_CERT_CHECKING_SYSTEM_PROPERTY, "false");
				try {
					endpointUrl = new URL(connectionDetails.optString("url"));
					logger.info("endpointUrl "+endpointUrl);
				} catch (MalformedURLException e1) {
					logger.error("Upload DATASOURCE URL not correct" + e1.getMessage());
					return "Error";
				}
				TrustManager[] trustAllCerts = getTrustAllCerts();
				SSLContext sslContext = getSslContext(trustAllCerts);
				//HostnameVerifier myVerifier = (hostname, session) -> true;
				ClientConfiguration clientConfiguration = new ClientConfiguration();
				ConnectionSocketFactory factory = new SdkTLSSocketFactory(sslContext, (hostname, session) -> true);
				clientConfiguration.getApacheHttpClientConfig().setSslSocketFactory(factory);
				JSONObject attr = new JSONObject(attributes);
				String bucketName = attr.optString("bucket");
				logger.info("bucketName "+bucketName);
				String objectKey = attr.optString("uploadFilePath")+"/"+attr.optString("object");
				logger.info("objectKey "+objectKey);
				File localFilePath = new File(uploadFile);
				BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
				AmazonS3 s3Client = AmazonS3ClientBuilder.standard().withClientConfiguration(clientConfiguration)
						.withEndpointConfiguration(
								new AwsClientBuilder.EndpointConfiguration(endpointUrl.toString(), region))
						.withCredentials(new AWSStaticCredentialsProvider(credentials)).build();
				long partSize = 100L * 1024 * 1024;
				try {
					boolean doesObjectExist = s3Client.doesObjectExist(bucketName, objectKey);
					if (!doesObjectExist) {
						InitiateMultipartUploadRequest initRequest = new InitiateMultipartUploadRequest(bucketName, objectKey);
						InitiateMultipartUploadResult initResponse = s3Client.initiateMultipartUpload(initRequest);
						String uploadId = initResponse.getUploadId();

						List<PartETag> partETags = new ArrayList<>();
						long contentLength = localFilePath.length();
						long filePosition = 0;

						for (int i = 1; filePosition < contentLength; i++) {
							long partSizeRemaining = Math.min(partSize, contentLength - filePosition);
							UploadPartRequest uploadRequest = new UploadPartRequest()
									.withBucketName(bucketName)
									.withKey(objectKey)
									.withUploadId(uploadId)
									.withPartNumber(i)
									.withFileOffset(filePosition)
									.withFile(localFilePath)
									.withPartSize(partSizeRemaining);
							try {
								UploadPartResult uploadPartResult = s3Client.uploadPart(uploadRequest);
								partETags.add(uploadPartResult.getPartETag());
							} catch (Exception e) {
								logger.error(e.getMessage());
								// Abort the multipart upload if any part fails
								s3Client.abortMultipartUpload(new AbortMultipartUploadRequest(
										bucketName, objectKey, uploadId));
								s3Client.shutdown();
								return "Failed to upload part: " + e.getMessage();
							}
							filePosition += partSizeRemaining;
						}

						CompleteMultipartUploadRequest completeRequest = new CompleteMultipartUploadRequest(
								bucketName, objectKey, uploadId, partETags);
						s3Client.completeMultipartUpload(completeRequest);
						logger.info("File Uploaded successfully");
					}
					s3Client.shutdown();
					logger.info("uploadFilePath " + attr.optString("uploadFilePath"));
					return attr.optString("uploadFilePath");
				} catch (Exception e) {
					logger.error("Error occurred in upload method", e);
					//webSocketController.sendUploadStatus("Error");
					s3Client.shutdown();
					return "Failed to upload script to S3: The 's3Path' (inputArtifactsPath) is null.\n" +
							"Please verify your S3 connection details, ensure that the bucket and object paths are correctly configured, and check if your storage service is operational.\n" + e.getMessage();
				}
			}
	
/*	@Override
	public String uploadFileToAws(ICIPDatasource datasource, String attributes, String uploadFile) {
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		String accessKey = connectionDetails.optString("accessKey");
		String secretKey = connectionDetails.optString("secretKey");
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		HostnameVerifier myVerifier = (hostname, session) -> true;
		ClientConfiguration clientConfiguration = new ClientConfiguration();
		ConnectionSocketFactory factory = new SdkTLSSocketFactory(sslContext, myVerifier);
		clientConfiguration.getApacheHttpClientConfig().setSslSocketFactory(factory);
		JSONObject attr = new JSONObject(attributes);
		String bucketName = attr.optString("bucket");
		String objectKey = attr.optString("uploadFilePath");
		String region = attr.optString("region");
		File localFilePath = new File(uploadFile);
		BasicAWSCredentials awsCreds = new BasicAWSCredentials(accessKey, secretKey);
		AmazonS3 s3Client = AmazonS3ClientBuilder.standard().withRegion(Regions.AP_SOUTH_1)
				 .withCredentials(new AWSStaticCredentialsProvider(awsCreds))
				 .build();

		try {
			  PutObjectRequest request = new PutObjectRequest(bucketName, objectKey,localFilePath);
			  s3Client.putObject(request);
			  return "s3://" + bucketName + "/" + objectKey;
			 }     
		catch (SdkClientException e) {
			logger.error(e.getMessage());
			return null;
		}

		}
	*/
			@Override
			public String downloadFile(ICIPDatasource datasource, String attributes, String downloadFilePath) throws Exception {

				JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
				String accessKey = connectionDetails.optString("accessKey");
				String secretKey = connectionDetails.optString("secretKey");
				String region = connectionDetails.optString("Region");
				URL endpointUrl = null;
				try {
					endpointUrl = new URL(connectionDetails.optString("url"));
				} catch (MalformedURLException e1) {
					logger.error("Upload DATASOURCE URL not correct" + e1.getMessage());
					return "Error";

				}
				JSONObject attr = new JSONObject(attributes);
				String bucketName = attr.optString("bucket");
				String objectKey = attr.optString("uploadFilePath");
				String localFilePath = downloadFilePath;
				BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
				TrustManager[] trustAllCerts = getTrustAllCerts();
				SSLContext sslContext = getSslContext(trustAllCerts);
				//HostnameVerifier myVerifier = (hostname, session) -> true;
				ClientConfiguration clientConfiguration = new ClientConfiguration();
				ConnectionSocketFactory factory = new SdkTLSSocketFactory(sslContext, (hostname, session) -> true);
				clientConfiguration.getApacheHttpClientConfig().setSslSocketFactory(factory);
				System.setProperty(SDKGlobalConfiguration.DISABLE_CERT_CHECKING_SYSTEM_PROPERTY, "true");
				TransferManager xfer_mgr = TransferManagerBuilder.standard().withS3Client(AmazonS3ClientBuilder.standard().withClientConfiguration(clientConfiguration)
						.withClientConfiguration(new ClientConfiguration().withProtocol(Protocol.HTTP)).withCredentials(new AWSStaticCredentialsProvider(credentials)).withEndpointConfiguration(
								new AwsClientBuilder.EndpointConfiguration(endpointUrl.toString(), region)).build()).build();

				try {
					MultipleFileDownload xfer = xfer_mgr.downloadDirectory(
							bucketName, objectKey,new File(localFilePath));
					xfer.waitForCompletion();
					return downloadFilePath;
					//	} catch (AmazonClientException | InterruptedException e) {
					//		logger.error(e.getMessage());
				} catch (AmazonClientException e) {
					logger.error(e.getMessage());
					//throw new RuntimeException(e);
				} catch (InterruptedException e) {
					// Re-interrupt the current thread
					Thread.currentThread().interrupt();
					logger.error(e.getMessage());
					//throw new RuntimeException("Thread was interrupted", e);
				} finally {
				}
				return localFilePath;
			}

//	@Override
//    public String downloadLogFilefromS3(ICIPDatasource datasource, String attributes, String downloadFilePath) {
//        JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
//        String accessKey = connectionDetails.optString("accessKey");
//        String secretKey = connectionDetails.optString("secretKey");
//        String prefix = "logs/"+"j-2IE53HO1F7LXC/"+"steps/"+"s-3JSFG5IQ5AYV0/";
//    //    Region region = Region.getRegion(Regions.AP_SOUTH_1);
//        JSONObject attr = new JSONObject(attributes);
//        String bucketName = attr.optString("bucket");
//        String objectKey = attr.optString("uploadFilePath");
//        String localFilePath = downloadFilePath;
//        BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
//        AmazonS3 s3Client = AmazonS3ClientBuilder.standard().withRegion(Regions.AP_SOUTH_1)
//                 .withCredentials(new AWSStaticCredentialsProvider(credentials))
//                 .build();
//        try {
//            TransferManager transferManager = TransferManagerBuilder.standard().withS3Client(s3Client).build();
//            File dir = new File(localFilePath);
//
// 
//
//            MultipleFileDownload download = transferManager.downloadDirectory(bucketName, prefix, dir);
//            download.waitForCompletion();
//
// 
//
//            //System.out.println("All logs downloaded successfully to " + localFolder);
//            return(localFilePath);
//        } catch (Exception e) {
//            logger.error("Error Message:    " + e.getMessage());
//        }
//
//
//        return localFilePath;     
//    }

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
//	private TrustManager[] getTrustAllCerts() throws Exception {
//		if("false".equalsIgnoreCase(certificateCheck)) {
//			TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
//				@Override
//				public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) {
//				}
//	
//				@Override
//				public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) {
//				}
//	
//				@Override
//				public java.security.cert.X509Certificate[] getAcceptedIssuers() {
//					return new java.security.cert.X509Certificate[] {};
//				}
//			} };
//			return trustAllCerts;
//		}else {
//	    // Load the default trust store
//	    TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
//	    trustManagerFactory.init((KeyStore) null);
//
//	    // Get the trust managers from the factory
//	    TrustManager[] trustManagers = trustManagerFactory.getTrustManagers();
//
//	    // Ensure we have at least one X509TrustManager
//	    for (TrustManager trustManager : trustManagers) {
//	        if (trustManager instanceof X509TrustManager) {
//	            return new TrustManager[] { (X509TrustManager) trustManager };
//	        }
//	    }
//
//	    throw new IllegalStateException("No X509TrustManager found. Please install the valid certificate in keystore");
//		}   
//	}

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
						public X509Certificate[] getAcceptedIssuers() {
							return new X509Certificate[] {};
						}
					} };
					return trustAllCerts;
				}
			}

			private SSLContext getSslContext(TrustManager[] trustAllCerts) {
				SSLContext sslContext = null;
				try {
					sslContext = SSLContext.getInstance("TLSv1.2");

					sslContext.init(null, trustAllCerts, new SecureRandom());
				} catch (KeyManagementException | NoSuchAlgorithmException e) {
					logger.error(e.getMessage(), e);
				}
				return sslContext;
			}



			public String downloadLogFilefromS3(ICIPDatasource datasource, String attributes, String downloadFilePath) {
				JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
				String accessKey = connectionDetails.optString("accessKey");
				String secretKey = connectionDetails.optString("secretKey");
				String prefix = "logs/"+"j-2IE53HO1F7LXC/"+"steps/"+"s-3JSFG5IQ5AYV0/";
				//    Region region = Region.getRegion(Regions.AP_SOUTH_1);
				JSONObject attr = new JSONObject(attributes);
				String bucketName = attr.optString("bucket");
				String objectKey = attr.optString("uploadFilePath");
				String localFilePath = downloadFilePath;
				BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
				AmazonS3 s3Client = AmazonS3ClientBuilder.standard().withRegion(Regions.AP_SOUTH_1)
						.withCredentials(new AWSStaticCredentialsProvider(credentials))
						.build();
				try {
					TransferManager transferManager = TransferManagerBuilder.standard().withS3Client(s3Client).build();
					File dir = new File(localFilePath);



					MultipleFileDownload download = transferManager.downloadDirectory(bucketName, prefix, dir);
					download.waitForCompletion();



					//System.out.println("All logs downloaded successfully to " + localFolder);
					return(localFilePath);
				} catch (Exception e) {
					logger.error("Error Message:    " + e.getMessage());
				}


				return localFilePath;

			}

			@Override
			public List<Map<String, Object>> getCustomModels(String org, List<ICIPDatasource> connectionsList, Integer page,
					Integer size, String query) {

				List<Map<String, Object>> allObjectDetails = new ArrayList<>();
				OkHttpClient customHttpClient = null;
				try {
					TrustManager[] trustAllCerts = getTrustAllCerts();
					SSLContext sslContext = getSslContext(trustAllCerts);
					customHttpClient = new OkHttpClient.Builder()
							.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
							.hostnameVerifier((hostname, session) -> true).build();
				} catch (Exception e) {
					logger.error("Error initializing custom HTTP client: " + e.getMessage());
					return allObjectDetails;
				}

				for (ICIPDatasource datasource : connectionsList) {
					JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
					String accessKey = connectionDetails.optString("accessKey");
					String secretKey = connectionDetails.optString("secretKey");
					String url = connectionDetails.optString("url");
					String bucketName = connectionDetails.optString("StorageContainerName");
					try {
						MinioClient minioClient = MinioClient.builder().endpoint(url).credentials(accessKey, secretKey)
								.httpClient(customHttpClient).build();
						Iterable<Result<Item>> results = minioClient
								.listObjects(ListObjectsArgs.builder().bucket(bucketName).recursive(true).build());
						for (Result<Item> result : results) {
							Item item = result.get();
							String path = item.objectName();
							String modelName = extractModelName(path);
							String lastModified = item.lastModified() != null ? item.lastModified().toString() : null;
							// Only add if file ends with .pkl (custom model file)
							if ((query == null || query.isEmpty() || modelName.toLowerCase().contains(query.toLowerCase()))
									&& path.toLowerCase().endsWith(".pkl")) {
								Map<String, Object> modelInfo = new HashMap<>();
								modelInfo.put("path", path);
								modelInfo.put("sourceName", modelName);
								modelInfo.put("name", extractModelNameWithoutVersion(modelName));
								modelInfo.put("sourceModifiedDate", lastModified);
								modelInfo.put("createdOn", lastModified);
								modelInfo.put("type", "Custom");
								modelInfo.put("status", "Registered");
								modelInfo.put("createdBy", org);
								modelInfo.put("organisation", org);
								modelInfo.put("appOrg", org);
								modelInfo.put("version", extractVersionFromPath(path));
								JSONObject artifacts = new JSONObject();
								artifacts.put("storageType", datasource.getAlias() + "-" + datasource.getName());
								artifacts.put("uri", bucketName + "/" + path);
								modelInfo.put("artifacts", artifacts.toString());
								allObjectDetails.add(modelInfo);
							}
						}
					} catch (Exception e) {
						logger.error("Error fetching objects from datasource: " + e.getMessage());
					}
				}

				// Sort by sourceModifiedDate/lastModified (latest first)
				allObjectDetails.sort((a, b) -> {
					String dateA = (String) a.get("sourceModifiedDate");
					String dateB = (String) b.get("sourceModifiedDate");
					if (dateA == null && dateB == null)
						return 0;
					if (dateA == null)
						return 1;
					if (dateB == null)
						return -1;
					return dateB.compareTo(dateA); // descending order
				});

				// If page or size is null or empty, return the entire list
				if (page == null || size == null) {
					return allObjectDetails;
				}

				// Pagination logic (page is 1-based)
				int effectivePage = (page < 1) ? 1 : page;
				int effectivePageSize = (size < 1) ? 8 : size;
				int fromIndex = Math.max(0, Math.min((effectivePage - 1) * effectivePageSize, allObjectDetails.size()));
				int toIndex = Math.max(0, Math.min(fromIndex + effectivePageSize, allObjectDetails.size()));
				return allObjectDetails.subList(fromIndex, toIndex);
			}

			private String extractModelNameWithoutVersion(String modelName) {
				// Removes version suffix like _v2, _v10, etc. from model name
				return modelName.replaceFirst("_v\\d+$", "");
			}

			// Helper method to extract model name from path
			private String extractModelName(String path) {
				if (path == null || !path.contains("/"))
					return path;
				String fileName = path.substring(path.lastIndexOf('/') + 1);
				int dotIdx = fileName.lastIndexOf('.');
				return (dotIdx > 0) ? fileName.substring(0, dotIdx) : fileName;
			}

			// Helper method to extract model version from path
			private String extractVersionFromPath(String path) {
				String version = "1"; // Default version is 1
				Pattern pattern = Pattern.compile("_v(\\d+)\\.pkl$", Pattern.CASE_INSENSITIVE);
				Matcher matcher = pattern.matcher(path);
				if (matcher.find()) {
					version = matcher.group(1);
				}
				return version;
			}

			@Override
			public Long getAllModelObjectDetailsCount(List<ICIPDatasource> datasources, String searchModelName, // pass null or
					// empty for no
					// filter
					String org) {
				long count = 0L;
				OkHttpClient customHttpClient = null;

				try {
					TrustManager[] trustAllCerts = getTrustAllCerts();
					SSLContext sslContext = getSslContext(trustAllCerts);
					customHttpClient = new OkHttpClient.Builder()
							.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
							.hostnameVerifier((hostname, session) -> true).build();
				} catch (Exception e) {
					logger.error("Error initializing custom HTTP client: " + e.getMessage());
					return 0L;
				}

				for (ICIPDatasource datasource : datasources) {
					JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
					String accessKey = connectionDetails.optString("accessKey");
					String secretKey = connectionDetails.optString("secretKey");
					String url = connectionDetails.optString("url");
					String bucketName = connectionDetails.optString("StorageContainerName");
					try {
						MinioClient minioClient = MinioClient.builder().endpoint(url).credentials(accessKey, secretKey)
								.httpClient(customHttpClient).build();
						Iterable<Result<Item>> results = minioClient
								.listObjects(ListObjectsArgs.builder().bucket(bucketName).recursive(true).build());
						for (Result<Item> result : results) {
							Item item = result.get();
							String path = item.objectName();
							String modelName = extractModelName(path);
							// Filter by model name if searchModelName is provided
							if ((searchModelName == null || searchModelName.isEmpty()
									|| modelName.toLowerCase().contains(searchModelName.toLowerCase()))
									&& path.toLowerCase().endsWith(".pkl")) {
								count++;
							}
						}
					} catch (Exception e) {
						logger.error("Error fetching objects from datasource: " + e.getMessage());
					}
				}
				return count;
			}

	}
