package com.lfn.icip.icipwebeditor.event.model;

import org.springframework.context.ApplicationEvent;

import lombok.Getter;

// TODO: Auto-generated Javadoc
/**
 * Gets the path.
 *
 * @return the path
 */

/**
 * Gets the path.
 *
 * @return the path
 */
@Getter
public class LogFileDownloadEvent extends ApplicationEvent {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = -7923517518132998656L;

	/** The count. */
	private int count;

	/** The job id. */
	private String jobId;

	/** The org. */
	private String org;

	/** The path. */
	private String path;

	/**
	 * Instantiates a new log file download event.
	 *
	 * @param source the source
	 * @param path the path
	 * @param count the count
	 * @param jobId the job id
	 * @param org the org
	 */
	public LogFileDownloadEvent(Object source, String path, int count, String jobId, String org) {
		super(source);
		this.count = count;
		this.jobId = jobId;
		this.org = org;
		this.path = path;
	}

}
