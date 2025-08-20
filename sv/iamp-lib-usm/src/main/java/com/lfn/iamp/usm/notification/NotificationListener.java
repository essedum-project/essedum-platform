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

package com.lfn.iamp.usm.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import com.lfn.iamp.usm.service.UsmNotificationsService;

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
 * @author essedum
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
