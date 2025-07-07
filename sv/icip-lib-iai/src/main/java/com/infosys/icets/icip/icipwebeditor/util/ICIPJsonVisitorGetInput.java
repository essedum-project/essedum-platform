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
import java.util.List;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPJsonVisitorGetInput.
 *
 * @author icets
 */

/**
 * Gets the input.
 *
 * @return the input
 */

/**
 * Gets the input.
 *
 * @return the input
 */

/**
 * Gets the input.
 *
 * @return the input
 */
@Getter

/**
 * Sets the input.
 *
 * @param input the new input
 */

/**
 * Sets the input.
 *
 * @param input the new input
 */

/**
 * Sets the input.
 *
 * @param input the new input
 */
@Setter
public class ICIPJsonVisitorGetInput implements ICIPJsonVisitor<JsonElement> {

	/** The input. */
	private List<String> input = new ArrayList<>();

	/** The Constant INPUTSTRING. */
	private static final String INPUTSTRING = "input";

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
		if (json.has(INPUTSTRING) && json.get(INPUTSTRING).getAsJsonObject().has("dataset")) {
			JsonArray arrs = json.get(INPUTSTRING).getAsJsonObject().get("dataset").getAsJsonArray();
			arrs.forEach(arr -> {
				String element = null;
				try {
					element = arr.getAsString();
				} catch (Exception ex) {
					element = arr.toString();
				}
				input.add(element);
			});
		}
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