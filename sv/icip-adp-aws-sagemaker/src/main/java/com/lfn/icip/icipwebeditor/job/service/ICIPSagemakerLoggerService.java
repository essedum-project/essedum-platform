package com.lfn.icip.icipwebeditor.job.service;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.auth.profile.ProfileCredentialsProvider;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.ResponseHeaderOverrides;
import com.amazonaws.services.s3.model.S3Object;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.zip.GZIPInputStream;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.transfer.MultipleFileDownload;
import com.amazonaws.services.s3.transfer.TransferManager;
import com.amazonaws.services.s3.transfer.TransferManagerBuilder;
//import com.amazonaws.auth.AWSStaticCredentialsProvider;
//import com.amazonaws.auth.BasicAWSCredentials;
//import com.amazonaws.regions.Regions;
////import com.amazonaws.services.s3.AmazonS3;
////import com.amazonaws.services.s3.AmazonS3ClientBuilder;
////import com.amazonaws.services.s3.model.ObjectMetadata;
////import com.amazonaws.services.s3.model.PutObjectRequest;
//import com.amazonaws.services.s3.transfer.MultipleFileDownload;
//import com.amazonaws.services.s3.transfer.TransferManager;
//import com.amazonaws.services.s3.transfer.TransferManagerBuilder;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.service.IICIPDatasourcePluginsService;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.service.util.IICIPDataSourceServiceUtil;
import com.lfn.icip.icipwebeditor.constants.IAIJobConstants;
import com.lfn.icip.icipwebeditor.constants.LoggerConstants;
import com.lfn.icip.icipwebeditor.job.service.util.ICIPInitializeAnnotationServiceUtil;
import com.lfn.icip.icipwebeditor.model.ICIPJobs;
import com.lfn.icip.icipwebeditor.model.ICIPJobsPartial;
import com.lfn.icip.icipwebeditor.repository.ICIPJobsRepository;
import com.lfn.icip.icipwebeditor.service.IICIPJobRuntimeLoggerService;

import lombok.extern.log4j.Log4j2;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cloudwatchlogs.CloudWatchLogsClient;
import software.amazon.awssdk.services.cloudwatchlogs.model.GetLogEventsRequest;
import software.amazon.awssdk.services.cloudwatchlogs.model.OutputLogEvent;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cloudwatchlogs.CloudWatchLogsClient;
import software.amazon.awssdk.services.cloudwatchlogs.model.*;

import java.util.List;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;



import software.amazon.awssdk.services.cloudwatchlogs.model.GetLogEventsRequest;
import software.amazon.awssdk.services.cloudwatchlogs.model.GetLogEventsResponse;
import software.amazon.awssdk.services.cloudwatchlogs.model.OutputLogEvent;
//import software.amazon.awssdk.services.cloudwatchlogs.model.DescribeLogGroupsRequest;
//import software.amazon.awssdk.services.cloudwatchlogs.model.DescribeLogGroupsResponse;
//import software.amazon.awssdk.services.cloudwatchlogs.model.LogGroup;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

@Log4j2
@Service("sagemakerloggerservice")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RefreshScope
public class ICIPSagemakerLoggerService implements IICIPJobRuntimeLoggerService {

	private final Logger logger = LoggerFactory.getLogger(ICIPRemoteSagemakerJob.class);

	@Autowired
	private IICIPDatasourceService dsService;

	@Autowired
	private IICIPDatasourcePluginsService dsPluginService;

	@Autowired
	private ICIPInitializeAnnotationServiceUtil annotationServiceUtil;

	@Autowired
	private ICIPJobsRepository iCIPJobsRepository;

	@Autowired
	private ICIPRemoteSagemakerJob sagemakerJob;

	public ICIPJobsPartial updateAndLogJob(ICIPJobsPartial job) {
		return updateSagemakerJob(job);
	}

	public ICIPJobsPartial updateSagemakerJob(ICIPJobsPartial job) {

		Path writeLogFilePath = Paths.get(annotationServiceUtil.getFolderPath(),
				String.format(LoggerConstants.STRING_DECIMAL_STRING, IAIJobConstants.PIPELINELOGPATH, job.getId(),
						IAIJobConstants.OUTLOG));
		ICIPJobs job2save = iCIPJobsRepository.findById(job.getId()).get();
		FileOutputStream writer = null;
		FileLock lock = null;
		FileChannel channel = null;
		try {
			writer = new FileOutputStream(writeLogFilePath.toString());
			channel = writer.getChannel();
			channel.truncate(0);
			if (channel.isOpen()) {
				try {
					lock = channel.tryLock();
					if (lock == null) {
						return job;
					}
				} catch (Exception e) {
					logger.error("Exception", e.getMessage());
					return job;
				}

				org.json.JSONObject jobMetaData = new org.json.JSONObject(job.getJobmetadata());
				ICIPDatasource dsObject = dsService.getDatasource(jobMetaData.getString("datasourceName"),
						job.getOrganization());
				org.json.JSONObject connDetails = new org.json.JSONObject(dsObject.getConnectionDetails());
				// org.json.JSONObject responseObj =
				// emrJob.getPipelineStatus(jobMetaData.getString("trialId"),
				// connDetails);
				// String status = responseObj.getString("status");
				String uploadDsName = connDetails.get("datasource").toString();
				ICIPDatasource uploadDs = dsService.getDatasource(uploadDsName, job.getOrganization());
//				JSONObject responseObj = emrJob.getStepStatus(jobMetaData.getString("activeCluster"),
//						jobMetaData.getString("jobIds"), uploadDs);
//				JSONObject responseObj = emrJob.getStepStatus(emrJob.attributes.toString(),
//						jobMetaData.getString("jobIds"), uploadDs);
				//new Gson().toJson()
				JSONObject responseObj = sagemakerJob.getStatus(uploadDs,jobMetaData);
            	String status = responseObj.getString("StepStatus");

				IICIPDataSourceServiceUtil uploadPluginConn = dsPluginService.getDataSourceService(uploadDs);
				org.json.JSONObject attributes = new org.json.JSONObject();
				attributes.put("bucket", jobMetaData.get("bucketName"));
				attributes.put("uploadFilePath", jobMetaData.get("logFilePath"));
				switch (status) {
				case "PENDING":
					return job;
				case "RUNNING":
					return job;
				case "Completed":
					if (jobMetaData.has("logFilePath")) {
						ProcessingJobLogEvent(dsObject,jobMetaData.getString("processingJobName"),attributes.toString());
						String response = readLogsandWriteToLogFile(job, jobMetaData, uploadPluginConn, uploadDs,
								attributes, writer);
						
						//SimpleDateFormat sdf = new SimpleDateFormat("E MMM dd hh:mm:ss Z yyyy");
						SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
						try {
							Date finishedTime = sdf.parse(responseObj.getString("finishedTime"));
							job.setJobStatus("COMPLETED");
							job.setFinishtime(new Timestamp(finishedTime.getTime()));
							job2save.setJobStatus("COMPLETED");
							job2save.setFinishtime(new Timestamp(finishedTime.getTime()));
						} catch (JSONException | ParseException e) {
							// TODO Auto-generated catch block
							log.error(e.getMessage());
						}

						iCIPJobsRepository.save(job2save);

					}
					return job;
				case "Failed":
					String response = readLogsandWriteToLogFile(job, jobMetaData, uploadPluginConn, uploadDs,
							attributes, writer);
					job2save.setJobStatus("ERROR");
					job2save.setFinishtime(Timestamp.valueOf(responseObj.getString("finishedTime")));
					iCIPJobsRepository.save(job2save);
					job.setJobStatus("ERROR");
					job.setFinishtime(Timestamp.valueOf(responseObj.getString("finishedTime")));
					return job;
				default:
					return job;
				}
			}
		} catch (IOException | JSONException e1) {
//			String error = "Error in Job Execution : " + e1.getMessage()
//					+ System.getProperty(IAIJobConstants.LINE_SEPARATOR) + e1.toString();
			log.error("Error in Job Execution : " + e1.getMessage());
			job2save.setJobStatus("ERROR");
			job2save.setFinishtime(new Timestamp(System.currentTimeMillis()));
			iCIPJobsRepository.save(job2save);
			job.setJobStatus("ERROR");
			job.setFinishtime(new Timestamp(System.currentTimeMillis()));
			try {
				writer.write(e1.getMessage().getBytes());
			} catch (IOException e) {

				log.error(e.getMessage());
			}

		} finally {
			try {
				if (lock != null) {
					lock.release();
					if (writer != null) {
						writer.close();
					}
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				log.error(e.getMessage());

			}
		}

		return job;

	}

	private String readLogsandWriteToLogFile(ICIPJobsPartial job, JSONObject jobMetaData,
			IICIPDataSourceServiceUtil uploadPluginConn, ICIPDatasource uploadDs, org.json.JSONObject attributes,
			FileOutputStream writer) {
		try {

			Path downloadSagemakerLogPath = Paths.get(annotationServiceUtil.getFolderPath(),
					String.format("%s/%d", IAIJobConstants.SAGEMAKERLOGSSTOREPATH, job.getId()));
			Files.createDirectories(downloadSagemakerLogPath);
			downloadSagemakerLogPath = Paths.get(downloadSagemakerLogPath.toString(), "logs/", jobMetaData.getString("processingJobName") + ".log");
			downloadLogFileFromS3(uploadDs, jobMetaData, attributes.toString(), downloadSagemakerLogPath.toString(),writer);
			
//			Path decompressedLogFilePath = Paths.get(annotationServiceUtil.getFolderPath(),
//					String.format("%s/%s/decompressed/", IAIJobConstants.SAGEMAKERLOGSSTOREPATH, job.getId()));
			

//			String res = decompressLogFiles(downloadSagemakerLogPath, decompressedLogFilePath);
			//if (res != null) {
//				Path writeLogFilePath = Paths.get(annotationServiceUtil.getFolderPath(),
//						String.format(LoggerConstants.STRING_DECIMAL_STRING, IAIJobConstants.PIPELINELOGPATH,
//								job.getId(), IAIJobConstants.OUTLOG));

				//readfilesandwrite(downloadSagemakerLogPath, writeLogFilePath, writer);
				return "success";
			//}

		} catch (Exception e) {
			log.error(e.getMessage());
		}
		return null;

	}

	private void ProcessingJobLogEvent(ICIPDatasource datasource, String processingJobName ,String attributes) {
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		String accessKey = connectionDetails.optString("accessKey");
		String secretKey = connectionDetails.optString("secretKey");
		
		
		String region = connectionDetails.optString("region");
        String S3_OBJECT_KEY_PREFIX = "logs/";
        JSONObject attr = new JSONObject(attributes);
		String S3_BUCKET_NAME = attr.optString("bucket");
		//String S3_BUCKET_NAME = "aws-coe-pratice";
		String LOG_GROUP_NAME = "/aws/sagemaker/ProcessingJobs";
		AwsCredentialsProvider credentialsProvider = StaticCredentialsProvider.create(
				AwsBasicCredentials.create(accessKey,secretKey)
		);
		
		CloudWatchLogsClient cloudWatchLogsClient = CloudWatchLogsClient.builder()
		        .credentialsProvider(credentialsProvider)
		        .region(Region.of(region))
		        .build();

        //CloudWatchLogsClient cloudWatchLogsClient = CloudWatchLogsClient.create();
        //S3Client s3Client = S3Client.create();
		//S3Client s3Client = createS3Client(accessKey,secretKey);
		S3Client s3Client = S3Client.builder()
				.credentialsProvider(credentialsProvider)
				.region(Region.of(region))
				.build();

        String logStreamName = getLogStreamName(cloudWatchLogsClient, processingJobName,LOG_GROUP_NAME);
        String logEvents = getLogEvents(cloudWatchLogsClient, LOG_GROUP_NAME, logStreamName);

        String s3ObjectKey = S3_OBJECT_KEY_PREFIX + processingJobName + ".log";
        putObject(s3Client, S3_BUCKET_NAME, s3ObjectKey, logEvents);

        logger.info("Logs sent from CloudWatch to S3 successfully.");
    }
	private static String getLogStreamName(CloudWatchLogsClient cloudWatchLogsClient, String processingJobName,String LOG_GROUP_NAME ) {
        DescribeLogStreamsRequest describeLogStreamsRequest = DescribeLogStreamsRequest.builder()
                .logGroupName(LOG_GROUP_NAME)
                .logStreamNamePrefix( processingJobName)
                .build();

        DescribeLogStreamsResponse describeLogStreamsResponse = cloudWatchLogsClient.describeLogStreams(describeLogStreamsRequest);
        List<LogStream> logStreams = describeLogStreamsResponse.logStreams();

        if (logStreams.isEmpty()) {
            throw new IllegalArgumentException("No log streams found for the given processing job name.");
        }

        return logStreams.get(0).logStreamName();
    }


    private static String getLogEvents(CloudWatchLogsClient cloudWatchLogsClient, String logGroupName, String logStreamName) {
        GetLogEventsRequest getLogEventsRequest = GetLogEventsRequest.builder()
                .logGroupName(logGroupName)
                .logStreamName(logStreamName)
                .build();

        GetLogEventsResponse getLogEventsResponse = cloudWatchLogsClient.getLogEvents(getLogEventsRequest);
        StringBuilder logEvents = new StringBuilder();

        for (OutputLogEvent event : getLogEventsResponse.events()) {
            logEvents.append(event.message()).append("\n");
        }

        return logEvents.toString();
    }

    private static void putObject(S3Client s3Client, String bucketName, String objectKey, String content) {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromString(content));
    }
  


	private String downloadLogFileFromS3(ICIPDatasource datasource, JSONObject jobMetaData, String attributes,
			String downloadFilePath,FileOutputStream writer) throws IOException {

		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		String accessKey = connectionDetails.optString("accessKey");
		String secretKey = connectionDetails.optString("secretKey");
		String region = connectionDetails.getString("Region");
		S3Object fullObject = null, objectPortion = null, headerOverrideObject = null;
		//String prefix =  "logs/sagemaker-job-2023-09-12-10-43-57.log";
		String prefix = "logs/"+jobMetaData.getString("processingJobName") + ".log";
		JSONObject attr = new JSONObject(attributes);
		String bucketName = attr.optString("bucket");
		String objectKey = attr.optString("uploadFilePath");
		String localFilePath = downloadFilePath;
//		BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
//		AmazonS3 s3Client = AmazonS3ClientBuilder.standard().withRegion(region)
//				.withCredentials(new AWSStaticCredentialsProvider(credentials)).build();
//		try {
//			TransferManager transferManager = TransferManagerBuilder.standard().withS3Client(s3Client).build();
//			File dir = new File(localFilePath);
//			MultipleFileDownload download = transferManager.downloadDirectory(bucketName, prefix, dir);
//         	download.waitForCompletion();
//
//  		return localFilePath;
//		} catch (Exception e) {
//			logger.error("Error Message:    " + e.getMessage());
//		}
//
//		return localFilePath;
		   try {
        	   BasicAWSCredentials awsCredentials = new BasicAWSCredentials(accessKey, secretKey);
            AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                    .withRegion(region)
                    .withCredentials(new ProfileCredentialsProvider())
                    .build();

            // Get an object and print its contents.
            logger.info("Downloading an object");
            fullObject = s3Client.getObject(new GetObjectRequest(bucketName, prefix));
           //displayTextInputStream(fullObject.getObjectContent());
         // BufferedReader reader = new BufferedReader(new InputStreamReader(fullObject.getObjectContent()));
           // String line = null;
           // File Folder = new File(downloadFilePath);
    		//File files[];
    	//	files = Folder.listFiles();
            
				BufferedReader r = new BufferedReader(new InputStreamReader(fullObject.getObjectContent()));
				String line = null;
				while ((line = r.readLine()) != null) {
					writer.write(line.getBytes());
					writer.write(10);
				}
				r.close();
			
            // Get a range of bytes from an object and print the bytes.
            GetObjectRequest rangeObjectRequest = new GetObjectRequest(bucketName, prefix)
                    .withRange(0, 9);
            objectPortion = s3Client.getObject(rangeObjectRequest);
           
           // displayTextInputStream(objectPortion.getObjectContent());

            // Get an entire object, overriding the specified response headers, and print the object's content.
            
           // displayTextInputStream(headerOverrideObject.getObjectContent());
        } catch (AmazonServiceException e) {
            // The call was transmitted successfully, but Amazon S3 couldn't process 
            // it, so it returned an error response.
            e.getMessage();
        } catch (SdkClientException e) {
            // Amazon S3 couldn't be contacted for a response, or the client
            // couldn't parse the response from Amazon S3.
            e.getMessage();
        } finally {
            // To ensure that the network connection doesn't remain open, close any open input streams.
            if (fullObject != null) {
                fullObject.close();
            }
            if (objectPortion != null) {
                objectPortion.close();
            }
            if (headerOverrideObject != null) {
                headerOverrideObject.close();
            }
        }
		return localFilePath;
		 
	}

//	private void readfilesandwrite(Path decompressedLogFilePath, Path writeLogFilePath, FileOutputStream writer) {
//		File Folder = new File(decompressedLogFilePath.toString());
//		File files[];
//		files = Folder.listFiles();
//
//		try {
//			// write to the channel
//			for (File f : files) {
//				BufferedReader r = new BufferedReader(new FileReader(f));
//				String line = null;
//				while ((line = r.readLine()) != null) {
//					writer.write(line.getBytes());
//					writer.write(10);
//				}
//				r.close();
//			}
//
//		} catch (IOException e) {
//			// TODO Auto-generated catch block
//			log.error(e.getMessage());
//
//		} finally {
//
//		}
//
//	}

//	private String decompressLogFiles(Path downloadSagemakerLogPath, Path decompressedLogFilePath) throws IOException {
//		File oldDecompFile = new File(decompressedLogFilePath.toString());
////		for (File x : oldDecompFile.listFiles()) {
////			Files.deleteIfExists(Paths.get(x.getAbsolutePath()));
////		}
//		Files.createDirectories(decompressedLogFilePath);
//
//		File fObj = new File(downloadSagemakerLogPath.toString());
//		if (fObj.exists() && fObj.isDirectory()) {
//			File files[] = fObj.listFiles();
//			if (files.length > 0) {
//				for (File f : files) {
//					String fileName = f.getName();
//					Path extractPath = Paths.get(decompressedLogFilePath.toString(), fileName.replace(".gz", ""));
//					decompressGzip(Paths.get(f.getAbsolutePath()), extractPath);
//				}
//
//			}
//			return "success";
//		} else
//			return null;
//	}

//	public static void decompressGzip(Path source, Path target) throws IOException {
//
//		try (GZIPInputStream gis = new GZIPInputStream(new FileInputStream(source.toFile()));
//				FileOutputStream fos = new FileOutputStream(target.toFile())) {
//
//			byte[] buffer = new byte[1024];
//			int len;
//			while ((len = gis.read(buffer)) > 0) {
//				fos.write(buffer, 0, len);
//			}
//
//		}
//
//	}

	private TrustManager[] getTrustAllCerts() {
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

	private SSLContext getSslContext(TrustManager[] trustAllCerts) {
		SSLContext sslContext = null;
		try {
			sslContext = SSLContext.getInstance("TLSv1.2");

			sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
		} catch (KeyManagementException | NoSuchAlgorithmException e) {
			log.error("Exception:" + e);
		}
		return sslContext;
	}

}
