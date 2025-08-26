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

package com.lfn.icip.adapter.service.impl;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.icip.dataset.cache.EncryptionCache;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.service.aspect.ResolverAspect;
import com.lfn.icip.dataset.service.impl.ICIPDatasetService;
import com.lfn.icip.dataset.util.DecryptPassword;
import com.zaxxer.hikari.HikariDataSource;

@Service
public class ICIPAIOpsAdapterService {

	/** The ICIP dataset service. */
	@Autowired
	private ICIPDatasetService datasetService;

	private ICIPDataset dataset;

	/** The Constant TICKETSDATASETNAME. */
	private static final String TICKETSDATASETNAME = "Tickets";

	/** The encryption key. */
	@EssedumProperty("application.uiconfig.enckeydefault")
	private static String enckeydefault;

	/** The encryption cache. */
	@Autowired
	private EncryptionCache encryptionCache;

	@Autowired
	private ResolverAspect resolver;
	
	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPAIOpsAdapterService.class);

	public void saveRecommendation(String requestBody, String results, String project, String columnName) {
		ObjectMapper objMapper = new ObjectMapper();
		JsonNode jsonNode;
		try {
			jsonNode = objMapper.readTree(requestBody);
			String incidentNumber = jsonNode.get("query").get("number").asText();
			String itsmTicketsDatasetName = TICKETSDATASETNAME;

			JsonNode resultsJson = objMapper.readTree(results);
			if (resultsJson.has("Answer")) {
				results = resultsJson.get("Answer").asText();
				results.replace("\\n", "\n");
			}

			this.saveRecommendation(results, incidentNumber, itsmTicketsDatasetName, project, columnName);
		} catch (JsonMappingException e) {
			logger.error("Error due to:", e);
		} catch (JsonProcessingException e) {
			logger.error("Error due to:", e);
		}
	}

	private void saveRecommendation(String results, String incidentNumber, String itsmTicketsDatasetName,
			String project, String columnName) {
		try {
			dataset = datasetService.getDataset(itsmTicketsDatasetName, project);
		} catch (Exception e) {
			logger.error("Error due to:", e);
		}
		
		resolver.resolve(dataset.getDatasource());
		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		String url = connectionDetails.optString("url");
		String user = connectionDetails.optString("userName");
		String pstr = connectionDetails.optString("password");

		try {
			String decrypted = null;
			if (encryptionCache.getCache().containsKey(pstr)) {
				logger.debug("getting from Encryption Cache");
				decrypted = encryptionCache.getCache().get(pstr);
			} else {
				logger.debug("decrypting password");
				decrypted = DecryptPassword.decrypt(pstr, enckeydefault, dataset.getDatasource().getSalt());
				if (decrypted != null)
					encryptionCache.getCache().put(pstr, decrypted);
			}
			pstr = decrypted;

		} catch (Exception e) {
			logger.error("Error in decryption: " + e);
		}

		try (HikariDataSource hkDatasource = new HikariDataSource()) {
			hkDatasource.setJdbcUrl(url);
			hkDatasource.setUsername(user);
			hkDatasource.setPassword(pstr);
			String dbType = dataset.getDatasource().getType();

			switch (dbType.toLowerCase()) {
			case "mysql":
				hkDatasource.setDriverClassName("com.mysql.cj.jdbc.Driver");
				break;
			case "postgresql":
				hkDatasource.setDriverClassName("com.postgresql.Driver");
				break;
			case "mssql":
				hkDatasource.setDriverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
				break;
			default:
				throw new IllegalArgumentException("Unsupported database type: " + dbType);
			}

			JdbcTemplate jdbcTemplate = new JdbcTemplate(hkDatasource);

			String selectSql = "SELECT COUNT(*) FROM " + project + "_genairecommendations where number = ?";
			int count = jdbcTemplate.queryForObject(selectSql, Integer.class, incidentNumber);

			if (count > 0) {
				String updateSql = "UPDATE " + project + "_genairecommendations SET " + columnName
						+ " = ? where number = ?";
				jdbcTemplate.update(updateSql, results, incidentNumber);
			} else {
				String insertSql = "INSERT " + project + "_genairecommendations (number, " + columnName
						+ ") VALUES (?, ?)";
				jdbcTemplate.update(insertSql, incidentNumber, results);
			}
		} catch (Exception e) {
			logger.error("Error due to:", e);
		}

	}

}
