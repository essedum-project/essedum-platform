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

package com.lfn.icip.icipwebeditor.event.model;

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
 * @author essedum
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
