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
