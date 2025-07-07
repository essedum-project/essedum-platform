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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.infosys.icets.ai.comm.lib.util.logger.JobLogger;
import com.infosys.icets.icip.icipwebeditor.event.model.ModelBootstrapEvent;

import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
//
/**
* The Class ModelBootstrapEventListener.
*
* @author icets
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
