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
package com.infosys.icets.ai.comm.lib.util.logger;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.sift.AbstractDiscriminator;
import lombok.Getter;
import lombok.Setter;

// 
/**
 * The Class JobContextDiscriminator.
 *
 * @author icets
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