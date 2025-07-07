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
package com.infosys.icets.icip.icipwebeditor.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPJsonVisitorGetElements.
 *
 * @author icets
 */
@Component
public class ICIPJsonVisitorGetElements {
	
	/**
	 * Instantiates a new ICIP json visitor get elements.
	 */
	private ICIPJsonVisitorGetElements() {
		// Avoid instantiation of the class since its a Utility class
	}

	/**
	 * Json to map.
	 *
	 * @param json the json
	 * @return the map
	 */
	public static Map<String, Object> jsonToMap(JsonObject json) {
		Map<String, Object> retMap = new HashMap<>();

		if (json != null) {
			retMap = toMap(json);
		}
		return retMap;
	}

	/**
	 * To map.
	 *
	 * @param object the object
	 * @return the map
	 */
	public static Map<String, Object> toMap(JsonObject object) {
		Map<String, Object> map = new HashMap<>();

		Iterator<String> keysItr = object.keySet().iterator();
		while (keysItr.hasNext()) {
			String key = keysItr.next();
			Object value = object.get(key);

			if (value instanceof JsonArray) {
				value = toList((JsonArray) value);
			}

			else if (value instanceof JsonObject) {
				value = toMap((JsonObject) value);
			} else if (value instanceof JsonPrimitive) {
				String element = null;
				JsonPrimitive jsonPrimitive = (JsonPrimitive) value;
				try {
					element = jsonPrimitive.getAsString();
				} catch (Exception ex) {
					element = jsonPrimitive.toString();
				}
				value = element;
			}
			map.put(key, value);
		}
		return map;
	}

	/**
	 * To list.
	 *
	 * @param array the array
	 * @return the list
	 */
	public static List<Object> toList(JsonArray array) {
		List<Object> list = new ArrayList<>();
		for (int i = 0; i < array.size(); i++) {
			Object value = array.get(i);
			if (value instanceof JsonArray) {
				value = toList((JsonArray) value);
			}

			else if (value instanceof JsonObject) {
				value = toMap((JsonObject) value);
			}
			list.add(value);
		}
		return list;
	}
}