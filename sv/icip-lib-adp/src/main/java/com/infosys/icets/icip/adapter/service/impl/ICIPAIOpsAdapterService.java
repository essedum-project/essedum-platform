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
package com.infosys.icets.icip.adapter.service.impl;

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
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.icip.dataset.cache.EncryptionCache;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.service.aspect.ResolverAspect;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetService;
import com.infosys.icets.icip.dataset.util.DecryptPassword;
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
	@LeapProperty("application.uiconfig.enckeydefault")
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
