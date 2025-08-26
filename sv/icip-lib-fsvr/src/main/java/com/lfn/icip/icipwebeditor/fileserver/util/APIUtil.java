package com.lfn.icip.icipwebeditor.fileserver.util;

import java.io.File;
import java.util.LinkedHashMap;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.google.gson.Gson;
import com.lfn.icip.icipwebeditor.fileserver.constants.LoggerConstants;

import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/** The Constant log. */
@Log4j2
public class APIUtil {

	/**
	 * Instantiates a new API util.
	 */
	private APIUtil() {
	}

	/**
	 * Call deploy API.
	 *
	 * @param authserviceSession the authservice session
	 * @param url the url
	 * @param merged the merged
	 * @param inferenceClassFile the inference class file
	 * @param modelClassFile the model class file
	 * @param requirementsFile the requirements file
	 * @return the string
	 * @throws InterruptedException the interrupted exception
	 * @throws ExecutionException the execution exception
	 */
	public static String callDeployAPI(String authserviceSession, String url, File merged, File inferenceClassFile,
			File modelClassFile, File requirementsFile) throws InterruptedException, ExecutionException {
		// Calling Deploy API
		RestTemplate restTemplate = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.MULTIPART_FORM_DATA);
		headers.add("Cookie", String.format(LoggerConstants.STRING_STRING, "authservice_session=", authserviceSession));
		MultiValueMap<String, Object> map = new LinkedMultiValueMap<>();
		if (merged != null) {
			map.add("file", new FileSystemResource(merged));
		}
		if (inferenceClassFile != null) {
			map.add("inferenceClassFile", new FileSystemResource(inferenceClassFile));
		}
		if (modelClassFile != null) {
			map.add("modelClassFile", new FileSystemResource(modelClassFile));
		}
		if (requirementsFile != null) {
			map.add("requirementsFile", new FileSystemResource(requirementsFile));
		}
		HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(map, headers);
		log.info("Deploy URL : {}", url);
		log.info("Deploy Header : {}", request);
		ResponseEntity<LinkedHashMap> results = restTemplate.postForEntity(url, request, LinkedHashMap.class);
		CompletableFuture<LinkedHashMap> completeFuture = CompletableFuture.completedFuture(results.getBody());
		LinkedHashMap resultMap = completeFuture.get();
		log.info("Deploy Response : {}", resultMap);
		return new Gson().toJson(resultMap, LinkedHashMap.class);
	}

}