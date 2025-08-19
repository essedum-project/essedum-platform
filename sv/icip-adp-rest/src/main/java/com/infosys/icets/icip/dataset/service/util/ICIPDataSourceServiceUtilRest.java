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
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.properties.ProxyProperties;

/**
 * The Class ICIPDataSourceServiceUtilRest.
 *
 * @author icets
 */
@Component("restsource")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPDataSourceServiceUtilRest extends ICIPDataSourceServiceUtilRestAbstract {

	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(ICIPDataSourceServiceUtilRest.class);

	public ICIPDataSourceServiceUtilRest(ProxyProperties proxyProperties) {
		super(proxyProperties);
	}

	@Override
	public ICIPDatasource setHashcode(boolean isVault, ICIPDatasource datasource) throws NoSuchAlgorithmException {
		JsonObject obj = new JsonObject();
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		String authType = connectionDetails.optString("AuthType");
		String url = connectionDetails.optString("Url");

		obj.addProperty("Url", url);
		obj.addProperty("userName", authType);
		String objString = obj.toString();
		datasource.setDshashcode(ICIPUtils.createHashString(objString));
		return datasource;
	}
	
	@Override
	public void createDatasets(ICIPDatasource datasource, Marker marker) {
		logger.info("CreateDatasets jobs is not implemented for type "+ datasource.getType());
	}
	
	@Override
	public ICIPDatasource updateDatasource(ICIPDatasource datasource) {
		return super.updateDatasource(datasource);
	}
	
	@Override
	public JSONObject isEtlSupported(ICIPDatasource datasource) {
		return new JSONObject("{ETL:true}");
	}

	@Override
	public List<Map<String, Object>> getCustomModels(String org, List<ICIPDatasource> connectionsList,Integer page,Integer size,String query) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Long getAllModelObjectDetailsCount(List<ICIPDatasource> datasources, String searchModelName, String org) {
		// TODO Auto-generated method stub
		return null;
	}
}

