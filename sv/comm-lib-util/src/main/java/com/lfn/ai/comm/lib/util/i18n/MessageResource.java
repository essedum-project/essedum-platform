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

package com.lfn.ai.comm.lib.util.i18n;

import java.text.MessageFormat;
import java.util.HashMap;
import java.util.ResourceBundle;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import com.lfn.ai.comm.lib.util.constants.Constants;

/**
 * The Class MessageResource.
 *
 * @author essedum
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
