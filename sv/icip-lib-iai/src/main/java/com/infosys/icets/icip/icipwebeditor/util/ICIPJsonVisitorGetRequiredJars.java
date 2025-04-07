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