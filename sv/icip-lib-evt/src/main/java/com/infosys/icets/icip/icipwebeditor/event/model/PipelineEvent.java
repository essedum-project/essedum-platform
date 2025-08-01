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

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class PipelineEvent.
 *
 * @author icets
 */

/**
 * Checks if is rest node.
 *
 * @return true, if is rest node
 */

/**
 * Gets the corelid.
 *
 * @return the corelid
 */

/**
 * Gets the corelid.
 *
 * @return the corelid
 */

/**
 * Gets the corelid.
 *
 * @return the corelid
 */
@Getter

/**
 * Sets the rest node.
 *
 * @param restNode the new rest node
 */

/**
 * Sets the corelid.
 *
 * @param corelid the new corelid
 */

/**
 * Sets the corelid.
 *
 * @param corelid the new corelid
 */

/**
 * Sets the corelid.
 *
 * @param corelid the new corelid
 */
@Setter
public class PipelineEvent extends ApplicationEvent {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The event name. */
	private String eventName;

	/** The organization. */
	private String organization;

	/** The params. */
	private String params;

	/** The rest node id. */
	private String restNodeId;

	/** The rest node. */
	private boolean restNode;

	/** The clazz. */
	private Class clazz;

	/** The corelid. */
	private String corelid;
	
	private String submittedBy;
	
	private String datasourceName;

	/**
	 * Instantiates a new pipeline event.
	 *
	 * @param source       the source
	 * @param eventName    the event name
	 * @param organization the organization
	 * @param params       the params
	 * @param clazz the clazz
	 * @param corelid the corelid
	 */
	
	public PipelineEvent(Object source, String eventName, String organization, String params, Class clazz,
			String corelid, String submittedBy, String datasourceName) {
		this(source, eventName, organization, params, false, clazz, corelid, submittedBy, datasourceName);
	}
	/**
	 * Instantiates a new pipeline event.
	 *
	 * @param source       the source
	 * @param eventName    the event name
	 * @param organization the organization
	 * @param params       the params
	 * @param restNode     the rest node
	 * @param clazz the clazz
	 * @param corelid the corelid
	 * @param datasource the datasource
	 */
	public PipelineEvent(Object source, String eventName, String organization, String params, boolean restNode,
			Class clazz, String corelid, String submittedBy, String datasourceName) {
		super(source);
		this.eventName = eventName;
		this.organization = organization;
		this.params = params;
		this.restNode = restNode;
		this.clazz = clazz;
		this.corelid = corelid;
		this.submittedBy = submittedBy;
		this.datasourceName = datasourceName;
	}

}
