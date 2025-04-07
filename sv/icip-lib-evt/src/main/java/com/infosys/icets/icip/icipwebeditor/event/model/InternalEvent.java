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

import java.time.ZonedDateTime;
import java.util.Map;

import org.springframework.context.ApplicationEvent;

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class InternalEvent.
 *
 * @author icets
 */

/**
 * Gets the internal class.
 *
 * @return the internal class
 */

/**
 * Gets the internal class.
 *
 * @return the internal class
 */

/**
 * Checks if is runnow.
 *
 * @return true, if is runnow
 */

/**
 * Checks if is runnow.
 *
 * @return true, if is runnow
 */
@Getter

/**
 * Sets the internal class.
 *
 * @param internalClass the new internal class
 */

/**
 * Sets the internal class.
 *
 * @param internalClass the new internal class
 */

/**
 * Sets the runnow.
 *
 * @param runnow the new runnow
 */

/**
 * Sets the runnow.
 *
 * @param runnow the new runnow
 */
@Setter
public class InternalEvent extends ApplicationEvent {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The event name. */
	private String eventName;

	/** The organization. */
	private String organization;

	/** The cron. */
	private boolean cron;

	/** The expression. */
	private String expression;

	/** The start at. */
	private ZonedDateTime startAt;

	/** The params. */
	private Map<String, String> params;

	/** The internal class. */
	private Class internalClass;

	/** The runnow. */
	private boolean runnow;
	
	private int jobTimeout;

	/**
	 * Instantiates a new internal event.
	 *
	 * @param source        the source
	 * @param eventName     the event name
	 * @param organization  the organization
	 * @param params        the params
	 * @param internalClass the internal class
	 */
	public InternalEvent(Object source, String eventName, String organization, Map<String, String> params,
			Class internalClass) {
		super(source);
		this.eventName = eventName;
		this.organization = organization;
		this.params = params;
		this.internalClass = internalClass;
		this.cron = false;
		this.runnow = true;
	}

	/**
	 * Instantiates a new internal event.
	 *
	 * @param source        the source
	 * @param eventName     the event name
	 * @param organization  the organization
	 * @param params        the params
	 * @param internalClass the internal class
	 * @param isCron        the is cron
	 * @param expression    the expression
	 * @param startAt the start at
	 * @param runnow the runnow
	 */
	public InternalEvent(Object source, String eventName, String organization, Map<String, String> params,
			Class internalClass, boolean isCron, String expression, ZonedDateTime startAt, boolean runnow,int jobTimeout) {
		this(source, eventName, organization, params, internalClass);
		this.cron = isCron;
		this.expression = expression;
		this.startAt = startAt;
		this.runnow = runnow;
		this.jobTimeout=jobTimeout;
	}
}
