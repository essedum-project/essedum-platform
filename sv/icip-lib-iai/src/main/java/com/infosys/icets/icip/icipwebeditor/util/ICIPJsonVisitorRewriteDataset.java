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
import com.infosys.icets.icip.dataset.service.IICIPDatasetService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPJsonVisitorRewriteDataset.
 *
 * @author icets
 */
public class ICIPJsonVisitorRewriteDataset implements ICIPJsonVisitor<JsonElement>
{
	
	/** The dataset service. */
	private IICIPDatasetService datasetService;
	
	
	/**
	 * Instantiates a new ICIP json visitor rewrite dataset.
	 *
	 * @param datasetService the dataset service
	 */
	public ICIPJsonVisitorRewriteDataset(IICIPDatasetService datasetService) {
		this.setDatasetService(datasetService);
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
	 * Gets the dataset service.
	 *
	 * @return the dataset service
	 */
	public IICIPDatasetService getDatasetService() {
		return datasetService;
	}


	/**
	 * Sets the dataset service.
	 *
	 * @param datasetService the new dataset service
	 */
	private void setDatasetService(IICIPDatasetService datasetService) {
		this.datasetService = datasetService;
	}
}