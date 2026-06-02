package com.lfn.icip.icipwebeditor.model.dto;

import java.io.Serializable;
import java.sql.Timestamp;

// TODO: Auto-generated Javadoc
/**
 * The Interface IJobLog.
 */
public interface IJobLog extends Serializable {

	/**
	 * Gets the jobid.
	 *
	 * @return the jobid
	 */
	public String getJobid();

	/**
	 * Gets the alias.
	 *
	 * @return the alias
	 */
	public String getAlias();

	/**
	 * Gets the submittedby.
	 *
	 * @return the submittedby
	 */
	public String getSubmittedby();

	/**
	 * Gets the submittedon.
	 *
	 * @return the submittedon
	 */
	public Timestamp getSubmittedon();

	/**
	 * Gets the jobstatus.
	 *
	 * @return the jobstatus
	 */
	public String getJobstatus();

	/**
	 * Gets the runtime.
	 *
	 * @return the runtime
	 */
	public String getRuntime();

	/**
	 * Gets the jobtype.
	 *
	 * @return the jobtype
	 */
	public String getJobtype();

	/**
	 * Gets the finishtime.
	 *
	 * @return the finishtime
	 */
	public Timestamp getFinishtime();

	/**
	 * Gets the jobmetadata.
	 *
	 * @return the jobmetadata
	 */
	public String getJobmetadata();

	/**
	 * Gets the type.
	 *
	 * @return the type
	 */
	public String getType();

}