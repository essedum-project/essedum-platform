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

package com.lfn.icip.icipwebeditor.constants;

import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Component;

import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;

// TODO: Auto-generated Javadoc
//
/**
 * The Class AlertConstants.
 *
 * @author essedum
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
	@EssedumProperty("icip.mailevent.error.subject")
	private String PIPELINE_ERROR_MAIL_SUBJECT;

	/** The pipeline error mail message. */
	@EssedumProperty("icip.mailevent.error.message")
	private String PIPELINE_ERROR_MAIL_MESSAGE;

	/** The pipeline success mail subject. */
	@EssedumProperty("icip.mailevent.success.subject")
	private String PIPELINE_SUCCESS_MAIL_SUBJECT;

	/** The pipeline success mail message. */
	@EssedumProperty("icip.mailevent.success.message")
	private String PIPELINE_SUCCESS_MAIL_MESSAGE;

	/** The pipeline success notification message. */
	@EssedumProperty("icip.alertevent.success.message")
	private String PIPELINE_SUCCESS_NOTIFICATION_MESSAGE;

	/** The pipeline error notification message. */
	@EssedumProperty("icip.alertevent.error.message")
	private String PIPELINE_ERROR_NOTIFICATION_MESSAGE;

	/** The pipeline error notification enabled. */
	@EssedumProperty("icip.alertevent.error.enabled")
	private String PIPELINE_ERROR_NOTIFICATION_ENABLED;

	/** The pipeline success notification enabled. */
	@EssedumProperty("icip.alertevent.success.enabled")
	private String PIPELINE_SUCCESS_NOTIFICATION_ENABLED;

	/** The pipeline success mail enabled. */
	@EssedumProperty("icip.mailevent.success.enabled")
	private String PIPELINE_SUCCESS_MAIL_ENABLED;

	/** The pipeline error mail enabled. */
	@EssedumProperty("icip.mailevent.error.enabled")
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
