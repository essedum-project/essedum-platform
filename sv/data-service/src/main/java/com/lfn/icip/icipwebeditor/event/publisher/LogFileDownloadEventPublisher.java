package com.lfn.icip.icipwebeditor.event.publisher;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.ApplicationEventPublisherAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// TODO: Auto-generated Javadoc
/**
 * The Class LogFileDownloadEventPublisher.
 */
@Configuration
public class LogFileDownloadEventPublisher {

	/**
	 * Gets the download log service bean.
	 *
	 * @return the download log service bean
	 */
	@Bean(name = "logFileDownloadEventPublisherBean")
	public LogFileDownloadService getDownloadLogServiceBean() {
		return new LogFileDownloadService();
	}

	/**
	 * The Class AlertService.
	 * 
	 * @author essedum
	 */
	public class LogFileDownloadService implements ApplicationEventPublisherAware {

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
