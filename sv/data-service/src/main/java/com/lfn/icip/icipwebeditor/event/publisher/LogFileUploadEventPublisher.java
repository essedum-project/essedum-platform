package com.lfn.icip.icipwebeditor.event.publisher;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.ApplicationEventPublisherAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// TODO: Auto-generated Javadoc
/**
 * The Class LogFileUploadEventPublisher.
 */
@Configuration
public class LogFileUploadEventPublisher {

	/**
	 * Gets the upload log service bean.
	 *
	 * @return the upload log service bean
	 */
	@Bean(name = "logFileUploadEventPublisherBean")
	public LogFileUploadService getUploadLogServiceBean() {
		return new LogFileUploadService();
	}

	/**
	 * The Class AlertService.
	 * 
	 * @author essedum
	 */
	public class LogFileUploadService implements ApplicationEventPublisherAware {

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
