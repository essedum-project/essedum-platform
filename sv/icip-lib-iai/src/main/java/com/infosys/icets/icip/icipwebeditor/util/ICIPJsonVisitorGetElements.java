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