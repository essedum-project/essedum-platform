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
package com.infosys.icets.icip.icipwebeditor.event.publisher;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.ApplicationEventPublisherAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// TODO: Auto-generated Javadoc
//
/**
 * The Class AlertEventPublisher.
 *
 * @author icets
 */

@Configuration
public class AlertEventPublisher {

	/**
	 * Gets the Alert service bean.
	 *
	 * @return the Alert service bean
	 */
	@Bean(name = "alertEventPublisherBean")
	public AlertService getAlertServiceBean() {
		return new AlertService();
	}

	/**
	 * The Class AlertService.
	 * 
	 * @author icets
	 */
	public class AlertService implements ApplicationEventPublisherAware {

		/** The application event publisher. */
		private ApplicationEventPublisher applicationEventPublisher;

		/**
		 * Gets the application event publisher.
		 *
		 * @return the application event publisher
		 */
		public ApplicationEventPublisher getApplicationEventPublisher() {
			return applicationEventPublisher;
		}

		/**
		 * Sets the application event publisher.
		 *
		 * @param applicationEventPublisher the new application event publisher
		 */
		@Override
		public void setApplicationEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
			this.applicationEventPublisher = applicationEventPublisher;
		}

	}
}
