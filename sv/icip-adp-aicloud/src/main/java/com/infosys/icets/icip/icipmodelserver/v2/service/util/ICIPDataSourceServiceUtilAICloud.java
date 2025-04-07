package com.infosys.icets.icip.icipmodelserver.v2.service.util;

import java.security.NoSuchAlgorithmException;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.elasticsearch.client.RestClient;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.properties.ProxyProperties;
import com.infosys.icets.icip.dataset.service.util.ICIPDataSourceServiceUtil;
import com.infosys.icets.icip.dataset.service.util.ICIPDataSourceServiceUtilRestAbstract;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.ICIPModelServiceAICloud;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

@Component("aicloudsource")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPDataSourceServiceUtilAICloud extends ICIPDataSourceServiceUtilRestAbstract {
	
    private static final String PROJECT_ID = "projectId";

    private static final String USER_ID = "userId";

    private static final String INPUT = "input";

	@Autowired
	private ICIPModelServiceAICloud modelService;
	
	public ICIPDataSourceServiceUtilAICloud(ProxyProperties proxyProperties) {
		super(proxyProperties);
	}

	private static Logger logger = LoggerFactory.getLogger(ICIPDataSourceServiceUtilAICloud.class);

	@Override
	public boolean testConnection(ICIPDatasource datasource) {
		JSONObject connDetails = new JSONObject(datasource.getConnectionDetails());
		String url = connDetails.optString("Url") + "/api/v1/endpoint?projectId=" + connDetails.optString(PROJECT_ID);
		String userId = connDetails.optString(USER_ID);

		try {
			Response response = modelService.executeUrl(url, userId);
			if (response.code() == 200) {
				return true;
			}
		} catch (Exception e) {
			logger.error("Error while executing request:",e);
			return false;
		}
		return false;
	}

	@Override
	public ICIPDatasource setHashcode(boolean isVault, ICIPDatasource datasource) throws NoSuchAlgorithmException {

		try {
			logger.info("Indside setHashcode of Datasource Service Aicloud");
		} catch (Exception e) {
			logger.error("Error while setting hashcode: ", e.getMessage());
		}
		return datasource;
	}

	@Override
    public JSONObject getJson() {
        JSONObject ds = super.getJson();
        try {
            ds.put("type", "AICLOUD");
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
            attributes.put(PROJECT_ID, "");
            attributes.put(USER_ID, "");
            attributes.put("runtime","");
            JSONObject formats = new JSONObject();
            formats.put("datasource", "datasourceDropdown");
            formats.put("datasource-dp", "Datasource");
            formats.put(PROJECT_ID, INPUT);
            formats.put("projectId-dp", "Project Id");
            formats.put("runtime",INPUT);
            formats.put("runtime-dp","Pipeline Version");
            formats.put(USER_ID, INPUT);
            formats.put("userId-dp", "AICloud UserID");
            ds.put(ICIPDataSourceServiceUtil.ATTRIBUTES, attributes);
            ds.put("formats", formats);
        } catch (JSONException e) {
            logger.error("plugin attributes mismatch", e.getMessage());
        }
        return ds;
    }

	
	

}
