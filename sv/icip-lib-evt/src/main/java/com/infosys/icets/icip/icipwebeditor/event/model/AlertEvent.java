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

package com.infosys.icets.icip.icipwebeditor.event.model;

import org.springframework.context.ApplicationEvent;
import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;

// TODO: Auto-generated Javadoc
//
/**
* The Class AlertEvent.
*
* @author icets
*/

/**
 * Checks if is notification read flag.
 *
 * @return true, if is notification read flag
 */

/**
 * Checks if is notification read flag.
 *
 * @return true, if is notification read flag
 */

/**
 * Checks if is notification read flag.
 *
 * @return true, if is notification read flag
 */
@Getter
public class AlertEvent extends ApplicationEvent {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The mail service enabled. */
	private boolean mailServiceEnabled;
	
	/** The mail recipient. */
	private String mailRecipient;
	
	/** The mail subject. */
	private String mailSubject;
	
	/** The mail message. */
	private String mailMessage;

	/** The notification enabled. */
	private boolean notificationEnabled;
	
	/** The notification user id. */
	private String notificationUserId;
	
	/** The notification severity. */
	private String notificationSeverity;
	
	/** The notification source. */
	private String notificationSource;
	
	/** The notification message. */
	private String notificationMessage;
	
	/** The notification read flag. */
	private boolean notificationReadFlag;

	private MultipartFile mailAttachment;

	/**
	 * Instantiates a new alert event.
	 *
	 * @param source the source
	 * @param mailServiceEnabled the mail service enabled
	 * @param mailRecipient the mail recipient
	 * @param mailSubject the mail subject
	 * @param mailMessage the mail message
	 */
	public AlertEvent(Object source, boolean mailServiceEnabled, String mailRecipient, String mailSubject,
			String mailMessage) {
		super(source);
		this.mailServiceEnabled = mailServiceEnabled;
		this.mailRecipient = mailRecipient;
		this.mailSubject = mailSubject;
		this.mailMessage = mailMessage;
	}

	/**
	 * Instantiates a new alert event.
	 *
	 * @param source the source
	 * @param notificationEnabled the notification enabled
	 * @param notificationUserId the notification user id
	 * @param notificationSeverity the notification severity
	 * @param notificationSource the notification source
	 * @param notificationMessage the notification message
	 * @param notificationReadFlag the notification read flag
	 */
	public AlertEvent(Object source, boolean notificationEnabled, String notificationUserId,
			String notificationSeverity, String notificationSource, String notificationMessage,
			boolean notificationReadFlag) {
		super(source);
		this.notificationEnabled = notificationEnabled;
		this.notificationUserId = notificationUserId;
		this.notificationSeverity = notificationSeverity;
		this.notificationSource = notificationSource;
		this.notificationMessage = notificationMessage;
		this.notificationReadFlag = notificationReadFlag;
	}

	/**
	 * Instantiates a new alert event.
	 *
	 * @param source the source
	 * @param mailServiceEnabled the mail service enabled
	 * @param mailRecipient the mail recipient
	 * @param mailSubject the mail subject
	 * @param mailMessage the mail message
	 * @param notificationEnabled the notification enabled
	 * @param notificationUserId the notification user id
	 * @param notificationSeverity the notification severity
	 * @param notificationSource the notification source
	 * @param notificationMessage the notification message
	 * @param notificationReadFlag the notification read flag
	 */
	public AlertEvent(Object source, boolean mailServiceEnabled, String mailRecipient, String mailSubject,
			String mailMessage, boolean notificationEnabled, String notificationUserId, String notificationSeverity,
			String notificationSource, String notificationMessage, boolean notificationReadFlag) {
		super(source);
		this.mailServiceEnabled = mailServiceEnabled;
		this.mailRecipient = mailRecipient;
		this.mailSubject = mailSubject;
		this.mailMessage = mailMessage;
		this.notificationEnabled = notificationEnabled;
		this.notificationUserId = notificationUserId;
		this.notificationSeverity = notificationSeverity;
		this.notificationSource = notificationSource;
		this.notificationMessage = notificationMessage;
		this.notificationReadFlag = notificationReadFlag;
	}

	/**
	 * Instantiates a new alert event.
	 *
	 * @param source the source
	 * @param mailServiceEnabled the mail service enabled
	 * @param mailRecipient the mail recipient
	 * @param mailSubject the mail subject
	 * @param mailMessage the mail message
	 * @param notificationEnabled the notification enabled
	 * @param notificationUserId the notification user id
	 * @param notificationSeverity the notification severity
	 * @param notificationSource the notification source
	 * @param notificationMessage the notification message
	 * @param notificationReadFlag the notification read flag
	 */
	public AlertEvent(Object source, boolean mailServiceEnabled, String mailRecipient, String mailSubject,
			String mailMessage, boolean notificationEnabled, String notificationUserId, String notificationSeverity,
			String notificationSource, String notificationMessage, boolean notificationReadFlag, MultipartFile attachments) {
		super(source);
		this.mailServiceEnabled = mailServiceEnabled;
		this.mailRecipient = mailRecipient;
		this.mailSubject = mailSubject;
		this.mailMessage = mailMessage;
		this.mailAttachment=attachments;
		this.notificationEnabled = notificationEnabled;
		this.notificationUserId = notificationUserId;
		this.notificationSeverity = notificationSeverity;
		this.notificationSource = notificationSource;
		this.notificationMessage = notificationMessage;
		this.notificationReadFlag = notificationReadFlag;
	}
}
