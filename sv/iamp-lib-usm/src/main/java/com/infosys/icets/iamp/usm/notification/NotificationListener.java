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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import com.infosys.icets.iamp.usm.service.UsmNotificationsService;

// TODO: Auto-generated Javadoc
/**
 * The listener interface for receiving notification events.
 * The class that is interested in processing a notification
 * event implements this interface, and the object created
 * with that class is registered with a component using the
 * component's <code>addNotificationListener<code> method. When
 * the notification event occurs, that object's appropriate
 * method is invoked.
 *
 * @author icets
 */
@Component
public class NotificationListener implements ApplicationListener<NotificationEvent>  {
	
	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(NotificationListener.class);
	
	/** The usm notifications service. */
	@Autowired
	private UsmNotificationsService usmNotificationsService;

	/**
	 * On application event.
	 *
	 * @param event the event
	 */
	/* (non-Javadoc)
	 * @see org.springframework.context.ApplicationListener#onApplicationEvent(org.springframework.context.ApplicationEvent)
	 */
	@Override
	public void onApplicationEvent(NotificationEvent event) {
		log.info("onApplicationEvent: Create event Source: {}",event.getUsmNotification().getSource());
		
		usmNotificationsService.save(event.getUsmNotification());
	}


}
