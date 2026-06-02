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
package com.lfn.icip.dataset.service.util;

import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.lfn.icip.dataset.properties.ProxyProperties;

//
/**
 * The Class ICIPDataSetServiceUtilFireeye.
 *
 * @author lfn
 */
@Component("azureds")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPDataSetServiceUtilAzure extends ICIPDataSetServiceUtilRestAbstract {
	
	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPDataSetServiceUtilAzure.class);
	
	/** The Constant API. */
	private static final String API = "EndPoint";
	
	/** The Constant QPARAMS. */
	private static final String QPARAMS = "QueryParams";
	
	private static final String SCRIPT = "TransformationScript";
	
	/** The Constant BODY. */
	private static final String BODY = "Request Body";
	
	public ICIPDataSetServiceUtilAzure(ProxyProperties proxyProperties) {
		super(proxyProperties);
	}
	
	/**
	 * Gets the json.
	 *
	 * @return the json
	 */
	@Override
	public JSONObject getJson() {
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", "AZURE");
			JSONObject attributes = new JSONObject();
			attributes.put(API, "");
			attributes.put(QPARAMS, "");
			attributes.put(REQUESTMETHOD, "");
			attributes.put("Headers", "");
			attributes.put(BODY, "");
			attributes.put("params", "");
			attributes.put(SCRIPT, "");
			JSONObject position = new JSONObject();
			position.put(API, 0);
			position.put(QPARAMS, 1);
			position.put(REQUESTMETHOD, 2);
			position.put("Headers", 3);
			position.put(BODY, 4);
			position.put("params", 5);
			position.put(SCRIPT, 6);
			ds.put("attributes", attributes);
			ds.put("position", position);
		} catch (JSONException e) {
			logger.error("error", e);
		}
		logger.info("setting plugin attributes with default values");
		return ds;
	}
}


