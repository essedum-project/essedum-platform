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

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.lfn.icip.dataset.service.IICIPDatasetService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPJsonVisitorRewriteDataset.
 *
 * @author essedum
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