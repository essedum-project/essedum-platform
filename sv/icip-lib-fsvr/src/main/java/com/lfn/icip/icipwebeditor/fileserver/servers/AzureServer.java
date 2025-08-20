package com.lfn.icip.icipwebeditor.fileserver.servers;

import java.io.FileInputStream;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.StreamSupport;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

import org.apache.commons.codec.digest.DigestUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.azure.core.http.HttpClient;
import com.azure.core.http.okhttp.OkHttpAsyncHttpClientBuilder;
import com.azure.core.http.rest.PagedIterable;
import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.blob.models.BlobItem;
import com.azure.storage.blob.models.ListBlobsOptions;
import com.azure.storage.blob.models.ParallelTransferOptions;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.icip.icipwebeditor.fileserver.constants.FileServerConstants;
import com.lfn.icip.icipwebeditor.fileserver.constants.LoggerConstants;
import com.lfn.icip.icipwebeditor.fileserver.service.impl.CommonService;
import com.lfn.icip.icipwebeditor.fileserver.util.ChecksumUtil;
import com.lfn.icip.icipwebeditor.fileserver.util.FileServerUtil;
import com.lfn.icip.icipwebeditor.fileserver.util.FileUtil;
import com.lfn.icip.icipwebeditor.fileserver.util.StringUtil;

import okhttp3.OkHttpClient;

// TODO: Auto-generated Javadoc
/**
 * The Class AzureServer.
 */
@Component("azure")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class AzureServer implements FileServerUtil {

	/** The constants. */
	@Autowired
	private FileServerConstants constants;

	/** The common service. */
	@Autowired
	private CommonService commonService;

	/** The blob service client. */
	private BlobServiceClient blobServiceClient;
	
	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(AzureServer.class);
	
	@EssedumProperty("icip.certificateCheck")
	private String certificateCheck;
	
	private static final String UTF_ENCODE = "UTF-8";

	/**
	 * Instantiates a new azure server.
	 *
	 * @param connectStr the connect str
	 */
	public AzureServer(@Value("${fileserver.azure.connection}") String connectStr) {
		 connectToAzureBlobStorage(connectStr);
	}
	
	private void connectToAzureBlobStorage(String connectionString) {
		TrustManager[] trustAllCerts;
		trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		if (sslContext != null) {
			OkHttpClient customHttpClient = new OkHttpClient.Builder()
					.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
					.hostnameVerifier((hostname, session) -> true).build();

			HttpClient httpClient = new OkHttpAsyncHttpClientBuilder(customHttpClient).build();
			try {
				blobServiceClient = new BlobServiceClientBuilder().httpClient(httpClient)
						.connectionString(connectionString).buildClient();
				logger.info("Connected to Azure Blob Storage Successfully");
			} catch (Exception e) {
				logger.error("Error while connecting to Azure Blob Storage: ", e.getMessage());
			}
		} else {
			logger.error("SSLContext could not be initialized");
		}
	}
	
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
			logger.error(e.getMessage(), e);
		}
		return sslContext;
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
		String fileid = StringUtil.addPrefix(prefix, StringUtil.getRandomString());
		if (!blobServiceClient.getBlobContainerClient(bucket).exists()) {
			blobServiceClient.createBlobContainer(bucket);
		}
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
	@Override
	public Integer upload(Path path, String folder, String fileid, int totalCount, boolean replace, String bucket)
			throws Exception {
		String filename = path.getFileName().toString();
		Path dirpath = commonService.createTempPath();
		//FileInputStream fis = null;
		try (FileInputStream fis = new FileInputStream(path.toFile())) {
			
			String checksum = DigestUtils.sha256Hex(fis);
			Path checksumPath = Paths.get(dirpath.toAbsolutePath().toString(), constants.getChecksum(), filename);
			ChecksumUtil.check(checksum, path, checksumPath);

			if (folder != null) {
				fileid = String.format(LoggerConstants.STRING_SLASH_STRING, fileid, folder);
			}

			BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(bucket);

			if (Files.exists(path)) {
				String checksumfilename = URLEncoder
						.encode(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING_SLASH_STRING, fileid,
								constants.getMetadata(), constants.getChecksum(), filename), UTF_ENCODE);
				containerClient.getBlobClient(checksumfilename).uploadFromFile(checksumPath.toAbsolutePath().toString());

				String filenameString = URLEncoder
						.encode(String.format(LoggerConstants.STRING_SLASH_STRING, fileid, filename), UTF_ENCODE);
				containerClient.getBlobClient(filenameString).uploadFromFile(path.toAbsolutePath().toString(), replace);

				// Updating totalcount
				Path countPath = Paths.get(dirpath.toAbsolutePath().toString(), constants.getCountFile());
				byte[] countBytes = String.valueOf(totalCount).getBytes();
				Files.write(countPath, countBytes);
				String countFilename = URLEncoder.encode(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING,
						fileid, constants.getMetadata(), constants.getCountFile()), UTF_ENCODE);
				containerClient.getBlobClient(countFilename).uploadFromFile(countPath.toAbsolutePath().toString(), replace);

				// Updating timestamp
				Path timePath = Paths.get(dirpath.toAbsolutePath().toString(), constants.getTimestampFile());
				String currentTime = Timestamp.from(Instant.now()).toString();
				byte[] timeBytes = currentTime.getBytes();
				Files.write(timePath, timeBytes);
				String timestampFilename = URLEncoder.encode(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING,
						fileid, constants.getMetadata(), constants.getTimestampFile()), UTF_ENCODE);
				containerClient.getBlobClient(timestampFilename).uploadFromFile(timePath.toAbsolutePath().toString(), true);
			}

			ListBlobsOptions option1 = new ListBlobsOptions().setPrefix(fileid);
			ListBlobsOptions option2 = new ListBlobsOptions()
					.setPrefix(String.format(LoggerConstants.STRING_SLASH_STRING, fileid, constants.getMetadata()));
			PagedIterable<BlobItem> result1 = containerClient.listBlobs(option1, Duration.of(2, ChronoUnit.MINUTES));
			PagedIterable<BlobItem> result2 = containerClient.listBlobs(option2, Duration.of(2, ChronoUnit.MINUTES));
			long count1 = StreamSupport.stream(result1.spliterator(), false).count();
			long count2 = StreamSupport.stream(result2.spliterator(), false).count();
			long count = count1 - count2;
			return Math.round(count * 100F / totalCount);
		}
	}

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
	public byte[] download(String fileid, String index, String bucket) throws Exception {
		Path dirpath = commonService.createTempPath();
		Path path = Paths.get(dirpath.toAbsolutePath().toString(), index);
		Files.createDirectories(path.getParent());
		BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(bucket);
		String filename = URLEncoder.encode(String.format(LoggerConstants.STRING_SLASH_STRING, fileid, index), UTF_ENCODE);
		containerClient.getBlobClient(filename).downloadToFile(path.toAbsolutePath().toString());
		return Files.readAllBytes(path);
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
		BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(bucket);
		ListBlobsOptions option = new ListBlobsOptions().setPrefix(fileid);
		PagedIterable<BlobItem> result = containerClient.listBlobs(option, Duration.of(2, ChronoUnit.MINUTES));
		result.stream().forEach(blob -> {
			BlobClient sourceBlobClient = containerClient.getBlobClient(blob.getName());
			sourceBlobClient.delete();
		});
		return "Removed";
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
		Path dirpath = commonService.createTempPath();
		Path path = Paths.get(dirpath.toAbsolutePath().toString(), fileid, constants.getTimestampFile());
		Files.createDirectories(path.getParent());
		BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(bucket);
		String filename = URLEncoder.encode(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING, fileid,
				constants.getMetadata(), constants.getTimestampFile()), UTF_ENCODE);
		containerClient.getBlobClient(filename).downloadToFile(path.toAbsolutePath().toString());
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
		Path dirpath = commonService.createTempPath();
		Path path = Paths.get(dirpath.toAbsolutePath().toString(), fileid, constants.getCountFile());
		Files.createDirectories(path.getParent());
		BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(bucket);
		String filename = URLEncoder.encode(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING, fileid,
				constants.getMetadata(), constants.getCountFile()), "UTF-8");
		containerClient.getBlobClient(filename).downloadToFile(path.toAbsolutePath().toString());
		return FileUtil.getFirstLine(path);
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
		Path dirpath = commonService.createTempPath();
		Path path = Paths.get(dirpath.toAbsolutePath().toString(), fileid, constants.getMetadata(),
				constants.getChecksum(), index);
		Files.createDirectories(path.getParent());
		BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(bucket);
		String filename = URLEncoder.encode(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING_SLASH_STRING,
				fileid, constants.getMetadata(), constants.getChecksum(), index), UTF_ENCODE);
		containerClient.getBlobClient(filename).downloadToFile(path.toAbsolutePath().toString());
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

	@Override
	public Integer upload(Path path, String folder, String fileid, int totalCount, boolean replace, String bucket,
			MultipartFile file) throws Exception {
		// TODO Auto-generated method stub
		String filename = path.getFileName().toString();
		Path dirpath = commonService.createTempPath();
		//FileInputStream fis = null;
		try (FileInputStream fis = new FileInputStream(path.toFile())) {
			
			String checksum = DigestUtils.sha256Hex(fis);
			Path checksumPath = Paths.get(dirpath.toAbsolutePath().toString(), constants.getChecksum(), filename);
			ChecksumUtil.check(checksum, path, checksumPath);

			if (folder != null) {
				fileid = String.format(LoggerConstants.STRING_SLASH_STRING, fileid, folder);
			}

			BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(bucket);

			if (Files.exists(path)) {
				String checksumfilename = URLEncoder
						.encode(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING_SLASH_STRING, fileid,
								constants.getMetadata(), constants.getChecksum(), filename), UTF_ENCODE);
				containerClient.getBlobClient(checksumfilename).uploadFromFile(checksumPath.toAbsolutePath().toString());

				String filenameString = URLEncoder
						.encode(String.format(LoggerConstants.STRING_SLASH_STRING, fileid, filename), UTF_ENCODE);
				containerClient.getBlobClient(filenameString).uploadFromFile(path.toAbsolutePath().toString(), replace);

				// Updating totalcount
				Path countPath = Paths.get(dirpath.toAbsolutePath().toString(), constants.getCountFile());
				byte[] countBytes = String.valueOf(totalCount).getBytes();
				Files.write(countPath, countBytes);
				String countFilename = URLEncoder.encode(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING,
						fileid, constants.getMetadata(), constants.getCountFile()), UTF_ENCODE);
				containerClient.getBlobClient(countFilename).uploadFromFile(countPath.toAbsolutePath().toString(), replace);

				// Updating timestamp
				Path timePath = Paths.get(dirpath.toAbsolutePath().toString(), constants.getTimestampFile());
				String currentTime = Timestamp.from(Instant.now()).toString();
				byte[] timeBytes = currentTime.getBytes();
				Files.write(timePath, timeBytes);
				String timestampFilename = URLEncoder.encode(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING,
						fileid, constants.getMetadata(), constants.getTimestampFile()), UTF_ENCODE);
				containerClient.getBlobClient(timestampFilename).uploadFromFile(timePath.toAbsolutePath().toString(), true);
			}

			ListBlobsOptions option1 = new ListBlobsOptions().setPrefix(fileid);
			ListBlobsOptions option2 = new ListBlobsOptions()
					.setPrefix(String.format(LoggerConstants.STRING_SLASH_STRING, fileid, constants.getMetadata()));
			PagedIterable<BlobItem> result1 = containerClient.listBlobs(option1, Duration.of(2, ChronoUnit.MINUTES));
			PagedIterable<BlobItem> result2 = containerClient.listBlobs(option2, Duration.of(2, ChronoUnit.MINUTES));
			long count1 = StreamSupport.stream(result1.spliterator(), false).count();
			long count2 = StreamSupport.stream(result2.spliterator(), false).count();
			long count = count1 - count2;
			return Math.round(count * 100F / totalCount);
		}
	}

	

	

	@Override
	public Integer upload(Path path, String folder, String fileid, int totalCount, boolean replace,
			String bucket, String archivalFileserverurl) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getLastIndex(String fileid, String bucket, String datasource) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public byte[] download(String fileid, String index, String bucket, String fileserverurl)
			throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

}
