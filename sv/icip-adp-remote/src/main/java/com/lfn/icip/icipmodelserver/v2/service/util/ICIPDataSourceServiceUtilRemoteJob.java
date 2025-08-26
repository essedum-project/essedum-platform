package com.lfn.icip.icipmodelserver.v2.service.util;

import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;

import org.apache.http.client.methods.CloseableHttpResponse;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.google.gson.JsonArray;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.properties.ProxyProperties;
import com.lfn.icip.dataset.service.util.ICIPDataSourceServiceUtil;
import com.lfn.icip.dataset.service.util.ICIPDataSourceServiceUtilRestAbstract;

@Component("remotesource")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPDataSourceServiceUtilRemoteJob extends ICIPDataSourceServiceUtilRestAbstract {

	/** The proxy properties. */
	private ProxyProperties proxyProperties;

	public ICIPDataSourceServiceUtilRemoteJob(ProxyProperties proxyProperties) {
		super(proxyProperties);
		this.proxyProperties = proxyProperties;

	}

	private static Logger logger = LoggerFactory.getLogger(ICIPDataSourceServiceUtilRemoteJob.class);

	@Override
	public ICIPDatasource setHashcode(boolean isVault, ICIPDatasource datasource) throws NoSuchAlgorithmException {
	
		try {
		} catch (Exception e) {
			logger.error("Error while setting hashcode: ", e);
		}
		return datasource;

	}

	@Override
	public JSONObject getJson() {
		JSONObject ds = super.getJson();
		try {
			ds.put("type", "REMOTE");
			ds.put("category", "REST");
			JSONObject attributes = ds.getJSONObject(ICIPDataSourceServiceUtil.ATTRIBUTES);
			attributes.put("AuthType", "token");
			attributes.put("NoProxy", "false");
			attributes.put("ConnectionType", "ApiRequest");
			attributes.put("Url", "");
			attributes.put("fileId", "");
			attributes.put("AuthDetails", "{}");
			attributes.put("testDataset", "{\"name\":\"\",\"attributes\":{\"RequestMethod\":\"GET\",\"Headers\":\"{}\","
					+ "\"QueryParams\":\"{}\",\"Body\":\"\",\"Endpoint\":\"\"}}");
			attributes.put("tokenExpirationTime", "");
			attributes.put("datasource", "");
			attributes.put("bucketname", "");
			attributes.put("projectId", "");
			JSONObject formats = new JSONObject();
			formats.put("datasource", "datasourceDropdown");
			formats.put("datasource-dp", "Datasource");
			formats.put("bucketname", "input");
			formats.put("bucketname-dp", "Bucket Name");
			formats.put("projectId", "input");
			formats.put("projectId-dp", "Project Id");
			formats.put("storageType", "input");
			formats.put("storageType-dp", "Storage Type");
			formats.put("userId", "input");
			formats.put("userId-dp", "User Id");
			ds.put(ICIPDataSourceServiceUtil.ATTRIBUTES, attributes);
			ds.put("formats", formats);
		} catch (JSONException e) {
			logger.error("plugin attributes mismatch", e);
		}
		return ds;
	}

	/**
	 * Test connection.
	 *
	 * @param datasource the datasource
	 * @return true, if successful
	 */
	@Override
	public boolean testConnection(ICIPDatasource datasource) {

		try (CloseableHttpResponse response = authenticate(datasource)) {

			if (response.getStatusLine().getStatusCode() == 200 || response.getStatusLine().getStatusCode() == 201
					|| response.getStatusLine().getStatusCode() == 204) {
				return true;
			}
		} catch (Exception e) {
			logger.error("Error while executing request:", e);
		}
		return false;
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