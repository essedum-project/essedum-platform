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

import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.sql.SQLException;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.imageio.ImageIO;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.Loader;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.python.google.common.util.concurrent.Futures;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.web.server.UnsupportedMediaTypeStatusException;

import com.amazonaws.ClientConfiguration;
import com.amazonaws.HttpMethod;
import com.amazonaws.Protocol;
import com.amazonaws.SDKGlobalConfiguration;
import com.amazonaws.SdkClientException;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.http.conn.ssl.SdkTLSSocketFactory;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.CompleteMultipartUploadRequest;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.amazonaws.services.s3.model.InitiateMultipartUploadRequest;
import com.amazonaws.services.s3.model.InitiateMultipartUploadResult;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import com.amazonaws.services.s3.model.PartETag;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.amazonaws.services.s3.model.UploadPartRequest;
import com.amazonaws.services.s3.model.UploadPartResult;
import com.amazonaws.services.s3.transfer.TransferManager;
import com.amazonaws.services.s3.transfer.TransferManagerBuilder;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.dataset.model.ICIPDataset;

import com.lfn.icip.icipwebeditor.rest.WebSocketController;
import com.opencsv.CSVParser;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.exceptions.CsvValidationException;

import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.UploadObjectArgs;
import okhttp3.OkHttpClient;
import com.azure.core.http.okhttp.OkHttpAsyncHttpClientBuilder;
import com.azure.core.http.HttpClient;
import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;
import com.azure.storage.blob.options.BlobDownloadToFileOptions;
import com.azure.storage.blob.options.BlobUploadFromFileOptions;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import com.azure.storage.blob.specialized.BlockBlobClient;

import reactor.core.publisher.Mono;

@Component("s3ds")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPDataSetServiceUtilS3 extends ICIPDataSetServiceUtil {

	@Autowired
	private WebSocketController webSocketController;
	
    private static final String UPLOAD_FILE_KEY = "uploadFile";
	private static final String ACCESS_KEY = "accessKey";
	private static final String SECRET_KEY = "secretKey";
	private static final String BUCKET_KEY = "bucket";
	private static final String REGION_KEY = "Region";
	private static final String AMPERSAND_ENCODED = "&amp;";
	
	private static final String PATH_DELIMITER = "/";
	
	public static final String SSL_CONTEXT_ERROR_MESSAGE = "SSLContext could not be initialized";
	
	private static final String OBJECT_KEY = "object";
	
	private static final String CSV_SEPARATOR_KEY = "csv_separator";
	
	public static final String UNSUPPORTED_TYPE_MESSAGE = "Type of %s is not supported";
	
	public static final String UPLOAD_DATASOURCE_URL_ERROR = "Upload DATASOURCE URL not correct";
    
	@EssedumProperty("icip.certificateCheck")
	private String certificateCheck;
	
	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(ICIPDataSetServiceUtilS3.class);

	/** The minio client. */
	private MinioClient minioClient;
	
	private static final List<String> CODE_EXTENSIONS =Arrays.asList(
			  "abap", "abc", "as", "ada", "alda", "conf", "apex", "aql", "adoc", "asl","asm", "ahk", "bat", "c9search", "c", "cirru", "clj", "cbl", "coffee", "cfm",
			  "cr", "cs", "csd", "orc", "sco", "css", "curly", "d", "dart", "diff", "html","dockerfile", "dot", "drl", "edi", "e", "ejs", "ex", "elm", "erl", "fs",
			  "fsl", "ftl", "gcode", "feature", "gitignore", "glsl", "gbs", "go", "graphql","groovy", "haml", "hbs", "hs", "cabal", "hx", "hjson", "html.eex", "erb",
			  "ini", "io", "jack", "jade", "java", "js", "json", "json5", "jq", "jsp","jssm", "jsx", "jl", "kt", "tex", "latte", "less", "liquid", "lisp", "ls",
			  "logic", "lsl", "lua", "lp", "lucene", "makefile", "md", "mask", "m", "mw","mel", "mips", "mc", "sql", "nginx", "nim", "nix", "nsi", "njk", "ml",
			  "pas", "pl", "pgsql", "php", "pig", "ps1", "praat", "pro", "properties", "proto", "py", "r", "cshtml", "rdoc", "red", "rhtml", "rst", "rb", "rs",
			  "sass", "scad", "scala", "scm", "scss", "sh", "sjs", "slim", "tpl", "soy","space", "rq", "sqlserver", "styl", "svg", "swift", "tcl", "tf", "txt",
			  "textile", "toml", "tsx", "ttl", "twig", "ts", "vala", "vbs", "vm", "v","vhd", "vf", "wlk", "xml", "xq", "yaml", "zeek","yml","log"
			);

	@Override
	public boolean testConnection(ICIPDataset dataset) throws EssedumException {

		try {
			boolean response;
			JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
			JSONObject attributes = new JSONObject(dataset.getAttributes());
			String uploadFile = attributes.optString(UPLOAD_FILE_KEY);
			String url = connectionDetails.optString("url");
			if (uploadFile != null && !uploadFile.isBlank()) {
				upload(dataset, uploadFile);
			}

			if (url.contains("blob")) {
				response = connectAzure(dataset);
			} else {
				response = connectMinio(dataset);
			}
			if (response)
				return true;
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
		return false;
	}

	private boolean connectMinio(ICIPDataset dataset) throws EssedumException {

		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		String accessKey = connectionDetails.optString(ACCESS_KEY);
		String secretKey = connectionDetails.optString(SECRET_KEY);
		String url = connectionDetails.optString("url");

		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String bucket = attributes.optString(BUCKET_KEY);

		try {
			TrustManager[] trustAllCerts = getTrustAllCerts();
			SSLContext sslContext = getSslContext(trustAllCerts);
			if (sslContext != null) {
			    OkHttpClient customHttpClient = new OkHttpClient.Builder()
			    		.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
					    .hostnameVerifier((hostname, session) -> true).build();
			    MinioClient mc = minioClient = MinioClient.builder().endpoint(url).credentials(accessKey, secretKey)
					    .httpClient(customHttpClient).build();
			    boolean found = mc.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
			    if (!found)
			    	return false;
			    }
		     else {
			  // Handle the case where sslContext is null
	             throw new EssedumException(SSL_CONTEXT_ERROR_MESSAGE);
	       }
		} catch (Exception e) {
			logger.info(e.getMessage());
			throw new EssedumException(e.getMessage());
		}
		return true;
	}

	private boolean connectAzure(ICIPDataset dataset) throws Exception {

		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		String accessKey = connectionDetails.optString(ACCESS_KEY);
		String secretKey = connectionDetails.optString(SECRET_KEY);

		//JSONObject attr = new JSONObject(dataset.getAttributes());
		TrustManager[] trustAllCerts;
		trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		if (sslContext != null) {
			OkHttpClient customHttpClient = new OkHttpClient.Builder()
					.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
					.hostnameVerifier((hostname, session) -> true).build();

			String connectStr = String.format(
					"DefaultEndpointsProtocol=https;AccountName=%s;AccountKey=%s;EndpointSuffix=core.windows.net",
					accessKey, secretKey);

			HttpClient httpClient = new OkHttpAsyncHttpClientBuilder(customHttpClient).build();
			try {
				BlobServiceClient client = new BlobServiceClientBuilder().httpClient(httpClient)
						.connectionString(connectStr).buildClient();
				logger.info("BlobServiceClient Successful ");
			} catch (Exception e) {
				logger.error("Error While connecting to azure : ", e.getMessage());
				return false;
			}
		} else {
			throw new EssedumException(SSL_CONTEXT_ERROR_MESSAGE);

		}

		return true;
	}

	private BlobServiceClient blobServiceClient(ICIPDataset dataset) throws EssedumException, Exception {
		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		String accessKey = connectionDetails.optString(ACCESS_KEY);
		String secretKey = connectionDetails.optString(SECRET_KEY);

		//JSONObject attr = new JSONObject(dataset.getAttributes());
		TrustManager[] trustAllCerts;
		trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		BlobServiceClient client = null;
		if (sslContext != null) {
			OkHttpClient customHttpClient = new OkHttpClient.Builder()
					.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
					.hostnameVerifier((hostname, session) -> true).build();
			String connectStr = String.format(
					"DefaultEndpointsProtocol=https;AccountName=%s;AccountKey=%s;EndpointSuffix=core.windows.net",
					accessKey, secretKey);

			HttpClient httpClient = new OkHttpAsyncHttpClientBuilder(customHttpClient).build();
			try {
				client = new BlobServiceClientBuilder().httpClient(httpClient).connectionString(connectStr)
						.buildClient();
				logger.info("BlobServiceClient Successful ");
			} catch (Exception e) {
				logger.error("Error  : ", e.getMessage());

			}
		} else {
			throw new EssedumException(SSL_CONTEXT_ERROR_MESSAGE);

		}

		return client;
	}

	// Returns a blobs/file list inside a container/bucket
	public JSONArray blobsList_azure(ICIPDataset dataset) throws EssedumException, Exception {
		BlobServiceClient blbserviceClient = blobServiceClient(dataset);
		JSONArray blobsList = new JSONArray();
		if (blbserviceClient != null) {
			String bucketName = new JSONObject(dataset.getAttributes()).optString(BUCKET_KEY);
			BlobContainerClient containerClient = blbserviceClient.getBlobContainerClient(bucketName);
			try {
				for (BlobItem item : containerClient.listBlobs()) {
					blobsList.put(item.getName());
				}
			} catch (Exception e) {
				logger.error("Error : ", e.getMessage());
			}
		} else {
			throw new EssedumException(SSL_CONTEXT_ERROR_MESSAGE);

		}
		return blobsList;
	}

	private void uploadFileToAzure(ICIPDataset dataset, String uploadFile)
			throws UncheckedIOException, NullPointerException, EssedumException, Exception {
		JSONObject attr = new JSONObject(dataset.getAttributes());
		String bucketName = attr.optString(BUCKET_KEY);

		logger.info("bucketName " + bucketName);
		String uploadFilePath = attr.optString("path");
		String objectKey;
		if (uploadFilePath != null && !uploadFilePath.isEmpty()) {
			objectKey = attr.optString("path") + "/" + attr.optString(OBJECT_KEY);
		} else
			objectKey = attr.optString(OBJECT_KEY);
		logger.info("objectKey " + objectKey);
		BlobServiceClient client = blobServiceClient(dataset);
		if (client != null) {
			BlobClient blobClient = client.getBlobContainerClient(bucketName).getBlobClient(objectKey);

			long blockSize = 2L * 1024 * 1024; // 2MB

			ParallelTransferOptions parallelTransferOptions = new ParallelTransferOptions().setBlockSizeLong(blockSize)
					.setMaxConcurrency(3);

			BlobHttpHeaders headers = new BlobHttpHeaders().setContentLanguage("en-IN").setContentType("binary");

			blobClient.uploadFromFile(uploadFile, parallelTransferOptions, headers, null, AccessTier.HOT,
					new BlobRequestConditions(), Duration.ofMinutes(30));

			logger.info("File Uploaded Successfully");
		} else {
			throw new EssedumException(SSL_CONTEXT_ERROR_MESSAGE);
		}
	}

	private JSONArray fetchFileFromAzure(ICIPDataset dataset, String blobName, int limit, int page)
			throws CsvValidationException, EssedumException, Exception {
		JSONObject attr = new JSONObject(dataset.getAttributes());
		String objectKey = attr.optString(OBJECT_KEY);
		String bucketName = new JSONObject(dataset.getAttributes()).optString(BUCKET_KEY);
		BlobServiceClient client = blobServiceClient(dataset);
		JSONArray records = new JSONArray();
		if (client != null) {
			BlobClient blobClient = client.getBlobContainerClient(bucketName).getBlobClient(blobName);
			byte[] byteArray = null;
			StringBuilder sb = new StringBuilder(objectKey);
			String extension = new StringBuilder(sb.reverse().toString().split("[.]", 2)[0].toLowerCase()).reverse()
					.toString();

			if (extension.equals("mp4") || extension.equals("mp3") || extension.equals("docx")
					|| extension.equals("pptx") || extension.equals("xlsx") || extension.equals("zip")) {
				String url = blobClient.getBlobUrl();
				OffsetDateTime expiryTime = OffsetDateTime.now().plusDays(1);
				BlobSasPermission permission = new BlobSasPermission().setReadPermission(true);
				BlobServiceSasSignatureValues values = new BlobServiceSasSignatureValues(expiryTime, permission)
						.setStartTime(OffsetDateTime.now());
				String preURL = blobClient.generateSas(values);
				String preSignedURL = url + "?" + preURL;

				records.put(preSignedURL);
				return records;
			} else {
				ByteArrayOutputStream os = new ByteArrayOutputStream();
				blobClient.download(os);
				byteArray = os.toByteArray();
				switch (extension) {
				case "png":
				case "jpeg":
				case "jpg":
					BufferedImage jpgimage = null;
					String outputFormat = "jpg";
					if ("png".equals(extension)) {
						outputFormat = "png";
					} else if ("jpeg".equals(extension)) {
						outputFormat = "jpeg";
					}
					try {
						jpgimage = ImageIO.read(new ByteArrayInputStream(byteArray));
					} catch (IOException e) {
						logger.error("Error reading image: " + e.getMessage(), e);
					}
					if (jpgimage != null) {
						ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
						ImageIO.write(jpgimage, outputFormat, outputStream);
						String base64Image = Base64.getEncoder().encodeToString(outputStream.toByteArray());
						records.put(base64Image);
					} else {
						logger.error("Image data is null or couldn't be read");
					}
					break;

				case "pdf":
					try (PDDocument pdfDocument = Loader.loadPDF(byteArray)) {

						ByteArrayOutputStream pdfOutputStream = new ByteArrayOutputStream();
						pdfDocument.setAllSecurityToBeRemoved(true);
						pdfDocument.save(pdfOutputStream);
						String base64Pdf = Base64.getEncoder().encodeToString(pdfOutputStream.toByteArray());
						records.put(base64Pdf);
					} catch (IOException pdfException) {
						logger.error("Error while processing PDF:" + pdfException.getMessage(), pdfException);
					}
					break;

				case "jsonl":
				case "json":
					try (Reader targetReaderJson = new InputStreamReader(new ByteArrayInputStream(byteArray));
							BufferedReader reader = new BufferedReader(targetReaderJson, 2048)) {
						String line;
						StringBuilder textBuilder = new StringBuilder(4096);
						while ((line = reader.readLine()) != null) {
							textBuilder.append(line);
						}
						String res = textBuilder.toString();
						if (res.startsWith("{"))
							records.put(new JSONObject(res));
						else if (res.startsWith("["))
							records = new JSONArray(res);
					}
					break;

				case "csv":
					char csvSeparator = attr.optString(CSV_SEPARATOR_KEY).isEmpty() ? ','
							: attr.optString(CSV_SEPARATOR_KEY).charAt(0);
					getCsvData(limit, records, byteArray, csvSeparator, page);
					break;

				case "txt":
					try (Reader targetReader = new InputStreamReader(new ByteArrayInputStream(byteArray));
							BufferedReader reader = new BufferedReader(targetReader, 2048)) {
						String line;
						StringBuilder textBuilder = new StringBuilder(4096);
						while ((line = reader.readLine()) != null) {
							textBuilder.append(line + '\n');
						}
						records.put(textBuilder.toString());
					}
					break;

				default:
					throw new UnsupportedMediaTypeStatusException(
							String.format(UNSUPPORTED_TYPE_MESSAGE, extension));
				}
			}
		} else {
			throw new EssedumException(" client cannot be null");
		}

		return records;
	}

	private void upload(ICIPDataset dataset, String uploadFile) throws Exception {

		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		String accessKey = connectionDetails.optString(ACCESS_KEY);
		String secretKey = connectionDetails.optString(SECRET_KEY);
		String region = connectionDetails.optString(REGION_KEY);
		URL endpointUrl = null;
		try {
			endpointUrl = new URL(connectionDetails.optString("url"));
			logger.info("endpointUrl " + endpointUrl);
		} catch (MalformedURLException e1) {
			logger.error(UPLOAD_DATASOURCE_URL_ERROR + e1.getMessage());
		}
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		ClientConfiguration clientConfiguration = new ClientConfiguration();
		ConnectionSocketFactory factory = new SdkTLSSocketFactory(sslContext, (hostname, session) -> true);
		clientConfiguration.getApacheHttpClientConfig().setSslSocketFactory(factory);
		JSONObject attr = new JSONObject(dataset.getAttributes());
		String bucketName = attr.optString(BUCKET_KEY);
		logger.info("bucketName " + bucketName);
		String uploadFilePath = attr.optString("path");
		String objectKey;
		if (uploadFilePath != null && !uploadFilePath.isEmpty()) {
			objectKey = attr.optString("path") + "/" + attr.optString(OBJECT_KEY);
		} else
			objectKey = attr.optString(OBJECT_KEY);
		logger.info("objectKey " + objectKey);
		File localFilePath = new File(uploadFile);
		BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
		AmazonS3 s3Client = AmazonS3ClientBuilder.standard().withClientConfiguration(clientConfiguration)
				.withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(endpointUrl.toString(), region))
				.withCredentials(new AWSStaticCredentialsProvider(credentials)).build();
		long partSize = 100L * 1024 * 1024;

		ExecutorService executorService = Executors.newCachedThreadPool();

		try {

			InitiateMultipartUploadRequest initRequest = new InitiateMultipartUploadRequest(bucketName, objectKey);
			InitiateMultipartUploadResult initResponse = s3Client.initiateMultipartUpload(initRequest);
			String uploadId = initResponse.getUploadId();

			List<PartETag> partETags = new ArrayList<>();
			long contentLength = localFilePath.length();
			long filePosition = 0;

			List<CompletableFuture<PartETag>> futures = new ArrayList<>();
			for (int i = 1; filePosition < contentLength; i++) {
				long partSizeRemaining = Math.min(partSize, contentLength - filePosition);
				UploadPartRequest uploadRequest = new UploadPartRequest().withBucketName(bucketName).withKey(objectKey)
						.withUploadId(uploadId).withPartNumber(i).withFileOffset(filePosition).withFile(localFilePath)
						.withPartSize(partSizeRemaining);

				CompletableFuture<PartETag> future = CompletableFuture.supplyAsync(() -> {
					try {
						UploadPartResult uploadPartResult = s3Client.uploadPart(uploadRequest);
						return uploadPartResult.getPartETag();
					} catch (Exception e) {
						logger.error(e.getMessage());
						return null;
					}
				}, executorService);

				futures.add(future);
				filePosition += partSizeRemaining;
			}

			CompletableFuture<Void> allOf = CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
			allOf.thenRunAsync(() -> {
				futures.forEach(future -> {
					try {
						PartETag partETag = future.get();
						if (partETag != null) {
							partETags.add(partETag);
						}
					} catch (Exception e) {
						e.getMessage();
					}
				});

				CompleteMultipartUploadRequest completeRequest = new CompleteMultipartUploadRequest(bucketName,
						objectKey, uploadId, partETags);
				s3Client.completeMultipartUpload(completeRequest);
				logger.info("File Uploaded successfully");
				webSocketController.sendUploadStatus("Success");
			});

			logger.info("File Upload Initiated");
		} catch (Exception e) {
			logger.error("Error occurred in upload method", e);
			webSocketController.sendUploadStatus("Error");
		}

	}

	@Override
	public void deleteFiledata(ICIPDataset dataset, String fileName) {
		try {
			JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
			String accessKey = connectionDetails.optString(ACCESS_KEY);
			String secretKey = connectionDetails.optString(SECRET_KEY);
			String region = connectionDetails.optString(REGION_KEY);
			URL endpointUrl = null;
			String filePath2;
			try {
				endpointUrl = new URL(connectionDetails.optString("url"));
				logger.info("endpointUrl " + endpointUrl);
			} catch (MalformedURLException e1) {
				logger.error(UPLOAD_DATASOURCE_URL_ERROR + e1.getMessage());
			}
			TrustManager[] trustAllCerts = getTrustAllCerts();
			SSLContext sslContext = getSslContext(trustAllCerts);
			ClientConfiguration clientConfiguration = new ClientConfiguration();
			ConnectionSocketFactory factory = new SdkTLSSocketFactory(sslContext, (hostname, session) -> true);
			clientConfiguration.getApacheHttpClientConfig().setSslSocketFactory(factory);
			JSONObject attribute = new JSONObject(dataset.getAttributes());
			String bucketName = attribute.optString(BUCKET_KEY);
			String[] path = attribute.optString("path").split(PATH_DELIMITER);
			String filePath = path[0] + "/" + fileName;
			if (filePath.contains("amp")) {
				filePath2 = filePath.replace(AMPERSAND_ENCODED, "&");
				filePath = filePath2;
			}
			BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
			if (endpointUrl != null) {
				AmazonS3 s3Client = AmazonS3ClientBuilder.standard().withClientConfiguration(clientConfiguration)
						.withEndpointConfiguration(
								new AwsClientBuilder.EndpointConfiguration(endpointUrl.toString(), region))
						.withCredentials(new AWSStaticCredentialsProvider(credentials)).build();
				DeleteObjectRequest delete = new DeleteObjectRequest(bucketName, filePath);
				s3Client.deleteObject(delete);
				logger.info("File Deleted Successfully");
			} else {
				throw new EssedumException("Endpoint URL cannot be null");
			}
		} catch (Exception e) {
			logger.info("File is not deleted");
		}
	}

	private JSONArray getFileInfoAsJSONArray(ICIPDataset dataset, int limit, int page)
			throws NumberFormatException, Exception {
		Date modifydate = new Date();
		long filesize = 0;
		JSONArray records = new JSONArray();
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String bucketName = attributes.getString(BUCKET_KEY);
		String uploadFilePath = attributes.optString("path");
		String objectKey;
		String objectKey2 = null;
		if (uploadFilePath != null && !uploadFilePath.isEmpty()) {
			objectKey = attributes.optString("path") + "/" + attributes.optString(OBJECT_KEY);
		} else
			objectKey = attributes.optString(OBJECT_KEY);
		if (objectKey.contains("amp")) {
			objectKey2 = objectKey.replace(AMPERSAND_ENCODED, "&");
			objectKey = objectKey2;
		}
		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		String accessKey = connectionDetails.optString(ACCESS_KEY);
		String secretKey = connectionDetails.optString(SECRET_KEY);
		String region = connectionDetails.optString(REGION_KEY);
		URL endpointUrl = null;
		try {
			endpointUrl = new URL(connectionDetails.optString("url"));
		} catch (MalformedURLException e1) {
			logger.error("Error occured while fetching FileInfo" + e1.getMessage());
		}
		BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		ClientConfiguration clientConfiguration = new ClientConfiguration();
		ConnectionSocketFactory factory = new SdkTLSSocketFactory(sslContext, (hostname, session) -> true);
		clientConfiguration.getApacheHttpClientConfig().setSslSocketFactory(factory);
		System.setProperty(SDKGlobalConfiguration.DISABLE_CERT_CHECKING_SYSTEM_PROPERTY, "true");
		if (endpointUrl != null) {
			TransferManager transferManager = TransferManagerBuilder.standard()
					.withS3Client(AmazonS3ClientBuilder.standard().withClientConfiguration(clientConfiguration)
							.withClientConfiguration(new ClientConfiguration().withProtocol(Protocol.HTTP))
							.withCredentials(new AWSStaticCredentialsProvider(credentials))
							.withEndpointConfiguration(
									new AwsClientBuilder.EndpointConfiguration(endpointUrl.toString(), region))
							.build())
					.build();
			connectMinio(dataset);
			ListObjectsV2Request req = new ListObjectsV2Request().withBucketName(bucketName).withPrefix(objectKey);
			ListObjectsV2Result listing;
			List<S3ObjectSummary> docList = new ArrayList<>();
			do {
				listing = transferManager.getAmazonS3Client().listObjectsV2(req);
				docList.addAll(listing.getObjectSummaries());
				String token = listing.getNextContinuationToken();
				req.setContinuationToken(token);
			} while (listing.isTruncated());
			try (InputStream allbytes = minioClient
					.getObject(GetObjectArgs.builder().bucket(bucketName).object(objectKey).build());) {

				StringBuilder sb = new StringBuilder(objectKey);
				String extension = new StringBuilder(sb.reverse().toString().split("[.]", 2)[0].toLowerCase()).reverse()
						.toString();
				for (S3ObjectSummary commonPrefix : docList) {
					filesize = commonPrefix.getSize();
					modifydate = commonPrefix.getLastModified();
				}
				Map<String, Object> recData = new HashMap<>();
				if (!extension.isEmpty()) {
					recData.put("filesize", filesize);
					recData.put("lastdate", modifydate);
					records.put(recData);
				} else {
					throw new UnsupportedMediaTypeStatusException(
							String.format(UNSUPPORTED_TYPE_MESSAGE, attributes.optString(OBJECT_KEY)));
				}
			} catch (IOException e) {
				logger.error(e.getMessage(), e);
			}
			logger.info("Fetched file info successfully");
		} else {
			throw new EssedumException("Endpoint URL cannot be null");
		}
		return records;
	}

	private JSONArray getDataAsJSONArray(ICIPDataset dataset, int limit, int page)
			throws NumberFormatException, Exception {
		ArrayList<String> filesList = new ArrayList<>();
		JSONArray records = new JSONArray();
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String bucketName = attributes.getString(BUCKET_KEY);
		String uploadFilePath = attributes.optString("path");
		String objectKey;
		String objectKey2 = null;
		if (uploadFilePath != null && !uploadFilePath.isEmpty()) {
			objectKey = attributes.optString("path") + "/" + attributes.optString(OBJECT_KEY);
		} else
			objectKey = attributes.optString(OBJECT_KEY);
		if (objectKey.contains("amp")) {
			objectKey2 = objectKey.replace(AMPERSAND_ENCODED, "&");
			objectKey = objectKey2;
		}
		byte[] byteArray = null;
		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		String accessKey = connectionDetails.optString(ACCESS_KEY);
		String secretKey = connectionDetails.optString(SECRET_KEY);
		String region = connectionDetails.optString(REGION_KEY);
		URL endpointUrl = null;
		try {
			endpointUrl = new URL(connectionDetails.optString("url"));
		} catch (MalformedURLException e1) {
			logger.error(UPLOAD_DATASOURCE_URL_ERROR + e1.getMessage());
		}

		if (!(connectionDetails.optString("url").contains("blob"))) {
			BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
			TrustManager[] trustAllCerts = getTrustAllCerts();
			SSLContext sslContext = getSslContext(trustAllCerts);
			ClientConfiguration clientConfiguration = new ClientConfiguration();
			ConnectionSocketFactory factory = new SdkTLSSocketFactory(sslContext, (hostname, session) -> true);
			clientConfiguration.getApacheHttpClientConfig().setSslSocketFactory(factory);
			System.setProperty(SDKGlobalConfiguration.DISABLE_CERT_CHECKING_SYSTEM_PROPERTY, "true");
			TransferManager transferManager = TransferManagerBuilder.standard()
					.withS3Client(AmazonS3ClientBuilder.standard().withClientConfiguration(clientConfiguration)
							.withClientConfiguration(new ClientConfiguration().withProtocol(Protocol.HTTP))
							.withCredentials(new AWSStaticCredentialsProvider(credentials))
							.withEndpointConfiguration(
									new AwsClientBuilder.EndpointConfiguration(endpointUrl.toString(), region))
							.build())
					.build();
			connectMinio(dataset);
			ListObjectsV2Request req = new ListObjectsV2Request().withBucketName(bucketName).withPrefix(objectKey);
			ListObjectsV2Result listing;
			List<S3ObjectSummary> docList = new ArrayList<>();
		    do{
		        listing=transferManager.getAmazonS3Client().listObjectsV2(req);
				docList.addAll(listing.getObjectSummaries());
		        String token = listing.getNextContinuationToken();
		        req.setContinuationToken(token);
		    }while (listing.isTruncated());
		    
			if (attributes.optString(OBJECT_KEY).equals("")){
				for (S3ObjectSummary commonPrefix : docList) {
					String objectPath = commonPrefix.getKey();
					if (objectPath.endsWith("/"))
						continue;
					filesList.add(objectPath);
				}
				logger.info("fileNames:", filesList);
				return records.put(filesList);
			}
			StringBuilder sb = new StringBuilder(objectKey);
			String extension = new StringBuilder(sb.reverse().toString().split("[.]", 2)[0].toLowerCase()).reverse()
					.toString();
			if (extension.equals("mp4") || extension.equals("mp3") || extension.equals("docx")
					|| extension.equals("pptx") || extension.equals("xlsx") || extension.equals("zip")) {
				AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
						.withEndpointConfiguration(
								new AwsClientBuilder.EndpointConfiguration(endpointUrl.toString(), region))
						.withCredentials(
								new AWSStaticCredentialsProvider(new BasicAWSCredentials(accessKey, secretKey)))
						.build();
				Date expiration = new Date(System.currentTimeMillis() + 3600000);

				GeneratePresignedUrlRequest generatePresignedUrlRequest = new GeneratePresignedUrlRequest(bucketName,
						objectKey).withMethod(HttpMethod.GET).withExpiration(expiration);

				URL url = s3Client.generatePresignedUrl(generatePresignedUrlRequest);
				logger.info("Pre-signed URL: " + url.toString());

				records.put(url);
				return records;
			}
			try (InputStream allbytes = minioClient
					.getObject(GetObjectArgs.builder().bucket(bucketName).object(objectKey).build());) {

				byteArray = allbytes.readAllBytes();
				if (byteArray.length > 0) {
					if(CODE_EXTENSIONS.contains(extension)){
						extension="code";
					}
					logger.info("extension", extension);
					switch (extension) {

//				case "xlsx":
//					getExcelData(records, byteArray, limit, page);
//					break;

					case "csv":
						char csvSeparator = attributes.optString(CSV_SEPARATOR_KEY).isEmpty() ? ','
								: attributes.optString(CSV_SEPARATOR_KEY).charAt(0);
						getCsvData(limit, records, byteArray, csvSeparator, page);
						break;

					case "txt":
						logger.info("OBJECTKEY in txt: " +objectKey );
						if(objectKey.contains("/FAQ/")) {
							logger.info("OBJECTKEY in if block: " +objectKey );
							try (Reader targetReader = new InputStreamReader(new ByteArrayInputStream(byteArray));
									BufferedReader reader = new BufferedReader(targetReader, 2048)) {
								String line;
								StringBuilder textBuilder = new StringBuilder(4096);
								while ((line = reader.readLine()) != null) {
									textBuilder.append(line);
								}
								String[] qa = textBuilder.toString().split("Q\\. ");
								List<Map<String,String>> keyVal = new ArrayList<>();
								for(String i:qa) { 
									String[] values = i.split("A\\.");
									if(values.length == 2) {
										String ques = values[0];
										String ans = values[1];
										Map<String, String> keyValue = new LinkedHashMap<>();
										keyValue.put(ques.trim(), ans.trim());
										records.put(keyValue);
									} 
								}
							}
							
						} else {
							logger.info("OBJECTKEY in else block: " +objectKey );
							try (Reader targetReader = new InputStreamReader(new ByteArrayInputStream(byteArray));
									BufferedReader reader = new BufferedReader(targetReader, 2048)) {
								String line;
								StringBuilder textBuilder = new StringBuilder(4096);
								while ((line = reader.readLine()) != null) {
									textBuilder.append(line + '\n');
								}
								records.put(textBuilder.toString());
							}
						}

						break;
					case "code":

						if(objectKey.contains("/FAQ/")) {
							try (Reader targetReader = new InputStreamReader(new ByteArrayInputStream(byteArray));
									BufferedReader reader = new BufferedReader(targetReader, 2048)) {
								String line;
								StringBuilder textBuilder = new StringBuilder(4096);
								while ((line = reader.readLine()) != null) {
									textBuilder.append(line);
								}
								String[] qa = textBuilder.toString().split("Q\\. ");
								List<Map<String,String>> keyVal = new ArrayList<>();
								for(String i:qa) { 
									String[] values = i.split("A\\.");
									if(values.length == 2) {
										String ques = values[0];
										String ans = values[1];
										Map<String, String> keyValue = new LinkedHashMap<>();
										keyValue.put(ques.trim(), ans.trim());
										records.put(keyValue);
									} 
								}
							}
							
						} else {
							try (Reader targetReader = new InputStreamReader(new ByteArrayInputStream(byteArray));
									BufferedReader reader = new BufferedReader(targetReader, 2048)) {
								String line;
								StringBuilder textBuilder = new StringBuilder(4096);
								while ((line = reader.readLine()) != null) {
									textBuilder.append(line + '\n');
								}
								records.put(textBuilder.toString());
							}
						}

						break;

					case "png":
					case "jpeg":
					case "jpg":
						BufferedImage jpgimage = null;
						String outputFormat = "jpg";
						if ("png".equals(extension)) {
							outputFormat = "png";
						} else if ("jpeg".equals(extension)) {
							outputFormat = "jpeg";
						}
						try {
							jpgimage = ImageIO.read(new ByteArrayInputStream(byteArray));
						} catch (IOException e) {
							logger.error("Error reading image: " + e.getMessage(), e);
						}
						if (jpgimage != null) {
							ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
							ImageIO.write(jpgimage, outputFormat, outputStream);
							String base64Image = Base64.getEncoder().encodeToString(outputStream.toByteArray());
							records.put(base64Image);
						} else {
							logger.error("Image data is null or couldn't be read");
						}
						break;

					case "pdf":
						try (PDDocument pdfDocument = Loader.loadPDF(byteArray)) {

							ByteArrayOutputStream pdfOutputStream = new ByteArrayOutputStream();
							pdfDocument.setAllSecurityToBeRemoved(true);
							pdfDocument.save(pdfOutputStream);
							String base64Pdf = Base64.getEncoder().encodeToString(pdfOutputStream.toByteArray());
							records.put(base64Pdf);

						} catch (IOException pdfException) {
							logger.error("Error while processing PDF:" + pdfException.getMessage(), pdfException);
						}
						break;

					case "jsonl":
					case "json":

						try (Reader targetReaderJson = new InputStreamReader(new ByteArrayInputStream(byteArray));
								BufferedReader reader = new BufferedReader(targetReaderJson, 2048)) {
							String line;
							StringBuilder textBuilder = new StringBuilder(4096);
							while ((line = reader.readLine()) != null) {
								textBuilder.append(line);
							}
							String res = textBuilder.toString();
							if (res.startsWith("{"))
								records.put(new JSONObject(res));
							else if (res.startsWith("["))
								records = new JSONArray(res);
						}
						break;
						
					case "pkl":
					case "joblib":
					case "h5":
					case "pt":
					case "pth":
					case "ckpt":
					case "model":
						// Handle model files - return as base64 encoded data
						String base64Model = Base64.getEncoder().encodeToString(byteArray);
						JSONObject modelData = new JSONObject();
						modelData.put("data", base64Model);
						modelData.put("fileName", objectKey.substring(objectKey.lastIndexOf("/") + 1));
						modelData.put("fileType", extension);
						modelData.put("contentType", getContentTypeForModelFile(extension));
						records.put(modelData);
						break;
						
					default:
						throw new UnsupportedMediaTypeStatusException(
								String.format(UNSUPPORTED_TYPE_MESSAGE, attributes.optString(OBJECT_KEY)));
					}
				} else {
					throw new IOException("Unable to read data from the file!");
				}

			} catch (IOException | CsvValidationException | JSONException e) {
				logger.error(e.getMessage(), e);
				return null;
			}

			logger.info("preparing dataset");
			return records;
		} else {
			try {
				JSONArray records1 = new JSONArray();
				if (attributes.optString(OBJECT_KEY).equals("")) {
					JSONArray list = blobsList_azure(dataset);
					records1.put(list);
					return records1;
				} else {
					records1 = fetchFileFromAzure(dataset, objectKey, limit, page);
					return records1;
				}
			} catch (IOException | CsvValidationException | JSONException e) {
				logger.error(e.getMessage(), e);
				return null;
			}

		}

	}
	
	/**
	 * Helper method to get appropriate content type for model files
	 */
	private String getContentTypeForModelFile(String extension) {
		switch (extension.toLowerCase()) {
			case "pkl":
				return "application/octet-stream";
			case "joblib":
				return "application/octet-stream";
			case "h5":
				return "application/x-hdf5";
			case "pt":
			case "pth":
				return "application/octet-stream";
			case "ckpt":
				return "application/octet-stream";
			case "model":
				return "application/octet-stream";
			default:
				return "application/octet-stream";
		}
	}

	/**
	 * Gets the excel data.
	 *
	 * @param records   the records
	 * @param byteArray the byte array
	 * @param limit     the limit
	 * @return the excel data
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	private void getExcelData(JSONArray records, byte[] byteArray, int limit, int page) throws IOException {
		Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(byteArray));
		Sheet datatypeSheet = workbook.getSheetAt(0);
		ArrayList<String> colList = new ArrayList<>();
		Iterator<Row> iterator = datatypeSheet.iterator();
		Iterator<Cell> headerCell = null;
		if (iterator.hasNext()) {
			Row headerRow = iterator.next();
			headerCell = headerRow.iterator();
			while (headerCell.hasNext()) {
				Cell currentCell = headerCell.next();
				String cell = currentCell.toString();
				colList.add(cell);
			}
		}
		if (limit == 0) {
			while (iterator.hasNext()) {
//			while (iterator.hasNext() && records.length() < limit) {
				Row currentRow = iterator.next();
				JSONObject tempRow = new JSONObject();
				Iterator<Cell> cellIterator = currentRow.iterator();
				int index = 0;
				while (cellIterator.hasNext()) {
					Cell currentCell = cellIterator.next();
					if (currentCell.getCellType() == CellType.NUMERIC) {
						try {
							double d = Double.parseDouble(currentCell.toString());
							if (Double.compare(d, Math.floor(d)) == 0 && !Double.isInfinite(d)) {
								tempRow.put(colList.get(index), currentCell.getNumericCellValue());
								index++;
							}
						} catch (NoSuchElementException ne) {
							tempRow.put("", currentCell);
						}
					} else {
						tempRow.put(colList.get(index), currentCell.toString());
						index++;
					}
				}

				records.put(tempRow);
			}
		} else {
			int recordsToSkip = (page - 0) * limit;
			for (int i = 0; i < recordsToSkip; i++) {
				iterator.next();
			}
			int resordsToIterate = 0;
			while (iterator.hasNext() && resordsToIterate < limit) {
				Row currentRow = iterator.next();
				JSONObject tempRow = new JSONObject();
				Iterator<Cell> cellIterator = currentRow.iterator();
				int index = 0;
				while (cellIterator.hasNext()) {
					Cell currentCell = cellIterator.next();
					if (currentCell.getCellType() == CellType.NUMERIC) {
						try {
							double d = Double.parseDouble(currentCell.toString());
							if (Double.compare(d, Math.floor(d)) == 0 && !Double.isInfinite(d)) {
								tempRow.put(colList.get(index), currentCell.getNumericCellValue());
								index++;
							}
						} catch (NoSuchElementException ne) {
							tempRow.put("", currentCell);
						}
					} else {
						tempRow.put(colList.get(index), currentCell.toString());
						index++;
					}
				}

				records.put(tempRow);
				resordsToIterate++;
			}

		}
		workbook.close();
	}

	/**
	 * Checks if is numeric.
	 *
	 * @param strNum the str num
	 * @return true, if is numeric
	 */
	public static boolean isNumeric(String strNum) {
		try {
			Double.parseDouble(strNum);
		} catch (NumberFormatException nfe) {
			return false;
		}
		return true;
	}

	/**
	 * Gets the csv data.
	 *
	 * @param limit        the limit
	 * @param records      the records
	 * @param byteArray    the byte array
	 * @param csvSeparator the csv separator
	 * @return the csv data
	 * @throws IOException            Signals that an I/O exception has occurred.
	 * @throws CsvValidationException the csv validation exception
	 */
	private void getCsvData(int limit, JSONArray records, byte[] byteArray, char csvSeparator, int page)
			throws IOException, CsvValidationException {
		CSVReader csvReader = null;
		try (Reader targetReader = new InputStreamReader(new ByteArrayInputStream(byteArray))) {
			CSVParser parser = new CSVParserBuilder().withSeparator(csvSeparator).build();
			csvReader = new CSVReaderBuilder(targetReader).withCSVParser(parser).build();
			String[] values = null;
			List<String> colList = Arrays.asList(csvReader.readNext());
			if (limit == 0) {
				while ((values = csvReader.readNext()) != null) {
					JSONObject tempRow = new JSONObject();
					if (values.length == 1 && values[0].trim().isEmpty()) {
						continue;
					}
					List<String> row = Arrays.asList(values);
					int len;
					if (colList.size() >= row.size()) {
						for (int i = 0; i < colList.size() - row.size(); i++)
							row.add("");
						len = colList.size();
					} else {
						for (int i = 0; i < row.size() - colList.size(); i++)
							colList.add("");
						len = row.size();
					}
					for (int size = 0; size < len; size++) {
						tempRow.put(colList.get(size), row.get(size));
					}
					records.put(tempRow);

				}

			} else {
				int recordsToSkip = (page - 0) * limit;
				csvReader.skip(recordsToSkip);

				int recordsRead = 0;
				while ((values = csvReader.readNext()) != null && recordsRead < limit) {
					JSONObject tempRow = new JSONObject();
					if (values.length == 1 && values[0].trim().isEmpty()) {
						continue;
					}
					List<String> row = Arrays.asList(values);
					int len;
					if (colList.size() >= row.size()) {
						for (int i = 0; i < colList.size() - row.size(); i++)
							row.add("");
						len = colList.size();
					} else {
						for (int i = 0; i < row.size() - colList.size(); i++)
							colList.add("");
						len = row.size();
					}
					for (int size = 0; size < len; size++) {
						tempRow.put(colList.get(size), row.get(size));
					}
					records.put(tempRow);
					recordsRead++;
				}
			}
		} finally {
			if (csvReader != null)
				csvReader.close();
		}

	}

	public List<Map<String, Object>> extractAsList(JSONArray response) {

		List<Map<String, Object>> rowsList = new ArrayList<>();

		for (int rownum = 0; rownum < response.length(); rownum++) {
			LinkedHashMap<String, Object> row = new LinkedHashMap<String, Object>();
			JSONObject rowObj = response.getJSONObject(rownum);
			for (String key : rowObj.keySet()) {
				row.put(key, rowObj.get(key));
			}
			rowsList.add(row);
		}

		return rowsList;
	}

	/**
	 * Gets the data count.
	 *
	 * @param dataset the dataset
	 * @return the data count
	 * @throws SQLException the SQL exception
	 */
	@Override
	public Long getDataCount(ICIPDataset dataset) {
		int limit = 0;
		int page = 0;
		long count = 0L;
		try {
			JSONArray jsonArray = getDataAsJSONArray(dataset, limit, page);
			count = jsonArray.length();

		} catch (NumberFormatException e) {
			logger.error(e.getMessage());
		} catch (Exception e) {
			logger.error(e.getMessage());
		}
		return count;
	}

	/**
	 * Gets the json.
	 *
	 * @return the json
	 */
	@Override
	public JSONObject getJson() {
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", "S3");

			JSONObject attributes = new JSONObject();
			attributes.put(BUCKET_KEY, "");
			attributes.put("path", "");
			attributes.put(OBJECT_KEY, "");
			attributes.put(UPLOAD_FILE_KEY, "");
			JSONObject position = new JSONObject();
			position.put(BUCKET_KEY, 0);
			position.put("path", 1);
			position.put(OBJECT_KEY, 2);
			position.put(UPLOAD_FILE_KEY, 3);
			ds.put("position", position);
			logger.info("setting plugin attributes with default values");
			ds.put("attributes", attributes);
		} catch (JSONException e) {
			logger.error("error", e);
		}
		return ds;
	}

	@Override
	public JSONArray getFileData(ICIPDataset dataset, String fileName) {
		JSONArray fileData = null;
		int limit = 0;
		int page = 0;
		try {
			JSONObject attributes = new JSONObject(dataset.getAttributes());
			attributes.put(OBJECT_KEY, fileName);
			String filePath = attributes.optString("path");
			if (filePath.split("/")[0] != null) {
				attributes.put("path", filePath.split("/")[0]);
			}
			dataset.setAttributes(attributes.toString());
			fileData = getDataAsJSONArray(dataset, limit, page);
		} catch (Exception e) {
			logger.error(e.getMessage());
		}
		return fileData;
	}

	@SuppressWarnings("unchecked")
	@Override
	public <T> T getDatasetData(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype, Class<T> clazz)
			throws SQLException {
		try {
			if (clazz.equals(String.class)) {
				return (T) getDataAsJSONArray(dataset, pagination.getSize(), pagination.getPage()).toString();
			}
			if (clazz.equals(JSONArray.class)) {
				return (T) getDataAsJSONArray(dataset, pagination.getSize(), pagination.getPage());
			}
			if (clazz.equals(List.class)) {
				return (T) extractAsList(getDataAsJSONArray(dataset, pagination.getSize(), pagination.getPage()));
			}

			return (T) getDataAsJSONArray(dataset, pagination.getSize(), pagination.getPage()).toString();
		} catch (KeyManagementException | NoSuchAlgorithmException | KeyStoreException | IOException e) {
			logger.error(e.getMessage());
			throw new SQLException(e.getMessage());
		} catch (NumberFormatException e) {
			logger.error(e.getMessage());
			throw new SQLException(e.getMessage());
		} catch (Exception e) {
			logger.error(e.getMessage());
			throw new SQLException(e.getMessage());
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

	@Override
	public JSONArray getFileInfo(ICIPDataset dataset, String fileName) {
		JSONArray fileData = null;
		int limit = 0;
		int page = 0;
		try {
			JSONObject attributes = new JSONObject(dataset.getAttributes());
			attributes.put(OBJECT_KEY, fileName);
			dataset.setAttributes(attributes.toString());
			fileData = getFileInfoAsJSONArray(dataset, limit, page);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			logger.error(e.getMessage());
		}
		return fileData;
	}

}
