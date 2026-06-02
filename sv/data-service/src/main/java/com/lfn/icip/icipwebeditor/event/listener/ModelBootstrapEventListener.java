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

package com.lfn.icip.icipwebeditor.event.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.icipwebeditor.event.model.ModelBootstrapEvent;

import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
//
/**
* The Class ModelBootstrapEventListener.
*
* @author essedum
*/

/** The Constant log. */
@Component

/** The Constant log. */

/** The Constant log. */
@Log4j2
public class ModelBootstrapEventListener {

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(JobLogger.class);

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
	public void onApplicationEvent(ModelBootstrapEvent event) {
		try {
			String url = event.getModelServerUrl();
			log.info("Bootstraping Model & URL is {}", url);
			logger.info(event.getMarker(), "Bootstraping Model & URL is {}", url);
			restTemplate.getForEntity(url, null);
		} catch (RestClientException e) {
			log.error("Error in Model Bootstraping : {} - {}", e.getMessage(), e);
			logger.error(event.getMarker(), "Error in Model Bootstraping : {}", e.getMessage(), e);
		}
	}

}
