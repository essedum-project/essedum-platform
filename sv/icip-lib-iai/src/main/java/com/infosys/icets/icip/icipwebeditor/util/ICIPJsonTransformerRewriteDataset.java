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
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPSchemaDetails;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPJsonTransformerRewriteDataset.
 *
 * @author icets
 */
public class ICIPJsonTransformerRewriteDataset extends ICIPJsonTransformerBase<JsonElement> {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPJsonTransformerRewriteDataset.class);

	/** The visitor. */
	private ICIPJsonVisitor<? extends JsonElement> visitor;

	/** The is recursive. */
	private boolean isRecursive;

	/** The Constant SCHEMA. */
	private static final String SCHEMA = "schema";

	/**
	 * Instantiates a new ICIP json transformer rewrite dataset.
	 *
	 * @param visitor the visitor
	 * @param org     the org
	 */
	public ICIPJsonTransformerRewriteDataset(ICIPJsonVisitor<? extends JsonElement> visitor, String org) {
		this(visitor, true, org);
	}

	/**
	 * Instantiates a new ICIP json transformer rewrite dataset.
	 *
	 * @param visitor     the visitor
	 * @param isRecursive the is recursive
	 * @param org         the org
	 */
	public ICIPJsonTransformerRewriteDataset(ICIPJsonVisitor<? extends JsonElement> visitor, boolean isRecursive,
			String org) {
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
		try {
			JsonElement repl = ICIPJsonWalker.visit(json, visitor, org);
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
			if (entry.getKey().equalsIgnoreCase("dataset")) {
				if (val.isJsonArray()) {
					JsonArray arr = new JsonArray();
					val.getAsJsonArray().forEach(ds -> {
						Gson gson = new Gson();
						JsonParser parser = new JsonParser();
						ICIPDataset dataset = null;
						try {
							dataset = ((ICIPJsonVisitorRewriteDataset) visitor).getDatasetService()
									.getDataset(ds.getAsString(), org);
						} catch (Exception e2) {
							logger.error(e2.getMessage(), e2);
						}
						JsonElement e1 = parser.parse(gson.toJson(dataset));
						arr.add(e1);
						for (Entry<String, JsonElement> schemaentry : e1.getAsJsonObject().entrySet()) {
							if (schemaentry.getKey().equals(SCHEMA)) {
								JsonObject obj = schemaentry.getValue().getAsJsonObject();
								ICIPSchemaDetails schemaDetails = new ICIPSchemaDetails();
								String schemaValue = obj.get("schemavalue").getAsString();
								JsonElement schemaElem = parser.parse(schemaValue);
								schemaDetails.setSchemaDetails(schemaElem.getAsJsonArray());
								schemaDetails.setSchemaId(obj.get("name").getAsString());
								e1.getAsJsonObject().remove(SCHEMA);
								e1.getAsJsonObject().add(SCHEMA, parser.parse(gson.toJson(schemaDetails)));
								arr.add(e1);
								break;
							}
						}
					});
					e = arr;
				} else if (val.isJsonObject()) {
					Gson gson = new Gson();
					JsonParser parser = new JsonParser();
					JsonObject data = entry.getValue().getAsJsonObject();
					e = parser.parse(gson.toJson(data));
				} else if (!val.getAsString().trim().equals("") && !val.getAsString().equals("dropdown")
						&& !val.getAsString().equals("text")) {
					Gson gson = new Gson();
					JsonParser parser = new JsonParser();
					ICIPDataset dataset;
					try {
						dataset = ((ICIPJsonVisitorRewriteDataset) visitor).getDatasetService()
								.getDataset(entry.getValue().getAsString(), org);
						e = parser.parse(gson.toJson(dataset));
						for (Entry<String, JsonElement> schemaentry : e.getAsJsonObject().entrySet()) {
							if (schemaentry.getKey().equals(SCHEMA)) {
								JsonObject obj = schemaentry.getValue().getAsJsonObject();
								ICIPSchemaDetails schemaDetails = new ICIPSchemaDetails();
								String schemaValue = obj.get("schemavalue").getAsString();
								JsonElement schemaElem = parser.parse(schemaValue);
								schemaDetails.setSchemaDetails(schemaElem.getAsJsonArray());
								schemaDetails.setSchemaId(obj.get("name").getAsString());
								e.getAsJsonObject().remove(SCHEMA);
								e.getAsJsonObject().add(SCHEMA, parser.parse(gson.toJson(schemaDetails)));
								break;
							}
						}
					} catch (Exception ex) {
						logger.error(ex.getMessage(), ex);
					}
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
	 * @param org     the org
	 * @return the ICIP json transformer rewrite dataset
	 */
	public static ICIPJsonTransformerRewriteDataset create(ICIPJsonVisitor<? extends JsonElement> visitor, String org) {
		return create(visitor, true, org);
	}

	/**
	 * Creates the.
	 *
	 * @param visitor     the visitor
	 * @param isRecursive the is recursive
	 * @param org         the org
	 * @return the ICIP json transformer rewrite dataset
	 */
	public static ICIPJsonTransformerRewriteDataset create(ICIPJsonVisitor<? extends JsonElement> visitor,
			boolean isRecursive, String org) {
		return new ICIPJsonTransformerRewriteDataset(visitor, isRecursive, org);
	}

}
