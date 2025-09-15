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

package com.lfn.ai.comm.lib.util.logger;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.sift.AbstractDiscriminator;
import lombok.Getter;
import lombok.Setter;

// 
/**
 * The Class JobContextDiscriminator.
 *
 * @author essedum
 */
@Getter
@Setter
public class JobContextDiscriminator extends AbstractDiscriminator<ILoggingEvent> {

	/** The Constant KEY. */
	private static final String JOBKEY = "contextName";

	/** The default value. */
	private String defaultValue;

	/**
	 * Gets the discriminating value.
	 *
	 * @param event the event
	 * @return the discriminating value
	 */
	public String getDiscriminatingValue(ILoggingEvent event) {
		if (event == null || event.getMarker() == null) {
			return defaultValue;
		}
		return event.getMarker().getName();
	}

	/**
	 * Gets the key.
	 *
	 * @return the key
	 */
	public String getKey() {
		return JOBKEY;
	}

	/**
	 * Sets the key.
	 *
	 * @param key the new key
	 */
	public void setKey(String key) {
		throw new UnsupportedOperationException("Key cannot be set. Using fixed key " + JOBKEY);
	}

}