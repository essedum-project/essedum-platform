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
