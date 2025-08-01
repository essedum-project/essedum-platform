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

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Types;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import org.apache.poi.ss.format.CellDateFormatter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import com.healthmarketscience.sqlbuilder.BinaryCondition;
import com.healthmarketscience.sqlbuilder.InsertQuery;
import com.healthmarketscience.sqlbuilder.SelectQuery;
import com.healthmarketscience.sqlbuilder.ValidationException;
import com.healthmarketscience.sqlbuilder.dbspec.Column;
import com.healthmarketscience.sqlbuilder.dbspec.basic.DbColumn;
import com.healthmarketscience.sqlbuilder.dbspec.basic.DbSchema;
import com.healthmarketscience.sqlbuilder.dbspec.basic.DbSpec;
import com.healthmarketscience.sqlbuilder.dbspec.basic.DbTable;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.logger.JobLogger;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.NameEncoderService;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDatasetFiles;
import com.infosys.icets.icip.dataset.model.dto.ICIPDataAuditResponse;
import com.infosys.icets.icip.dataset.model.dto.ICIPDataAuditResponse.Operation;
import com.infosys.icets.icip.dataset.model.dto.ICIPDataAuditResponse.Status;
import com.infosys.icets.icip.dataset.repository.ICIPDatasetFilesRepository;
import com.infosys.icets.icip.dataset.service.IICIPSchemaRegistryService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetFilesService;
import com.infosys.icets.icip.dataset.util.DecryptPassword;
import com.infosys.icets.icip.icipwebeditor.event.factory.IAPIEventFactory;
import com.infosys.icets.icip.icipwebeditor.fileserver.service.impl.FileServerService;
import com.infosys.icets.icip.reader.xlsx.StreamingReader;
import com.jayway.jsonpath.JsonPath;
import com.opencsv.CSVReader;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPDataSetServiceUtilSqlAbstract.
 */
@RefreshScope
public abstract class ICIPDataSetServiceUtilSqlAbstract extends ICIPDataSetServiceUtil
		implements IICIPDataSetServiceUtilSql {

	/** The update batch size. */
	@LeapProperty("icip.updateBatchSize")
	private String updateBatchSize;

	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(ICIPDataSetServiceUtilSqlAbstract.class);

	/** The Constant joblogger. */
	protected static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/** The Constant LIKE. */
	private static final String LIKE = " like '%";

	/** The Constant QU. */
	private static final String QU = "Query";

	/** The Constant WHERE. */
	private static final String WHERE = " where ";

	/** The update query. */
	String updateQuery = "";

	/** The Constant TICKETIDLIST. */
	private static final String TICKETIDLIST = "ticketIdList";

	/** The fileserver service. */
	@Autowired
	private FileServerService fileserverService;

	/** The datasetfileserver service. */
	@Autowired
	private ICIPDatasetFilesService datasetfilesService;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	/** The dataset files repository. */
	@Autowired
	private ICIPDatasetFilesRepository datasetFilesRepository;

	/** The nameencoderservice. */
	@Autowired
	private NameEncoderService nameencoderservice;

	/** The event factory. */
	@Autowired
	private IAPIEventFactory eventFactory;

	@Autowired
	private DecryptPassword decryptpass;

	@Autowired
	IICIPSchemaRegistryService schemaService;

	@Value("${encryption.key}")
	String key;
	/** The Constant RECORDCOLUMNDISPLAYNAME. */
	private static final String RECORDCOLUMNDISPLAYNAME = "$..recordcolumndisplayname";

	/**
	 * Extract schema.
	 *
	 * @param dataset the dataset
	 * @return the list
	 */
	public List<String> extractSchema(ICIPDataset dataset) {
		return null;
	}

	/**
	 * Execute update.
	 *
	 * @param dataset the dataset
	 * @param marker  the marker
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	public void executeUpdate(ICIPDataset dataset, Marker marker) throws SQLException, NoSuchAlgorithmException {

	}

	/**
	 * Execute update.
	 *
	 * @param dataset the dataset
	 * @param marker  the marker
	 * @return the int
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	public int executeUpdatewithGeneratedID(ICIPDataset dataset, Marker marker)
			throws SQLException, NoSuchAlgorithmException {
		return 0;
	}

	/** The Constant PSTR. */
	private static final String PSTR = "password";
	/** The Constant UNAME. */
	private static final String UNAME = "userName";

	/**
	 * Gets the db connection.
	 *
	 * @param connectionDetails the connection details
	 * @return the db connection
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	public Connection getDbConnection(JSONObject connectionDetails) throws SQLException {
		String url = connectionDetails.optString("url");
		String username = connectionDetails.optString(UNAME);
		String password = connectionDetails.optString(PSTR);
		Connection conn = null;
		conn = DriverManager.getConnection(url, username, password);
		return conn;
	}

	/**
	 * Validate query.
	 *
	 * @param query the query
	 * @return true, if successful
	 * @throws SQLException the SQL exception
	 */
	protected boolean validateQuery(String inpQuery) throws SQLException {
		String query = inpQuery.trim();
		if (query.toUpperCase(Locale.ENGLISH).contains("--") || query.toUpperCase(Locale.ENGLISH).startsWith("UPDATE")
				|| query.toUpperCase(Locale.ENGLISH).startsWith("INSERT")
				|| query.toUpperCase(Locale.ENGLISH).startsWith("DELETE")
				|| query.toUpperCase(Locale.ENGLISH).startsWith("REPLACE")) {
			throw new SQLException("Insert, Delete, Update, Replace queries are not allowed");
		} else
			return true;
	}

	/**
	 * Creates the table if not exists.
	 *
	 * @param dataset the dataset
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	public abstract void createTableIfNotExists(ICIPDataset dataset) throws SQLException, NoSuchAlgorithmException;
	public abstract void dataAudit(ICIPDataset dataset, String rowdata, String action, String rowId, String user) throws SQLException, NoSuchAlgorithmException;
	public abstract String getcolumnMappings(JSONArray uniqueSchemaArray, boolean approve, boolean inbox);

	/**
	 * Gets the column mappings.
	 *
	 * @param schema  the schema
	 * @param approve the approve
	 * @param inbox   the inbox
	 * @return the column mappings
	 */

	/**
	 * Gets the row by BID.
	 *
	 * @param dataset the dataset
	 * @param bid     the bid
	 * @return the row by BID
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws JSONException            the JSON exception
	 * @throws SQLException             the SQL exception
	 */
	public JsonObject getRowByBID(ICIPDataset dataset, String bid, boolean decrypt)
			throws NoSuchAlgorithmException, JSONException, SQLException {
		try (Connection conn = getDbConnection(new JSONObject(dataset.getDatasource().getConnectionDetails()))) {

			String table = new JSONObject(dataset.getAttributes()).getString("tableName");
			DbSpec spec = new DbSpec();
			DbSchema schema = spec.addDefaultSchema();
			DbTable cTable = schema.addTable(table);
			SelectQuery dslquery = new SelectQuery();
			dslquery.addAllTableColumns(cTable);
			dslquery.addFromTable(cTable);
			Column bidCol = cTable.addColumn("BID");
			dslquery.getWhereClause().addCondition(BinaryCondition.equalTo(bidCol, bid));

			try (PreparedStatement stmt = conn.prepareStatement(dslquery.validate().toString(),
					ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_UPDATABLE)) {
				try (ResultSet res = stmt.executeQuery()) {

					JsonObject obj = extractAsGsonJsonObject(res);
					JSONObject obj1 = new JSONObject(obj.toString());
					// if (decrypt) {
					// 	obj1 = checkIfDecrypted(obj1, dataset);
					// 	obj = new JsonParser().parse(obj1.toString()).getAsJsonObject();
					// }
					return obj;
				}

			}
		}

	}

	/**
	 * Extract as gson json object.
	 *
	 * @param res the res
	 * @return the json object
	 * @throws SQLException the SQL exception
	 */
	protected JsonObject extractAsGsonJsonObject(ResultSet res) throws SQLException {
		JsonObject row = new JsonObject();
		if (res.first()) {
			ResultSetMetaData metadata = res.getMetaData();
			for (int i = 1; i <= metadata.getColumnCount(); i++) {
				String s = res.getString(i);
				row.addProperty(metadata.getColumnLabel(i), s);
			}
		}
		if (row.keySet().isEmpty()) {
			ResultSetMetaData metadata = res.getMetaData();
			for (int i = 1; i <= metadata.getColumnCount(); i++) {
				String s = "";
				row.addProperty(metadata.getColumnLabel(i), s);
			}
		}
		return row;
	}

	/**
	 * Extract as gson json array.
	 *
	 * @param res the res
	 * @return the json array
	 * @throws SQLException the SQL exception
	 */
	protected JsonArray extractAsGsonJsonArray(ResultSet res) throws SQLException {
		JsonArray rows = new JsonArray();
		while (res.next()) {
			JsonObject row = new JsonObject();
			ResultSetMetaData metadata = res.getMetaData();
			for (int i = 1; i <= metadata.getColumnCount(); i++) {
				if (res.getObject(i) == null) {
					String s = res.getString(i);
					row.addProperty(metadata.getColumnLabel(i), s);
				} else {
					if (metadata.getColumnClassName(i).equals("java.lang.Integer")) {
						int s = res.getInt(i);
						row.addProperty(metadata.getColumnLabel(i), s);
					} else if(metadata.getColumnClassName(i).equals("java.lang.Double") ) {
						double s = res.getDouble(i);
						if (isScientificNotation(s)) {
				            System.out.println(s + " is in scientific notation.");
				            DecimalFormat decimalFormat = new DecimalFormat("#,###.##");
				            String formattedValue = decimalFormat.format(s);
				            row.addProperty(metadata.getColumnLabel(i), formattedValue);
				        }else {
						row.addProperty(metadata.getColumnLabel(i), s);
				        }
					} else {
						String s = res.getString(i);
						row.addProperty(metadata.getColumnLabel(i), s);
					}
				}
			}
			rows.add(row);
		}
		if (rows.size() == 0) {
			JsonObject row = new JsonObject();
			ResultSetMetaData metadata = res.getMetaData();
			for (int i = 1; i <= metadata.getColumnCount(); i++) {
				String s = "";
				row.addProperty(metadata.getColumnLabel(i), s);
			}
			rows.add(row);
		}
		return rows;
	}
	
	public static boolean isScientificNotation(double number) {
        String numberStr = Double.toString(number);
        String regex = "^[+-]?\\d+(\\.\\d+)?[eE][+-]?\\d+$";
        return numberStr.matches(regex);
    }

	/**
	 * Gets the SQL type.
	 *
	 * @param type the type
	 * @return the SQL type
	 */
	public String getSQLType(String type) {
		String sqlType = "";
		switch (type) {
		case "int":
		case "integer":
			sqlType = "INT";
			break;
		case "varchar":
		case "string":
			sqlType = "VARCHAR(255)";
			break;
		case "boolean":
			sqlType = "BOOLEAN";
			break;
		case "float":
		case "double":
			sqlType = "DOUBLE";
			break;
		case "timestamp":
			sqlType = "TIMESTAMP";
			break;
		case "date":
			sqlType = "DATE";
			break;
		case "datetime":
			sqlType = "DATETIME";
			break;
		case "file":
			sqlType = "TEXT";
			break;
		default:
			sqlType = "TEXT";
		}
		return sqlType;
	}

	/**
	 * Creates the table if not exists.
	 *
	 * @param dataset the dataset
	 * @param map     the map
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	public void createTableFromCsv(ICIPDataset dataset, List<Map<String, ?>> map)
			throws SQLException, NoSuchAlgorithmException {

	}

	/**
	 * Delete all from table.
	 *
	 * @param dataset the dataset
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws SQLException             the SQL exception
	 */
	public void deleteAllFromTable(ICIPDataset dataset) throws NoSuchAlgorithmException, SQLException {
	}

	/**
	 * Extract table schema.
	 *
	 * @param dataset   the dataset
	 * @param tablename the tablename
	 * @return the string
	 */
	public String extractTableSchema(ICIPDataset dataset, String tablename) {
		return null;
	}

	/**
	 * Checks if is table present.
	 *
	 * @param ds        the ds
	 * @param tableName the table name
	 * @return true, if is table present
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	public boolean isTablePresent(ICIPDataset ds, String tableName) throws SQLException, NoSuchAlgorithmException {
		return false;

	}

	/**
	 * Adds the entry.
	 *
	 * @param dataset  the dataset
	 * @param entryObj the entry obj
	 * @return the ICIP data audit response
	 */
	public ICIPDataAuditResponse addEntry(ICIPDataset dataset, JSONObject entryObj, Marker marker) {
		ICIPDataAuditResponse resp = new ICIPDataAuditResponse("", Operation.INSERT, Status.ERROR, "", dataset, 0);
		String assignee = "unassigned";
		try {

			JSONObject attributes = new JSONObject(dataset.getAttributes());
			String tableName = attributes.getString("tableName");
			if (tableName != null) {
				logger.info(marker, "Inserting entry in " + tableName);
				String colNames = "";
				String colValues = "";

				entryObj = new JSONObject(entryObj.toString().replaceAll("'", ""));
				// if (dataset.getIsInboxRequired()) {

				// 	entryObj = checkIfEncrypted(entryObj, dataset, true);

				// }
				Iterator<String> kyItr = entryObj.keys();

				while (kyItr.hasNext()) {
					String ky = kyItr.next();
					if (!ky.equals("action")) {
						colNames += "" + ky + ",";
						colValues += "'" + entryObj.get(ky) + "',";
					}
				}

				if (attributes.has("defaultValues") && attributes.get("defaultValues").toString().length() > 0) {
					String dfltValsStr = attributes.get("defaultValues").toString();
					JSONObject dfltVals = new JSONObject(dfltValsStr);
					Iterator<String> dfltValItr = dfltVals.keys();
					while (dfltValItr.hasNext()) {
						String ky = dfltValItr.next();
						colNames += "`" + ky + "`,";
						colValues += "'" + dfltVals.get(ky) + "',";
					}
				}
				colNames = colNames.substring(0, colNames.length() - 1);
				colValues = colValues.substring(0, colValues.length() - 1);
				String insrtQry = "INSERT INTO " + tableName + " (" + colNames + ") values (" + colValues + ")";
				attributes.put(QU, insrtQry);
				dataset.setAttributes(attributes.toString());
				try {

					Integer id;
					String generated_id;
					if (dataset.getIsInboxRequired()) {
						id = executeUpdatewithGeneratedID(dataset, null);
						generated_id = id.toString();
						resp.setGeneratedId(id);
					} else {
						executeUpdatewithGeneratedID(dataset, null);
						generated_id = entryObj.getString((attributes.getString("uniqueIdentifier")));
					}

					if (dataset.getIsAuditRequired()) {
						if (entryObj.has("_salt")) {
							entryObj.remove("_salt");
						}
						dataAudit(dataset, entryObj.toString(), "create", generated_id,ICIPUtils.getUser(claim));
					}
					resp.setResponse("Entry successfully inserted in table " + tableName);
					logger.info(marker, "Entry successfully inserted in table {}", tableName);

					if (dataset.getIsAuditRequired()) {

						resp.setQuery(insrtQry);
						resp.setStatus(Status.SUCCESS);
					}

				} catch (SQLException e) {
					resp.setResponse("Error: " + e.getMessage());
					logger.error(marker, "Error while inserting entry in {}", tableName, e);
				}
			} else {
				resp.setResponse("Error: Table name is required for inserting entry");
				logger.error(marker, "Error while saving {} dataset entry: Table name is required for inserting entry",
						dataset.getName());
			}
		} catch (Exception ex) {
			resp.setResponse("Error: " + ex.getMessage());
			logger.error(marker, "Error while saving {} dataset entry: ", dataset.getName(), ex);
		}
		return resp;

	}

	/**
	 * Adds the entry.
	 *
	 * @param dataset the dataset
	 * @param rowData the row data
	 * @return the string
	 */
	public ICIPDataAuditResponse addEntry(ICIPDataset dataset, String rowData) {
		return addEntry(dataset, new JSONObject(rowData), null);
	}

	/**
	 * Update entry.
	 *
	 * @param dataset the dataset
	 * @param rowData the row data
	 * @return the string
	 */

	@Transactional
	public ICIPDataAuditResponse updateEntry(ICIPDataset dataset, String rowData) {
		ICIPDataAuditResponse resp = new ICIPDataAuditResponse("", Operation.UPDATE, Status.ERROR, "", dataset, 0);

		try {
			JSONObject attributes = new JSONObject(dataset.getAttributes());

			String tableName = attributes.getString("tableName");
			String uniqueIdentifier = attributes.getString("uniqueIdentifier");
			if (tableName != null && uniqueIdentifier != null && !uniqueIdentifier.trim().isEmpty()) {

				rowData = rowData.replaceAll("'", "");
				// if (dataset.getIsInboxRequired()) {
				// 	rowData = checkIfEncrypted(new JSONObject(rowData), dataset, false).toString();
				// }

				JSONObject entryObj = new JSONObject(rowData);
				logger.info("Updating {} entry in {}", entryObj.get(uniqueIdentifier), tableName);
				String updtQry = "UPDATE " + tableName + " SET ";
				Iterator<String> kyItr = entryObj.keys();
				while (kyItr.hasNext()) {
					String ky = kyItr.next();
					if (!ky.equals(uniqueIdentifier)) {
						updtQry += ky + "=";
						updtQry += "'" + entryObj.get(ky) + "',";
					}
				}
				updtQry = updtQry.substring(0, updtQry.length() - 1);
				if (entryObj.get(uniqueIdentifier) instanceof Integer) {
					updtQry += " WHERE " + uniqueIdentifier + "=" + entryObj.get(uniqueIdentifier);

				} else {
					updtQry += " WHERE " + uniqueIdentifier + "='" + entryObj.get(uniqueIdentifier) + "'";
				}
				attributes.put(QU, updtQry);
				dataset.setAttributes(attributes.toString());
				try {
					executeUpdate(dataset, null);

					String generatedId = entryObj.get(uniqueIdentifier).toString();

					if (dataset.getIsAuditRequired())
						dataAudit(dataset, rowData, "update", generatedId,ICIPUtils.getUser(claim));
					resp.setResponse(
							entryObj.get(uniqueIdentifier) + " entry successfully updated in table " + tableName);

					logger.info("{} entry successfully updated in table {}", entryObj.get(uniqueIdentifier), tableName);
					if (dataset.getIsAuditRequired()) {
						resp.setQuery(updtQry);
						resp.setStatus(Status.SUCCESS);
					}

				} catch (SQLException e) {
					resp.setResponse("Error: " + e.getMessage());
					logger.error("Error while updating {} entry in {} : {}", entryObj.get(uniqueIdentifier), tableName,
							e);
				}
			} else {
				resp.setResponse("Error: Both table name and unique identifier are required for updating entry");
				logger.error("Error while saving " + dataset.getName()
						+ " dataset entry: Both table name and unique identifier are required for updating entry");
			}
		} catch (Exception ex) {
			resp.setResponse("Error: " + ex.getMessage());
			logger.error("Error while saving " + dataset.getName() + " dataset entry: " + ex);
		}
		return resp;
	}

	/**
	 * Builds the query.
	 *
	 * @param dataset    the dataset
	 * @param pagination the pagination
	 * @param query      the query
	 * @return the string
	 */
	protected String buildQuery(ICIPDataset dataset, SQLPagination pagination, String query) {
		query = this.appendSearchParams(dataset, query);
		query = this.appendSortParams(query, pagination);
		int offset = pagination.getPage() * pagination.getSize();
		if (offset >= 0)
			query = this.appendPaginationValues(pagination, query);
		return query;
	}

	/**
	 * Approve.
	 *
	 * @param dataset the dataset
	 * @param approve the approve
	 * @param rowData the row data
	 * @return the string
	 */
//	protected String approve(ICIPDataset dataset, boolean approve, String rowData) {
//		String res = "";
//		if (approve) {
//			JSONObject attributes = new JSONObject(dataset.getAttributes());
//			JSONObject entryObj = new JSONObject(rowData);
//			String uniqueIdentifier = attributes.getString("uniqueIdentifier");
//
//			String tableName = attributes.getString("tableName");
//
//			String query = "SELECT COUNT(*) FROM " + tableName + " WHERE " + uniqueIdentifier + "='"
//					+ entryObj.get(uniqueIdentifier) + "' AND row_status!='UNCHANGED'";
//			JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
//			try (Connection conn = getDbConnection(connectionDetails)) {
//				try (PreparedStatement stmt = conn.prepareStatement(query)) {
//					try {
//						ResultSet rs = stmt.executeQuery(query);
//						rs.next();
//						if (rs.getInt("count(*)") > 0) {
//							res = "false";
//							return res;
//
//						}
//					} finally {
//						if (stmt != null) {
//							safeClose(stmt);
//						}
//					}
//
//				} catch (Exception ex) {
//					logger.error("Some error occured :", ex);
//					return ex.toString();
//				}
//
//			} catch (Exception ex) {
//				logger.error("Some error occured :", ex);
//				return ex.toString();
//
//			}
//		} else {
//			res = "true";
//			return res;
//		}
//		return res;
//	}
	protected String approve(ICIPDataset dataset, boolean approve, String rowData) {
	    String res = "";
	    if (approve) {
	        JSONObject attributes = new JSONObject(dataset.getAttributes());
	        JSONObject entryObj = new JSONObject(rowData);
	        String uniqueIdentifier = attributes.getString("uniqueIdentifier");
	 
	        String tableName = attributes.getString("tableName");
	 
	        String query = "SELECT COUNT(*) FROM " + tableName + " WHERE " + uniqueIdentifier + "='"
	                + entryObj.get(uniqueIdentifier) + "' AND row_status!='UNCHANGED'";
	        JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
	        try (Connection conn = getDbConnection(connectionDetails);
	             PreparedStatement stmt = conn.prepareStatement(query)) {
	            try (ResultSet rs = stmt.executeQuery()) {
	                rs.next();
	                if (rs.getInt("count(*)") > 0) {
	                    res = "false";
	                    return res;
	                }
	            }
	        } catch (Exception ex) {
	            logger.error("Some error occurred:", ex);
	            return ex.toString();
	        }
	    } else {
	        res = "true";
	        return res;
	    }
	    return res;
	}
	
	public ICIPDataAuditResponse updateExtras(ICIPDataset dataset, String rowData, String businessKeyId) {
		ICIPDataAuditResponse resp = new ICIPDataAuditResponse("", Operation.UPDATE, Status.ERROR, "", dataset, 0);

		try {
			JSONObject attributes = new JSONObject(dataset.getAttributes());

			String tableName = attributes.getString("tableName");
			String uniqueIdentifier = attributes.getString("uniqueIdentifier");
			if (tableName != null && uniqueIdentifier != null) {

				logger.info("Updating {} entry in {}", businessKeyId, tableName);
				String updtQry = "UPDATE " + tableName + " SET ";
						updtQry += "_extras" + "=";
						updtQry += "'" + rowData + "'";
					updtQry += " WHERE " + uniqueIdentifier + "=" + businessKeyId;
				attributes.put(QU, updtQry);
				dataset.setAttributes(attributes.toString());
				try {
					executeUpdate(dataset, null);

					String generatedId = businessKeyId.toString();

					if (dataset.getIsAuditRequired())
						dataAudit(dataset, rowData, "update", generatedId,ICIPUtils.getUser(claim));
					resp.setResponse(
							businessKeyId + " entry successfully updated in table " + tableName);

					logger.info("{} entry successfully updated in table {}", businessKeyId,
							tableName);
					if (dataset.getIsAuditRequired()) {
						resp.setQuery(updtQry);
						resp.setStatus(Status.SUCCESS);
					}

				} catch (SQLException e) {
					resp.setResponse("Error: " + e.getMessage());
					logger.error("Error while updating {} entry in {} : {}",businessKeyId,
							tableName, e);
				}
			} else {
				resp.setResponse("Error: Both table name and unique identifier are required for updating entry");
				logger.error("Error while saving " + dataset.getName()
						+ " dataset entry: Both table name and unique identifier are required for updating entry");
			}
		} catch (Exception ex) {
			resp.setResponse("Error: " + ex.getMessage());
			logger.error("Error while saving " + dataset.getName() + " dataset entry: " + ex);
		}
		
		return resp;
	}
	
	public ICIPDataAuditResponse updateTime(ICIPDataset dataset, String businessKeyId) {
		ICIPDataAuditResponse resp = new ICIPDataAuditResponse("", Operation.UPDATE, Status.ERROR, "", dataset, 0);

		try {
			JSONObject attributes = new JSONObject(dataset.getAttributes());

			String tableName = attributes.getString("tableName");
			String uniqueIdentifier = attributes.getString("uniqueIdentifier");
			if (tableName != null && uniqueIdentifier != null) {

				logger.info("Updating {} entry in {}", businessKeyId, tableName);

			String updateQuery = "UPDATE " + tableName + " SET extra_time = (" + "SELECT extra_time FROM "
						+ tableName + "_task_durations " + "WHERE business_key = '" + businessKeyId + "' "
						+ "AND id = (" + "SELECT MAX(id) FROM " + tableName + "_task_durations "
						+ "WHERE business_key = '" + businessKeyId + "' " + "AND extra_time IS NOT NULL)" + ")"
						+ " WHERE business_key_ = '" + businessKeyId + "';";

				attributes.put(QU, updateQuery);
				dataset.setAttributes(attributes.toString());
				try {
					executeUpdate(dataset, null);

					resp.setResponse(businessKeyId + " entry successfully updated in table " + tableName);

					logger.info("{} entry successfully updated in table {}", businessKeyId, tableName);

				} catch (SQLException e) {
					resp.setResponse("Error: " + e.getMessage());
					logger.error("Error while updating {} entry in {} : {}", businessKeyId, tableName, e);
				}
			} else {
				resp.setResponse("Error: Both table name and unique identifier are required for updating entry");
				logger.error("Error while saving " + dataset.getName()
						+ " dataset entry: Both table name and unique identifier are required for updating entry");
			}
		} catch (Exception ex) {
			resp.setResponse("Error: " + ex.getMessage());
			logger.error("Error while saving " + dataset.getName() + " dataset entry: " + ex);
		}
		return resp;
	}

	/**
	 * Adds search parameters to where clause of query.
	 *
	 * @param searchParams the string
	 * @param allowedProps the list of allowed properties
	 * @return the modified where clause
	 */
	protected String assembleSearchParams(String searchParams, List<String> allowedProps) {
		StringBuilder whereClause = new StringBuilder("");
		try {
			if (searchParams != null && !searchParams.trim().isEmpty() && !new JSONObject(searchParams).isEmpty()) {
				JSONObject searchParamsObj = new JSONObject(searchParams);
				if (searchParamsObj.has("searchQuery")) {
					return searchParamsObj.getString("searchQuery");
				}
				Iterator<String> keys = searchParamsObj.keys();
				while (keys.hasNext()) {
					String key = keys.next();
					if (searchParamsObj.get(key) != null && searchParamsObj.get(key) instanceof JSONArray) {
						JSONArray array = (JSONArray) searchParamsObj.get(key);

						for (int i = 0; i < array.length(); i++) {

							if (whereClause.length() != 0) {
								whereClause.append(" " + key + " ");
							}

							JSONObject object = (JSONObject) array.get(i);
							if ( object.has("or")) {
							if (object.get("or") != null && object.get("or") instanceof JSONArray) {
								JSONArray array1 = (JSONArray) object.get("or");
								whereClause.append("( ");
								for (int j = 0; j < array1.length(); j++) {
									JSONObject jObject = (JSONObject) array1.get(j);

									whereClause.append("ta.`" + jObject.get("property") + "`");
									whereClause.append(" " + jObject.get("equality") + " ");
									if (jObject.get("equality").toString().equalsIgnoreCase("like")) {
										whereClause.append("'%");
										whereClause.append(jObject.get("value"));
										whereClause.append("%'");
									} else {
										whereClause.append("\"");
										whereClause.append(jObject.get("value"));
										whereClause.append("\"");
									}
									if (j != array1.length() - 1)
										whereClause.append(" or ");
								}
								whereClause.append(" )");
							}  
							//For AIP where OR search param is not a jsonArray
							else if (object.get("or") != null) {
								JSONObject objVal = (JSONObject) object.get("or");
								whereClause.append("( ");
								whereClause.append("ta.`" + objVal.get("property") + "`");
								whereClause.append(" " + objVal.get("equality") + " ");
								if (objVal.get("equality").toString().equalsIgnoreCase("like")) {
									whereClause.append("'%");
									whereClause.append(objVal.get("value"));
									whereClause.append("%'");
								} else {
									whereClause.append("\"");
									whereClause.append(objVal.get("value"));
									whereClause.append("\"");
								}

								whereClause.append(" )");
							}
				
					        } else if ( object.has("and")) {
						     if(object.get("and") != null && object.get("and") instanceof JSONArray) {
								JSONArray array1 = (JSONArray) object.get("and");
								whereClause.append("( ");
									for(int m = 0; m < array1.length(); m++) {
										JSONObject jObject = (JSONObject) array1.get(m);
										whereClause.append("ta.`" + jObject.get("property") + "`");
										whereClause.append(" " + jObject.get("equality") + " ");
										  if (jObject.get("equality").toString().equalsIgnoreCase("like")) {
											   whereClause.append("'%");
											   whereClause.append(jObject.get("value"));
											   whereClause.append("%'");
										  }else if(jObject.get("equality").toString().equalsIgnoreCase("IN")) {
                                               whereClause.append(jObject.get("value"));
										  }else {
											   whereClause.append("\"");
											   whereClause.append(jObject.get("value"));
											   whereClause.append("\"");	
										  }
												
										  if(m != array1.length() - 1) 
											   whereClause.append(" and ");	
											

										}
										whereClause.append(" )");
							 }
							 
							 }

						}

					}
				}
			}
			return whereClause.toString();
		} catch (Exception ex) {
			logger.error("Error: Error in adding search parameters to where clause of query {}", ex.getMessage(), ex);
			return whereClause.toString();
		}
	}

	/**
	 * Append search params.
	 *
	 * @param dataset the dataset
	 * @param query   the query
	 * @return the string
	 */
	protected String appendSearchParams(ICIPDataset dataset, String query) {
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String searchParams = "";
		String allowedPropsStr = "";
		if (attributes.has("searchParams"))
			searchParams = attributes.getString("searchParams");
		if (attributes.has("allowedProps"))
			allowedPropsStr = attributes.getString("allowedProps");
		List<String> allowedProps = new ArrayList<>();
		if (allowedPropsStr != null && !allowedPropsStr.trim().isEmpty()) {
			allowedProps = Arrays.asList(allowedPropsStr.split("=#@-@#="));
		}
		String whereClause = this.assembleSearchParams(searchParams, allowedProps);
		query = query.replace(";", "");
		if (attributes.has("selectClauseParams"))
			query = "SELECT " + attributes.getString("selectClauseParams") + " from ( " + query + " ) ta ";
		else
			query = "SELECT * from ( " + query + " ) ta ";
		/** ta is table alias **/
		if (whereClause != null && !whereClause.trim().isEmpty()) {
			query += WHERE + whereClause;
		}
		return query;
	}

	/**
	 * Append sort parameters.
	 *
	 * @param query      the query
	 * @param pagination the pagination
	 * @return the string
	 */
	protected String appendSortParams(String query, SQLPagination pagination) {
		StringBuilder sortValue = new StringBuilder();
		if (pagination.getSortEvent() != null && !pagination.getSortEvent().trim().isBlank()
				&& !pagination.getSortEvent().trim().isEmpty() && !pagination.getSortEvent().equals("null")) {
			String order = pagination.getSortOrder() > 0 ? " ASC" : " DESC";
//			query += " ORDER BY ta.`" + pagination.getSortEvent() + "` " + order;
			String se = pagination.getSortEvent();
			String[] sort = se.split(",");
			String sortingEvent = null;
			String sortEvent;
			String sortData = null;
			for(String event : sort) {
				sortingEvent = " ta.`" + event + "` " + ",";
				sortEvent = sortValue.append(sortingEvent).toString();
				sortData = sortEvent.substring(0,sortEvent.length()-1);	
               }
			query += " ORDER BY " + sortData + order;
		}
		return query;
	}

	/**
	 * Append pagination values.
	 *
	 * @param pagination the pagination
	 * @param query      the query
	 * @return the string
	 */
	protected abstract String appendPaginationValues(SQLPagination pagination, String query);

	/**
	 * Load dataset.
	 *
	 * @param dataset     the dataset
	 * @param marker      the marker
	 * @param datasetCols the dataset cols
	 * @param id          the id
	 * @param projectId   the project id
	 * @param overwrite   the overwrite
	 * @param org         the org
	 * @throws Exception the exception
	 */
	@Override
	public void loadDataset(ICIPDataset dataset, Marker marker, List<Map<String, ?>> datasetCols, String id,
			int projectId, boolean overwrite, String org) throws Exception {
		if (id != null && id.equals("undefined")) {
			try {
				createTableIfNotExists(dataset);
				joblogger.info(marker, "{} Table created successfully",
						new JSONObject(dataset.getAttributes()).getString("tableName"));
			} catch (NoSuchAlgorithmException | SQLException e) {
				logger.error(e.getMessage(), e);
				//joblogger.error(marker, e.getMessage(), e);
				
			}
		} else {
			if (overwrite) {
				try {
					deleteAllFromTable(dataset);
				} catch (SQLException | NoSuchAlgorithmException e3) {
					logger.error(e3.getMessage(), e3);
				}
			}
			final AtomicInteger countInsertedRows = new AtomicInteger(0);
			final AtomicInteger countFileRows = new AtomicInteger(0);

			String[] queries = new String[Integer.parseInt(updateBatchSize)];
			// Init the dbspec
			DbSpec spec = new DbSpec();
			DbSchema schema = spec.addDefaultSchema();
			DbTable aTable = schema.addTable(
					new Gson().fromJson(dataset.getAttributes(), JsonObject.class).get("tableName").getAsString());
			List<String> requiredList = new ArrayList<>();
			try {
				Boolean isTable = isTablePresent(dataset,
						new JSONObject(dataset.getAttributes()).getString("tableName"));
				if (dataset.getSchema() != null && (!isTable || dataset.getDatasource().getType().equals("MSSQL"))) {
					new JSONArray(dataset.getSchema().getSchemavalue()).forEach(itemObj -> {
						JSONObject item = (JSONObject) itemObj;
						aTable.addColumn(item.getString("recordcolumnname"), item.getString("columntype"), 256);
						if (item.has("required") && item.getString("required").equals("true")) {
							requiredList.add(item.getString("recordcolumnname"));
						}
					});
				} else if (isTable.booleanValue()) {
					JSONArray tableFields = new JSONArray(extractTableSchema(dataset,
							new JSONObject(dataset.getAttributes()).getString("tableName")));
					new ArrayList<>();

					tableFields.forEach(fieldObj -> {
						JSONObject field = (JSONObject) fieldObj;
						String type;
						if (!field.getString("Type").contains("varchar"))
							type = field.getString("Type");
						else
							type = DbColumn.getTypeName(Types.VARCHAR);
						aTable.addColumn(field.getString("Field"), type, 256);
					});
				} else {
					if (dataset.getDatasource().getType() == "PRESTO") {
						aTable.addColumn("uuid__", "VARCHAR", 256);
						aTable.addColumn("ingestion_time__", "TIMESTAMP WITH TIME ZONE", 256);
					}
					datasetCols.forEach(col -> {
						aTable.addColumn(col.get("field").toString(), col.get("type").toString(), 256);
						if (col.get("required").toString().equals("true"))
							requiredList.add(col.get("field").toString());
					});
				}

			} catch (JsonSyntaxException | NoSuchAlgorithmException | SQLException e2) {
				logger.error(e2.getMessage());
			}
			// Validate All required columns are present in the dataset columns
			List<String> datasetColsFields = new ArrayList<>();
			new JSONArray(datasetCols).forEach(col -> datasetColsFields.add(((JSONObject) col).getString("field")));
			requiredList.removeAll(datasetColsFields);

			if (!requiredList.isEmpty()) {
				joblogger.error(marker, "Required columns not mapped {}", requiredList);
				throw new RuntimeException("Please check the mapping");
			}

			ICIPDatasetFiles datasetFile = datasetFilesRepository.findById(id);
			String filename = datasetFile.getFilename();
			switch (LoadFileTypes.valueOf(filename.substring(filename.indexOf(".") + 1).toUpperCase())) {
			case XLSX:
				loadDatasetXlsx(dataset, marker, datasetCols, countInsertedRows, countFileRows, queries, aTable,
						requiredList, datasetFile);
				break;
			case CSV:
				loadDatasetCsv(dataset, marker, datasetCols, countInsertedRows, countFileRows, queries, aTable,
						requiredList, datasetFile);
				break;
			case JSON:
				loadDatasetJson(dataset, marker, datasetCols, countInsertedRows, countFileRows, queries, aTable,
						datasetFile);
				break;
			}
		}
	}

	/**
	 * Load dataset json.
	 *
	 * @param dataset           the dataset
	 * @param marker            the marker
	 * @param datasetCols       the dataset cols
	 * @param countInsertedRows the count inserted rows
	 * @param countFileRows     the count file rows
	 * @param queries           the queries
	 * @param aTable            the a table
	 * @param datasetFile       the dataset file
	 * @throws Exception   the exception
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	private void loadDatasetJson(ICIPDataset dataset, Marker marker, List<Map<String, ?>> datasetCols,
			final AtomicInteger countInsertedRows, final AtomicInteger countFileRows, String[] queries, DbTable aTable,
			ICIPDatasetFiles datasetFile) throws Exception, IOException {
		datasetfilesService.copyFileFromServer(datasetFile);
		byte[] byteArray;
		Gson gson = new Gson();
		JsonObject metadataObj = gson.fromJson(datasetFile.getMetadata(), JsonObject.class);
		ByteArrayOutputStream allbytes = new ByteArrayOutputStream();
		for (int index = 0, limit = metadataObj.get("totalcount").getAsInt(); index < limit; index++) {
			allbytes.write(fileserverService.download(datasetFile.getId(),
					String.valueOf(index) + "_" + metadataObj.get("filename").getAsString().trim().replace(" ", ""),
					datasetFile.getOrganization()));
		}
		byteArray = allbytes.toByteArray();
		Reader targetReaderJson = new InputStreamReader(new ByteArrayInputStream(byteArray));
		try (BufferedReader reader = new BufferedReader(targetReaderJson, 2048)) {
			String line;
			StringBuilder textBuilder = new StringBuilder(4096);
			while ((line = reader.readLine()) != null) {
				textBuilder.append(line);
			}
			String res = textBuilder.toString();
			JSONArray records = new JSONArray(res);
			records.forEach(row -> {
				JSONObject object = (JSONObject) row;
				updateQuery = "";
				countFileRows.incrementAndGet();
//							List<JSONObject> errorList = this.validateCsv(row, requiredList, map, aTable, marker);
				InsertQuery insertQuery = new InsertQuery(aTable);
//								if (errorList.isEmpty()) {
				datasetCols.forEach(m -> {
					if (m.get("excelcol") != null) {
						if (aTable.findColumn(m.get("field").toString()).getTypeNameSQL().equals("date")
								|| aTable.findColumn(m.get("field").toString()).getTypeNameSQL()
										.equals(DbColumn.getTypeName(Types.DATE))) {
							DateTime timestamp;
							if (m.containsKey("format"))
								timestamp = ICIPUtils.convertStringToDate(
										object.getString(m.get("excelcol").toString()), m.get("format").toString());
							else
								timestamp = ICIPUtils
										.convertStringToDate(object.getString(m.get("excelcol").toString()), null);
							if (timestamp == null) {
								joblogger.info(marker, "Row:{}, Col:{}, Date Format Not supported : {} ", countFileRows,
										m.get("field").toString(), object.getString(m.get("excelcol").toString()));
							} else
								dateConversion(insertQuery, aTable.findColumn(m.get("field").toString()), timestamp);
						} else if (aTable.findColumn(m.get("field").toString()).getTypeNameSQL().equals("datetime")
								|| aTable.findColumn(m.get("field").toString()).getTypeNameSQL().contains("timestamp")
								|| aTable.findColumn(m.get("field").toString()).getTypeNameSQL()
										.equals(DbColumn.getTypeName(Types.TIMESTAMP))) {
							try {
								if (object.getString(m.get("excelcol").toString()) != null
										&& !object.getString(m.get("excelcol").toString()).trim().isEmpty()) {
									DateTime timestamp;
									if (m.containsKey("format"))
										timestamp = ICIPUtils.convertStringToDate(
												object.getString(m.get("excelcol").toString()),
												m.get("format").toString());
									else
										timestamp = ICIPUtils.convertStringToDate(
												object.getString(m.get("excelcol").toString()), "dd-MM-yyyy HH:mm:ss");
									if (timestamp == null) {
										joblogger.info(marker, "Row:{}, Col:{}, Date Format Not supported : {} ",
												countFileRows, m.get("field").toString(),
												object.getString(m.get("excelcol").toString()));
									} else
										timestampConversion(insertQuery, aTable.findColumn(m.get("field").toString()),
												timestamp);
								}
							} catch (NumberFormatException e) {
								insertQuery.addColumn(aTable.findColumn(m.get("field").toString()),
										object.getString(m.get("excelcol").toString()));
							}
						} else if (aTable.findColumn(m.get("field").toString()).getTypeNameSQL().equals("integer")
								|| aTable.findColumn(m.get("field").toString()).getTypeNameSQL().equals("int")) {
							insertQuery.addColumn(aTable.findColumn(m.get("field").toString()),
									Integer.parseInt(object.get(m.get("excelcol").toString()).toString()));
							updateQuery = updateQuery + aTable.findColumn(m.get("field").toString()) + "=\""
									+ object.get(m.get("excelcol").toString()) + "\",";
						}
//						else if(aTable.findColumn(m.get("field").toString()).getTypeNameSQL().equals("int")) {
//							insertQuery.addColumn(aTable.findColumn(m.get("field").toString()),
//									object.get(m.get("excelcol").toString()));
//							updateQuery = updateQuery + aTable.findColumn(m.get("field").toString()) + "=\"" + object.get(m.get("excelcol").toString())
//									+ "\",";
//						}
						else {
//							if (object.getString(m.get("excelcol").toString()).contains("'")) {
//								object.put(m.get("excelcol").toString(),
//										object.getString(m.get("excelcol").toString()).replace("'", ""));
//							}
							insertQuery.addColumn(aTable.findColumn(m.get("field").toString()),
									object.get(m.get("excelcol").toString()));
						}

						if (!aTable.findColumn(m.get("field").toString()).getTypeNameSQL().equals("map")
								&& object.get(m.get("excelcol").toString()) != null
								&& !object.get(m.get("excelcol").toString()).toString().isEmpty()) {

							String colVal = object.get(m.get("excelcol").toString()).toString();

							if (colVal.contains("\""))
								colVal = colVal.replace("\"", "'");

							updateQuery = updateQuery + aTable.findColumn(m.get("field").toString()) + "=\"" + colVal
									+ "\",";
						}

					}

				});

				try {
					if (aTable.findColumn("uuid__") != null) {
						String uid = UUID.randomUUID().toString();
						insertQuery.addColumn(aTable.findColumn("uuid__"), uid);
					}
					if (aTable.findColumn("ingestion_time__") != null) {
						SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
						String currentdate = sdf.format(new Date());
						String time = "from_iso8601_timestamp('" + currentdate + "')";
						insertQuery.addColumn(aTable.findColumn("ingestion_time__"), time);
					}
					String query = insertQuery.validate().toString();
					int updateBatchSizeidx = countInsertedRows.getAndIncrement() % Integer.parseInt(updateBatchSize);
					if (dataset.getDatasource().getType().equals("MYSQL")
							|| dataset.getDatasource().getType().equals("H2")) {

//											query = query.replace("INSERT", "REPLACE");

						query = query + " ON DUPLICATE KEY UPDATE" + " "
								+ updateQuery.substring(0, updateQuery.length() - 1);

					}

					// accumulate and batch update
					queries[updateBatchSizeidx] = query;
					if (updateBatchSizeidx == Integer.parseInt(updateBatchSize) - 1) {
						try {
							if (dataset.getSchema() == null) {
								createTableFromCsv(dataset, datasetCols);
							}
							updateBatch(marker, queries, dataset);

						} catch (SQLException | NoSuchAlgorithmException e) {
							joblogger.error(marker, "Batch update failed, error report: {}", e.getMessage(), e);
							countInsertedRows.set(countInsertedRows.intValue() - updateBatchSizeidx);
						}
						Arrays.fill(queries, null);
					}
				} catch (ValidationException v) {
					joblogger.error(marker, "{} : {}", row, v.getMessage(), v);
					return;
				}

//								} else {
//									joblogger.error(marker, "Skipped Row {}", countFileRows);
//									errorList.forEach(error -> {
//										joblogger.error(marker, error.get("errorMsg").toString(),
//												error.get("columnName"));
//									});
//								}
			});

			// last batch
			if (queries[0] != null && !queries[0].isEmpty()) {
				try {
					if (dataset.getSchema() == null) {
						createTableFromCsv(dataset, datasetCols);
					}
					updateBatch(marker, queries, dataset);
					joblogger.info(marker, "Last batch insert completed");
				} catch (SQLException | NoSuchAlgorithmException e) {
					joblogger.error(marker, "Batch update failed, error report: {}", e.getMessage(), e);
					long arrLength = Arrays.stream(queries).filter(query -> {
						return (query != null && !query.isEmpty());
					}).count();
					countInsertedRows.set((int) (countInsertedRows.intValue() - arrLength));
				}
			}
		}

		joblogger.info(marker, "No of rows inserted {}", countInsertedRows);
	}

	/**
	 * Load dataset csv.
	 *
	 * @param dataset           the dataset
	 * @param marker            the marker
	 * @param datasetCols       the dataset cols
	 * @param countInsertedRows the count inserted rows
	 * @param countFileRows     the count file rows
	 * @param queries           the queries
	 * @param aTable            the a table
	 * @param requiredList      the required list
	 * @param datasetFile       the dataset file
	 * @throws Exception             the exception
	 * @throws IOException           Signals that an I/O exception has occurred.
	 * @throws FileNotFoundException the file not found exception
	 */
	private void loadDatasetCsv(ICIPDataset dataset, Marker marker, List<Map<String, ?>> datasetCols,
			final AtomicInteger countInsertedRows, final AtomicInteger countFileRows, String[] queries, DbTable aTable,
			List<String> requiredList, ICIPDatasetFiles datasetFile)
			throws Exception, IOException, FileNotFoundException {
		datasetfilesService.copyFileFromServer(datasetFile);
		try (Reader reader = new FileReader(datasetFile.getFilepath())) {
			try (CSVReader csvReader = new CSVReader(reader)) {
				csvReader.forEach(row -> {
					try {
						updateQuery = "";
						countFileRows.incrementAndGet();
						if (countFileRows.get() == 1)
							return;
						List<JSONObject> errorList = this.validateCsv(row, requiredList, datasetCols, aTable, marker);
						InsertQuery insertQuery = new InsertQuery(aTable);
						if (errorList.isEmpty()) {
							datasetCols.forEach(m -> {
								if (m.get("excelcol") != null) {
									if (row[Integer.parseInt(m.get("excelcol").toString())].contains("'")) {
										row[Integer.parseInt(m.get("excelcol").toString())] = row[Integer
												.parseInt(m.get("excelcol").toString())].replace("'", "");
									}
									if (aTable.findColumn(m.get("field").toString()).getTypeNameSQL().equals("date")
											|| aTable.findColumn(m.get("field").toString()).getTypeNameSQL()
													.equals(DbColumn.getTypeName(Types.DATE))) {
										try {
											if (row[Integer.parseInt(m.get("excelcol").toString())] != null
													&& !row[Integer.parseInt(m.get("excelcol").toString())].trim()
															.isEmpty()) {
												DateTime timestamp;
												if (m.containsKey("format"))
													timestamp = ICIPUtils.convertStringToDate(
															row[Integer.parseInt(m.get("excelcol").toString())],
															m.get("format").toString());
												else
													timestamp = ICIPUtils.convertStringToDate(
															row[Integer.parseInt(m.get("excelcol").toString())],
															"dd-MM-yyyy HH:mm:ss");
												if (timestamp == null) {
													joblogger.info(marker,
															"Row:{}, Col:{}, Date Format Not supported : {} ",
															countFileRows, m.get("field").toString(),
															row[Integer.parseInt(m.get("excelcol").toString())]);
												} else {
													dateConversion(insertQuery,
															aTable.findColumn(m.get("field").toString()), timestamp);
//															insertQuery.addColumn(
//																	aTable.findColumn(m.get("field").toString()),
//																	timestamp.toLocalDateTime());
												}
											}
										} catch (NumberFormatException e) {
											insertQuery.addColumn(aTable.findColumn(m.get("field").toString()),
													row[Integer.parseInt(m.get("excelcol").toString())]);
										}
									} else if (aTable.findColumn(m.get("field").toString()).getTypeNameSQL()
											.equals("datetime")
											|| aTable.findColumn(m.get("field").toString()).getTypeNameSQL()
													.equals("timestamp")
											|| aTable.findColumn(m.get("field").toString()).getTypeNameSQL()
													.equals(DbColumn.getTypeName(Types.TIMESTAMP))) {
										try {
											if (row[Integer.parseInt(m.get("excelcol").toString())] != null
													&& !row[Integer.parseInt(m.get("excelcol").toString())].trim()
															.isEmpty()) {
												DateTime timestamp;
												if (m.containsKey("format"))
													timestamp = ICIPUtils.convertStringToDate(
															row[Integer.parseInt(m.get("excelcol").toString())],
															m.get("format").toString());
												else
													timestamp = ICIPUtils.convertStringToDate(
															row[Integer.parseInt(m.get("excelcol").toString())],
															"dd-MM-yyyy HH:mm:ss");
												if (timestamp == null) {
													joblogger.info(marker,
															"Row:{}, Col:{}, Date Format Not supported : {} ",
															countFileRows, m.get("field").toString(),
															row[Integer.parseInt(m.get("excelcol").toString())]);
												} else {
													timestampConversion(insertQuery,
															aTable.findColumn(m.get("field").toString()), timestamp);
//															insertQuery.addColumn(
//																	aTable.findColumn(m.get("field").toString()),
//																	timestamp.toLocalDateTime());
												}
											}
										} catch (NumberFormatException e) {
											insertQuery.addColumn(aTable.findColumn(m.get("field").toString()),
													row[Integer.parseInt(m.get("excelcol").toString())]);
										}
									} else if (aTable.findColumn(m.get("field").toString()).getTypeNameSQL()
											.equals("real")
											|| aTable.findColumn(m.get("field").toString()).getTypeNameSQL()
													.equals("int")) {
										if (row[Integer.parseInt(m.get("excelcol").toString())] != null && 
												!row[Integer.parseInt(m.get("excelcol").toString())].trim().isEmpty() ) {
											insertQuery.addColumn(aTable.findColumn(m.get("field").toString()),
													Integer.parseInt(row[Integer.parseInt(m.get("excelcol").toString())]));
											} else {
											insertQuery.addColumn(aTable.findColumn(m.get("field").toString()), null);
										}
//										insertQuery.addColumn(aTable.findColumn(m.get("field").toString()),
//												Integer.parseInt(row[Integer.parseInt(m.get("excelcol").toString())]));
									} else if (aTable.findColumn(m.get("field").toString()).getTypeNameSQL()
											.equals("double")) {
										if (!m.get("excelcol").toString().isEmpty()) {
											if (row[Integer.parseInt(m.get("excelcol").toString())] != null && 
													!row[Integer.parseInt(m.get("excelcol").toString())].trim().isEmpty() ) {
												insertQuery.addColumn(aTable.findColumn(m.get("field").toString()),
														Double.parseDouble(row[Integer.parseInt(m.get("excelcol").toString())]));
											} else {
												insertQuery.addColumn(aTable.findColumn(m.get("field").toString()), null);
											}
//											insertQuery.addColumn(aTable.findColumn(m.get("field").toString()),
//													Double.parseDouble(row[Integer.parseInt(m.get("excelcol").toString())]));
										}
									} else {
										insertQuery.addColumn(aTable.findColumn(m.get("field").toString()),
												row[Integer.parseInt(m.get("excelcol").toString())]);
									}

									if (row[Integer.parseInt(m.get("excelcol").toString())] != null
											&& !row[Integer.parseInt(m.get("excelcol").toString())].isEmpty()) {

										String colVal = row[Integer.parseInt(m.get("excelcol").toString())];

										if (colVal.contains("\"") || colVal.contains("'"))
											colVal = colVal.replace("\"", "").replace("'", "");

										updateQuery = updateQuery + aTable.findColumn(m.get("field").toString()) + "=\""
												+ colVal + "\",";
									}									

								}
							});

							try {
								if (aTable.findColumn("uuid__") != null) {
									String uid = UUID.randomUUID().toString();
									insertQuery.addColumn(aTable.findColumn("uuid__"), uid);
								}
								if (aTable.findColumn("ingestion_time__") != null) {
									SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
									String currentdate = sdf.format(new Date());
									String time = "from_iso8601_timestamp('" + currentdate + "')";
									insertQuery.addColumn(aTable.findColumn("ingestion_time__"), time);
								}
								String query = insertQuery.validate().toString();
								int updateBatchSizeidx = countInsertedRows.getAndIncrement()
										% Integer.parseInt(updateBatchSize);
								if (dataset.getDatasource().getType().equals("MYSQL")
										|| dataset.getDatasource().getType().equals("H2")) {

//											query = query.replace("INSERT", "REPLACE");

									query = query + "ON DUPLICATE KEY UPDATE" + " "
											+ updateQuery.substring(0, updateQuery.length() - 1);

								}

								// accumulate and batch update
								queries[updateBatchSizeidx] = query;
								if (updateBatchSizeidx == Integer.parseInt(updateBatchSize) - 1) {
									try {
										if (dataset.getSchema() == null) {
											createTableFromCsv(dataset, datasetCols);
										}
										updateBatch(marker, queries, dataset);

									} catch (SQLException | NoSuchAlgorithmException e) {
										joblogger.error(marker, "Batch update failed, error report: {}", e.getMessage(),
												e);
										countInsertedRows.set(countInsertedRows.intValue() - updateBatchSizeidx);
									}
									Arrays.fill(queries, null);
								}
							} catch (ValidationException v) {
								joblogger.error(marker, "{} : {}", row, v.getMessage(), v);
								return;
							}

						} else {
							joblogger.error(marker, "Skipped Row {}", countFileRows);
							errorList.forEach(error -> {
								joblogger.error(marker, error.get("errorMsg").toString(), error.get("columnName"));
							});
						}
					} catch (Exception exp) {
						joblogger.error(marker, "Row Error {}:{} -- {}", countFileRows, row, exp.getMessage());
					}
				});

				// last batch
				if (queries[0] != null && !queries[0].isEmpty()) {
					try {
						if (dataset.getSchema() == null) {
							createTableFromCsv(dataset, datasetCols);
						}
						updateBatch(marker, queries, dataset);
						joblogger.info(marker, "Last batch insert completed");
					} catch (SQLException | NoSuchAlgorithmException e) {
						joblogger.error(marker, "Batch update failed, error report: {}", e.getMessage(), e);
						long arrLength = Arrays.stream(queries).filter(query -> {
							return (query != null && !query.isEmpty());
						}).count();
						countInsertedRows.set((int) (countInsertedRows.intValue() - arrLength));
					}
				}
			}
		}
		joblogger.info(marker, "No of rows inserted {}", countInsertedRows);
	}

	/**
	 * Load dataset xlsx.
	 *
	 * @param dataset           the dataset
	 * @param marker            the marker
	 * @param datasetCols       the dataset cols
	 * @param countInsertedRows the count inserted rows
	 * @param countFileRows     the count file rows
	 * @param queries           the queries
	 * @param aTable            the a table
	 * @param requiredList      the required list
	 * @param datasetFile       the dataset file
	 * @throws Exception             the exception
	 * @throws FileNotFoundException the file not found exception
	 */
	private void loadDatasetXlsx(ICIPDataset dataset, Marker marker, List<Map<String, ?>> datasetCols,
			final AtomicInteger countInsertedRows, final AtomicInteger countFileRows, String[] queries, DbTable aTable,
			List<String> requiredList, ICIPDatasetFiles datasetFile) throws Exception, FileNotFoundException {
		datasetfilesService.copyFileFromServer(datasetFile);
		InputStream is = new FileInputStream(datasetFile.getFilepath());
		try (Workbook workbook = StreamingReader.builder().rowCacheSize(100).bufferSize(4096).open(is)) {
			Sheet sheet = workbook.getSheetAt(0);
			sheet.forEach(row -> {
				try {
					updateQuery = "";
					if (row.getPhysicalNumberOfCells() != 0) {
						countFileRows.incrementAndGet();
						if (countFileRows.get() == 1)
							return;
						List<JSONObject> errorList = this.validate(row, requiredList, datasetCols, aTable, marker);
						InsertQuery insertQuery = new InsertQuery(aTable);

						if (errorList.isEmpty()) {
							datasetCols.forEach(datasetCol -> {
								try {
									if (datasetCol.get("excelcol") != null) {
										ResponseEntity<?> colVal = insertQueryfromCell(insertQuery,
												aTable.findColumn(datasetCol.get("field").toString()),
												datasetCol.containsKey("format") ? datasetCol.get("format").toString()
														: null,
												row.getCell(Integer.parseInt(datasetCol.get("excelcol").toString())),
												row.getRowNum(), marker);

										if (row.getCell(Integer.parseInt(datasetCol.get("excelcol").toString())) != null
												&& row.getCell(Integer.parseInt(datasetCol.get("excelcol").toString()))
														.getStringCellValue() != null
												&& !row.getCell(Integer.parseInt(datasetCol.get("excelcol").toString()))
														.getStringCellValue().isEmpty()) {

//											String colVal = row
//													.getCell(Integer.parseInt(datasetCol.get("excelcol").toString()))
//													.getStringCellValue();

											updateQuery = updateQuery
													+ aTable.findColumn(datasetCol.get("field").toString()) + "=\""
													+ colVal.getBody() + "\",";

										}
									}
								} catch (Exception e1) {
									joblogger.error(marker, e1.getMessage());
									joblogger.error(marker, "Error Column : {} and Error Row # : {}",
											datasetCol.get("field"), countFileRows);
								}
							});

							try {
								if (aTable.findColumn("uuid__") != null) {
									String uid = UUID.randomUUID().toString();
									insertQuery.addColumn(aTable.findColumn("uuid__"), uid);
								}
								if (aTable.findColumn("ingestion_time__") != null) {
									SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
									String currentdate = sdf.format(new Date());
									String time = "from_iso8601_timestamp('" + currentdate + "')";
									insertQuery.addColumn(aTable.findColumn("ingestion_time__"), time);
								}
								String query = insertQuery.validate().toString();
								int updateBatchSizeidx = countInsertedRows.getAndIncrement()
										% Integer.parseInt(updateBatchSize);
								if (dataset.getDatasource().getType().equals("MYSQL")
										|| dataset.getDatasource().getType().equals("H2")) {
									query = query + " ON DUPLICATE KEY UPDATE" + " "
											+ updateQuery.substring(0, updateQuery.length() - 1);

								}

								// accumulate and batch update
								queries[updateBatchSizeidx] = query;
								if (updateBatchSizeidx == Integer.parseInt(updateBatchSize) - 1) {
									try {
										if (dataset.getSchema() == null) {
											createTableFromCsv(dataset, datasetCols);
										}
										updateBatch(marker, queries, dataset);

									} catch (SQLException | NoSuchAlgorithmException e) {
										joblogger.error(marker, "Batch update failed, error report: {}", e.getMessage(),
												e);
										countInsertedRows.set(countInsertedRows.intValue() - updateBatchSizeidx);
									}
									Arrays.fill(queries, null);
								}
							} catch (Exception v) {
								joblogger.error(marker, "{} : {}", row, v.getMessage(), v);
								return;
							}

						} else {
							joblogger.error(marker, "Skipped Row {}", countFileRows);
							errorList.forEach(error -> {
								joblogger.error(marker, error.get("errorMsg").toString(), error.get("columnName"));
							});
						}
					}

				} catch (Exception e) {
					joblogger.error(marker, e.getMessage());
				}

			});
			// last batch
			if (queries[0] != null && !queries[0].isEmpty()) {
				try {
					if (dataset.getSchema() == null) {
						createTableFromCsv(dataset, datasetCols);
					}
					updateBatch(marker, queries, dataset);
					joblogger.info(marker, "Last batch insert completed");
				} catch (SQLException | NoSuchAlgorithmException e) {
					joblogger.error(marker, "Batch update failed, error report: {}", e.getMessage(), e);
					long arrLength = Arrays.stream(queries).filter(query -> {
						return (query != null && !query.isEmpty());
					}).count();
					countInsertedRows.set((int) (countInsertedRows.intValue() - arrLength));
				}
			}
		} catch (IOException e) {
			logger.error(e.getMessage(), e);
			joblogger.error(marker, e.getMessage(), e);
		} finally {
			if (is != null) {
				try {
					is.close();
				} catch (IOException e) {
					logger.error(e.getMessage(), e);
				}
			}
		}
		joblogger.info(marker, "No of rows inserted {}", countInsertedRows);
	}

	/**
	 * Update batch.
	 *
	 * @param marker  the marker
	 * @param queries the queries
	 * @param dataset the dataset
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	public void updateBatch(Marker marker, String[] queries, ICIPDataset dataset)
			throws SQLException, NoSuchAlgorithmException {
	}

	/**
	 * Validate.
	 *
	 * @param row          the row
	 * @param requiredList the required list
	 * @param map          the map
	 * @param aTable       the a table
	 * @param marker       the marker
	 * @return the string
	 */
	public List<JSONObject> validate(Row row, List<String> requiredList, List<Map<String, ?>> map, DbTable aTable,
			Marker marker) {
		List<JSONObject> errorList = new ArrayList<>();
		for (Map<String, ?> m : map) {
			JSONObject error = new JSONObject();
			if (m.get("excelcol") != null) {
				DbColumn column = aTable.findColumn(m.get("field").toString());
				Cell cell = row.getCell(Integer.parseInt(m.get("excelcol").toString()));
				// check required
				if (requiredList.contains(column.getColumnNameSQL())) {
					if (cell == null || cell.getStringCellValue() == null || cell.getStringCellValue().trim() == null
							|| cell.getStringCellValue().trim().isEmpty()) {
						error.put("columnName", column.getColumnNameSQL());
						error.put("errorMsg", "Column {} is empty");
						errorList.add(error);
					}
				}
				if (cell != null) {
					// check length
					if (cell.getStringCellValue() != null && !m.get("type").toString().contains("text")
							&& !m.get("type").toString().contains("blob")
							&& cell.getStringCellValue().length() >= column.getTypeLength()) {
						error.put("columnName", column.getColumnNameSQL());
						error.put("errorMsg", "Column {} data is too long for type " + m.get("type"));
						errorList.add(error);
					}
					// date format
					if (m.get("type").equals("timestamp") || m.get("type").equals("datetime")
							|| m.get("type").equals(DbColumn.getTypeName(Types.TIMESTAMP))) {
						String strValue;
						try {
							if (cell.getStringCellValue() != null && !cell.getStringCellValue().trim().isEmpty()) {
								if (DateUtil.isCellDateFormatted(cell)) {
									Date date = DateUtil.getJavaDate(cell.getNumericCellValue());
									String dateFmt = cell.getCellStyle().getDataFormatString();
									
									if(dateFmt.contains("yy") && !dateFmt.contains("yyyy")) {
										dateFmt = dateFmt.replace("yy", "yyyy");
									}
									strValue = new CellDateFormatter(dateFmt).format(date);
								} else {
									strValue = cell.getDateCellValue().toString();
								}
								DateTime value;
								if (m.containsKey("format"))
									value = ICIPUtils.convertStringToDate(strValue, m.get("format").toString());
								else
									value = ICIPUtils.convertStringToDate(strValue, "MM/dd/yyyy hh:mm:ss");
								if (value == null) {
									error.put("columnName", column.getColumnNameSQL());
									error.put("errorMsg", "Column {} Date format not supported ");
									errorList.add(error);
								}
							}
						} catch (NumberFormatException ne) {
							joblogger.error(marker, "Please check the mapping/format. Error in {} ",
									column.getColumnNameSQL());
							throw new RuntimeException(
									"Please check the mapping/format. Error in " + column.getColumnNameSQL());
						}
					}
				}
			}
		}
		return errorList;
	}

	/**
	 * Validate csv.
	 *
	 * @param row          the row
	 * @param requiredList the required list
	 * @param map          the map
	 * @param aTable       the a table
	 * @param marker       the marker
	 * @return the list
	 */
	public List<JSONObject> validateCsv(String[] row, List<String> requiredList, List<Map<String, ?>> map,
			DbTable aTable, Marker marker) {
		List<JSONObject> errorList = new ArrayList<>();
		for (Map<String, ?> m : map) {
			JSONObject error = new JSONObject();
			if (m.get("excelcol") != null) {
				DbColumn column = aTable.findColumn(m.get("field").toString());
				String cellValue = row[Integer.parseInt(m.get("excelcol").toString())];
				// check required
				if (requiredList.contains(column.getColumnNameSQL())) {
					if (cellValue == null || cellValue.trim().isEmpty()) {
						error.put("columnName", column.getColumnNameSQL());
						error.put("errorMsg", "Column {} is empty");
						errorList.add(error);
					}
				}
				if (cellValue != null) {
					// check length
					if (!m.get("type").toString().contains("text") && !m.get("type").toString().contains("blob")
							&& cellValue.length() >= column.getTypeLength()) {
						error.put("columnName", column.getColumnNameSQL());
						error.put("errorMsg", "Column {} data is too long for type " + m.get("type"));
						errorList.add(error);
					}
					// date format
					if (m.get("type").equals("timestamp") || m.get("type").equals("datetime")
							|| m.get("type").equals(DbColumn.getTypeName(Types.TIMESTAMP))) {
						try {
							if (cellValue != null && !cellValue.trim().isEmpty()) {
								DateTime timestamp;
								if (m.containsKey("format"))
									timestamp = ICIPUtils.convertStringToDate(
											row[Integer.parseInt(m.get("excelcol").toString())],
											m.get("format").toString());
								else
									timestamp = ICIPUtils.convertStringToDate(
											row[Integer.parseInt(m.get("excelcol").toString())], "MM/dd/yyyy hh:mm:ss");
								if (timestamp == null) {
									error.put("columnName", column.getColumnNameSQL());
									error.put("errorMsg", "Column {} Date format not supported ");
									errorList.add(error);
								}
							}

						} catch (NumberFormatException ne) {
							joblogger.error(marker, "Please check the mapping/format. Error in {} ",
									column.getColumnNameSQL());
							throw new RuntimeException(
									"Please check the mapping/format. Error in " + column.getColumnNameSQL());
						}
					}
				}
			}
		}
		return errorList;
	}

	/**
	 * Insert queryfrom cell.
	 *
	 * @param insertQuery the insert query
	 * @param col         the col
	 * @param format      the format
	 * @param cell        the cell
	 * @param rowNum      the row num
	 * @param marker      the marker
	 * @throws ParseException the parse exception
	 */
	private ResponseEntity<?> insertQueryfromCell(InsertQuery insertQuery, DbColumn col, String format, Cell cell,
			int rowNum, Marker marker) throws ParseException {
		if (cell != null && !cell.getStringCellValue().trim().isEmpty()) {
			if (col.getTypeNameSQL().toLowerCase().equals("string") || col.getTypeNameSQL().equals("bit")
					|| col.getTypeNameSQL().equals("text") || col.getTypeNameSQL().equals("blob")
					|| col.getTypeNameSQL().equals(DbColumn.getTypeName(Types.CHAR))
					|| col.getTypeNameSQL().toUpperCase().equals(DbColumn.getTypeName(Types.VARCHAR))
					|| col.getTypeNameSQL().equals(DbColumn.getTypeName(Types.LONGVARCHAR))) {
				insertQuery.addColumn(col, ICIPUtils.escapeCharecters(cell.getStringCellValue()));
				return new ResponseEntity<>(ICIPUtils.escapeCharecters(cell.getStringCellValue()), new HttpHeaders(),
						HttpStatus.OK);
			}
			if (col.getTypeNameSQL().equals("number") || col.getTypeNameSQL().equals("bigint")
					|| col.getTypeNameSQL().equals("int")
					|| col.getTypeNameSQL().equals(DbColumn.getTypeName(Types.INTEGER))) {
				insertQuery.addColumn(col, (int) cell.getNumericCellValue());
				return new ResponseEntity<>((int) cell.getNumericCellValue(), new HttpHeaders(), HttpStatus.OK);
			}
			if (col.getTypeNameSQL().equals("float") || col.getTypeNameSQL().equals("double")
					|| col.getTypeNameSQL().equals(DbColumn.getTypeName(Types.DOUBLE))) {
				insertQuery.addColumn(col, cell.getNumericCellValue());
				return new ResponseEntity<>(cell.getNumericCellValue(), new HttpHeaders(), HttpStatus.OK);
			}
			if (col.getTypeNameSQL().equals("date") || col.getTypeNameSQL().equals(DbColumn.getTypeName(Types.DATE))) {
				DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");
				String strValue;
				if (DateUtil.isCellDateFormatted(cell)) {
					Date date = DateUtil.getJavaDate(cell.getNumericCellValue());
					String dateFmt = cell.getCellStyle().getDataFormatString();
					
					if(dateFmt.contains("yy") && !dateFmt.contains("yyyy")) {
						dateFmt = dateFmt.replace("yy", "yyyy");
					}
					strValue = new CellDateFormatter(dateFmt).format(date);
				} else {
					strValue = new Integer((int) cell.getNumericCellValue()).toString();
				}
				DateTime parsedDate = DateTime.parse(strValue, dateTimeFormatter);
				insertQuery.addColumn(col, parsedDate);
				return new ResponseEntity<>(parsedDate, new HttpHeaders(), HttpStatus.OK);
			}
			if (col.getTypeNameSQL().equals("timestamp") || col.getTypeNameSQL().equals("datetime")
					|| col.getTypeNameSQL().equals(DbColumn.getTypeName(Types.TIMESTAMP))) {
				String strValue;
				if (DateUtil.isCellDateFormatted(cell)) {
					Date date = DateUtil.getJavaDate(cell.getNumericCellValue());
					String dateFmt = cell.getCellStyle().getDataFormatString();
					
					if(dateFmt.contains("yy") && !dateFmt.contains("yyyy")) {
						dateFmt = dateFmt.replace("yy", "yyyy");
					}
					strValue = new CellDateFormatter(dateFmt).format(date);
				} else {
					strValue = cell.getDateCellValue().toString();
				}
				DateTime timestamp = ICIPUtils.convertStringToDate(strValue, format);
				if (timestamp == null) {
					joblogger.info(marker, "Row:{}, Col:{}, Date Format Not supported : {}", rowNum + 1,
							col.getColumnNameSQL(), strValue);
				} else
					insertQuery.addColumn(col, timestamp.toLocalDateTime());
				return new ResponseEntity<>(timestamp.toLocalDateTime(), new HttpHeaders(), HttpStatus.OK);
			}
		}
		insertQuery.addColumn(col, cell != null
				? (cell.getStringCellValue().isEmpty() ? null : ICIPUtils.escapeCharecters(cell.getStringCellValue()))
				: cell);
		return new ResponseEntity<>(
				cell != null ? (cell.getStringCellValue().isEmpty() ? null
						: ICIPUtils.escapeCharecters(cell.getStringCellValue())) : cell,
				new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Apply Tag.
	 *
	 * @param dataset the dataset object
	 * @param data    the data
	 * @return the string
	 */
	public String applyTag(ICIPDataset dataset, String data) {
		String resStr = "";
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String tableName = attributes.getString("tableName");
		String uniqueIdentifier = attributes.getString("uniqueIdentifier");
		if (tableName != null && !tableName.trim().isEmpty()) {
			JSONObject dataJobj = new JSONObject(data);
			JSONObject propObj = new JSONObject(dataJobj.get("taggingDetails").toString());
			Iterator<String> properties = propObj.keys();
			if (properties != null && properties.hasNext()) {
				List<String> propertyList = new ArrayList<>();
				while (properties.hasNext()) {
					propertyList.add(properties.next());
				}
				StringBuilder queryPart1 = new StringBuilder("");
				String updateAction = dataJobj.get("updateAction").toString();
				if (updateAction.equals("overwrite")) {
					for (String property : propertyList) {
						queryPart1.append(property);
						queryPart1.append("= '");
						queryPart1.append((String) propObj.get(property));
						queryPart1.append("',");
					}
					queryPart1 = new StringBuilder(queryPart1.substring(0, queryPart1.length() - 1));
				} else if (updateAction.equals("append")) {
					for (String property : propertyList) {
						queryPart1.append(property);
						queryPart1.append("= concat(" + property + ",',");
						queryPart1.append((String) propObj.get(property));
						queryPart1.append("'),");
					}
					queryPart1 = new StringBuilder(queryPart1.substring(0, queryPart1.length() - 1));
				}
				StringBuilder queryPart2 = new StringBuilder("");
				if (dataJobj.has("searchParams") && dataJobj.get("searchParams") != JSONObject.NULL) {
					String searchParams = dataJobj.getString("searchParams");
					String entryCountStr = dataJobj.getString("entryCount");
					attributes.put("searchParams", searchParams);
					attributes.put("selectClauseParams", uniqueIdentifier);
					dataset.setAttributes(attributes.toString());
					try {
						List<Object> pkValueList = new ArrayList<>();
						List results = this.getDatasetData(dataset,
								new SQLPagination(0, Integer.parseInt(entryCountStr), null, -1), DATATYPE.DATA,
								List.class);
						pkValueList = results;
						List<String> unqIdList = new ArrayList<>();
						pkValueList.stream().forEach(ele -> {
							String tempEle = ele.toString();
							tempEle = tempEle.substring(0, tempEle.length() - 1);
							if (tempEle != null && !tempEle.isEmpty())
								unqIdList.add(Arrays.asList(tempEle.split("=")).get(1));
						});
						if (unqIdList != null && !unqIdList.isEmpty()) {
							if (dataJobj.has(TICKETIDLIST) && dataJobj.get(TICKETIDLIST) != JSONObject.NULL) {
								JSONObject ticketList = new JSONObject(dataJobj.get(TICKETIDLIST).toString());
								String excludedIdsStr = ticketList.getString(uniqueIdentifier);
								List<String> excludedIds = Arrays
										.asList(excludedIdsStr.substring(1, excludedIdsStr.length() - 1).split(","));
								unqIdList.removeAll(excludedIds);
							}
							queryPart2.append(uniqueIdentifier);
							queryPart2.append(" in (");
							StringBuilder idsStr = new StringBuilder("");
							for (String unqIdValue : unqIdList) {
								idsStr.append("'");
								idsStr.append(unqIdValue);
								idsStr.append("',");
							}
							idsStr = new StringBuilder(idsStr.substring(0, idsStr.length() - 1));
							queryPart2.append(idsStr);
							queryPart2.append(")");
							queryPart2.append(" and ");
							queryPart2 = new StringBuilder(queryPart2.substring(0, queryPart2.length() - 4));
						} else {
							logger.error("Error while applying tag: No tickets found to apply tag");
							resStr = "Error: No tickets found to apply tag";
						}
					} catch (NumberFormatException | SQLException e) {
						logger.error("Error while applying tag: ", e);
						resStr = "Error: " + e.getMessage();
					}
				} else if (dataJobj.has(TICKETIDLIST) && dataJobj.get(TICKETIDLIST) != JSONObject.NULL) {
					JSONObject ticketList = new JSONObject(dataJobj.get(TICKETIDLIST).toString());
					Iterator<String> prmyKeys = ticketList.keys();
					if (prmyKeys != null) {
						while (prmyKeys.hasNext()) {
							String pky = prmyKeys.next();
							queryPart2.append(pky);
							queryPart2.append(" in (");
							String objList = (String) ticketList.get(pky);
							if (objList.contains(",")) {
								objList = objList.substring(1, objList.length() - 1);
								String[] idsList = objList.split(",");
								StringBuilder idsStr = new StringBuilder("");
								for (String ids : idsList) {
									idsStr.append("'");
									idsStr.append(ids);
									idsStr.append("',");
								}
								objList = idsStr.substring(0, idsStr.length() - 1);
							}
							queryPart2.append(objList);
							queryPart2.append(")");
							queryPart2.append(" and ");
						}
						queryPart2 = new StringBuilder(queryPart2.substring(0, queryPart2.length() - 4));
					} else {
						logger.error("Error while applying tag: No tickets found to apply tag");
						resStr = "Error: No tickets found to apply tag";
					}
				} else {
					logger.error("Error while applying tag: No tickets found to apply tag");
					resStr = "Error: No tickets found to apply tag";
				}
				if (resStr == null || resStr.trim().isEmpty()) {
					String queryToExecute = "update " + tableName + " set " + queryPart1 + WHERE + queryPart2;
					resStr = queryToExecute;
					logger.info("Query built to apply tag");
				}
			} else {
				logger.error("Error while applying tag: No properties found to apply tag");
				resStr = "Error: No properties found to apply tag";
			}
		} else {
			logger.error("Error while applying tag: Table not found in database");
			resStr = "Error: Table not found in database";
		}
		return resStr;
	}

	/**
	 * Delete entry.
	 *
	 * @param dataset the dataset
	 * @param rowData the row data
	 * @param approve the approve
	 * @return the string
	 */
	public String deleteEntry(ICIPDataset dataset, String rowData, boolean approve) {

		String resp = "";
		try {
			JSONObject attributes = new JSONObject(dataset.getAttributes());
			String tableName = attributes.getString("tableName");
			String uniqueIdentifier = attributes.getString("uniqueIdentifier");
			String deleteQry = "";
			if (tableName != null && uniqueIdentifier != null && uniqueIdentifier != "") {
				logger.info("Deleting entry in " + tableName);
				JSONObject entryObj = new JSONObject(rowData);
				Map<String, Object> rowMap = entryObj.toMap();
				String uniqueColValue = "";
				if (rowMap.containsKey(uniqueIdentifier))

					uniqueColValue = rowMap.get(uniqueIdentifier).toString();
				if (approve) {
					deleteQry = "UPDATE" + tableName + "SET row_status=DELETED WHERE" + uniqueIdentifier + " = " + "'"
							+ uniqueColValue + "'";
				} else {
					deleteQry = "DELETE FROM " + tableName + " WHERE " + uniqueIdentifier + " = " + "'" + uniqueColValue
							+ "'";
				}
				attributes.put(QU, deleteQry);
				dataset.setAttributes(attributes.toString());
				try {
					executeUpdate(dataset, null);
					if (approve) {
						resp = "Entry sent for approval:" + tableName;
						logger.info("Entry in {} sent for approval", tableName);
					} else {
						resp = "Entry successfully deleted from table " + tableName;
						logger.info("Entry successfully deleted from table " + tableName);
					}
				} catch (SQLException e) {
					resp = "Error: " + e.getMessage();
					logger.error("Error while deleting entry in " + tableName + " ");
				}

			} else {
				resp = "Error: Table name and Unique identifier is required for deleting entry";
				logger.error("Error while deleting " + dataset.getName()
						+ " dataset entry: Table name and Unique identifier is required for deleting entry");
			}
		} catch (Exception ex) {
			resp = "Error: " + ex.getMessage();
			logger.error("Error while deleting " + dataset.getName() + " dataset entry: " + ex);
		}
		return resp;
	}

	/**
	 * Date conversion.
	 *
	 * @param insertQuery the insert query
	 * @param findColumn  the find column
	 * @param timestamp   the timestamp
	 * @return the insert query
	 */
	public InsertQuery dateConversion(InsertQuery insertQuery, DbColumn findColumn, DateTime timestamp) {
		insertQuery.addColumn(findColumn, timestamp.toLocalDateTime());
		return insertQuery;

	}

	/**
	 * Timestamp conversion.
	 *
	 * @param insertQuery the insert query
	 * @param findColumn  the find column
	 * @param timestamp   the timestamp
	 * @return the insert query
	 */
	public InsertQuery timestampConversion(InsertQuery insertQuery, DbColumn findColumn, DateTime timestamp) {
		insertQuery.addColumn(findColumn, timestamp.toLocalDateTime());
		return insertQuery;

	}

	/**
	 * Assign entry.
	 *
	 * @param dataset the dataset
	 * @param rowData the row data
	 * @return the ICIP data audit response
	 */
	public ICIPDataAuditResponse assignEntry(ICIPDataset dataset, String rowData) {
		ICIPDataAuditResponse resp = new ICIPDataAuditResponse("", Operation.UPDATE, Status.ERROR, "", dataset, 0);
		String BID = "";
		String assignee = "";
		String context = "";
		String action = "";
		try {
			JSONObject attributes = new JSONObject(dataset.getAttributes());
			String tableName = attributes.getString("tableName");
			JSONObject entryObj = new JSONObject(rowData);
			Map<String, Object> rowMap = entryObj.toMap();
			if (tableName != null && rowMap.containsKey(BID)) {
				logger.info("assigning new user %s", tableName);
				BID = rowMap.get("BID").toString();

				if (!assignee.isEmpty() && !context.isEmpty() && !BID.isEmpty()) {
					String assignQry = "UPDATE " + tableName + " SET action =" + action + ",assignee =" + assignee
							+ ",context=" + context;

					assignQry += " WHERE BID ='" + entryObj.get("BID") + "'";
					attributes.put(QU, assignQry);
					dataset.setAttributes(attributes.toString());
					try {
						executeUpdate(dataset, null);
						resp.setResponse(entryObj.getString("BID") + "NEW USER ASSIGNED " + tableName);

						logger.info("{} entry successfully updated in table {}", entryObj.getString("BID"), tableName);
						if (dataset.getIsAuditRequired()) {
							resp.setQuery(assignQry);
							resp.setStatus(Status.SUCCESS);
						}

					} catch (SQLException e) {
						resp.setResponse("Error: " + e.getMessage());
						logger.error("Error while updating %s entry in %s,%s", entryObj.getString("BID"), tableName, e);
					}
				} else {
					resp.setResponse("Error: No assignee");
					logger.error("Error while saving %s dataset entry: No assignee", dataset.getName());
				}

			} else {
				resp.setResponse("Error: Both table name and unique identifier are required for updating entry");
				logger.error(
						"Error while saving %s dataset entry: Both table name and unique identifier are required for updating entry",
						dataset.getName());
			}
		} catch (Exception ex) {
			resp.setResponse("Error: " + ex.getMessage());
			logger.error("Error while saving %s dataset entry: %s ", dataset.getName(), ex);
		}
		return resp;
	}

	/**
	 * Fetch process id.
	 *
	 * @param dataset the dataset
	 * @param bid     the bid
	 * @return the string
	 */

	/**
	 * Check under approval.
	 *
	 * @param dataset the dataset
	 * @param rowData the row data
	 * @param action  the action
	 * @param approve the approve
	 * @return true, if successful
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws SQLException             the SQL exception
	 */
//	public boolean checkUnderApproval(ICIPDataset dataset, String rowData, String action, boolean approve)
//			throws NoSuchAlgorithmException, SQLException {
//		JSONObject attributes = new JSONObject(dataset.getAttributes());
//		JSONObject entryObj = new JSONObject(rowData);
//		String uniqueIdentifier = attributes.getString("uniqueIdentifier");
//
//		String tableName = attributes.getString("tableName");
//		if (tableName != null && !uniqueIdentifier.isEmpty()) {
//
//			String checkquery = String.format("SELECT COUNT(*) as count1 FROM %s WHERE %s = ? AND row_status <> ?",
//					tableName, uniqueIdentifier);
//			JSONObject obj = new JSONObject(dataset.getDatasource().getConnectionDetails());
//			try (Connection conn = getDbConnection(obj)) {
//				try (PreparedStatement stmt = conn.prepareStatement(checkquery)) {
//					stmt.setString(1, entryObj.getString(uniqueIdentifier));
//					stmt.setString(2, "UNCHANGED");
//					try {
//						ResultSet rs = stmt.executeQuery();
//						rs.next();
//						Integer count = rs.getInt("count1");
//
//						if (count > 0) // checking if row under approval
//						{
//
//							return true;
//
//						} else {
//							return false;
//
//						}
//					} finally {
//						if (stmt != null) {
//							safeClose(stmt);
//						}
//					}
//				}
//			}
//		} else {
//			return false;
//		}
//
//	}
	public boolean checkUnderApproval(ICIPDataset dataset, String rowData, String action, boolean approve)
	        throws NoSuchAlgorithmException, SQLException {
	    JSONObject attributes = new JSONObject(dataset.getAttributes());
	    JSONObject entryObj = new JSONObject(rowData);
	    String uniqueIdentifier = attributes.getString("uniqueIdentifier");
 
	    String tableName = attributes.getString("tableName");
	    if (tableName != null && !uniqueIdentifier.isEmpty()) {
 
	        String checkquery = String.format("SELECT COUNT(*) as count1 FROM %s WHERE %s = ? AND row_status <> ?",
	                tableName, uniqueIdentifier);
	        JSONObject obj = new JSONObject(dataset.getDatasource().getConnectionDetails());
	        try (Connection conn = getDbConnection(obj);
	             PreparedStatement stmt = conn.prepareStatement(checkquery)) {
	            stmt.setString(1, entryObj.getString(uniqueIdentifier));
	            stmt.setString(2, "UNCHANGED");
	            try (ResultSet rs = stmt.executeQuery()) {
	                rs.next();
	                Integer count = rs.getInt("count1");
 
	                if (count > 0) {
	                    return true;
	                } else {
	                    return false;
	                }
	            }
	        }
	    }
	    return false;
	}

	/**
	 * Approveupdate entry.
	 *
	 * @param dataset the dataset
	 * @param rowData the row data
	 * @return the string
	 */
	public String approveupdateEntry(ICIPDataset dataset, String rowData) {
		String resp = "";
		try {
			JSONObject attributes = new JSONObject(dataset.getAttributes());
			JSONObject entryObj = new JSONObject(rowData);
			String tableName = attributes.getString("tableName");
			String uniqueIdentifier = attributes.getString("uniqueIdentifier");

			Map<String, Object> rowMap = entryObj.toMap();
			String uniqueColValue = "";
			if (rowMap.containsKey(uniqueIdentifier))
				uniqueColValue = rowMap.get(uniqueIdentifier).toString();
			if (dataset.getSchema() != null) {
				org.json.JSONArray schema = new org.json.JSONArray(dataset.getSchema().getSchemavalue());

				List<String> columnlist = JsonPath.read(schema.toString(), RECORDCOLUMNDISPLAYNAME);
				String columnsbef = String.join(",", columnlist);
				columnlist.add("row_status");// not in schema but in table so added externally
				columnlist.add("curr_user");
				columnlist.add("context");

				String columns = String.join(",", columnlist);
				List<String> duplicatesList = new ArrayList<>();
				List<String> placeHolderList = new ArrayList<>();
				columnlist.forEach(column -> {
					duplicatesList.add(String.format("%s=VALUES(%s)", column, column));
					placeHolderList.add("?");
				});

				String qrystatusdetached = "UPDATE" + tableName + "SET row_status=DETACHED WHERE" + uniqueIdentifier
						+ " = " + uniqueColValue;
				String row = "'UPDATED',curr_user,context";

				String qryinsertupdatedrow = String.format("INSERT INTO %s (%s) (SELECT %s,%s FROM %s WHERE %s = %s)",
						tableName, columns, columnsbef, row, tableName, uniqueIdentifier, uniqueColValue);
				logger.info("inside:approveupdate insertquery:" + qryinsertupdatedrow);

				String updtQry = "UPDATE " + tableName + " SET ";
				Iterator<String> kyItr = entryObj.keys();
				while (kyItr.hasNext()) {
					String ky = kyItr.next();
					if (!ky.equals(uniqueIdentifier)) {
						updtQry += ky + "=";
						updtQry += "'" + entryObj.get(ky) + "',";
					}
				}
				updtQry = updtQry.substring(0, updtQry.length() - 1);
				updtQry += " WHERE " + uniqueIdentifier + "='" + entryObj.get(uniqueIdentifier)
						+ "' AND row_status='UPDATED'";
				try {
					attributes.put(QU, qrystatusdetached);
					dataset.setAttributes(attributes.toString());
					executeUpdate(dataset, null);
					logger.info("rowstatus detached");
					attributes.put(QU, qryinsertupdatedrow);
					dataset.setAttributes(attributes.toString());
					executeUpdate(dataset, null);
					logger.info("new row inserted");
					attributes.put(QU, updtQry);
					dataset.setAttributes(attributes.toString());
					executeUpdate(dataset, null);
					logger.info("new row updated with values");
					resp = entryObj.getString(uniqueIdentifier) + " row sent for approval " + tableName;
					logger.info(entryObj.getString(uniqueIdentifier) + " row sent for approval " + tableName);

				} catch (SQLException e) {
					resp = "Error: " + e.getMessage();
					logger.error("Error while updating " + entryObj.getString(uniqueIdentifier) + " entry in "
							+ tableName + " " + e);
				}
			} else {
				resp = "Error: Both table name and unique identifier are required for updating entry";
				logger.error("Error while saving " + dataset.getName()
						+ " dataset entry: Both table name and unique identifier are required for updating entry");
			}
		} catch (Exception ex) {
			resp = "Error: " + ex.getMessage();
			logger.error("Error while saving " + dataset.getName() + " dataset entry: " + ex);
		}
		return resp;
	}

	/**
	 * The Enum LoadFileTypes.
	 */
	enum LoadFileTypes {

		/** The xlsx. */
		XLSX("xlsx"),
		/** The csv. */
		CSV("csv"),
		/** The json. */
		JSON("json");

		/** The filetype. */
		String filetype;

		/**
		 * Instantiates a new load file types.
		 *
		 * @param filetype the filetype
		 */
		private LoadFileTypes(String filetype) {
			this.filetype = filetype;
		}

		/**
		 * To string.
		 *
		 * @return the string
		 */
		@Override
		public String toString() {
			return this.filetype;
		}
	}

	/**
	 * Data audit.
	 *
	 * @param dataset the dataset
	 * @param rowdata the rowdata
	 * @param action  the action
	 * @param rowId   the row id
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws SQLException             the SQL exception
	 */

	public JSONArray getRowExtras(ICIPDataset dataset, String unqId, String properties) {
		try (Connection conn = getDbConnection(new JSONObject(dataset.getDatasource().getConnectionDetails()))) {
			String tableName = new JSONObject(dataset.getAttributes()).getString("tableName");
			String uniqueIdentifier = new JSONObject(dataset.getAttributes()).getString("uniqueIdentifier");
			DbSpec spec = new DbSpec();
			DbSchema schema = spec.addDefaultSchema();
			DbTable cTable = schema.addTable(tableName);
			SelectQuery dslquery = new SelectQuery();
			List<String> propertyList = Arrays.asList(properties.split(","));
			propertyList.stream().forEach(property -> {
				DbColumn extrasColumn = new DbColumn(cTable, property, null, null, null);
				dslquery.addColumns(extrasColumn);
			});
			dslquery.addFromTable(cTable);
			Column unqIdCol = cTable.addColumn(uniqueIdentifier);
			dslquery.getWhereClause().addCondition(BinaryCondition.equalTo(unqIdCol, Integer.parseInt(unqId)));
			JSONArray extras = new JSONArray();
			try (PreparedStatement stmt = conn.prepareStatement(dslquery.validate().toString(),
					ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_UPDATABLE)) {
				try (ResultSet res = stmt.executeQuery()) {
					ResultSetMetaData resultSetMetaData = res.getMetaData();
					final int columnCount = resultSetMetaData.getColumnCount();
					Map<String, String> entries = new LinkedHashMap<>();
					while (res.next()) {
						for (int i = 1; i <= columnCount; i++) {
							entries.put(resultSetMetaData.getColumnName(i), res.getString(i));
						}
						extras.put(entries);
					}
				}
			}
			return extras;
		} catch (JSONException | SQLException e) {
			logger.error("Error: Error in fetching row extras " + e);
			return new JSONArray()
					.put(new JSONObject().put("Error:", "Error in fetching row extras " + e.getMessage()));
		}
	}

	@SuppressWarnings("unchecked")
	@Override
	public <T> T getDatasetDataAudit(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype, String id,
			Class<T> clazz) throws SQLException {
		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String table = String.format("%s_%s", attributes.getString("tableName"), "audit");
		DbSpec spec = new DbSpec();
		DbSchema schema = spec.addDefaultSchema();
		DbTable cTable = schema.addTable(table);
		SelectQuery dslquery = new SelectQuery();
		dslquery.addAllTableColumns(cTable);
		dslquery.addFromTable(cTable);

		DbColumn uniqueID = cTable.addColumn(attributes.getString("uniqueIdentifier"));
		dslquery.addCondition(BinaryCondition.equalTo(uniqueID, id));
		return (T) getJSONHeaderAuditDataset(dslquery.toString(), connectionDetails);

	}

	protected String getJSONHeaderDataset(String query, JSONObject connectionDetails) throws SQLException {
		try (Connection conn = getDbConnection(connectionDetails)) {
			try (PreparedStatement stmt = conn.prepareStatement(query)) {
				try (ResultSet res = stmt.executeQuery()) {
					return extractWithHeaderRowsData(res);
				}
			}
		}
	}

	protected String getJSONHeaderAuditDataset(String query, JSONObject connectionDetails) throws SQLException {
		try (Connection conn = getDbConnection(connectionDetails)) {
			try (PreparedStatement stmt = conn.prepareStatement(query, ResultSet.TYPE_SCROLL_SENSITIVE,
					ResultSet.CONCUR_UPDATABLE)) {
				try (ResultSet res = stmt.executeQuery()) {
					return extractAsGsonJsonArray(res).toString();
				}
			}
		}
	}

	private String extractWithHeaderRowsData(ResultSet res) throws SQLException {
		JSONObject obj = new JSONObject();
		if (res.next()) {
			obj.put("headers", res.getString(1));
		}
		ArrayList<String> array = new ArrayList<>();
		while (res.next()) {
			array.add(res.getString(1));
		}
		obj.put("data", array);
		return obj.toString();
	}

	@Transactional
	private JSONObject checkIfEncrypted(JSONObject entryObj, ICIPDataset dataset, Boolean newentry)
			throws NoSuchAlgorithmException, ValidationException, JSONException, SQLException {
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String tableName = attributes.getString("tableName");
		String uniqueIdentifier = attributes.getString("uniqueIdentifier");
		String colNames = "";
		String colValues = "";
		byte[] salt;
		if (newentry) {
			salt = new byte[64];
			SecureRandom random = SecureRandom.getInstanceStrong();
			random.nextBytes(salt);
			entryObj.put("_salt", Base64.getEncoder().encodeToString(salt));
		} else {
			String salt1 = getsaltfromtable(dataset, uniqueIdentifier, entryObj.get(uniqueIdentifier).toString(),
					tableName);
			salt = Base64.getDecoder().decode(salt1);
		}
		JSONArray schema = new JSONArray(dataset.getSchema().getSchemavalue());
		Iterator<String> kyItr = entryObj.keys();
		while (kyItr.hasNext() && salt != null) {
			String ky = kyItr.next();
			schema.forEach(res -> {
				JSONObject res1 = new JSONObject(res.toString());
				if (res1.has("recordcolumnname") && (res1.getString("recordcolumnname").equalsIgnoreCase(ky))) {

					if (res1.has("isencrypted") && res1.getBoolean("isencrypted")
							&& (!entryObj.get(ky).toString().isEmpty())) {

						String[] enc = decryptpass.encryptwithsalt(entryObj.get(ky).toString(), key, salt);
						String encryptedvalue = enc[0];
						entryObj.put(ky, encryptedvalue);

					}
				}
			});

		}

		return entryObj;
	}

	@Transactional
	protected String getsaltfromtable(ICIPDataset dataset, String uniqueidentifier, String uniquevalue,
			String tablename) throws ValidationException, SQLException {
		try (Connection conn = getDbConnection(new JSONObject(dataset.getDatasource().getConnectionDetails()))) {
			DbSpec spec = new DbSpec();
			DbSchema schema = spec.addDefaultSchema();
			DbTable cTable = schema.addTable(tablename);
			SelectQuery dslquery = new SelectQuery();
			Column saltCol = cTable.addColumn("_salt");
			dslquery.addColumns(saltCol);
			dslquery.addFromTable(cTable);
			Column bidCol = cTable.addColumn("BID");
			dslquery.getWhereClause().addCondition(BinaryCondition.equalTo(bidCol, uniquevalue));
			String salt = "";
			try (PreparedStatement stmt = conn.prepareStatement(dslquery.validate().toString(),
					ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_UPDATABLE)) {
				try (ResultSet res = stmt.executeQuery()) {
					while (res.next()) {
						salt = res.getString(1);
					}
					return salt;
				}
			}
		}
	}

	private JSONObject checkIfDecrypted(JSONObject entryObj, ICIPDataset dataset)
			throws NoSuchAlgorithmException, ValidationException, JSONException, SQLException {
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String tableName = attributes.getString("tableName");
		String uniqueIdentifier = attributes.getString("uniqueIdentifier");
		String salt = getsaltfromtable(dataset, uniqueIdentifier, entryObj.get(uniqueIdentifier).toString(), tableName);

		JSONArray schema = new JSONArray(dataset.getSchema().getSchemavalue());
		Iterator<String> kyItr = entryObj.keys();
		while (kyItr.hasNext() && !salt.isEmpty()) {
			String ky = kyItr.next();
			schema.forEach(res -> {
				JSONObject res1 = new JSONObject(res.toString());
				if (res1.has("recordcolumnname") && (res1.getString("recordcolumnname").equalsIgnoreCase(ky))) {

					if (res1.has("isencrypted") && res1.getBoolean("isencrypted")) {
						String enc = entryObj.get(ky).toString();
						if (!entryObj.get(ky).toString().isEmpty()
								&& entryObj.get(ky).toString().substring(0, 3).equalsIgnoreCase("enc")) {

							enc = decryptpass.decrypt(entryObj.get(ky).toString(), key, salt);
						}

						entryObj.put(ky, enc);

					}
				}
			});

		}

		return entryObj;
	}

	public String decryptfield(ICIPDataset dataset, String uniqueIdentifier, String uniqueValue, String tableName,
			String encryptedValue) throws ValidationException, SQLException {

		String salt = getsaltfromtable(dataset, uniqueIdentifier, uniqueValue, tableName);
		String enc = decryptpass.decrypt(encryptedValue, key, salt);
		return enc;
	}

	public JsonArray getDataByProcess(ICIPDataset dataset, String process)
			throws NoSuchAlgorithmException, JSONException, SQLException {
		try (Connection conn = getDbConnection(new JSONObject(dataset.getDatasource().getConnectionDetails()))) {

			String table = new JSONObject(dataset.getAttributes()).getString("tableName");
			DbSpec spec = new DbSpec();
			DbSchema schema = spec.addDefaultSchema();
			DbTable cTable = schema.addTable(table);
			SelectQuery dslquery = new SelectQuery();
			dslquery.addAllTableColumns(cTable);
			dslquery.addFromTable(cTable);
			Column bidCol = cTable.addColumn("process");
			dslquery.getWhereClause().addCondition(BinaryCondition.equalTo(bidCol, process));

			try (PreparedStatement stmt = conn.prepareStatement(dslquery.validate().toString(),
					ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_UPDATABLE)) {
				try (ResultSet res = stmt.executeQuery()) {

					JsonArray obj = extractAsGsonJsonArray(res);

					return obj;
				}

			}
		}

	}

	public static void safeClose(PreparedStatement stmt) {
		if (stmt != null) {
			try {
				stmt.close();
			} catch (SQLException e) {
				logger.error(e.getMessage());
			}
		}
	}

	public JSONArray extendInboxSchema(JSONArray schema) {

		String schemaValue = schemaService.fetchSchemaValue("CAMUNDA_SCHEMA", "Core");
		JSONArray inboxSchema = null;
		if (!schemaValue.isEmpty()) {
			inboxSchema = new JSONArray(schemaValue);
			inboxSchema.forEach(ele -> {
				schema.put(ele);
			});

			return schema;
		}
		return null;
	}

	public JSONArray archivalSchema(JSONArray schema, JSONObject attributes) {

		JSONArray schema1 = new JSONArray();
		JSONArray metaDataColumns = new JSONArray(attributes.get("metaDataColumns").toString());

		for (int i = 0; i < metaDataColumns.length(); ++i) {
			JSONObject metaDataColumnObj = metaDataColumns.getJSONObject(i);
			for (int j = 0; j < schema.length(); j++) {
				JSONObject schemaObj = schema.getJSONObject(j);
				if (schemaObj.getString("recordcolumnname").toString()
						.equals(metaDataColumnObj.getString("name").toString())) {
					schema1.put(schemaObj);
				}
			}
		}
		return schema1;

	}

	public ICIPDataAuditResponse addEntry(ICIPDataset dataset, JSONArray entryArr, Marker marker) {

		ICIPDataAuditResponse resp = new ICIPDataAuditResponse("", Operation.INSERT, Status.ERROR, "", dataset, 0);
		String assignee = "unassigned";
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String tableName = attributes.getString("tableName");
		if (tableName != null) {
			logger.info(marker, "Inserting entries in " + tableName);
			String colNames = "";
			String colValues = "";

			JSONArray entryObjArr = new JSONArray();
			for (int i = 0; i < entryArr.length(); i++) {
				JSONObject entryObj = entryArr.getJSONObject(i);
//	                if (dataset.getIsInboxRequired()) {
//	                    entryObj = checkIfEncrypted(entryObj, dataset, true);
//	                }
				entryObjArr.put(entryObj);

				Iterator<String> kyItr = entryObj.keys();

				while (kyItr.hasNext()) {
					String ky = kyItr.next();
					if (!ky.equals("action")) {
						colValues += "'" + entryObj.get(ky) + "',";
					}
				}
				colValues = colValues.substring(0, colValues.length() - 1);
				colValues += "),(";
			}
			JSONObject colNameObj = new JSONObject(entryArr.get(0).toString());
			Iterator<String> kyItr = colNameObj.keys();

			while (kyItr.hasNext()) {
				String ky = kyItr.next();
				if (!ky.equals("action")) {
					colNames += "" + ky + ",";
				}
			}
			colValues = colValues.substring(0, colValues.length() - 3);
			if (attributes.has("defaultValues") && attributes.get("defaultValues") != null
					&& attributes.get("defaultValues").toString().length() > 0) {
				String dfltValsStr = attributes.get("defaultValues").toString();
				JSONObject dfltVals = new JSONObject(dfltValsStr);
				Iterator<String> dfltValItr = dfltVals.keys();
				while (dfltValItr.hasNext()) {
					String ky = dfltValItr.next();
					colNames += "`" + ky + "`,";
					colValues += "'" + dfltVals.get(ky) + "',";
				}
			}
			colNames = colNames.substring(0, colNames.length() - 1);
			String insrtQry = "INSERT INTO " + tableName + " (" + colNames + ") values (" + colValues + ")";
			attributes.put(QU, insrtQry);
			dataset.setAttributes(attributes.toString());

			try {
				executeUpdatewithGeneratedID(dataset, null);

				if (dataset.getIsAuditRequired()) {
					for (int i = 0; i < entryObjArr.length(); i++) {
						JSONObject entryObj = entryObjArr.getJSONObject(i);
						String generated_id;
						if (dataset.getIsInboxRequired()) {
							generated_id = entryObj.getInt("id") + "";
						} else {
							generated_id = entryObj.getString((attributes.getString("uniqueIdentifier")));
						}
						if (entryObj.has("_salt")) {
							entryObj.remove("_salt");
						}
						dataAudit(dataset, entryObj.toString(), "create", generated_id,ICIPUtils.getUser(claim));
					}
				}

				resp.setResponse("Entries successfully inserted in table " + tableName);
				logger.info(marker, "Entries successfully inserted in table {}", tableName);

				if (dataset.getIsAuditRequired()) {
					resp.setQuery(insrtQry);
					resp.setStatus(Status.SUCCESS);
				}

			} catch (NoSuchAlgorithmException e) {
				resp.setResponse("Error: " + e.getMessage());
				logger.error(marker, "Error while inserting entries in {}", tableName, e);
			} catch (SQLException e) {
				resp.setResponse("Error: " + e.getMessage());
				logger.error(marker, "Error while inserting entries in {}", tableName, e);
			}
		}
		return resp;
	}

	public JSONArray getArchivalExtras(ICIPDataset dataset, String unqId, String properties, Connection connect) {
		try (Connection conn = getDbConnection(new JSONObject(dataset.getDatasource().getConnectionDetails()))) {
			String tableName = new JSONObject(dataset.getAttributes()).getString("tableName");
			String uniqueIdentifier = new JSONObject(dataset.getAttributes()).getString("uniqueIdentifier");
			DbSpec spec = new DbSpec();
			DbSchema schema = spec.addDefaultSchema();
			DbTable cTable = schema.addTable(tableName);
			SelectQuery dslquery = new SelectQuery();
			List<String> propertyList = Arrays.asList(properties.split(","));
			if (!propertyList.get(0).isEmpty()) {
				propertyList.stream().forEach(property -> {
					DbColumn extrasColumn = new DbColumn(cTable, property, null, null, null);
					dslquery.addColumns(extrasColumn);
				});
			} else {
				dslquery.addAllTableColumns(cTable);
			}
			dslquery.addFromTable(cTable);
			Column unqIdCol = cTable.addColumn(uniqueIdentifier);
			dslquery.getWhereClause().addCondition(BinaryCondition.equalTo(unqIdCol, Integer.parseInt(unqId)));
			JSONArray extras = new JSONArray();
			try (PreparedStatement stmt = conn.prepareStatement(dslquery.validate().toString(),
					ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_UPDATABLE)) {
				try (ResultSet res = stmt.executeQuery()) {
					ResultSetMetaData resultSetMetaData = res.getMetaData();
					final int columnCount = resultSetMetaData.getColumnCount();
					Map<String, String> entries = new LinkedHashMap<>();
					while (res.next()) {
						for (int i = 1; i <= columnCount; i++) {
							entries.put(resultSetMetaData.getColumnName(i), res.getString(i));
						}
						extras.put(entries);
					}
				}
			}
			return extras;
		} catch (JSONException | SQLException e) {
			logger.error("Error: Error in fetching row extras " + e);
			return new JSONArray()
					.put(new JSONObject().put("Error:", "Error in fetching row extras " + e.getMessage()));
		}
	}
}
