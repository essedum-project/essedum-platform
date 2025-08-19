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
