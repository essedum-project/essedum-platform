/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.notification;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.ApplicationEventPublisherAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// TODO: Auto-generated Javadoc
/**
 * The Class NotificationConfig.
 *
 * @author icets
 */
@Configuration
public class NotificationConfig {

	/**
	 * Gets the mail service bean.
	 *
	 * @return the mail service bean
	 */
	@Bean(name = "notificationPublisher")
	public NotificationService getMailServiceBean() {
		return new NotificationService();
	}

	/**
	 * The Class NotificationService.
	 */
	/**
	* @author icets
	*/
	public class NotificationService implements ApplicationEventPublisherAware {

		/** The publisher. */
		private ApplicationEventPublisher publisher;

		/**
		 * Gets the application event publisher.
		 *
		 * @return the application event publisher
		 */
		public ApplicationEventPublisher getApplicationEventPublisher() {
			return publisher;
		}

		/**
		 * Sets the application event publisher.
		 *
		 * @param applicationEventPublisher the new application event publisher
		 */
		/* (non-Javadoc)
		 * @see org.springframework.context.ApplicationEventPublisherAware#setApplicationEventPublisher(org.springframework.context.ApplicationEventPublisher)
		 */
		@Override
		public void setApplicationEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
			this.publisher = applicationEventPublisher;

		}
	}

}
