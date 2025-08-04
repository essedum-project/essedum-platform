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

package com.infosys.icets.icip.dataset.service.util;

import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.google.gson.JsonObject;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDataSourceServiceUtilMySQL.
 *
 * @author icets
 */
@Component("mysqlsource")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPDataSourceServiceUtilMySQL extends ICIPDataSourceServiceUtil {

	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(ICIPDataSourceServiceUtilMySQL.class);

	@Autowired
	private ICIPDataSetServiceUtilMySQLPoolMap poolMap;

	/**
	 * Test connection.
	 *
	 * @param datasource the datasource
	 * @return true, if successful
	 */
	@Override
	public boolean testConnection(ICIPDatasource datasource) {
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		String url = connectionDetails.optString("url");
		String user = connectionDetails.optString("userName");
		String pstr = connectionDetails.optString(PSTR);
		if(pstr==null)
			return false;
		try (Connection conn = DriverManager.getConnection(url, user, pstr)) {
			return true;
		} catch (SQLException e) {
			logger.error(e.getMessage(), e);
			try {
				poolMap.deleteDatasource(url, user, pstr);
			} catch (NoSuchAlgorithmException e1) {
				logger.error(e1.getMessage(), e1);
			}
			return false;
		}

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
			ds.put("type", "MYSQL");
			ds.put("category", "SQL");
			JSONObject attributes = ds.getJSONObject(ICIPDataSourceServiceUtil.ATTRIBUTES);
			attributes.put("url", "");
			attributes.put("userName", "");
			attributes.put(PSTR, "");
			JSONObject position = new JSONObject();
			position.put("url", 0);
			position.put("userName", 1);
			position.put(PSTR, 2);
			ds.put(ICIPDataSourceServiceUtil.ATTRIBUTES, attributes);
			ds.put("position", position);
		} catch (JSONException e) {
			logger.error("plugin attributes mismatch", e);
		}
		return ds;
	}
	
//	@Override
//    public JSONObject getJson() {
//        JSONObject ds = super.getJson();
//        try {
//        ds.put("type", "MYSQL");
//            ds.put("category", "SQL");
//            JSONObject attributes = new JSONObject();
//            attributes.put("type", "object");
//            JSONObject properties = new JSONObject();
//            properties.put("url", new JSONObject().put("type", "string"));
//            properties.put("userName", new JSONObject().put("type", "string"));
//            properties.put(PSTR, new JSONObject().put("type", "string"));
//            attributes.put("properties", properties);
//            List<String> req=new ArrayList<String>();
//            req.add("url");
//            req.add("userName");
//            req.add(PSTR);
//            attributes.put("required", req);
//            JSONObject uischema = new JSONObject();
//            uischema.put("type", "VerticalLayout");
//             JSONArray elements = new JSONArray();
//             elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/userName"));
//             elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/"+PSTR));
//             elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/url"));
//             uischema.put("elements", elements);
//            ds.put("attributes", attributes);
//            ds.put("uischema", uischema);         
//          }
//          catch (JSONException e) {
//            logger.error("Exception", e);
//        }
//        return ds;
//    }

	/**
	 * Sets the hashcode.
	 *
	 * @param datasource the datasource
	 * @return the ICIP datasource
	 * @throws NoSuchAlgorithmException
	 */
	@Override
	public ICIPDatasource setHashcode(boolean isVault, ICIPDatasource datasource) throws NoSuchAlgorithmException {
		JsonObject obj = new JsonObject();
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		String url = connectionDetails.optString("url");
		String user = connectionDetails.optString("userName");
		String pstr = connectionDetails.optString(PSTR);
		obj.addProperty("url", url);
		obj.addProperty("userName", user);
		obj.addProperty(PSTR, pstr);
		String objString = obj.toString();
		datasource.setDshashcode(ICIPUtils.createHashString(objString));
		return datasource;
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
	public JSONObject isDatasetVisualizationSupported(ICIPDatasource datasource) {
		return new JSONObject("{Visualization:true}");
	}

	@Override
	public JSONObject isTabularViewSupported(ICIPDatasource datasource) {
		return new JSONObject("{Tabular View:true}");
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
