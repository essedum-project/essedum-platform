package com.lfn.icip.icipwebeditor.fileserver.servers;

import java.io.FileInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.util.Arrays;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import org.apache.commons.codec.digest.DigestUtils;


import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.ssl.NoopHostnameVerifier;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactoryBuilder;
import org.apache.hc.core5.ssl.SSLContextBuilder;
import org.apache.hc.core5.ssl.TrustStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Scope;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.icip.icipwebeditor.fileserver.service.impl.CommonService;
import com.lfn.icip.icipwebeditor.fileserver.util.FileServerUtil;

import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/**
 * The Class LocalServer.
 */
@Component("local")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)

/** The Constant log. */

/** The Constant log. */
@Log4j2
@RefreshScope
public class LocalServer implements FileServerUtil {

	/** The Constant ACCESS_TOKEN. */
	private static final String ACCESS_TOKEN = "access-token";
	
	/** The Constant BUCKET_EQUALS. */
	private static final String BUCKET_EQUALS = "?bucket=";

	/** The fileserver url. */
	@EssedumProperty("icip.fileserver.local.url")
	private String fileserverUrl;

	/** The access token. */
	@Value("${fileserver.local.accesstoken}")
	private String accessToken;

	/** The rest template. */
	private RestTemplate restTemplate;

	/** The common service. */
	@Autowired
	private CommonService commonService;

	/**
	 * Instantiates a new local server.
	 *
	 * @throws KeyManagementException the key management exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws KeyStoreException the key store exception
	 */
	public LocalServer() throws KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		this.restTemplate = getResttemplate();
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
		String url = String.format("%s%s%s%s%s%s", fileserverUrl, "/api/generate/fileid", BUCKET_EQUALS, bucket,
				"&prefix=", prefix);
		log.info("Generate URL {}", url);
		HttpHeaders headers = new HttpHeaders();
		headers.set(ACCESS_TOKEN, accessToken);
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
		HttpEntity entity = new HttpEntity(headers);
		ResponseEntity<String> results = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
		CompletableFuture<String> completableFutureUrl = CompletableFuture.completedFuture(results.getBody());
		return completableFutureUrl.get(1, TimeUnit.MINUTES);
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
	public Integer upload(Path path, String folder, String fileid, int totalCount, boolean replace, String bucket,MultipartFile file)
			throws Exception {
		//FileInputStream fis = null;
		try (FileInputStream fis = new FileInputStream(path.toFile())) {
			
			String checksum = DigestUtils.sha256Hex(fis);
			String url = String.format("%s%s%s%s", fileserverUrl,
					"/api/upload/" + (folder != null ? folder + "/" : "") + fileid + "/true", BUCKET_EQUALS, bucket);
			log.info("Upload URL {}", url);
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.MULTIPART_FORM_DATA);
			headers.set(ACCESS_TOKEN, accessToken);
			headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
			LinkedMultiValueMap<String, Object> map = new LinkedMultiValueMap<>();
			map.add("file", new FileSystemResource(path));
			map.add("checksum", checksum);
			map.add("totalcount", totalCount);
			HttpEntity<LinkedMultiValueMap<String, Object>> entity = new HttpEntity<>(map, headers);
			ResponseEntity<Integer> response = restTemplate.postForEntity(url, entity, Integer.class);
			return response.getBody();
		}
		
	}

	@Override
	public Integer upload(Path path, String folder, String fileid, int totalCount, boolean replace, String bucket)
			throws Exception {
		//FileInputStream fis = null;
		try (FileInputStream fis = new FileInputStream(path.toFile())) {
			
			String checksum = DigestUtils.sha256Hex(fis);
			String url = String.format("%s%s%s%s", fileserverUrl,
					"/api/upload/" + (folder != null ? folder + "/" : "") + fileid + "/true", BUCKET_EQUALS, bucket);
			log.info("Upload URL {}", url);
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.MULTIPART_FORM_DATA);
			headers.set(ACCESS_TOKEN, accessToken);
			headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
			LinkedMultiValueMap<String, Object> map = new LinkedMultiValueMap<>();
			map.add("file", new FileSystemResource(path));
			map.add("checksum", checksum);
			map.add("totalcount", totalCount);
			HttpEntity<LinkedMultiValueMap<String, Object>> entity = new HttpEntity<>(map, headers);
			ResponseEntity<Integer> response = restTemplate.postForEntity(url, entity, Integer.class);
			return response.getBody();
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
		String url = String.format("%s%s%s%s%s%s%s", fileserverUrl, "/api/download/", fileid, "/", index, BUCKET_EQUALS,
				bucket);
		log.info("Download URL {}", url);
		HttpHeaders headers = new HttpHeaders();
		headers.set(ACCESS_TOKEN, accessToken);
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_OCTET_STREAM));
		HttpEntity entity = new HttpEntity(headers);
		ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.GET, entity, byte[].class);
		byte[] bytes = response.getBody();
		Path tmpPath = Files.createTempDirectory("download");
		Path path = Paths.get(tmpPath.toAbsolutePath().toString(), index);
		Files.createDirectories(path.getParent());
		Files.write(path, bytes);
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
		String url = String.format("%s%s%s%s%s", fileserverUrl, "/api/delete/", fileid, BUCKET_EQUALS, bucket);
		log.info("Last Delete URL {}", url);
		HttpHeaders headers = new HttpHeaders();
		headers.set(ACCESS_TOKEN, accessToken);
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
		HttpEntity entity = new HttpEntity(headers);
		ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
		return response.getBody();
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
		String url = String.format("%s%s%s%s%s", fileserverUrl, "/api/lastcall/", fileid, BUCKET_EQUALS, bucket);
		log.info("Last Call URL {}", url);
		HttpHeaders headers = new HttpHeaders();
		headers.set(ACCESS_TOKEN, accessToken);
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
		HttpEntity entity = new HttpEntity(headers);
		ResponseEntity<Boolean> response = restTemplate.exchange(url, HttpMethod.GET, entity, Boolean.class);
		return response.getBody();
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
		String url = String.format("%s%s%s%s%s", fileserverUrl, "/api/lastcount/", fileid, BUCKET_EQUALS, bucket);
		log.info("Last Index URL {}", url);
		HttpHeaders headers = new HttpHeaders();
		headers.set(ACCESS_TOKEN, accessToken);
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
		HttpEntity entity = new HttpEntity(headers);
		ResponseEntity<Integer> response = restTemplate.exchange(url, HttpMethod.GET, entity, Integer.class);
		return String.valueOf(response.getBody());
	}

	
	@Override
	public String getLastIndex(String fileid, String bucket, String datasource) throws Exception {
		String url = String.format("%s%s%s%s%s", datasource, "/api/lastcount/", fileid, BUCKET_EQUALS, bucket);
		log.info("Last Index URL {}", url);
		HttpHeaders headers = new HttpHeaders();
		headers.set(ACCESS_TOKEN, accessToken);
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
		HttpEntity entity = new HttpEntity(headers);
		ResponseEntity<Integer> response = restTemplate.exchange(url, HttpMethod.GET, entity, Integer.class);
		return String.valueOf(response.getBody());
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
		String url = String.format("%s%s%s%s%s%s%s", fileserverUrl, "/api/checksum/", fileid, "/", index, BUCKET_EQUALS,
				bucket);
		log.info("Checksum URL {}", url);
		HttpHeaders headers = new HttpHeaders();
		headers.set(ACCESS_TOKEN, accessToken);
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
		HttpEntity entity = new HttpEntity(headers);
		ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
		return response.getBody();
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

	/**
	 * Gets the resttemplate.
	 *
	 * @return the resttemplate
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws KeyManagementException the key management exception
	 * @throws KeyStoreException the key store exception
	 */
	private RestTemplate getResttemplate() throws NoSuchAlgorithmException, KeyManagementException, KeyStoreException {
		TrustStrategy acceptingTrustStrategy = (X509Certificate[] chain, String authType) -> true;
		CloseableHttpClient httpClient = HttpClients.custom().setConnectionManager(PoolingHttpClientConnectionManagerBuilder.create()
                .setSSLSocketFactory(SSLConnectionSocketFactoryBuilder.create()
                        .setSslContext(SSLContextBuilder.create()
                                .loadTrustMaterial(acceptingTrustStrategy)
                                .build())
                        .setHostnameVerifier(NoopHostnameVerifier.INSTANCE)
                        .build())
                .build())
        .build();
		HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
		requestFactory.setHttpClient(httpClient);
		return new RestTemplate(requestFactory);
	}
	
	@Override
	public Integer upload(Path path, String folder, String fileid, int totalCount, boolean replace, String bucket, String archivalFileserverurl)
			throws Exception {
		//FileInputStream fis = null;
		try (FileInputStream fis = new FileInputStream(path.toFile())) {
			
			String checksum = DigestUtils.sha256Hex(fis);
			String url = String.format("%s%s%s%s", archivalFileserverurl,
					"/api/upload/" + (folder != null ? folder + "/" : "") + fileid + "/true", BUCKET_EQUALS, bucket);
			log.info("Upload URL {}", url);
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.MULTIPART_FORM_DATA);
			headers.set(ACCESS_TOKEN, accessToken);
			headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
			LinkedMultiValueMap<String, Object> map = new LinkedMultiValueMap<>();
			map.add("file", new FileSystemResource(path));
			map.add("checksum", checksum);
			map.add("totalcount", totalCount);
			HttpEntity<LinkedMultiValueMap<String, Object>> entity = new HttpEntity<>(map, headers);
			ResponseEntity<Integer> response = restTemplate.postForEntity(url, entity, Integer.class);
			return response.getBody();
		}
		
	}
	@Override
	public byte[] download(String fileid, String index, String bucket,String fileserverurl) throws Exception {
		String url = String.format("%s%s%s%s%s%s%s", fileserverurl, "/api/download/", fileid, "/", index, BUCKET_EQUALS,
				bucket);
		log.info("Download URL {}", url);
		HttpHeaders headers = new HttpHeaders();
		headers.set(ACCESS_TOKEN, accessToken);
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_OCTET_STREAM));
		HttpEntity entity = new HttpEntity(headers);
		ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.GET, entity, byte[].class);
		byte[] bytes = response.getBody();
		Path tmpPath = Files.createTempDirectory("download");
		Path path = Paths.get(tmpPath.toAbsolutePath().toString(), index);
		Files.createDirectories(path.getParent());
		Files.write(path, bytes);
		return Files.readAllBytes(path);
	}

}
