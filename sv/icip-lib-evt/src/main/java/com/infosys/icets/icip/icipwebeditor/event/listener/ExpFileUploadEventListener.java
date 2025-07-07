/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipwebeditor.event.listener;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.infosys.icets.icip.icipwebeditor.event.model.ExpFileUploadEvent;

import lombok.Cleanup;
import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
//
/**
 * The Class FileUploadEventListener.
 *
 * @author icets
 */

/** The Constant log. */
@Component

/** The Constant log. */

/** The Constant log. */
@Log4j2
public class ExpFileUploadEventListener {

	/** The rest template. */
	@Autowired
	private RestTemplate restTemplate;

	/**
	 * On application event.
	 *
	 * @param event the event
	 */
	@Async
	@EventListener
	public void onApplicationEvent(ExpFileUploadEvent event) {
		try {
			String url = event.getUrl();
			String checksum = null;

			log.info("Uploading Model on Local Server");
			Path filePath = Paths.get(event.getFilePath());
			Files.createDirectories(filePath.getParent());
			File file = filePath.toFile();

			// Storing file in local server
			try (OutputStream os = new FileOutputStream(file)) {
				os.write(event.getFile().getBytes());
			}
			FileInputStream fis = null;
			// Checksum creation
			try {
			fis = new FileInputStream(file);
			checksum = DigestUtils.sha256Hex(fis);

			log.info("Uploading Model & URL is {}", url);
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.MULTIPART_FORM_DATA);
			LinkedMultiValueMap<String, Object> map = new LinkedMultiValueMap<>();
			map.add("file", new FileSystemResource(event.getFilePath()));
			map.add("checksum", checksum);
			map.add("totalcount", event.getTotalCount());
			HttpEntity<LinkedMultiValueMap<String, Object>> entity = new HttpEntity<>(map, headers);
			restTemplate.postForEntity(url, entity, Integer.class);
			}
			catch(Exception e) {
				log.error("Error in uploading file:{}", e.getMessage(), e);
			}
			finally {
				if (fis != null) {
					 try {
					 fis.close();
					 } catch (IOException e) {
					 log.error("Unable to close stream");
					 }
				}
			}
			
		} catch (Exception e) {
			log.error("Error in Project Uploading : {}", e.getMessage(), e);
		}
	}

}
