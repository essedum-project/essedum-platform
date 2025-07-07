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
import com.infosys.icets.icip.dataset.service.IICIPSchemaRegistryService;


// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPJsonVisitorRewrite.
 *
 * @author icets
 */
public class ICIPJsonVisitorRewrite implements ICIPJsonVisitor<JsonElement>
{
	
	/** The schema registry service. */
	private IICIPSchemaRegistryService schemaRegistryService;
	
	/**
	 * Instantiates a new ICIP json visitor rewrite.
	 *
	 * @param schemaRegistryService2 the schema registry service 2
	 */
	public ICIPJsonVisitorRewrite(IICIPSchemaRegistryService schemaRegistryService2) {
		this.setSchemaRegistryService(schemaRegistryService2);
	}
	
	
	/**
	 * Visit.
	 *
	 * @param json the json
	 * @param org the org
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
	 * @param org the org
	 * @return the json element
	 */
	@Override
	public JsonElement visit(JsonObject json, String org) {
		return json;
	}

	/**
	 * Visit.
	 *
	 * @param json the json
	 * @param org the org
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
	 * @param org the org
	 * @return the json element
	 */
	@Override
	public JsonElement visit(JsonPrimitive json, String org) {
		return json;
	}


	/**
	 * Gets the schema registry service.
	 *
	 * @return the schema registry service
	 */
	public IICIPSchemaRegistryService getSchemaRegistryService() {
		return schemaRegistryService;
	}


	/**
	 * Sets the schema registry service.
	 *
	 * @param schemaRegistryService2 the new schema registry service
	 */
	private void setSchemaRegistryService(IICIPSchemaRegistryService schemaRegistryService2) {
		this.schemaRegistryService = schemaRegistryService2;
	}

	
}