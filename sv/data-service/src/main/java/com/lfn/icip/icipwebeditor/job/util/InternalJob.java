package com.lfn.icip.icipwebeditor.job.util;

import org.quartz.Job;

// TODO: Auto-generated Javadoc
/**
 * The Interface InternalJob.
 */
public interface InternalJob extends Job {

	/**
	 * Gets the name.
	 *
	 * @return the name
	 */
	public String getName();

	/**
	 * Gets the url.
	 *
	 * @return the url
	 */
	public String getUrl();

	/**
	 * Gets the description.
	 *
	 * @return the description
	 */
	public String getDescription();

}
