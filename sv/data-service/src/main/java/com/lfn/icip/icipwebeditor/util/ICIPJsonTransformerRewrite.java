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

package com.lfn.icip.icipwebeditor.util;

import java.util.Map.Entry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPJsonTransformerRewrite.
 *
 * @author essedum
 */
public class ICIPJsonTransformerRewrite extends ICIPJsonTransformerBase<JsonElement> {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPJsonTransformerRewrite.class);

	/** The visitor. */
	private ICIPJsonVisitor<? extends JsonElement> visitor;

	/** The is recursive. */
	private boolean isRecursive;

	/**
	 * Instantiates a new ICIP json transformer rewrite.
	 *
	 * @param visitor the visitor
	 * @param org     the org
	 */
	public ICIPJsonTransformerRewrite(ICIPJsonVisitor<? extends JsonElement> visitor, String org) {
		this(visitor, true, org);
	}

	/**
	 * Instantiates a new ICIP json transformer rewrite.
	 *
	 * @param visitor     the visitor
	 * @param isRecursive the is recursive
	 * @param org         the org
	 */
	public ICIPJsonTransformerRewrite(ICIPJsonVisitor<? extends JsonElement> visitor, boolean isRecursive, String org) {
		super(org);
		this.visitor = visitor;
		this.isRecursive = isRecursive;
	}

	/**
	 * Apply.
	 *
	 * @param json the json
	 * @return the json element
	 */
	@Override
	public JsonElement apply(JsonElement json) {
		JsonElement repl;
		try {
			repl = ICIPJsonWalker.visit(json, visitor, org);
			return isRecursive ? super.apply(repl) : repl;
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
		return null;
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
	 * @throws Exception the exception
	 */
	@SuppressWarnings("deprecation")
	@Override
	public JsonElement visit(JsonObject json, String org) throws Exception {
		JsonObject copy = new JsonObject();
		boolean hasChanged = false;
		for (Entry<String, JsonElement> entry : json.entrySet()) {
			String key = entry.getKey();
			JsonElement val = entry.getValue();
			JsonElement e = null;
			if (entry.getKey().equals("schema")) {
				Gson gson = new Gson();
				String id = null;
				try {
					JsonObject schemaName = entry.getValue().getAsJsonObject();
					if (schemaName.has("schemaId"))
						id = schemaName.get("schemaId").getAsString();
					else if (schemaName.has("name")) {
						id = schemaName.get("name").getAsString();
					}
				} catch (Exception ex) {
					id = entry.getValue().getAsString();
				}
				if (id != null && !id.equals("text")) {
					JsonParser parser = new JsonParser();
					JsonObject tmpObject = new JsonObject();
					try {
						String schemaValue = ((ICIPJsonVisitorRewrite) visitor).getSchemaRegistryService()
								.fetchSchemaValue(id, org);
						JsonElement schemaElem = parser.parse(schemaValue);
						tmpObject.addProperty("name", id);
						tmpObject.add("schemaDetails", schemaElem.getAsJsonArray());
					} catch (Exception ex) {
						JsonElement schemaElem = parser.parse("");
						tmpObject.add("schemaDetails", schemaElem.getAsJsonNull());
					}
					e = gson.fromJson(tmpObject, JsonElement.class);
				}
			} else {
				e = apply(val);
			}

			if (e != val) {
				hasChanged = true;
			}

			copy.add(key, e);
		}

		return hasChanged ? copy : json;
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
		JsonArray copy = new JsonArray();

		boolean hasChanged = false;
		for (JsonElement item : json) {
			JsonElement e = apply(item);

			if (e != item) {
				hasChanged = true;
			}

			copy.add(e);
		}

		return hasChanged ? copy : json;
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

	/**
	 * Creates the.
	 *
	 * @param visitor the visitor
	 * @return the ICIP json transformer rewrite
	 */
	public static ICIPJsonTransformerRewrite create(ICIPJsonVisitor<? extends JsonElement> visitor) {
		return create(visitor, true, org);
	}

	/**
	 * Creates the.
	 *
	 * @param visitor     the visitor
	 * @param isRecursive the is recursive
	 * @param org         the org
	 * @return the ICIP json transformer rewrite
	 */
	public static ICIPJsonTransformerRewrite create(ICIPJsonVisitor<? extends JsonElement> visitor, boolean isRecursive,
			String org) {
		return new ICIPJsonTransformerRewrite(visitor, isRecursive, org);
	}

}
