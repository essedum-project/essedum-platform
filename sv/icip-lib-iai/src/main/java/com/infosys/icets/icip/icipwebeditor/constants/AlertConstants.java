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
package com.infosys.icets.icip.icipwebeditor.constants;

import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Component;

import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;

// TODO: Auto-generated Javadoc
//
/**
 * The Class AlertConstants.
 *
 * @author icets
 */

@Component

/**
 * Gets the pipeline error mail enabled.
 *
 * @return the pipeline error mail enabled
 */

/**
 * Gets the pipeline error mail enabled.
 *
 * @return the pipeline error mail enabled
 */
@Getter

/**
 * Instantiates a new alert constants.
 *
 * @param PIPELINE_ERROR_MAIL_SUBJECT the pipeline error mail subject
 * @param PIPELINE_ERROR_MAIL_MESSAGE the pipeline error mail message
 * @param PIPELINE_SUCCESS_MAIL_SUBJECT the pipeline success mail subject
 * @param PIPELINE_SUCCESS_MAIL_MESSAGE the pipeline success mail message
 * @param PIPELINE_SUCCESS_NOTIFICATION_MESSAGE the pipeline success notification message
 * @param PIPELINE_ERROR_NOTIFICATION_MESSAGE the pipeline error notification message
 * @param PIPELINE_ERROR_NOTIFICATION_ENABLED the pipeline error notification enabled
 * @param PIPELINE_SUCCESS_NOTIFICATION_ENABLED the pipeline success notification enabled
 * @param PIPELINE_SUCCESS_MAIL_ENABLED the pipeline success mail enabled
 * @param PIPELINE_ERROR_MAIL_ENABLED the pipeline error mail enabled
 */
@NoArgsConstructor
@RefreshScope
public class AlertConstants {

	/** The pipeline error mail subject. */
	@LeapProperty("icip.mailevent.error.subject")
	private String PIPELINE_ERROR_MAIL_SUBJECT;

	/** The pipeline error mail message. */
	@LeapProperty("icip.mailevent.error.message")
	private String PIPELINE_ERROR_MAIL_MESSAGE;

	/** The pipeline success mail subject. */
	@LeapProperty("icip.mailevent.success.subject")
	private String PIPELINE_SUCCESS_MAIL_SUBJECT;

	/** The pipeline success mail message. */
	@LeapProperty("icip.mailevent.success.message")
	private String PIPELINE_SUCCESS_MAIL_MESSAGE;

	/** The pipeline success notification message. */
	@LeapProperty("icip.alertevent.success.message")
	private String PIPELINE_SUCCESS_NOTIFICATION_MESSAGE;

	/** The pipeline error notification message. */
	@LeapProperty("icip.alertevent.error.message")
	private String PIPELINE_ERROR_NOTIFICATION_MESSAGE;

	/** The pipeline error notification enabled. */
	@LeapProperty("icip.alertevent.error.enabled")
	private String PIPELINE_ERROR_NOTIFICATION_ENABLED;

	/** The pipeline success notification enabled. */
	@LeapProperty("icip.alertevent.success.enabled")
	private String PIPELINE_SUCCESS_NOTIFICATION_ENABLED;

	/** The pipeline success mail enabled. */
	@LeapProperty("icip.mailevent.success.enabled")
	private String PIPELINE_SUCCESS_MAIL_ENABLED;

	/** The pipeline error mail enabled. */
	@LeapProperty("icip.mailevent.error.enabled")
	private String PIPELINE_ERROR_MAIL_ENABLED;

	/** The Constant NOTIFICATION_SEVERITY. */
	public static final String NOTIFICATION_SEVERITY = "P3";

	/** The Constant NOTIFICATION_SOURCE. */
	public static final String NOTIFICATION_SOURCE = "(NULL)";

	/** The Constant MESSAGE_FORMAT. */
	public static final String MESSAGE_FORMAT = "%s - %s (%s)";

	/** The Constant EMAIL_FORMAT. */
	public static final String EMAIL_FORMAT = "%s%s";
}
