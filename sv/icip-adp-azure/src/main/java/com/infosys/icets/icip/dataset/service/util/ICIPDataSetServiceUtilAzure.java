/**
 * @ 2020 - 2021 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.dataset.service.util;

import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.infosys.icets.icip.dataset.properties.ProxyProperties;

//
/**
 * The Class ICIPDataSetServiceUtilFireeye.
 *
 * @author icets
 */
@Component("azureds")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPDataSetServiceUtilAzure extends ICIPDataSetServiceUtilRestAbstract {
	
	/** The proxy properties. */
	private ProxyProperties proxyProperties;

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPDataSetServiceUtilAzure.class);
	
	/** The Constant AUTHURL. */
	private static final String AUTHURL = "authUrl";
	
	/** The Constant API. */
	private static final String API = "EndPoint";
	
	/** The Constant QPARAMS. */
	private static final String QPARAMS = "QueryParams";
	
	private static final String SCRIPT = "TransformationScript";
	
	/** The Constant METHOD. */
	private static final String METHOD = "API Type";
	
	/** The Constant BODY. */
	private static final String BODY = "Request Body";
	
	public ICIPDataSetServiceUtilAzure(ProxyProperties proxyProperties) {
		super(proxyProperties);
		this.proxyProperties = proxyProperties;
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


