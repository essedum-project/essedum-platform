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

package com.lfn.icip.dataset.service.util;

import java.io.IOException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;

import org.apache.commons.codec.DecoderException;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.healthmarketscience.sqlbuilder.BetweenCondition;
import com.healthmarketscience.sqlbuilder.BinaryCondition;
import com.healthmarketscience.sqlbuilder.BinaryCondition.Op;
import com.healthmarketscience.sqlbuilder.Condition;
import com.healthmarketscience.sqlbuilder.SelectQuery;
import com.healthmarketscience.sqlbuilder.dbspec.basic.DbColumn;
import com.healthmarketscience.sqlbuilder.dbspec.basic.DbSchema;
import com.healthmarketscience.sqlbuilder.dbspec.basic.DbSpec;
import com.healthmarketscience.sqlbuilder.dbspec.basic.DbTable;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;

//
/**
 * The Class ICIPDataSetServiceUtilMSSQL.
 *
 * @author essedum
 */
@Component("postgresqlds")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPDataSetServiceUtilPostgreSQL extends ICIPDataSetServiceUtilSqlAbstract {

	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(ICIPDataSetServiceUtilPostgreSQL.class);

	/** The limit. */
	private int limit = 10;

	/** The page. */
	private int page = 0;

	/** The Constant QUERY. */
	private static final String QUERY = "query";

	/** The Constant QU. */
	private static final String QU = "Query";

	/** The Constant PSTR. */
	private static final String PSTR = "password";

	/** The Constant DS. */
	private static final String DS = "datasource";

	/** The Constant FILTER. */
	private static final String FILTER = "filter";

	/** The Constant PARAMS. */
	private static final String PARAMS = "params";

	/** The Constant TNAME. */
	private static final String TNAME = "tableName";

	/** The Constant UNAME. */
	private static final String UNAME = "userName";

	/** The Constant CO. */
	private static final String CO = "\"columnorder\":";

	/** The Constant RCDN. */
	private static final String RCDN = "\"recordcolumndisplayname\":";

	/** The Constant RCN. */
	private static final String RCN = "\"recordcolumnname\":";

	/** The Constant CTYPE. */
	private static final String CTYPE = "{\"columntype\":";

	/** The pagination. */
	private SQLPagination pagination;

	@Autowired
	private IICIPDataSetServiceUtilFactory dsUtil;
	/**
	 * Test connection.
	 *
	 * @param dataset the dataset
	 * @return true, if successful
	 * @throws EssedumException 
	 */
	@Override
	public boolean testConnection(ICIPDataset dataset) throws EssedumException {
		JSONObject obj = new JSONObject(dataset.getDatasource().getConnectionDetails());
		try (Connection conn = DriverManager.getConnection(obj.optString("url"), obj.optString("userName"),
				obj.optString(PSTR))) {
			JSONObject attributes = new JSONObject(dataset.getAttributes());
			String query = attributes.getString(QU);
			if(query.startsWith("SELECT")) {
				return true;
			}
			else {
				
				throw new EssedumException("Only SELECT query allowed");
			}
		} catch (SQLException e) {
			throw new EssedumException("Error Testing Connection : ", e);
		}	
	}
	

	/**
	 * Gets the rows.
	 *
	 * @param stmt     the stmt
	 * @param query    the query
	 * @param justData the just data
	 * @param asJSON   the as JSON
	 * @return the rows
	 * @throws SQLException the SQL exception
	 */
	private String getRows(Statement stmt, String query, boolean justData, boolean asJSON) throws SQLException {
		page = pagination.getPage() * limit;
		boolean isSorting = pagination.getSortEvent() != null;
		if (!asJSON) {
			query = query.replace(";", "");
			if (page >= 0) {
				if (isSorting) {
					String order = pagination.getSortOrder() > 0 ? " ASC" : " DESC";
					query += " ORDER BY `" + pagination.getSortEvent() + "`" + order;
				}
				if (!query.toUpperCase().contains("ROWNUM"))
					query += " WHERE ROWNUM <=  " + page + ", " + limit;
			}
		}
		logger.info("Running the query {}", query);
		try (ResultSet res = stmt.executeQuery(query)) {
			if (asJSON) {
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
			} else {
				if (!justData) {
					List<List> rows = new ArrayList<>();
					List<Object> row = new ArrayList<>();

					List<List> col = new ArrayList<>();
					List<LinkedHashMap<Object, Object>> chartList = new ArrayList<>();
					List<Object> type = new ArrayList<>();

					ArrayList<Integer> integerSQLTypes = new ArrayList<>(
							Arrays.asList(java.sql.Types.BIGINT, java.sql.Types.BINARY, java.sql.Types.BIT,
									java.sql.Types.INTEGER, java.sql.Types.TINYINT, java.sql.Types.SMALLINT));
					ArrayList<Integer> decimalSQLTypes = new ArrayList<>(Arrays.asList(java.sql.Types.BIGINT,
							java.sql.Types.DOUBLE, java.sql.Types.FLOAT, java.sql.Types.DECIMAL));
					ArrayList<Integer> stringSQLTypes = new ArrayList<>(
							Arrays.asList(java.sql.Types.VARCHAR, java.sql.Types.CHAR, java.sql.Types.LONGVARCHAR,
									java.sql.Types.NCHAR, java.sql.Types.LONGNVARCHAR));
					ArrayList<Integer> dateSQLTypes = new ArrayList<>(
							Arrays.asList(java.sql.Types.DATE, java.sql.Types.TIMESTAMP, java.sql.Types.TIME));

					LinkedHashMap<Object, Object> chartData = new LinkedHashMap<>();
					Map<Object, Object> pieData = new LinkedHashMap<>();
					Map<Object, ArrayList<Object>> map = new LinkedHashMap<>();
					JSONObject obj = new JSONObject();

					ResultSetMetaData metadata = res.getMetaData();
					for (int i = 1; i <= metadata.getColumnCount(); i++) {
						row.add(metadata.getColumnLabel(i));
					}
					rows.add(row);

					obj.put("Heading", row);

					JsonArray paginatedRows = new JsonArray();

					while (res.next() && rows.size() <= limit) {
						row = new ArrayList<>();
						JsonObject paginatedRow = new JsonObject();
						for (int i = 1; i <= metadata.getColumnCount(); i++) {
							String s = res.getString(i);
							row.add(s);
							paginatedRow.addProperty(metadata.getColumnLabel(i), s);
							ArrayList<Object> tmpObject = map.getOrDefault(i, new ArrayList<>());
							if (s == null)
								continue;
							else
								tmpObject.add(s);
							map.put(i, tmpObject);
						}
						rows.add(row);
						paginatedRows.add(paginatedRow);
					}

					obj.put("paginatedRows", paginatedRows);

					logger.debug("preparing graph info");
					for (int i = 1; i <= metadata.getColumnCount(); i++) {
						col.add(map.get(i));
					}
					obj.put("col", col);

					for (int i = 0; i < metadata.getColumnCount(); i++) {
						chartData = new LinkedHashMap<>();
						pieData = new LinkedHashMap<>();
						if (integerSQLTypes.indexOf(metadata.getColumnType(i + 1)) != -1
								|| decimalSQLTypes.indexOf(metadata.getColumnType(i + 1)) != -1) {
							type.add("bar");
							if (col.get(i) != null) {
								Float max = Float.parseFloat("" + col.get(i).get(0));
								Float min = Float.parseFloat("" + col.get(i).get(0));
								for (Object data : col.get(i)) {
									Float tmpData = Float.parseFloat("" + data);
									if (tmpData > max) {
										max = tmpData;
									}
									if (tmpData < min) {
										min = tmpData;
									}
								}
								Float range = (max - min) / 10;
								List<Object> col1 = col.get(i);
								while (!col1.isEmpty()) {
									List<Object> col2 = new ArrayList<>();
									int count = 0;
									Float r = min + range;
									for (Object o : col1) {
										if (Float.parseFloat("" + o) >= min && Float.parseFloat("" + o) <= r) {
											count++;
											col2.add(o);
										}
									}
									if (count != 0) {
										String s = min + " - " + r;
										chartData.put(s, count);
									}
									col1.removeAll(col2);
									min = min + range;
								}
								chartList.add(chartData);

							} else {

								chartList.add(null);
							}
						}

						else if (dateSQLTypes.indexOf(metadata.getColumnType(i + 1)) != -1) {
							type.add("time");
							if (col.get(i) != null) {
								for (Object o : col.get(i)) {
									Integer previousValue = (Integer) chartData.get(o);
									chartData.put(o, previousValue == null ? 1 : previousValue + 1);
								}
								chartList.add(chartData);
							} else {
								chartList.add(null);
							}

						} else if (stringSQLTypes.indexOf(metadata.getColumnType(i + 1)) != -1) {

							type.add("pie");
							if (col.get(i) == null)
								chartList.add(null);
							else {
								Integer length = col.get(i).size();
								for (Object o : col.get(i)) {
									Integer previousValue = (Integer) pieData.get(o);
									pieData.put(o, previousValue == null ? 1 : previousValue + 1);
								}
								LinkedHashMap<Object, Object> pieData2 = new LinkedHashMap<>();
								for (Object key : pieData.keySet()) {
									pieData2.put(key, pieData.get(key));
								}
								Float total = 0f;
								List<Integer> maxList = new ArrayList<>();
								for (int j = 0; j < 4; j++)
									maxList.add(0);
								for (int max = 0; max < maxList.size(); max++) {
									for (Object key : pieData2.keySet()) {

										if ((Integer) pieData.get(key) > maxList.get(max))
											maxList.set(max, (Integer) pieData.get(key));
									}
									for (Object key1 : pieData.keySet()) {
										if ((Integer) pieData2.get(key1) == maxList.get(max)) {
											Float percent = (((Integer) pieData2.get(key1) / (float) length) * 100f);
											total += percent;
											chartData.put(key1, percent);
											pieData2.remove(key1);
											if (chartData.size() == 4) {
												chartData.put("Others", 100 - total);
												break;
											}
										}
									}
									if (chartData.containsKey("Others"))
										break;

								}
								if (!chartData.containsKey("Others") && (100 - total) != 0)
									chartData.put("Others", 100 - total);
								chartList.add(chartData);
							}

						}
					}
					net.minidev.json.JSONArray table = new net.minidev.json.JSONArray();
					table.addAll(rows);

					obj.put("rows", table);
					obj.put("chartType", type);
					obj.put("chartData", chartList);

					return obj.toString();
				} else {
					if (page >= 0) {
						JsonArray rows = new JsonArray();
						while (res.next() && rows.size() <= limit) {
							JsonObject row = new JsonObject();
							ResultSetMetaData metadata = res.getMetaData();
							for (int i = 1; i <= metadata.getColumnCount(); i++) {
								String s = res.getString(i);
								row.addProperty(metadata.getColumnLabel(i), s);
							}
							rows.add(row);
						}
						return rows.toString();
					} else {
						List<List> rows = new ArrayList<>();
						List<Object> row = new ArrayList<>();
						ResultSetMetaData metadata = res.getMetaData();
						for (int i = 1; i <= metadata.getColumnCount(); i++) {
							row.add(metadata.getColumnLabel(i));
						}
						rows.add(row);
						while (res.next() && rows.size() <= limit) {
							row = new ArrayList<>();
							for (int i = 1; i <= metadata.getColumnCount(); i++) {
								String s = res.getString(i);
								row.add(s);
							}
							rows.add(row);
						}
						logger.info("preparing dataset");
						net.minidev.json.JSONArray table = new net.minidev.json.JSONArray();
						table.addAll(rows);
						return table.toString();
					}
				}
			}
		}
	}

	/**
	 * Gets the cols format.
	 *
	 * @param metadata the metadata
	 * @param count    the count
	 * @return the cols format
	 * @throws SQLException the SQL exception
	 */
	public static List<String> getColsFormat(ResultSetMetaData metadata, int count) throws SQLException {
		List<String> rows = new ArrayList<>();
		String name = metadata.getColumnName(count);
		String type = metadata.getColumnTypeName(count).toUpperCase();
		String s = "";

		if (type.equals("VARCHAR") || type.equals("TEXT") || type.equals("CHAR") || type.equals("LONGVARCHAR")) {
			s = CTYPE + "\"string\"" + "," + CO + count + "," + RCN + "\"" + name + "\"" + "," + RCDN + "\""

					+ name.substring(0, 1).toUpperCase() + name.substring(1) + "\"}";
			rows.add(s);

		} else if (type.equals("INT")) {
			s = CTYPE + "\"int\"" + "," + CO + count + "," + RCN + "\"" + name + "\"" + "," + RCDN + "\""
					+ name.substring(0, 1).toUpperCase() + name.substring(1) + "\"}";
			rows.add(s);

		} else if (type.equals("FLOAT") || type.equals("REAL")) {
			s = CTYPE + "\"float\"" + "," + CO + count + "," + RCN + "\"" + name + "\"" + "," + RCDN + "\""
					+ name.substring(0, 1).toUpperCase() + name.substring(1) + "\"}";
			rows.add(s);

		} else if (type.equals("DOUBLE")) {
			s = CTYPE + "\"double\"" + "," + CO + count + "," + RCN + "\"" + name + "\"" + "," + RCDN + "\""
					+ name.substring(0, 1).toUpperCase() + name.substring(1) + "\"}";
			rows.add(s);

		} else if (type.equals("BOOLEAN") || type.equals("TINYINT")) {
			s = CTYPE + "\"boolean\"" + "," + CO + count + "," + RCN + "\"" + name + "\"" + "," + RCDN + "\""
					+ name.substring(0, 1).toUpperCase() + name.substring(1) + "\"}";
			rows.add(s);

		} else if (type.equals("BIGINT")) {
			s = CTYPE + "\"long\"" + "," + CO + count + "," + RCN + "\"" + name + "\"" + "," + RCDN + "\""
					+ name.substring(0, 1).toUpperCase() + name.substring(1) + "\"}";
			rows.add(s);

		} else if (type.equals("SMALLINT")) {
			s = CTYPE + "\"short\"" + "," + CO + count + "," + RCN + "\"" + name + "\"" + "," + RCDN + "\""
					+ name.substring(0, 1).toUpperCase() + name.substring(1) + "\"}";
			rows.add(s);

		} else if (type.equals("TIMESTAMP")) {
			s = CTYPE + "\"timestamp\"" + "," + CO + count + "," + RCN + "\"" + name + "\"" + "," + RCDN + "\""
					+ name.substring(0, 1).toUpperCase() + name.substring(1) + "\"}";
			rows.add(s);

		} else if (type.equals("DATETIME")) {

			s = CTYPE + "\"datetime\"" + "," + CO + count + "," + RCN + "\"" + name + "\"" + "," + RCDN + "\""

					+ name.substring(0, 1).toUpperCase() + name.substring(1) + "\"}";
			rows.add(s);

		} else if (type.equals("DATE")) {

			s = CTYPE + "\"date\"" + "," + CO + count + "," + RCN + "\"" + name + "\"" + "," + RCDN + "\""

					+ name.substring(0, 1).toUpperCase() + name.substring(1) + "\"}";
			rows.add(s);

		}
		return rows;
	}

	/**
	 * Apply query mode.
	 *
	 * @param attributes the attributes
	 * @param conn       the conn
	 * @param query      the query
	 * @param datasource the datasource
	 * @param justData   the just data
	 * @param asJSON     the as JSON
	 * @return the string
	 * @throws SQLException            the SQL exception
	 * @throws JsonProcessingException the json processing exception
	 */
	private String applyQueryMode(JSONObject attributes, Connection conn, String query, boolean justData,
			boolean asJSON) throws SQLException, JsonProcessingException {
		if (attributes.has(PARAMS)) {
			query = getTemplatedQuery(attributes, query);
		}
		try (Statement stmt = conn.createStatement()) {
			return getRows(stmt, query, justData, asJSON);
		}

	}

	/**
	 * Apply query mode count.
	 *
	 * @param attributes the attributes
	 * @param conn       the conn
	 * @param query      the query
	 * @param datasource the datasource
	 * @return the long
	 * @throws SQLException            the SQL exception
	 * @throws JsonProcessingException the json processing exception
	 */

	private Long applyQueryModeCount(JSONObject attributes, JSONObject connectionDetails)
			throws SQLException, NoSuchAlgorithmException {
		String query = attributes.getString(QU);
		if (attributes.has(PARAMS)) {
			query = getTemplatedQuery(attributes, query);
		}
		try (Connection conn = getDbConnection(connectionDetails)) {
			try (PreparedStatement stmt = conn.prepareStatement(query)) {
				ResultSet res = null;
				try {
					res = stmt.executeQuery();
					Long count = 0L;
					while (res.next())
						count++;
					return count;
				} finally {
					if (res != null) {
						res.close();
					}
				}
			}
		}
	}

	/**
	 * Gets the templated query.
	 *
	 * @param attributes the attributes
	 * @param query      the query
	 * @return the templated query
	 */
	private String getTemplatedQuery(JSONObject attributes, String query) {
		String newQry = query;
		if (attributes.has(PARAMS) && attributes.get(PARAMS).toString().length() > 0) {
			String paramStr = attributes.get(PARAMS).toString();
			JSONObject params = new JSONObject(paramStr);
			String[] paramValues = parseQuery(query);
			for (int i = 0; i < paramValues.length; i++) {
				String extparamValue = paramValues[i];
				extparamValue = extparamValue.substring(1, extparamValue.length() - 1);
				if (params.has(extparamValue)) {
					newQry = newQry.replace(paramValues[i], (String) params.get(extparamValue));
				}
			}
		}
		query = newQry;
		return query;
	}

	/**
	 * Applyfilter mode.
	 *
	 * @param attributes the attributes
	 * @param conn       the conn
	 * @param datasource the datasource
	 * @param justData   the just data
	 * @param asJSON     the as JSON
	 * @return the string
	 * @throws SQLException            the SQL exception
	 * @throws JsonProcessingException the json processing exception
	 */
	private String applyfilterMode(JSONObject attributes, Connection conn, boolean justData, boolean asJSON)
			throws SQLException, JsonProcessingException {
		throw new UnsupportedOperationException();
	}

	/**
	 * Parses the query.
	 *
	 * @param qrystr the qrystr
	 * @return the string[]
	 */
	private String[] parseQuery(String qrystr) {
		List<String> allMatches = new ArrayList<>();
		Matcher m = Pattern.compile("\\{(.*?)\\}").matcher(qrystr);
		while (m.find()) {
			for (int i = 0; i < m.groupCount(); i++) {
				allMatches.add(m.group(i));
			}
		}
		return allMatches.toArray(new String[allMatches.size()]);
	}
	
		@Override
	public JSONObject getJson() {
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", "POSTGRESQL");
			JSONObject attributes = new JSONObject();
			attributes.put(QU, "");
			attributes.put(FILTER, "");
			attributes.put(PARAMS, "{}");
			attributes.put(TNAME, "");
			attributes.put("uniqueIdentifier","");
			attributes.put("mode", QUERY);
			attributes.put("Cacheable", "");
			attributes.put("writeMode", "append");
			attributes.put("isStreaming", "false");
			ds.put("attributes", attributes);
			JSONObject position = new JSONObject();
			position.put(QU, 0);
			position.put(FILTER, 1);
			position.put(PARAMS, 2);
			position.put(TNAME, 3);
			position.put("uniqueIdentifier", 4);
			position.put("mode", 5);
			position.put("writeMode", 6);
			position.put("isStreaming", 7);
			attributes.put("Cacheable", 8);
			ds.put("position", position);
		} catch (JSONException e) {
			logger.error("Exception", e);
		}
		return ds;
	}

	/**
	 * Save data.
	 *
	 * @param dataset    the dataset
	 * @param dataToSave the data to save
	 * @return true, if successful
	 */
	public boolean saveData(ICIPDataset dataset, ICIPDatasource datasource, JSONArray dataToSave) {
		return false;
	}

	/**
	 * Gets the db connection.
	 *
	 * @param connectionDetails the connection details
	 * @return the db connection
	 * @throws SQLException the SQL exception
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
	 * Gets the column mappings.
	 *
	 * @param schema the schema
	 * @return the column mappings
	 */
	public String getcolumnMappings(JSONArray schema) {
		List<String> columnMappings = new ArrayList<>();
		for (int i = 0; i < schema.length(); i++) {
			JSONObject obj = schema.getJSONObject(i);
			String columnName = obj.getString("recordcolumndisplayname");
			String type = getSQLType(obj.getString("columntype"));
			columnMappings.add(String.format("%s %s", columnName, type));
		}
		return String.join(",", columnMappings);
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
		case "string":
			sqlType = "TEXT";
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
		default:
			sqlType = "TEXT";
		}
		return sqlType;
	}

	/**
	 * Gets the data with limit.
	 *
	 * @param dataset the dataset
	 * @param limit   the limit
	 * @return the data with limit
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws InvalidKeySpecException            the invalid key spec exception
	 * @throws InvalidAlgorithmParameterException the invalid algorithm parameter
	 *                                            exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws DecoderException                   the decoder exception
	 * @throws SQLException                       the SQL exception
	 * @throws JsonProcessingException            the json processing exception
	 */
	public String getDataWithLimit(ICIPDataset dataset, int limit) throws InvalidKeyException, NoSuchAlgorithmException,
			NoSuchPaddingException, InvalidKeySpecException, InvalidAlgorithmParameterException,
			IllegalBlockSizeException, BadPaddingException, DecoderException, SQLException, JsonProcessingException {
		return getDataWithLimit(dataset, limit, false);
	}

	/**
	 * Gets the data with limit.
	 *
	 * @param dataset  the dataset
	 * @param limit    the limit
	 * @param justData the just data
	 * @return the data with limit
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws InvalidKeySpecException            the invalid key spec exception
	 * @throws InvalidAlgorithmParameterException the invalid algorithm parameter
	 *                                            exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws DecoderException                   the decoder exception
	 * @throws SQLException                       the SQL exception
	 * @throws JsonProcessingException            the json processing exception
	 */
	public String getDataWithLimit(ICIPDataset dataset, int limit, boolean justData)
			throws InvalidKeyException, NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeySpecException,
			InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException, DecoderException,
			SQLException, JsonProcessingException {
		return getDataWithLimit(dataset, limit, justData, false);
	}

	/**
	 * Gets the data with limit.
	 *
	 * @param dataset  the dataset
	 * @param limit    the limit
	 * @param justData the just data
	 * @param asJSON   the as JSON
	 * @return the data with limit
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws InvalidKeySpecException            the invalid key spec exception
	 * @throws InvalidAlgorithmParameterException the invalid algorithm parameter
	 *                                            exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws DecoderException                   the decoder exception
	 * @throws SQLException                       the SQL exception
	 * @throws JsonProcessingException            the json processing exception
	 */
	public String getDataWithLimit(ICIPDataset dataset, int limit, boolean justData, boolean asJSON)
			throws InvalidKeyException, NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeySpecException,
			InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException, DecoderException,
			SQLException, JsonProcessingException {
		return getDataWithLimit(dataset, limit, justData, asJSON, new SQLPagination());
	}

	/**
	 * Gets the data count.
	 *
	 * @param dataset the dataset
	 * @return the data count
	 */
	@Override
	public Long getDataCount(ICIPDataset dataset) {
		Long count = 0L;
		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String query = attributes.getString(QU);
		query = this.appendSearchParams(dataset, query);
		attributes.remove(QU);
		attributes.put(QU, query);
		String mode = attributes.get("mode").toString();
		try {
			switch (mode) {
			case QUERY:
			default:
				count = applyQueryModeCount(attributes, connectionDetails);
			}
		} catch (SQLException | NoSuchAlgorithmException e) {
			logger.error(e.getMessage());
		}
		return count;
	}

	/**
	 * Gets the data with limit.
	 *
	 * @param dataset    the dataset
	 * @param limit      the limit
	 * @param justData   the just data
	 * @param asJSON     the as JSON
	 * @param pagination the pagination
	 * @return the data with limit
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws InvalidKeySpecException            the invalid key spec exception
	 * @throws InvalidAlgorithmParameterException the invalid algorithm parameter
	 *                                            exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws DecoderException                   the decoder exception
	 * @throws SQLException                       the SQL exception
	 * @throws JsonProcessingException            the json processing exception
	 */
	public String getDataWithLimit(ICIPDataset dataset, int limit, boolean justData, boolean asJSON,
			SQLPagination pagination) throws InvalidKeyException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			DecoderException, SQLException, JsonProcessingException {
		String results = null;
		this.limit = limit;
		this.pagination = pagination;
		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String url = connectionDetails.optString("url");
		String username = connectionDetails.optString(UNAME);
		String password = connectionDetails.optString(PSTR);
		try (Connection conn = DriverManager.getConnection(url, username, password)) {
			String query = attributes.getString(QU);
			String mode = attributes.get("mode").toString();
			switch (mode) {
			case FILTER:
				logger.info("filter mode");
				applyfilterMode(attributes, conn, false, false);
				break;
			case QUERY:
			default:
				results = applyQueryMode(attributes, conn, query, justData, asJSON);
			}
		}
		return results;
	}

	/**
	 * Extract schema.
	 *
	 * @param dataset the dataset
	 * @return the list
	 */
	@Override
	public List<String> extractSchema(ICIPDataset dataset) {
		throw new UnsupportedOperationException();
	}

	private String getDatasetDataAsString(JSONObject connectionDetails, String query, boolean isGraphData)
			throws SQLException {
		try (Connection conn = getDbConnection(connectionDetails)) {
			try (Statement stmt = conn.createStatement()) {
				try (ResultSet res = stmt.executeQuery(query)) {
					if (isGraphData) {
						return extractDataWithGraphs(res);
					}
					return extractAsGsonJsonArray(res).toString();
				}
			}
		}
	}
	
	private JsonArray getDatasetDataAsGsonJson(JSONObject connectionDetails, String query) throws SQLException {
		try (Connection conn = getDbConnection(connectionDetails)) {
			try (Statement stmt = conn.createStatement()) {
				try (ResultSet res = stmt.executeQuery(query)) {
					return extractAsGsonJsonArray(res);
				}
			}
		}
	}

	private JSONArray getDatasetDataAsJson(JSONObject connectionDetails, String query) throws SQLException {
		try (Connection conn = getDbConnection(connectionDetails)) {
			try (Statement stmt = conn.createStatement()) {
				try (ResultSet res = stmt.executeQuery(query)) {
					return extractAsJsonArray(res);
				}
			}
		}
	}

	private ArrayList<LinkedHashMap<String, Object>> getDatasetDataAsList(JSONObject connectionDetails, String query) throws SQLException {
		try (Connection conn = getDbConnection(connectionDetails)) {
			try (Statement stmt = conn.createStatement()) {
				try (ResultSet res = stmt.executeQuery(query)) {
					return extractAsList(res);
				}
			}
		}
	}

	

	@Override
	public <T> T getDatasetData(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype, Class<T> clazz) throws SQLException {
		String query = null;
		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String mode = attributes.optString("mode").toString();
		switch (mode) {
		case FILTER:
			logger.info("filter mode");
			query = applyfilterMode(attributes);
			break;
		case QUERY:
		default:
			query = applyQueryMode(attributes);
		}
		try {
			if (clazz.equals(String.class)) {
				boolean justData = false;
				boolean asJSON = false;
				//return (T) getDataWithLimit(dataset, limit, justData, asJSON, new SQLPagination());	
				return (T) getDatasetDataAsString(connectionDetails, query, datatype == DATATYPE.GRAPHDATA);	
			}
			if (clazz.equals(JsonArray.class)) {
				return (T) getDatasetDataAsGsonJson(connectionDetails, query);
			}
			if (clazz.equals(JSONArray.class)) {
				return (T) getDatasetDataAsJson(connectionDetails, query);
			}
			if (clazz.equals(List.class)) {
				return (T) getDatasetDataAsList(connectionDetails, query);
			}
		} catch (SQLException e) {
			logger.error(e.getMessage());
		}
		return null;
	}
	
	
	private String extractDataWithGraphs(ResultSet res) throws SQLException {
		List<List> rows = new ArrayList<>();
		List<Object> row = new ArrayList<>();

		List<List> col = new ArrayList<>();
		List<LinkedHashMap<Object, Object>> chartList = new ArrayList<>();
		List<Object> type = new ArrayList<>();

		ArrayList<Integer> integerSQLTypes = new ArrayList<>(
				Arrays.asList(java.sql.Types.BIGINT, java.sql.Types.BINARY, java.sql.Types.BIT,
						java.sql.Types.INTEGER, java.sql.Types.TINYINT, java.sql.Types.SMALLINT, java.sql.Types.NUMERIC));
		ArrayList<Integer> decimalSQLTypes = new ArrayList<>(Arrays.asList(java.sql.Types.BIGINT,
				java.sql.Types.DOUBLE, java.sql.Types.FLOAT, java.sql.Types.DECIMAL));
		ArrayList<Integer> stringSQLTypes = new ArrayList<>(
				Arrays.asList(java.sql.Types.VARCHAR, java.sql.Types.CHAR, java.sql.Types.LONGVARCHAR,
						java.sql.Types.NCHAR, java.sql.Types.LONGNVARCHAR));
		ArrayList<Integer> dateSQLTypes = new ArrayList<>(
				Arrays.asList(java.sql.Types.DATE, java.sql.Types.TIMESTAMP, java.sql.Types.TIME));

		LinkedHashMap<Object, Object> chartData = new LinkedHashMap<>();
		LinkedHashMap<Object, Object> pieData = new LinkedHashMap<>();
		Map<Object, ArrayList<Object>> map = new LinkedHashMap<>();
		JSONObject obj = new JSONObject();

		ResultSetMetaData metadata = res.getMetaData();
		for (int i = 1; i <= metadata.getColumnCount(); i++) {
			row.add(metadata.getColumnLabel(i));
		}
		rows.add(row);

		obj.put("Heading", row);

		JsonArray paginatedRows = new JsonArray();

		while (res.next() && rows.size() <= limit) {
			row = new ArrayList<>();
			JsonObject paginatedRow = new JsonObject();
			for (int i = 1; i <= metadata.getColumnCount(); i++) {
				String s = res.getString(i);
				row.add(s);
				paginatedRow.addProperty(metadata.getColumnLabel(i), s);
				ArrayList<Object> tmpObject = map.getOrDefault(i, new ArrayList<>());
				if (s == null)
					continue;
				else
					tmpObject.add(s);
				map.put(i, tmpObject);
			}
			rows.add(row);
			paginatedRows.add(paginatedRow);
		}

		obj.put("paginatedRows", paginatedRows);

		logger.debug("preparing graph info");
		for (int i = 1; i <= metadata.getColumnCount(); i++) {
			col.add(map.get(i));
		}
		obj.put("col", col);

		for (int i = 0; i < metadata.getColumnCount(); i++) {
			chartData = new LinkedHashMap<>();
			pieData = new LinkedHashMap<>();
			if (integerSQLTypes.indexOf(metadata.getColumnType(i + 1)) != -1
					|| decimalSQLTypes.indexOf(metadata.getColumnType(i + 1)) != -1) {
				type.add("bar");
				if (col.get(i) != null) {
					Float max = Float.parseFloat("" + col.get(i).get(0));
					Float min = Float.parseFloat("" + col.get(i).get(0));
					for (Object data : col.get(i)) {
						Float tmpData = Float.parseFloat("" + data);
						if (tmpData > max) {
							max = tmpData;
						}
						if (tmpData < min) {
							min = tmpData;
						}
					}
					Float range = (max - min) / 10;
					List<Object> col1 = col.get(i);
					while (!col1.isEmpty()) {
						List<Object> col2 = new ArrayList<>();
						int count = 0;
						Float r = min + range;
						for (Object o : col1) {
							if (Float.parseFloat("" + o) >= min && Float.parseFloat("" + o) <= r) {
								count++;
								col2.add(o);
							}
						}
						if (count != 0) {
							String s = min + " - " + r;
							chartData.put(s, count);
						}
						col1.removeAll(col2);
						min = min + range;
					}
					chartList.add(chartData);

				} else {

					chartList.add(null);
				}
			}

			else if (dateSQLTypes.indexOf(metadata.getColumnType(i + 1)) != -1) {
				type.add("time");
				if (col.get(i) != null) {
					for (Object o : col.get(i)) {
						Integer previousValue = (Integer) chartData.get(o);
						chartData.put(o, previousValue == null ? 1 : previousValue + 1);
					}
					chartList.add(chartData);
				} else {
					chartList.add(null);
				}

			} else if (stringSQLTypes.indexOf(metadata.getColumnType(i + 1)) != -1) {

				type.add("pie");
				if (col.get(i) == null)
					chartList.add(null);
				else {
					Integer length = col.get(i).size();
					for (Object o : col.get(i)) {
						Integer previousValue = (Integer) pieData.get(o);
						pieData.put(o, previousValue == null ? 1 : previousValue + 1);
					}
					LinkedHashMap<Object, Object> pieData2 = new LinkedHashMap<>();
					for (Object key : pieData.keySet()) {
						pieData2.put(key, pieData.get(key));
					}
					Float total = 0f;
					List<Integer> maxList = new ArrayList<>();
					for (int j = 0; j < 4; j++)
						maxList.add(0);
					for (int max = 0; max < maxList.size(); max++) {
						for (Object key : pieData2.keySet()) {

							if ((Integer) pieData.get(key) > maxList.get(max))
								maxList.set(max, (Integer) pieData.get(key));
						}
						for (Object key1 : pieData.keySet()) {
							if ((Integer) pieData2.get(key1) == maxList.get(max)) {
								Float percent = (((Integer) pieData2.get(key1) / (float) length) * 100f);
								total += percent;
								chartData.put(key1, percent);
								pieData2.remove(key1);
								if (chartData.size() == 4) {
									chartData.put("Others", 100 - total);
									break;
								}
							}
						}
						if (chartData.containsKey("Others"))
							break;

					}
					if (!chartData.containsKey("Others") && (100 - total) != 0)
						chartData.put("Others", 100 - total);
					chartList.add(chartData);
				}

			}
		}
		net.minidev.json.JSONArray table = new net.minidev.json.JSONArray();
		table.addAll(rows);

		obj.put("rows", table);
		obj.put("chartType", type);
		obj.put("chartData", chartList);

		return obj.toString();
	}
	
	public JsonArray extractAsGsonJsonArray(ResultSet res) throws SQLException {
		JsonArray rows = new JsonArray();
		while (res.next()) {
			JsonObject row = new JsonObject();
			ResultSetMetaData metadata = res.getMetaData();
			for (int i = 1; i <= metadata.getColumnCount(); i++) {
				String s = res.getString(i);
				row.addProperty(metadata.getColumnLabel(i), s);
			}
			rows.add(row);
		}
		return rows;
	}
	
	private JSONArray extractAsJsonArray(ResultSet res) throws SQLException {
		JSONArray rows = new JSONArray();
		while (res.next()) {
			JSONObject row = new JSONObject();
			ResultSetMetaData metadata = res.getMetaData();
			for (int i = 1; i <= metadata.getColumnCount(); i++) {
				String s = res.getString(i);
				row.put(metadata.getColumnLabel(i), s);
			}
			rows.put(row);
		}
		return rows;
	}
	
	private ArrayList<LinkedHashMap<String, Object>> extractAsList(ResultSet res) throws SQLException {
		ArrayList<LinkedHashMap<String, Object>> rows = new ArrayList<>();
		while (res.next()) {
			LinkedHashMap<String, Object> row = new LinkedHashMap<>();
			ResultSetMetaData metadata = res.getMetaData();
			for (int i = 1; i <= metadata.getColumnCount(); i++) {
				String s = res.getString(i);
				row.put(metadata.getColumnLabel(i), s != null ? s : "");
			}
			rows.add(row);
		}
		return rows;
	}


	private String applyQueryMode(JSONObject attributes) {
		String query = attributes.optString(QU);
		if (attributes.has(PARAMS)) {
			query = getTemplatedQuery(attributes, query);
		}
		return query;
	}
	
	private String applyfilterMode(JSONObject attributes) {
		String query = null;
		if (attributes.has(FILTER)) {
			query = getFilterQuery(attributes);
		}
		return query;
	}
	private String getFilterQuery(JSONObject attributes) {
		String table = attributes.getString(TNAME);
		DbSpec spec = new DbSpec();
		DbSchema schema = spec.addDefaultSchema();
		DbTable cTable = schema.addTable(table);
		SelectQuery dslquery = new SelectQuery();
		dslquery.addAllTableColumns(cTable);
		dslquery.addFromTable(cTable);

		String[] criteria = attributes.get(FILTER).toString().split(";");
		for (int i = 0; i < criteria.length; i++) {
			if (criteria[i].startsWith("BETWEEN")) {
				Object[] between = parseBetween(criteria[i]);
				DbColumn cCol = cTable.addColumn((String) between[0], (String) between[1], null);
				Condition condition = new BetweenCondition(cCol, getValue((String) between[1], between[2]),
						getValue((String) between[1], between[3]));
				dslquery.addCondition(condition);
			}
			if (criteria[i].startsWith("EQUALS")) {
				Object[] binary = parseEquals(criteria[i]);
				DbColumn cCol = cTable.addColumn((String) binary[0], (String) binary[1], null);
				Condition condition = new BinaryCondition(Op.EQUAL_TO, cCol, getValue((String) binary[1], binary[2]))
						.setDisableParens(true);
				dslquery.addCondition(condition);
			}
		}
		return dslquery.toString();
	}
	private Object[] parseBetween(String qrystr) {
		List<String> allMatches = new ArrayList<>();
		Matcher m = Pattern.compile("^BETWEEN\\[(.*?)[,](.*?)[,](.*?)[,](.*?)\\]$").matcher(qrystr);
		while (m.find()) {
			allMatches.add(m.group(1));
			allMatches.add(m.group(2));
			allMatches.add(m.group(3));
			allMatches.add(m.group(4));
		}
		return allMatches.toArray(new Object[allMatches.size()]);
	}
	private Object getValue(String type, Object value) {
		if (type.equals("number"))
			return Integer.parseInt((String) value);
		else
			return String.valueOf(value);

	}

	/**
	 * Parses the equals.
	 *
	 * @param qrystr the qrystr
	 * @return the object[]
	 */
	private Object[] parseEquals(String qrystr) {
		List<String> allMatches = new ArrayList<>();
		Matcher m = Pattern.compile("^EQUALS\\[(.*?)[,](.*?)[,](.*?)\\]$").matcher(qrystr);
		while (m.find()) {
			allMatches.add(m.group(1));
			allMatches.add(m.group(2));
			allMatches.add(m.group(3));
		}
		return allMatches.toArray(new Object[allMatches.size()]);
	}

//	public void loadDataset(Marker marker, Map<String, String> map, String id, ICIPDataset dataset, int projectId,
//			boolean overwrite, String org) throws IOException, EssedumException {
//		
//	}

	@Override
	protected String appendPaginationValues(SQLPagination pagination, String query) {
		int offset = pagination.getPage() * pagination.getSize();
		query += " LIMIT " + String.valueOf(pagination.getSize()) + " OFFSET " + String.valueOf(offset);
		return query;
	}

	@Override
	public void updateBatch(Marker marker, String[] queries, ICIPDataset dataset)
			throws SQLException, NoSuchAlgorithmException {
		dataset.setQueries(queries);
		dsUtil.getDataSetUtilSql("postgresqlds").executeUpdate(dataset, marker);
	}


	
	@Override
	public boolean isTablePresent(ICIPDataset ds, String tableName) throws SQLException, NoSuchAlgorithmException {
		JSONObject condetails = new JSONObject(ds.getDatasource().getConnectionDetails());
		String query = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tableName + "' ";
		try (Connection conn = getDbConnection(condetails)) {
			try (PreparedStatement stmt = conn.prepareStatement(query)) {
				try (ResultSet res = stmt.executeQuery()) {
					return res.next();
				}
			}
		} catch (SQLException e) {
			logger.error(e.getMessage(), e);
		}
		return false;
	}

	@Override
	public String extractTableSchema(ICIPDataset dataset, String tablename) {
		JSONObject condetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		List<JSONObject> row = new ArrayList<>();
		String query = "SELECT COLUMN_NAME AS \"Field\" , DATA_TYPE AS \"Type\" FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = "+"'"+tablename.replaceAll("^\"|\"$", "") + "'";
		try (Connection conn = getDbConnection(condetails)) {
			try (PreparedStatement stmt = conn.prepareStatement(query)) {
				try (ResultSet res = stmt.executeQuery()) {
					while (res.next()) {
						JSONObject obj = new JSONObject();
						ResultSetMetaData metadata = res.getMetaData();
						for (int i = 1; i <= metadata.getColumnCount(); i++) {
							obj.put(metadata.getColumnLabel(i), JSONObject.NULL);
						}
						for (int i = 1; i <= metadata.getColumnCount(); i++) {
							String s = res.getString(i);
							obj.put(metadata.getColumnLabel(i), s);

						}
						row.add(obj);
					}
					return row.toString();
				}
			}
		} catch (SQLException e) {
			logger.error(e.getMessage(), e);
		}
		return null;
	}
	
	@Override
	public void executeUpdate(ICIPDataset dataset, Marker marker) throws SQLException, NoSuchAlgorithmException {
		JSONObject obj = new JSONObject(dataset.getDatasource().getConnectionDetails());
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		try (Connection conn = getDbConnection(obj)) {
			try {
				createTableIfNotExists(dataset);
			} catch (SQLException | NoSuchAlgorithmException e) {
				logger.error(e.getMessage(), e);
				joblogger.error(marker, e.getMessage(), e);
			}
			if (dataset.getQueries().length > 0) {
				try (Statement stmt = conn.createStatement()) {
					Arrays.stream(dataset.getQueries()).forEach(query -> {
						try {
							if (query == null || query.isEmpty())
								return;
							stmt.addBatch(query);
						} catch (SQLException e) {
							logger.error(e.getMessage(), e);
							joblogger.error(marker, e.getMessage(), e);
						}
					});
					stmt.executeBatch();
					
				}
			} else {
				try (PreparedStatement stmt = conn.prepareStatement(attributes.getString(QU))) {
					stmt.execute();
				}
			}
		}
	}
	
	
	@Override
	public void createTableIfNotExists(ICIPDataset dataset) throws SQLException, NoSuchAlgorithmException {
		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		if (dataset.getSchema() != null) {
			JSONArray schema = new JSONArray(dataset.getSchema().getSchemavalue());

			JSONObject attributes = new JSONObject(dataset.getAttributes());
			if (!(attributes.getString(TNAME)).equals(null)&& !(attributes.getString(TNAME)).equals("")) {
				String sqlCreate = null;
				if (!isTablePresent(dataset, attributes.getString(TNAME))) {
					if(dataset.getIsInboxRequired()) {
					  schema = extendInboxSchema(schema);
						if(attributes.has("metaDataColumns")) {
							
							schema = archivalSchema(schema, attributes);
							schema.put(new JSONObject("{\"isunique\":false,\"isrequired\":false,\"recordcolumndisplayname\":\"Archival Location\",\"recordcolumnname\":\"archivalLocation\",\"columntype\":\"varchar\"}\r\n"
									+ ""));
							schema.put(new JSONObject("{\"isunique\":false,\"isrequired\":false,\"recordcolumndisplayname\":\"Archival Date\",\"recordcolumnname\":\"archivalDate\",\"columntype\":\"varchar\"}\r\n"
									+ ""));
					}}
					sqlCreate = "CREATE TABLE IF NOT EXISTS " + attributes.getString(TNAME) + "("
							+ getcolumnMappings(schema,
									dataset.getIsApprovalRequired() != null ? dataset.getIsApprovalRequired() : false,
									dataset.getIsInboxRequired() != null ? dataset.getIsInboxRequired() : false)
							+ ");";
//				} else {
//					sqlCreate = alterTable(dataset);
				}
				if (sqlCreate != null) {
					try (Connection conn = getDbConnection(connectionDetails)) {
						try (PreparedStatement stmt = conn.prepareStatement(sqlCreate)) {
							stmt.execute();
						}
					}
				}
				if (dataset.getIsAuditRequired()) {

					String sqlCreateAudit = "CREATE TABLE IF NOT EXISTS " + attributes.getString(TNAME) + "_audit"
							+ "( id INT auto_increment,entry_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,action VARCHAR(255),"
							+ "user VARCHAR(255)," + attributes.getString("uniqueIdentifier")
							+ " VARCHAR(255),row_data TEXT,primary key (id,entry_timestamp));";
					try (Connection conn = getDbConnection(connectionDetails)) {
						try (PreparedStatement stmt = conn.prepareStatement(sqlCreateAudit)) {
							stmt.execute();
						}
					}

				}
			}

		}
	}
	
	private String alterTable(ICIPDataset dataset) {
		JSONArray schema = new JSONArray(dataset.getSchema().getSchemavalue());
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String tableColumns = extractTableSchema(dataset, attributes.getString(TNAME));
		JSONArray columns = new JSONArray(tableColumns);
		String sqlAlter = "ALTER TABLE " + attributes.getString(TNAME) + " ADD ";
		Boolean flag = false;
		for (Object scm : schema) {
			flag = false;
			JSONObject scmjson = new JSONObject(scm.toString());
			for (Object col : columns) {
				JSONObject coljson = new JSONObject(col.toString());
				if (scmjson.get("recordcolumnname").equals(coljson.get("Field"))) {
					flag = true;
					break;
				}
			}
			if (!flag)
				sqlAlter = sqlAlter + scmjson.getString("recordcolumnname") + " "
						+ getSQLType(scmjson.getString("columntype")) + ", ADD ";
		}
		if (sqlAlter.endsWith("ADD "))
			sqlAlter = null;
		else
			sqlAlter = sqlAlter.substring(0, sqlAlter.length() - 2);
		return sqlAlter;

	}

	@Override
	public void createTableFromCsv(ICIPDataset dataset, List<Map<String, ?>> map)
			throws SQLException, NoSuchAlgorithmException {
		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		JSONArray schema = new JSONArray(map);
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		if (!(attributes.getString(TNAME)).equals(null)&& !(attributes.getString(TNAME)).equals("")) {
			String sqlCreate = "CREATE TABLE IF NOT EXISTS " + attributes.getString(TNAME) + "("
					+ getcolumnMappingsForCsv(schema) + ");";
			try (Connection conn = getDbConnection(connectionDetails)) {
				try (PreparedStatement stmt = conn.prepareStatement(sqlCreate)) {
					stmt.execute();
				}
			}
		}
	}
	
	
	public String getcolumnMappingsForCsv(JSONArray schema) {
		List<String> columnMappings = new ArrayList<>();
		for (int i = 0; i < schema.length(); i++) {
			JSONObject obj = schema.getJSONObject(i);
			String columnName = obj.getString("field");
			String type = getSQLType(obj.getString("type"));
			if (obj.getBoolean("primary") && !obj.getBoolean("autoincrement"))
				columnMappings.add(String.format("%s %s %s %s", columnName, type, "NOT NULL", "PRIMARY KEY"));
			else if (obj.getBoolean("primary") && obj.getBoolean("autoincrement"))
				columnMappings.add(
						String.format("%s %s %s %s %s", columnName, type, "NOT NULL","GENERATED ALWAYS AS IDENTITY", "PRIMARY KEY"));
			else if (obj.getBoolean("unique"))
				columnMappings.add(String.format("%s %s %s %s", columnName, type, "NOT NULL", "UNIQUE"));
			else if (obj.getBoolean("required"))
				columnMappings.add(String.format("%s %s %s", columnName, type, "NOT NULL"));
			else
				columnMappings.add(String.format("%s %s", columnName, type));
		}
		return String.join(",", columnMappings);
	}
	
	/**
	 * Execute update.
	 *
	 * @param dataset the dataset
	 * @param marker  the marker
	 * @return
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException
	 */
	@Override
	public int executeUpdatewithGeneratedID(ICIPDataset dataset, Marker marker)
			throws SQLException, NoSuchAlgorithmException {
		JSONObject obj = new JSONObject(dataset.getDatasource().getConnectionDetails());
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		try (Connection conn = getDbConnection(obj)) {
			try {
				createTableIfNotExists(dataset);
			} catch (SQLException | NoSuchAlgorithmException e) {
				logger.error(e.getMessage(), e);
				joblogger.error(marker, e.getMessage(), e);
			}
			if (dataset.getQueries().length > 0) {
				try (Statement stmt = conn.createStatement()) {
					Arrays.stream(dataset.getQueries()).forEach(query -> {
						try {
							if (query == null || query.isEmpty())
								return;
							stmt.addBatch(query);
						} catch (SQLException e) {
							logger.error(e.getMessage(), e);
							joblogger.error(marker, e.getMessage(), e);
						}
					});
					stmt.executeBatch();
					return ICIPUtils.getGeneratedKey(stmt);
				}
			} else {
				try (PreparedStatement stmt = conn.prepareStatement(attributes.getString(QU),
						Statement.RETURN_GENERATED_KEYS)) {
					stmt.executeUpdate();
					return ICIPUtils.getGeneratedKey(stmt);
				}
			}
		}
	}


	@Override
	public void dataAudit(ICIPDataset dataset, String rowdata, String action, String rowId, String user)
			throws SQLException, NoSuchAlgorithmException {
		// TODO Auto-generated method stub
		
	}


	@Override
	public String getcolumnMappings(JSONArray uniqueSchemaArray, boolean approve, boolean inbox) {
		// TODO Auto-generated method stub
		return null;
	}
}