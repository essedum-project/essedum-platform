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
package com.infosys.icets.iamp.usm.config;

import com.infosys.icets.ai.comm.lib.util.i18n.MessageResource;

// TODO: Auto-generated Javadoc
/**
 * The Class Messages.
 */
/**
 * @author icets
 */
public class Messages {
	
	/**
	 * Instantiates a new messages.
	 */
	private Messages() {}

	/**
	 * Gets the msg.
	 *
	 * @param key   the key
	 * @param param the param
	 * @return the msg
	 */
	public static String getMsg(String key, Object... param) {
		return MessageResource.getMessage(Constants.MODULE_NAME, key, param);
	}

}
