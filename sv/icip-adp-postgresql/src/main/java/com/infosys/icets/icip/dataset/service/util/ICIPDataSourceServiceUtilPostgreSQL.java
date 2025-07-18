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

import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.google.gson.JsonObject;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.util.DecryptPassword;
//import com.mchange.v2.c3p0.test.ConnectionDispersionTest;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;

@Component("postgresqlsource")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPDataSourceServiceUtilPostgreSQL extends ICIPDataSourceServiceUtil {

	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(ICIPDataSourceServiceUtilPostgreSQL.class);

	/** The Constant PSTR. */
	private static final String PSTR = "password";

	/**
	 * Test connection.
	 *
	 * @param datasource the datasource
	 * @return true, if successful
	 */
	@Override
	public boolean testConnection(ICIPDatasource datasource) {
		JSONObject obj = new JSONObject(datasource.getConnectionDetails());
		obj.optString(PSTR);

		try (Connection conn = DriverManager.getConnection(obj.optString("url"), obj.optString("userName"),
				obj.optString(PSTR))) {

			return true;
		} catch (SQLException e) {
			logger.error(e.getMessage(), e);
		}
		return false;

	}

	/**
	 * Gets the json.
	 *
	 * @return the json
	 */
	@Override
	public JSONObject getJson() {
		JSONObject ds = super.getJson();
		try {
			ds.put("type", "POSTGRESQL");
			ds.put("category", "SQL");
			JSONObject attributes = ds.getJSONObject(ICIPDataSourceServiceUtil.ATTRIBUTES);
			attributes.put("url", "");
			attributes.put("userName", "");
			attributes.put(PSTR, "");
			JSONObject position = new JSONObject();
			position.put("url", 0);
			position.put("userName", 1);
			position.put(PSTR, 2);
			ds.put("position", position);
			ds.put(ICIPDataSourceServiceUtil.ATTRIBUTES, attributes);
		} catch (JSONException e) {
			logger.error("plugin attributes mismatch", e);
		}
		return ds;
	}

	/**
	 * @param datasource
	 * @return
	 * @throws NoSuchAlgorithmException
	 */
	public ICIPDatasource setHashcode(ICIPDatasource datasource) throws NoSuchAlgorithmException {
		JsonObject obj = new JsonObject();
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		String url = connectionDetails.optString("url");
		String userName = connectionDetails.optString("userName");
		obj.addProperty("url", url);
		obj.addProperty("userName", userName);
		String objString = obj.toString();
		datasource.setDshashcode(ICIPUtils.createHashString(objString));
		return datasource;
	}

	/**
	 *
	 */
	@Override
	public ICIPDatasource setHashcode(boolean isVault, ICIPDatasource datasource) throws NoSuchAlgorithmException {
		JsonObject obj = new JsonObject();
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		String url = connectionDetails.optString("url");
		String userName = connectionDetails.optString("userName");
		obj.addProperty("url", url);
		obj.addProperty("userName", userName);
		String objString = obj.toString();
		datasource.setDshashcode(ICIPUtils.createHashString(objString));
		return datasource;
	}

	@Override
	public JSONObject isDatasetVisualizationSupported(ICIPDatasource datasource) {
		return new JSONObject("{Visualization:true}");
	}

	@Override
	public JSONObject isTabularViewSupported(ICIPDatasource datasource) {
		return new JSONObject("{Tabular View:true}");
	}

	@Override
	public JSONObject isUploadDataSupported(ICIPDatasource datasource) {
		return new JSONObject("{Load from File:true}");
	}

	@Override
	public JSONObject isMacroBaseSupported(ICIPDatasource datasource) {
		return new JSONObject("{Explore Outliers:true}");
	}

	@Override
	public JSONObject isExtractSchemaSupported(ICIPDatasource datasource) {
		return new JSONObject("{Extract Schema:true}");
	}

	@Override
	public JSONObject isTableCreationUsingSchemaSupported(ICIPDatasource datasource) {
		return new JSONObject("{Create Table:true}");
	}

	@Override
	public List<Map<String, Object>> getCustomModels(String org, List<ICIPDatasource> connectionsList, Integer page,
			Integer size, String query) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Long getAllModelObjectDetailsCount(List<ICIPDatasource> datasources, String searchModelName, String org) {
		// TODO Auto-generated method stub
		return null;
	}

}