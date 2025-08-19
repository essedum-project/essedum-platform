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
