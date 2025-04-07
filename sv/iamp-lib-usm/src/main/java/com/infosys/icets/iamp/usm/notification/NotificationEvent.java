/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.notification;

import org.springframework.context.ApplicationEvent;

import com.infosys.icets.iamp.usm.domain.UsmNotifications;

import lombok.Getter;


// TODO: Auto-generated Javadoc
/**
 * The Class NotificationEvent.
 *
 * @author icets
 */

/**
 * Gets the usm notification.
 *
 * @return the usm notification
 */

/**
 * Gets the usm notification.
 *
 * @return the usm notification
 */

/**
 * Gets the usm notification.
 *
 * @return the usm notification
 */
@Getter
public class NotificationEvent extends ApplicationEvent {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;
	
	/** The usm notification. */
	private UsmNotifications usmNotification;

	/**
	 * Instantiates a new notification event.
	 *
	 * @param source the source
	 * @param usmNotification the usm notification
	 */
	public NotificationEvent(Object source, UsmNotifications usmNotification) {
		super(source);
		this.usmNotification = usmNotification;
	}

}
