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

import java.util.HashSet;
import java.util.Set;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPJsonVisitorGetRequiredJars.
 *
 * @author icets
 */
public class ICIPJsonVisitorGetRequiredJars implements ICIPJsonVisitor<JsonElement> {

	/** The required jars. */
	private Set<String> requiredJars = new HashSet<>();

	/**
	 * Gets the required jars.
	 *
	 * @return the required jars
	 */
	public Set<String> getRequiredJars() {
		return requiredJars;
	}

	/**
	 * Sets the required jars.
	 *
	 * @param requiredJars the new required jars
	 */
	public void setRequiredJars(Set<String> requiredJars) {
		this.requiredJars = requiredJars;
	}

	/**
	 * Visit.
	 *
	 * @param json the json
	 * @param org  the org
	 * @return the json element
	 */
	@Override
	public JsonElement visit(JsonNull json, String org) {
		return json;
	}

	/**
	 * Visit.
	 *
	 * @param json the json
	 * @param org  the org
	 * @return the json element
	 */
	@Override
	public JsonElement visit(JsonObject json, String org) {
		if (json.has("requiredJars"))
			json.get("requiredJars").getAsJsonArray().forEach(ele -> {
				String element = null;
				try {
					element = ele.getAsString();
				} catch (Exception ex) {
					element = ele.toString();
				}
				requiredJars.add(element);
			});
		return json;
	}

	/**
	 * Visit.
	 *
	 * @param json the json
	 * @param org  the org
	 * @return the json element
	 */
	@Override
	public JsonElement visit(JsonArray json, String org) {
		return json;
	}

	/**
	 * Visit.
	 *
	 * @param json the json
	 * @param org  the org
	 * @return the json element
	 */
	@Override
	public JsonElement visit(JsonPrimitive json, String org) {
		return json;
	}
}