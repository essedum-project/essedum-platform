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
package com.infosys.icets.icip.dataset.service.util;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.Timestamp;
import java.util.List;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;

import com.fasterxml.jackson.databind.JsonNode;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;

// TODO: Auto-generated Javadoc
/**
 * The Class AICIPDataSourceServiceUtil.
 */
public abstract class ICIPDataSourceServiceUtil implements IICIPDataSourceServiceUtil {

	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(ICIPDataSourceServiceUtil.class);

	/** The Constant VAULTKEY. */
	public static final String VAULTKEY = "vaultkey";

	/** The Constant ATTRIBUTES. */
	public static final String ATTRIBUTES = "attributes";

	/** The Constant PSTR. */
	public static final String PSTR = "password";
	
	

	/**
	 * Gets the json.
	 *
	 * @return the json
	 */
	public JSONObject getJson() {
		JSONObject ds = new JSONObject();
		try {
			JSONObject attributes = new JSONObject();
			attributes.put(PSTR, "");
			ds.put(ATTRIBUTES, attributes);
		} catch (JSONException e) {
			logger.error("plugin attributes mismatch", e);
		}
		return ds;
	}

	/**
	 * checks if Upload Data functionality is supported.
	 *
	 * @param datasource the datasource
	 * @return false
	 */
	public JSONObject isUploadDataSupported(ICIPDatasource datasource) {
		return new JSONObject("{Load from File:false}");
	}

	/**
	 * checks if macrobase functionality is supported.
	 *
	 * @param datasource the datasource
	 * @return false
	 */
	public JSONObject isMacroBaseSupported(ICIPDatasource datasource) {
		return new JSONObject("{Explore Outliers:false}");
	}

	/**
	 * checks if extract schema functionality is supported.
	 *
	 * @param datasource the datasource
	 * @return false
	 */
	public JSONObject isExtractSchemaSupported(ICIPDatasource datasource) {
		return new JSONObject("{Extract Schema:false}");
	}

	/**
	 * checks if dataset visualization functionality is supported.
	 *
	 * @param datasource the datasource
	 * @return false
	 */
	public JSONObject isDatasetVisualizationSupported(ICIPDatasource datasource) {
		return new JSONObject("{Visualization:false}");
	}

	/**
	 * checks if tabular view is supported in dataset view.
	 *
	 * @param datasource the datasource
	 * @return false
	 */
	public JSONObject isTabularViewSupported(ICIPDatasource datasource) {
		return new JSONObject("{Tabular View:false}");
	}

	/**
	 * checks if table creation is supported for dataset.
	 *
	 * @param datasource the datasource
	 * @return false
	 */
	public JSONObject isTableCreationUsingSchemaSupported(ICIPDatasource datasource) {
		return new JSONObject("{Create Table:false}");
	}

	public JSONObject isEtlSupported(ICIPDatasource datasource) {
		return new JSONObject("{ETL:false}");
	}

	/**
	 * Creates the datasets.
	 *
	 * @param datasource the datasource
	 * @param marker     the marker
	 * @throws UnsupportedOperationException the unsupported operation exception
	 */
	@Override
	public void createDatasets(ICIPDatasource datasource, Marker marker) throws UnsupportedOperationException {
		throw new UnsupportedOperationException(
				"createDatasets method is not implemented for type " + datasource.getType());
	}

	/**
	 * Gets the docs.
	 *
	 * @param pluginType the plugin type
	 * @return the docs
	 * @throws FileNotFoundException the file not found exception
	 * @throws IOException           Signals that an I/O exception has occurred.
	 */
	@Override
	public String getDocs(String pluginType) throws FileNotFoundException, IOException {

		String path = "/docs/" + pluginType + ".html";
		InputStream in = getClass().getResourceAsStream(path);

		if (in == null) {
			throw new FileNotFoundException("incorrect documentaion file path");
		}

		try (BufferedReader reader = new BufferedReader(new InputStreamReader(in), 2048)) {
			String st;
			StringBuilder fullDocument = new StringBuilder(4096);
			while ((st = reader.readLine()) != null) {
				fullDocument.append(st);
			}
			return fullDocument.toString();
		}

	}

	@Override
	public String getSyncDatasetJobName(ICIPDatasource datasource) {
		throw new UnsupportedOperationException(
				String.format("SyncDatasets job is not implemented for type %s", datasource.getType()));
	}

	@Override
	public ICIPDatasource updateDatasource(ICIPDatasource datasource) {
		return datasource;
	}

	@Override
	public String uploadFile(ICIPDatasource datasource,String attributes, String uploadFile) throws Exception {
		return null;
	}
	@Override
	public String downloadFile(ICIPDatasource datasource, String attributes, String downloadFilePath) throws Exception {
		return downloadFilePath;
	}
	
    

//    public String getElasticSearchResponse(ICIPDatasource datasource, String pipelineId, String trailId, Timestamp submitedOn){
//    	return null;
//    }
	
	public String getElasticSearchResponse(ICIPDatasource datasource, String pipelineId, String trailId, String formattedDate, String elasticSearchIndex){
    	return null;
    }
}
