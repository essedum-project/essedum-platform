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
package com.infosys.icets.ai.comm.lib.util.i18n;

import java.text.MessageFormat;
import java.util.HashMap;
import java.util.ResourceBundle;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import com.infosys.icets.ai.comm.lib.util.constants.Constants;

/**
 * The Class MessageResource.
 *
 * @author icets
 */
@Service
public class MessageResource {

	/**
	 * ResourceBundle msg
	 */

	/**
	 * env
	 */
	@Autowired
	private Environment env;

	static HashMap<String, ResourceBundle> resourceBundleMap = new HashMap<>();

	static HashMap<String, String> queryStringMap = new HashMap<>();

	static HashMap<String, String> messageStringMap = new HashMap<>();

	static private ResourceBundle getResourceBundleForFilePath(String filePath) {
		ResourceBundle resourceBundle = resourceBundleMap.get(filePath);
		if (resourceBundle == null) {
			synchronized (MessageResource.class) {
				resourceBundle = ResourceBundle.getBundle(filePath);
				resourceBundleMap.put(filePath, resourceBundle);
				
			}
		}
		
		return resourceBundle;
	}

	static private String getQueryString(String moduleName, String messageKey) {
		String message = queryStringMap.get(moduleName + "::" + messageKey);
		
		if (message == null) {
			synchronized (MessageResource.class) {
				
				ResourceBundle resourceBundle = getResourceBundleForFilePath(moduleName + dbPath);
				message = resourceBundle.getString(messageKey);
				
				queryStringMap.put(moduleName + "::" + messageKey, message);
			}
		}
		
		return message;
	}

	static private String getMessageString(String moduleName, String messageKey) {
		String message = messageStringMap.get(moduleName + "::" + messageKey);
		
		if (message == null) {
			synchronized (MessageResource.class) {
				
				ResourceBundle msgResBundle = getResourceBundleForFilePath(
						moduleName + Constants.MESSAGE_PATH + "." + Constants.MESSAGE_FILE);
				message = msgResBundle.getString(messageKey);
				messageStringMap.put(moduleName + "::" + messageKey, message);
			}
		}
		
		return message;
	}

	private static String dbPath = null;

	@PostConstruct
	private void init() {
		String dbType = env.getProperty(Constants.ENV_DATABASE_TYPE, Constants.DEFAULT_DB_TYPE);
		dbPath = Constants.DB_QUERY_FILE_PATH + "_" + dbType; 
		
	}

	/**
	 * Get Query from property file
	 * 
	 * @param key
	 * @return query
	 */
	public static String getQuery(String moduleName, String messageKey) {
		return getQueryString(moduleName, messageKey);
	}

	/**
	 * Method to get messages from properties
	 * 
	 * @param key
	 * @param params
	 * @return
	 */
	public static String getMessage(String moduleName, String key, Object... params) {
		return MessageFormat.format(getMessageString(moduleName, key), params);

	}

}
