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
 * The Class ICIPJsonVisitorGetOutput.
 *
 * @author icets
 */

/**
 * Gets the output.
 *
 * @return the output
 */

/**
 * Gets the output.
 *
 * @return the output
 */

/**
 * Gets the output.
 *
 * @return the output
 */
@Getter

/**
 * Sets the output.
 *
 * @param output the new output
 */

/**
 * Sets the output.
 *
 * @param output the new output
 */

/**
 * Sets the output.
 *
 * @param output the new output
 */
@Setter
public class ICIPJsonVisitorGetOutput implements ICIPJsonVisitor<JsonElement> {

	/** The Constant OUTPUT. */
	private static final String OUTPUTSTRING = "output";

	/** The Constant DATASET. */
	private static final String DATASET = "dataset";

	/** The output. */
	private List<String> output = new ArrayList<>();

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
		if (json.has(OUTPUTSTRING) && json.get(OUTPUTSTRING).getAsJsonObject().has(DATASET)) {
			JsonArray arrs = json.get(OUTPUTSTRING).getAsJsonObject().get(DATASET).getAsJsonArray();
			arrs.forEach(arr -> {
				String element = null;
				try {
					element = arr.getAsString();
				} catch (Exception ex) {
					element = arr.toString();
				}
				output.add(element);
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