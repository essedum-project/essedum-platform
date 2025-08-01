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
