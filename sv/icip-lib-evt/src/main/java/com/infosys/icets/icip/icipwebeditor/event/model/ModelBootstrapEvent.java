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

import org.slf4j.Marker;
import org.springframework.context.ApplicationEvent;

import lombok.Getter;

// TODO: Auto-generated Javadoc
//
/**
* The Class  ModelBootstrapEvent.
*
* @author icets
*/

/**
 * Gets the model server url.
 *
 * @return the model server url
 */

/**
 * Gets the marker.
 *
 * @return the marker
 */

/**
 * Gets the marker.
 *
 * @return the marker
 */
@Getter
public class ModelBootstrapEvent extends ApplicationEvent {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The model server url. */
	private String modelServerUrl;

	/** The marker. */
	private Marker marker;

	/**
	 * Instantiates a new model bootstrap event.
	 *
	 * @param source         the source
	 * @param modelServerUrl the model server url
	 * @param marker the marker
	 */
	public ModelBootstrapEvent(Object source, String modelServerUrl, Marker marker) {
		super(source);
		this.modelServerUrl = modelServerUrl;
		this.marker = marker;
	}

}
