package com.lfn.icip.icipwebeditor.fileserver.servers;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.util.LinkedList;
import java.util.List;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.poi.util.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Scope;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.ClientConfiguration;
import com.amazonaws.SDKGlobalConfiguration;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.http.conn.ssl.SdkTLSSocketFactory;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.PutObjectResult;
import com.amazonaws.services.s3.model.S3Object;
import com.lfn.icip.icipwebeditor.fileserver.constants.FileServerConstants;
import com.lfn.icip.icipwebeditor.fileserver.constants.LoggerConstants;
import com.lfn.icip.icipwebeditor.fileserver.service.impl.CommonService;
import com.lfn.icip.icipwebeditor.fileserver.util.FileServerUtil;
import com.lfn.icip.icipwebeditor.fileserver.util.FileUtil;
import com.lfn.icip.icipwebeditor.fileserver.util.StringUtil;

import io.minio.DownloadObjectArgs;
import io.minio.ListObjectsArgs;
import io.minio.MinioClient;
import io.minio.RemoveObjectsArgs;
import io.minio.Result;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.InsufficientDataException;
import io.minio.errors.InternalException;
import io.minio.errors.InvalidResponseException;
import io.minio.errors.ServerException;
import io.minio.errors.XmlParserException;
import io.minio.messages.DeleteError;
import io.minio.messages.DeleteObject;
import io.minio.messages.Item;
import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/**
 * The Class MinioServer.
 */
@Component("hitachi")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)

/** The Constant log. */

/** The Constant log. */
@Log4j2
@RefreshScope
public class HitachiServer implements FileServerUtil {

	/** The constants. */
	@Autowired
	private FileServerConstants constants;

	/** The common service. */
	@Autowired
	private CommonService commonService;

	/** The minio client. */
	private MinioClient minioClient;
	
	private AmazonS3 amazons3client;

	/** The bucket. */
	@Value("${fileserver.hitachi.bucket}")
	private String bucket;
	
	@Value("${fileserver.hitachi.secret-key}")
	private String secretKey;
	
	@Value("${fileserver.hitachi.access-key}")
	private String accessKey;
	
	@Value("${fileserver.hitachi.url}")
	private String url;
	
	/**
	 * Instantiates a new minio server.
	 *
	 * @param secretKey the secret key
	 * @param accessKey the access key
	 */
	public HitachiServer(@Value("${fileserver.hitachi.secret-key}") String secretKey,
			@Value("${fileserver.hitachi.access-key}") String accessKey, @Value("${fileserver.hitachi.url}") String url) {
		AWSCredentials credentials = new BasicAWSCredentials(accessKey,secretKey);
		log.info("credentials" + credentials );
		amazons3client = AmazonS3ClientBuilder          
				.standard()
		        .withEndpointConfiguration(
				new AwsClientBuilder.EndpointConfiguration(url, "auto"))
				.withCredentials(new AWSStaticCredentialsProvider(credentials))
				.build();
		log.info(amazons3client+"s3client");
	}

	/**
	 * Generate file ID.
	 *
	 * @param bucket the bucket
	 * @param prefix the prefix
	 * @return the string
	 * @throws Exception the exception
	 */
	@Override
	public String generateFileID(String bucket, String prefix) throws Exception {
		bucket = getBucket(bucket);
		String fileid = StringUtil.addPrefix(prefix, StringUtil.getRandomString());
		return fileid;
	}

	/**
	 * Upload.
	 *
	 * @param path the path
	 * @param folder the folder
	 * @param fileid the fileid
	 * @param totalCount the total count
	 * @param replace the replace
	 * @param bucket the bucket
	 * @return the integer
	 * @throws Exception the exception
	 */
	
	
	/**
	 * Download.
	 *
	 * @param fileid the fileid
	 * @param index the index
	 * @param bucket the bucket
	 * @return the byte[]
	 * @throws Exception the exception
	 */
	@Override
	public byte[] download(String fileid, String index, String bucket1) throws Exception {
		
		String bucketName = bucket;		
		InputStream inputstream = null ;
		BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		HostnameVerifier myVerifier = (hostname, session) -> true;
		ClientConfiguration clientConfiguration = new ClientConfiguration();
		ConnectionSocketFactory factory = new SdkTLSSocketFactory(sslContext, myVerifier);
		clientConfiguration.getApacheHttpClientConfig().setSslSocketFactory(factory);
		System.setProperty(SDKGlobalConfiguration.DISABLE_CERT_CHECKING_SYSTEM_PROPERTY, "true");

        try {
        	S3Object s3object = amazons3client.getObject(bucketName,bucket1+"/"+fileid);
             inputstream = s3object.getObjectContent();
    		return IOUtils.toByteArray(inputstream);
			} catch (Exception e) {
				log.error(e.getMessage());
			} finally {
		}
		return IOUtils.toByteArray(inputstream);


	}

	/**
	 * Delete.
	 *
	 * @param fileid the fileid
	 * @param bucket the bucket
	 * @return the string
	 * @throws Exception the exception
	 */
	@Override
	public String delete(String fileid, String bucket) throws Exception {
		bucket = getBucket(bucket);
		List<DeleteObject> objects = new LinkedList<>();
		Iterable<Result<Item>> lists = minioClient
				.listObjects(ListObjectsArgs.builder().bucket(bucket).recursive(true).prefix(fileid).build());
		lists.forEach(element -> {
			try {
				Item item = element.get();
				objects.add(new DeleteObject(item.objectName()));
			} catch (InvalidKeyException | ErrorResponseException | IllegalArgumentException | InsufficientDataException
					| InternalException | InvalidResponseException | NoSuchAlgorithmException | ServerException
					| XmlParserException | IOException e) {
				log.error(e.getMessage(), e);
			}
		});
		StringBuilder strBuilder = new StringBuilder();
		Iterable<Result<DeleteError>> results = minioClient
				.removeObjects(RemoveObjectsArgs.builder().bucket(bucket).objects(objects).build());
		results.forEach(result -> {
			try {
				DeleteError error = result.get();
				strBuilder.append("Error in deleting object " + error.objectName() + "; " + error.message());
				strBuilder.append(System.getProperty("line.separator"));
			} catch (InvalidKeyException | ErrorResponseException | IllegalArgumentException | InsufficientDataException
					| InternalException | InvalidResponseException | NoSuchAlgorithmException | ServerException
					| XmlParserException | IOException e) {
				log.error(e.getMessage(), e);
			}
		});
		strBuilder.append("Done");
		String msg = strBuilder.toString();
		log.info(msg);
		return msg;
	}

	/**
	 * Last call.
	 *
	 * @param fileid the fileid
	 * @param bucket the bucket
	 * @return true, if successful
	 * @throws Exception the exception
	 */
	@Override
	public boolean lastCall(String fileid, String bucket) throws Exception {
		bucket = getBucket(bucket);
		Path dirpath = commonService.createTempPath();
		Path path = Paths.get(dirpath.toAbsolutePath().toString(), fileid, constants.getTimestampFile());
		Files.createDirectories(path.getParent());
		minioClient.downloadObject(DownloadObjectArgs
				.builder().bucket(bucket).object(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING, fileid,
						constants.getMetadata(), constants.getTimestampFile()))
				.filename(path.toAbsolutePath().toString()).build());
		return FileUtil.getLastCall(path);
	}

	/**
	 * Gets the last index.
	 *
	 * @param fileid the fileid
	 * @param bucket the bucket
	 * @return the last index
	 * @throws Exception the exception
	 */
	@Override
	public String getLastIndex(String fileid, String bucket) throws Exception {
		bucket = getBucket(bucket);
		Path dirpath = commonService.createTempPath();
		Path path = Paths.get(dirpath.toAbsolutePath().toString(), fileid, constants.getCountFile());
		Files.createDirectories(path.getParent());
//		minioClient.downloadObject(DownloadObjectArgs
//				.builder().bucket(bucket).object(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING, fileid,
//						constants.getMetadata(), constants.getCountFile()))
//				.filename(path.toAbsolutePath().toString()).build());
//		int lastIndex = Integer.valueOf(FileUtil.getFirstLine(path)) - 1;
		return String.valueOf("0");
	}

	/**
	 * Gets the checksum.
	 *
	 * @param fileid the fileid
	 * @param index the index
	 * @param bucket the bucket
	 * @return the checksum
	 * @throws Exception the exception
	 */
	@Override
	public String getChecksum(String fileid, String index, String bucket) throws Exception {
		bucket = getBucket(bucket);
		Path dirpath = commonService.createTempPath();
		Path path = Paths.get(dirpath.toAbsolutePath().toString(), fileid, constants.getMetadata(),
				constants.getChecksum(), index);
		Files.createDirectories(path.getParent());
		minioClient.downloadObject(DownloadObjectArgs.builder().bucket(bucket)
				.object(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING_SLASH_STRING, fileid,
						constants.getMetadata(), constants.getChecksum(), index))
				.filename(path.toAbsolutePath().toString()).build());
		return FileUtil.getFirstLine(path);
	}

	/**
	 * Deploy.
	 *
	 * @param authserviceSession the authservice session
	 * @param url the url
	 * @param filename the filename
	 * @param inferenceClassFileName the inference class file name
	 * @param modelClassFileName the model class file name
	 * @param requirementsFileName the requirements file name
	 * @param fileid the fileid
	 * @param bucket the bucket
	 * @return the string
	 * @throws Exception the exception
	 */
	@Override
	public String deploy(String authserviceSession, String url, String filename, String inferenceClassFileName,
			String modelClassFileName, String requirementsFileName, String fileid, String bucket) throws Exception {
		return commonService.deploy(authserviceSession, url, filename, inferenceClassFileName, modelClassFileName,
				requirementsFileName, fileid, bucket);
	}

	private String getBucket(String bucket) {
		return this.bucket.toLowerCase().trim()!="null"&&!this.bucket.trim().isBlank()?this.bucket:bucket;
	}

	@Override
	public Integer upload(Path path, String folder, String fileid, int totalCount, boolean replace, String bucket1, MultipartFile file)//			
	throws Exception {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		HostnameVerifier myVerifier = (hostname, session) -> true;
		ClientConfiguration clientConfiguration = new ClientConfiguration();
		ConnectionSocketFactory factory = new SdkTLSSocketFactory(sslContext, myVerifier);
		clientConfiguration.getApacheHttpClientConfig().setSslSocketFactory(factory);
		String bucketName = bucket ;
		ObjectMetadata metadata = new ObjectMetadata();
		metadata.setContentType(file.getContentType());
		metadata.setContentLength(file.getSize());
		PutObjectRequest request1 = new PutObjectRequest(bucketName,bucket1+"/"+fileid, file.getInputStream(),metadata);
		log.info("request"+request1);
		try {
			amazons3client.putObject(request1);
			return 1;
		} catch (Exception e) {
			   log.error(e.getMessage());
			    throw e;
		}
			
			
	}
	
	@Override
	public Integer upload(Path path, String folder, String fileid, int totalCount, boolean replace, String bucket1)//			
	throws Exception {
		FileInputStream fis = new FileInputStream(path.toFile()) ;
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		HostnameVerifier myVerifier = (hostname, session) -> true;
		ClientConfiguration clientConfiguration = new ClientConfiguration();
		ConnectionSocketFactory factory = new SdkTLSSocketFactory(sslContext, myVerifier);
		clientConfiguration.getApacheHttpClientConfig().setSslSocketFactory(factory);
		String bucketName = bucket ;
		ObjectMetadata metadata = new ObjectMetadata();
	    String contentType = URLConnection.guessContentTypeFromStream(fis);
	    if (contentType == null) {
	        contentType = MediaType.APPLICATION_OCTET_STREAM.toString();
	    }
	    metadata.setContentType(contentType);

	    // Get the size of the input stream.
	    long contentLength = fis.getChannel().size();
	    metadata.setContentLength(contentLength);
		PutObjectRequest request1 = new PutObjectRequest(bucketName,bucket1+"/"+fileid, fis, metadata);
		log.info("request"+request1);
		try {
		    PutObjectResult result = amazons3client.putObject(request1);
		    if (result == null || result.getETag() == null) {
		        throw new Exception("Failed to put object to S3.");
		    } else {
		        return 1;
		    }
		} catch (Exception e) {
		    log.error(e.getMessage());
		    throw e;
		}
			
				
	}
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
			sslContext = SSLContext.getInstance("SSL");

			sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
		} catch (KeyManagementException | NoSuchAlgorithmException e) {
			log.error(e.getMessage(), e);
		}
		return sslContext;
	}

	@Override
	public Integer upload(Path path, String folder, String fileid, int totalCount, boolean replace, String bucket,
			String archivalFileserverurl) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getLastIndex(String fileid, String bucket, String datasource) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public byte[] download(String fileid, String index, String bucket, String fileserverurl) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

}
