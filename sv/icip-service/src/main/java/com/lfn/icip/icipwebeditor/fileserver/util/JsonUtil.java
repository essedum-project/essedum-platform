package com.lfn.icip.icipwebeditor.fileserver.util;

import com.google.gson.JsonObject;

// TODO: Auto-generated Javadoc
/**
 * The Class JsonUtil.
 */
public class JsonUtil {
	
	/**
	 * Instantiates a new json util.
	 */
	private JsonUtil() {
	}

	/**
	 * Gets the value from json.
	 *
	 * @param json the json
	 * @param key the key
	 * @return the value from json
	 */
	public static String getValueFromJson(JsonObject json, String key) {
		if (json.has(key)) {
			try {
				return json.get(key).getAsString();
			} catch (Exception ex) {
				return json.get(key).toString();
			}
		}
		return "";
	}

}
