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
 * The Class ICIPJsonVisitorGetDagsterScript.
 *
 * @author icets
 */

/**
 * Gets the script.
 *
 * @return the script
 */

/**
 * Gets the script.
 *
 * @return the script
 */

/**
 * Gets the script.
 *
 * @return the script
 */
@Getter

/**
 * Sets the script.
 *
 * @param script the new script
 */

/**
 * Sets the script.
 *
 * @param script the new script
 */

/**
 * Sets the script.
 *
 * @param script the new script
 */
@Setter
public class ICIPJsonVisitorGetDagsterScript implements ICIPJsonVisitor<JsonElement> {

	/** The script. */
	private StringBuilder script = new StringBuilder();

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
		if (json.has("script"))
			json.get("script").getAsJsonArray().forEach(ele -> {
				String element = null;
				try {
					element = ele.getAsString();
				} catch (Exception ex) {
					element = ele.toString();
				}
				script.append(element);
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