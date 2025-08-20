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
import java.math.BigDecimal;
import java.nio.file.Paths;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.SortedDocValuesField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexableField;
import org.apache.lucene.index.Term;
import org.apache.lucene.queryparser.classic.MultiFieldQueryParser;
import org.apache.lucene.queryparser.classic.QueryParser.Operator;
import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.MatchAllDocsQuery;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.RegexpQuery;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.SortField;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.search.TotalHits;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.document.Field;
import org.apache.lucene.util.BytesRef;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

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
//import com.ibm.icu.math.BigDecimal;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
//import com.lfn.iamp.usm.annotation.EssedumProperty;
import com.lfn.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
import com.lfn.icip.dataset.model.ICIPDataset;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDataSetServiceUtilMySQL.
 *
 * @author essedum
 */
@Component("mysqlds")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RefreshScope
public class ICIPDataSetServiceUtilMySQL extends ICIPDataSetServiceUtilSqlAbstract {

	/** The Constant RECORDCOLUMNDISPLAYNAME. */
	private static final String RECORDCOLUMNDISPLAYNAME = "$..recordcolumndisplayname";

	/** The ds util. */
	@Autowired
	private IICIPDataSetServiceUtilFactory dsUtil;

	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(ICIPDataSetServiceUtilMySQL.class);

	/** The Constant QUERY. */
	private static final String QUERY = "query";

	/** The Constant QU. */
	private static final String QU = "Query";

	/** The Constant PSTR. */
	private static final String PSTR = "password";

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
	
	private static String lucene_indexPath=".\\luceneindex\\";

	/** The pool map. */
	@Autowired
	private ICIPDataSetServiceUtilMySQLPoolMap poolMap;

	/**
	 * Test connection.
	 *
	 * @param dataset the dataset
	 * @return true, if successful
	 * @throws EssedumException the essedum exception
	 * 
	 */
	@Override
	public boolean testConnection(ICIPDataset dataset) throws EssedumException {
		if (dataset.getType().equals("t")) {
			return true;
		}
		logger.info("testing connection to sql");
		JSONObject obj = new JSONObject(dataset.getDatasource().getConnectionDetails());
		try (Connection conn = getDbConnection(obj)) {
			JSONObject attributes = new JSONObject(dataset.getAttributes());
			String query = attributes.getString(QU);
			try {
				validateQuery(query);
			} catch (SQLException e) {
				throw new EssedumException(e.getMessage());
			}

			return true;
		} catch (SQLException e) {
			throw new EssedumException("Error Testing Connection : ", e);
		}
	}

	/**
	 * Checks if is primitive.
	 *
	 * @param type the type
	 * @return true, if is primitive
	 */
	public static boolean isPrimitive(Class<?> type) {
		return (type == int.class || type == long.class || type == double.class || type == float.class
				|| type == boolean.class || type == byte.class || type == char.class || type == short.class);
	}

	/**
	 * Box primitive class.
	 *
	 * @param type the type
	 * @return the class
	 */
	public static Class<?> boxPrimitiveClass(Class<?> type) {
		if (type == int.class) {
			return Integer.class;
		} else if (type == long.class) {
			return Long.class;
		} else if (type == double.class) {
			return Double.class;
		} else if (type == float.class) {
			return Float.class;
		} else if (type == boolean.class) {
			return Boolean.class;
		} else if (type == byte.class) {
			return Byte.class;
		} else if (type == char.class) {
			return Character.class;
		} else if (type == short.class) {
			return Short.class;
		} else {
			String string = "class '" + type.getName() + "' is not a primitive";
			throw new IllegalArgumentException(string);
		}
	}

	/**
	 * Replace query limit.
	 *
	 * @param query the query
	 * @return the string
	 */
	public String appendPaginationValues(SQLPagination pagination, String query) {
		int offset = pagination.getPage() * pagination.getSize();
		query += " LIMIT " + offset + ", " + pagination.getSize();
		return query;
	}

	/**
	 * Checks if is stored procedure.
	 *
	 * @param query the query
	 * @return true, if is stored procedure
	 */
	private boolean isStoredProcedure(String query) {
		query = query.trim();
		String[] splits = query.split(" ", 2);
		String firstWord = splits[0];
		return !firstWord.equalsIgnoreCase("select");
	}

	/**
	 * Extract data with graphs.
	 *
	 * @param res the res
	 * @return the string
	 * @throws SQLException the SQL exception
	 */
	private String extractDataWithGraphs(ResultSet res) throws SQLException {
		List<List> rows = new ArrayList<>();
		List<Object> row = new ArrayList<>();

		List<List> col = new ArrayList<>();
		List<LinkedHashMap<Object, Object>> chartList = new ArrayList<>();
		List<Object> type = new ArrayList<>();

		ArrayList<Integer> integerSQLTypes = new ArrayList<>(Arrays.asList(java.sql.Types.BIGINT, java.sql.Types.BINARY,
				java.sql.Types.BIT, java.sql.Types.INTEGER, java.sql.Types.TINYINT, java.sql.Types.SMALLINT));
		ArrayList<Integer> decimalSQLTypes = new ArrayList<>(Arrays.asList(java.sql.Types.BIGINT, java.sql.Types.DOUBLE,
				java.sql.Types.FLOAT, java.sql.Types.DECIMAL));
		ArrayList<Integer> stringSQLTypes = new ArrayList<>(Arrays.asList(java.sql.Types.VARCHAR, java.sql.Types.CHAR,
				java.sql.Types.LONGVARCHAR, java.sql.Types.NCHAR, java.sql.Types.LONGNVARCHAR));
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

		while (res.next()) {
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
							if (pieData2.get(key1).equals(maxList.get(max))) {
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
					float tmpNum = 100F - total;
					BigDecimal float1 = new BigDecimal(String.valueOf(tmpNum));
					BigDecimal float2 = new BigDecimal(String.valueOf(0));
					if (!chartData.containsKey("Others") && float1.compareTo(float2) != 0)
						chartData.put("Others", tmpNum);
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

	/**
	 * Extract with header rows data.
	 *
	 * @param res the res
	 * @return the string
	 * @throws SQLException the SQL exception
	 */
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

	/**
	 * Extract schema.
	 *
	 * @param dataset the dataset
	 * @return the list
	 */
	@Override
	public List<String> extractSchema(ICIPDataset dataset) {
		List<String> rows = new ArrayList<>();
		logger.info("extracting schema");
		JSONObject obj = new JSONObject(dataset.getDatasource().getConnectionDetails());
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String query = attributes.get(QU).toString();
		String mode = attributes.get("mode").toString();
		switch (mode) {
		case FILTER:
			query = getFilterQuery(attributes);
			break;
		case QUERY:
		default:
			query = getTemplatedQuery(attributes, query);
		}
		try (Connection conn = getDbConnection(obj)) {
			try (PreparedStatement stmt = conn.prepareStatement(query)) {
				try (ResultSet res = stmt.executeQuery()) {
					// logic to extract schema
					ResultSetMetaData metadata = res.getMetaData();
					for (int i = 1; i <= metadata.getColumnCount(); i++) {
						rows.addAll(getColsFormat(metadata, i));
					}
				}
			}
		} catch (SQLException e) {
			logger.error(e.getMessage(), e);
		}
		return rows;
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

		if (type.equalsIgnoreCase("VARCHAR") || type.equalsIgnoreCase("TEXT") || type.equalsIgnoreCase("CHAR")
				|| type.equalsIgnoreCase("LONGVARCHAR")) {
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
	 * Apply query mode count.
	 *
	 * @param attributes        the attributes
	 * @param connectionDetails the connection details
	 * @return the long
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException
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
			JSONObject params = new JSONObject(attributes.get(PARAMS).toString());
			String[] paramValues = parseQuery(query);
			for (int i = 0; i < paramValues.length; i++) {
				String extparamValue = paramValues[i];
				extparamValue = extparamValue.substring(1, extparamValue.length() - 1);
				if (params.has(extparamValue)) {
					newQry = newQry.replace(paramValues[i],
							params.get(extparamValue) != null ? params.get(extparamValue).toString() : null);
				}
			}
		}
		query = newQry;
		return query;
	}

	/**
	 * Applyfilter mode count.
	 *
	 * @param attributes        the attributes
	 * @param connectionDetails the connection details
	 * @return the long
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException
	 */
	private Long applyfilterModeCount(JSONObject attributes, JSONObject connectionDetails)
			throws SQLException, NoSuchAlgorithmException {
		String query = null;
		if (attributes.has(FILTER)) {
			query = getFilterQuery(attributes);
		}
		try (Connection conn = getDbConnection(connectionDetails)) {
			try (PreparedStatement stmt = conn.prepareStatement(query)) {
				try (ResultSet res = stmt.executeQuery()) {
					res.last();
					return Long.parseLong(String.valueOf(res.getRow()));
				}
			}
		}
	}

	/**
	 * Gets the filter query.
	 *
	 * @param attributes the attributes
	 * @return the filter query
	 */
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

	/**
	 * Gets the value.
	 *
	 * @param type  the type
	 * @param value the value
	 * @return the value
	 */
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
		//Matcher m = Pattern.compile("^EQUALS\\[(.*?)[,](.*?)[,](.*?)\\]$").matcher(qrystr);
		 Matcher m = Pattern.compile("^EQUALS\\[([^,]+),([^,]+),([^,]+)\\]$").matcher(qrystr);
		while (m.find()) {
			allMatches.add(m.group(1));
			allMatches.add(m.group(2));
			allMatches.add(m.group(3));
		}
		return allMatches.toArray(new Object[allMatches.size()]);
	}

	/**
	 * Parses the between.
	 *
	 * @param qrystr the qrystr
	 * @return the object[]
	 */
	private Object[] parseBetween(String qrystr) {
		List<String> allMatches = new ArrayList<>();
		//Matcher m = Pattern.compile("^BETWEEN\\[(.*?)[,](.*?)[,](.*?)[,](.*?)\\]$").matcher(qrystr);
		Matcher m = Pattern.compile("^BETWEEN\\[([^,]*),,,\\]$").matcher(qrystr);
		while (m.find()) {
			allMatches.add(m.group(1));
			allMatches.add(m.group(2));
			allMatches.add(m.group(3));
			allMatches.add(m.group(4));
		}
		return allMatches.toArray(new Object[allMatches.size()]);
	}

	/**
	 * Gets the json.
	 *
	 * @return the json
	 */
	@Override
	public JSONObject getJson() {
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", "MYSQL");
			JSONObject attributes = new JSONObject();
			attributes.put(QU, "");
			attributes.put(FILTER, "");
			attributes.put(PARAMS, "{}");
			attributes.put(TNAME, "");
			attributes.put("mode", QUERY);
			attributes.put("writeMode", "append");
			attributes.put("isStreaming", "false");
			attributes.put("uniqueIdentifier", "");
			attributes.put("defaultValues", "");
			ds.put("attributes", attributes);
			JSONObject position = new JSONObject();
			position.put(QU, 0);
			position.put(FILTER, 1);
			position.put(PARAMS, 2);
			position.put(TNAME, 3);
			position.put("uniqueIdentifier", 4);
			position.put("defaultValues", 5);
			position.put("mode", 6);
			position.put("writeMode", 7);
			position.put("isStreaming", 8);
			ds.put("position", position);
		} catch (JSONException e) {
			logger.error("Exception", e);
		}
		return ds;
	}

	/**
	 * Gets the db connection.
	 *
	 * @param connectionDetails the connection details
	 * @return the db connection
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException
	 */
	public Connection getDbConnection(JSONObject connectionDetails) throws SQLException {
		String url = connectionDetails.optString("url");
		String username = connectionDetails.optString(UNAME);
		String password = connectionDetails.optString(PSTR);
		Connection conn = null;
		conn = poolMap.getDatasource(url, username, password).getConnection();
		return conn;
	}

	/**
	 * Creates the table if not exists.
	 *
	 * @param dataset the dataset
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException
	 */
	@Override
	public void createTableIfNotExists(ICIPDataset dataset) throws SQLException, NoSuchAlgorithmException {
		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		if (dataset.getSchema() != null) {
			JSONArray schema = new JSONArray(dataset.getSchema().getSchemavalue());

			JSONObject attributes = new JSONObject(dataset.getAttributes());
			if (attributes.getString(TNAME) != null && attributes.getString(TNAME) != "") {
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
					      	Set<String> uniqueSchema = new HashSet<String>();
				        	JSONArray uniqueSchemaArray = new JSONArray();
				        	String key = "recordcolumnname";
				        	uniqueSchema.add("BID");
				        	for(int i=0; i <schema.length();i++) {
				        		JSONObject jsonObject = schema.getJSONObject(i);
				        		String value = jsonObject.getString(key);
				        		
				        		if(!uniqueSchema.contains(value)) {
				        			uniqueSchema.add(value);
				        			uniqueSchemaArray.put(jsonObject);
				        		}
				        	}
				        	schema = uniqueSchemaArray;
					}}
					sqlCreate = "CREATE TABLE IF NOT EXISTS " + attributes.getString(TNAME) + "("
							+ getcolumnMappings(schema,
									dataset.getIsApprovalRequired() != null ? dataset.getIsApprovalRequired() : false,
									dataset.getIsInboxRequired() != null ? dataset.getIsInboxRequired() : false)
							+ ");";
				} 
				else {
					if(!dataset.getIsInboxRequired()) {
					sqlCreate = alterTable(dataset);
				}
				}
				if (sqlCreate != null) {
					try (Connection conn = getDbConnection(connectionDetails)) {
						try (PreparedStatement stmt = conn.prepareStatement(sqlCreate)) {
							stmt.execute();
						}
					}
				}
				if (dataset.getIsAuditRequired()) {
					String tableName = attributes.getString(TNAME);
				    String uniqueIdentifier = attributes.getString("uniqueIdentifier");

				    // Validate and sanitize input
				    if (!isValidIdentifier(tableName) || !isValidIdentifier(uniqueIdentifier)) {
				        throw new IllegalArgumentException("Invalid table name or unique identifier");
				    }

					String sqlCreateAudit = "CREATE TABLE IF NOT EXISTS " + tableName + "_audit"
							+ "( id INT auto_increment,entry_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,action VARCHAR(255),"
							+ "user VARCHAR(255)," + uniqueIdentifier
							+ " VARCHAR(255),row_data TEXT,primary key (id,entry_timestamp));";
					try (Connection conn = getDbConnection(connectionDetails)) {
						try (PreparedStatement stmt = conn.prepareStatement(sqlCreateAudit)) {
							stmt.execute();
						}
					}
					sqlCreateAudit = "CREATE TABLE IF NOT EXISTS " + attributes.getString(TNAME) + "_task_durations"
							+ "(id INT auto_increment primary key,process_name VARCHAR(100),task_name VARCHAR(100),business_key VARCHAR(255),"
							+ "proc_inst_id VARCHAR(64),task_inst_id VARCHAR(64),start_date DATETIME,end_date DATETIME,"
							+ "duration INT(30),due_date DATETIME,sla_met BOOLEAN,extra_time VARCHAR(50),assignee VARCHAR(255),"
							+ "status VARCHAR(50));";
					try (Connection conn1 = getDbConnection(connectionDetails)) {
						try (PreparedStatement stmt1 = conn1.prepareStatement(sqlCreateAudit)) {
							stmt1.execute();
						}
					}

				}
			}

		}
	}
	private boolean isValidIdentifier(String identifier) {
	    return identifier != null && identifier.matches("[a-zA-Z0-9_]+");
	}

	private String alterTable(ICIPDataset dataset) {
		JSONArray schema = new JSONArray(dataset.getSchema().getSchemavalue());
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String tableColumns = extractTableSchema(dataset, attributes.getString(TNAME));
		JSONArray columns = new JSONArray(tableColumns);
//		String sqlAlter = "ALTER TABLE " + attributes.getString(TNAME) + " ADD ";
		String sqlAlter = "ALTER TABLE " + attributes.getString(TNAME);
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
//				sqlAlter = sqlAlter + scmjson.getString("recordcolumnname") + " "
//						+ getSQLType(scmjson.getString("columntype")) + ", ";
				sqlAlter = sqlAlter  + " ADD " + scmjson.getString("recordcolumnname") + " "
						+ getSQLType(scmjson.getString("columntype")) + ", ";
		}
		if (!sqlAlter.contains("ADD "))
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
		if (attributes.getString(TNAME) != null && attributes.getString(TNAME) != "") {
			String sqlCreate = "CREATE TABLE IF NOT EXISTS " + attributes.getString(TNAME) + "("
					+ getcolumnMappingsForCsv(schema) + ");";
			try (Connection conn = getDbConnection(connectionDetails)) {
				try (PreparedStatement stmt = conn.prepareStatement(sqlCreate)) {
					stmt.execute();
				}
			}
		}
	}

	/**
	 * performs delete function" throws NoSuchAlgorithmException and SQLException
	 * deletes string if TNAME is not null and empty
	 */

	@Override
	public void deleteAllFromTable(ICIPDataset dataset) throws NoSuchAlgorithmException, SQLException {
		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		if (attributes.getString(TNAME) != null && attributes.getString(TNAME) != "") {
			String sqlCreate = "DELETE FROM " + attributes.getString(TNAME);
			try (Connection conn = getDbConnection(connectionDetails)) {
				try (PreparedStatement stmt = conn.prepareStatement(sqlCreate)) {
					stmt.execute();
				}
			}
		}
	}

	/**
	 * Gets the dataset row values.
	 *
	 * @param columnlist the columnlist
	 * @param row        the row
	 * @param statement  the statement
	 * @return the dataset row values
	 * @throws SQLException the SQL exception
	 */
	private void getDatasetRowValues(List<String> columnlist, HashMap<String, Object> row, PreparedStatement statement)
			throws SQLException {
		for (int index = 0; index < row.size(); index++) {
			String columnName = columnlist.get(index);
			Object value = row.get(columnName);
			statement.setObject(index + 1, value);
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
						String.format("%s %s %s %s %s", columnName, type, "NOT NULL", "PRIMARY KEY", "AUTO_INCREMENT"));
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
			case FILTER:
				logger.info("filter mode");
				count = applyfilterModeCount(attributes, connectionDetails);
				break;
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
	 * Execute update.
	 *
	 * @param dataset the dataset
	 * @param marker  the marker
	 * @return
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException
	 */
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

	/**
	 * Gets the dataset data.
	 *
	 * @param <T>        the generic type
	 * @param dataset    the dataset
	 * @param pagination the pagination
	 * @param datatype   the datatype
	 * @param clazz      the clazz
	 * @return the dataset data
	 * @throws SQLException the SQL exception
	 */
	@SuppressWarnings("unchecked")
	@Override
	public <T> T getDatasetData(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype, Class<T> clazz)
			throws SQLException {
		String query = null;
		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String mode = attributes.get("mode").toString();
		try {
			switch (mode) {
			case FILTER:
				logger.info("filter mode");
				query = applyfilterMode(attributes);
				break;
			case QUERY:
			default:
				query = applyQueryMode(attributes);
			}

			//query = query.trim();
			if (query != null) {
			    query = query.trim();
			}
			if (datatype == DATATYPE.JSONHEADER) {
				return (T) getJSONHeaderDataset(query, connectionDetails);
			}
			if (!isStoredProcedure(query) && !datatype.equals(DATATYPE.ALL)) {
				query = this.buildQuery(dataset, pagination, query);
			}
			if (clazz.equals(String.class)) {
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
			if (clazz.equals(ArrayList.class)) {
				return (T) getDatasetDataAsListofString(connectionDetails, query);
			}
		} catch (SQLException | NoSuchAlgorithmException exc) {
			logger.error(exc.getMessage());
			throw new SQLException(exc.getMessage());
		}
		return null;
	}

	/**
	 * Apply query mode.
	 *
	 * @param attributes the attributes
	 * @return the string
	 */
	private String applyQueryMode(JSONObject attributes) {
		String query = attributes.getString(QU);
		if (attributes.has(PARAMS)) {
			query = getTemplatedQuery(attributes, query);
		}
		return query;
	}

	/**
	 * Applyfilter mode.
	 *
	 * @param attributes the attributes
	 * @return the string
	 */
	private String applyfilterMode(JSONObject attributes) {
		String query = null;
		if (attributes.has(FILTER)) {
			query = getFilterQuery(attributes);
		}
		return query;
	}

	/**
	 * Extract as json array.
	 *
	 * @param res the res
	 * @return the JSON array
	 * @throws SQLException the SQL exception
	 */
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

	
	
	/**
	 * Extract as list.
	 *
	 * @param res the res
	 * @return the list
	 * @throws SQLException the SQL exception
	 */
	private List<LinkedHashMap<String, Object>> extractAsList(ResultSet res) throws SQLException {
		List<LinkedHashMap<String, Object>> rows = new ArrayList<>();
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

	public List<String> extractAsListofString(ResultSet res) throws SQLException {

		List<String> rows = new ArrayList<>();
		while (res.next()) {
			String row = "";
			ResultSetMetaData metadata = res.getMetaData();
			for (int i = 1; i <= metadata.getColumnCount(); i++) {
				 row = res.getString(i);
			}
			rows.add(row);
		}
		return rows;
	}
	/**
	 * Gets the JSON header dataset.
	 *
	 * @param query             the query
	 * @param connectionDetails the connection details
	 * @return the JSON header dataset
	 * @throws SQLException the SQL exception
	 */
	protected String getJSONHeaderDataset(String query, JSONObject connectionDetails) throws SQLException {
		try (Connection conn = getDbConnection(connectionDetails)) {
			try (PreparedStatement stmt = conn.prepareStatement(query)) {
				try (ResultSet res = stmt.executeQuery()) {
					return extractWithHeaderRowsData(res);
				}
			}
		}
	}

	/**
	 * Gets the dataset data as string.
	 *
	 * @param connectionDetails the connection details
	 * @param query             the query
	 * @param isGraphData       the is graph data
	 * @return the dataset data as string
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException
	 */
	private String getDatasetDataAsString(JSONObject connectionDetails, String query, boolean isGraphData)
			throws SQLException, NoSuchAlgorithmException {
		try (Connection conn = getDbConnection(connectionDetails)) {
			try (PreparedStatement stmt = conn.prepareStatement(query)) {
				try (ResultSet res = stmt.executeQuery()) {
					if (isGraphData) {
						return extractDataWithGraphs(res);
					}
					return extractAsGsonJsonArray(res).toString();
				}
			}
		}
	}


	private List getDatasetDataAsListofString(JSONObject connectionDetails, String query)
			throws SQLException, NoSuchAlgorithmException {
		try (Connection conn = getDbConnection(connectionDetails)) {
			try (PreparedStatement stmt = conn.prepareStatement(query)) {
				try (ResultSet res = stmt.executeQuery()) {
					return extractAsListofString(res);
				}
			}
		}
	}
	/**
	 * Gets the dataset data as gson json.
	 *
	 * @param connectionDetails the connection details
	 * @param query             the query
	 * @return the dataset data as gson json
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException
	 */
	private JsonArray getDatasetDataAsGsonJson(JSONObject connectionDetails, String query)
			throws SQLException, NoSuchAlgorithmException {
		try (Connection conn = getDbConnection(connectionDetails)) {
			try (PreparedStatement stmt = conn.prepareStatement(query)) {
				try (ResultSet res = stmt.executeQuery()) {
					return extractAsGsonJsonArray(res);
				}
			}
		}
	}

	/**
	 * Gets the dataset data as json.
	 *
	 * @param connectionDetails the connection details
	 * @param query             the query
	 * @return the dataset data as json
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException
	 */
	private JSONArray getDatasetDataAsJson(JSONObject connectionDetails, String query)
			throws SQLException, NoSuchAlgorithmException {
		try (Connection conn = getDbConnection(connectionDetails)) {
			try (PreparedStatement stmt = conn.prepareStatement(query)) {
				try (ResultSet res = stmt.executeQuery()) {
					return extractAsJsonArray(res);
				}
			}
		}
	}

	/**
	 * Gets the dataset data as list.
	 *
	 * @param connectionDetails the connection details
	 * @param query             the query
	 * @return the dataset data as list
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException
	 */
	private List getDatasetDataAsList(JSONObject connectionDetails, String query)
			throws SQLException, NoSuchAlgorithmException {
		try (Connection conn = getDbConnection(connectionDetails)) {
			try (PreparedStatement stmt = conn.prepareStatement(query)) {
				try (ResultSet res = stmt.executeQuery()) {
					return extractAsList(res);
				}
			}
		}
	}

	/**
	 * Update batch.
	 *
	 * @param marker  the marker
	 * @param queries the queries
	 * @param dataset the dataset
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException
	 */
	@Override
	public void updateBatch(Marker marker, String[] queries, ICIPDataset dataset)
			throws SQLException, NoSuchAlgorithmException {
		dataset.setQueries(queries);
		dsUtil.getDataSetUtilSql("mysqlds").executeUpdate(dataset, marker);
	}

	/**
	 * Validate query.
	 *
	 * @param query the query
	 * @return true, if successful
	 * @throws SQLException the SQL exception
	 */
	public boolean validateQuery(String inpQuery) throws SQLException {
		String query = inpQuery.trim();
		if (query.toUpperCase(Locale.ENGLISH).contains("--") || query.toUpperCase(Locale.ENGLISH).startsWith("UPDATE")
				|| query.toUpperCase(Locale.ENGLISH).startsWith("INSERT")
				|| query.toUpperCase(Locale.ENGLISH).startsWith("DELETE")
				|| query.toUpperCase(Locale.ENGLISH).startsWith("REPLACE")) {
			throw new SQLException("Insert, Delete, Update, Replace queries are not allowed");
		} else
			return true;
	}

	@Override
	public boolean isTablePresent(ICIPDataset ds, String tableName) throws SQLException, NoSuchAlgorithmException {
		JSONObject condetails = new JSONObject(ds.getDatasource().getConnectionDetails());
		String[] dbName = condetails.getString("url").split("/");
		String query = "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '" + tableName
				+ "' AND TABLE_SCHEMA = " + "'" + dbName[dbName.length - 1] + "'";
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
		//String query = "DESCRIBE " + tablename.replaceAll("^\"|\"$", "");
		String query = "DESCRIBE " + tablename.replaceAll("(^\")|(\"$)", "");
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
	public ICIPDataset updateDataset(ICIPDataset dataset) {
		return null;
	}

	@Override
    public <T> T getDatasetDataAsList(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype, Class<T> clazz)
            throws SQLException {
        // TODO Auto-generated method stub
        return null;
    }
	
	@Override
	public void transformLoad(ICIPDataset outdataset, Marker marker, List<Map<String, ?>> map, JSONArray response) {
		// TODO Auto-generated method stub
		
	}
	
	
	public String getcolumnMappings(JSONArray schema, boolean approve, boolean inbox) {
		List<String> columnMappings = new ArrayList<>();
		String prime = "";
		if (inbox) {
			columnMappings
					.add(String.format("%s %s %s %s %s", "BID", "INT", "NOT NULL", "PRIMARY KEY", "AUTO_INCREMENT"));
		}
		schema.forEach(x -> {
			JSONObject obj = new JSONObject(x.toString());
			String columnName = obj.getString("recordcolumnname");
			String type = getSQLType(obj.getString("columntype"));

			if (obj.has("isencrypted") && obj.getBoolean("isencrypted")) {
				columnMappings.add(String.format("%s %s", columnName, "VARCHAR(255)"));
			}

			else if (obj.has("isunique") && obj.getBoolean("isunique")) {
				columnMappings.add(String.format("%s %s %s %s", columnName, type, "NOT NULL", "UNIQUE"));
			} else if (obj.has("isrequired") && obj.getBoolean("isrequired"))
				columnMappings.add(String.format("%s %s %s", columnName, type, "NOT NULL"));
			else
				columnMappings.add(String.format("%s %s", columnName, type));
		});

		return String.join(",", columnMappings);
	}
	
	
	public void dataAudit(ICIPDataset dataset, String rowdata, String action, String rowId, String user)
			throws NoSuchAlgorithmException, SQLException {
		//DateTime.now();
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String tableName = attributes.getString("tableName");
		if (attributes.getString("uniqueIdentifier").equalsIgnoreCase("BID")) {
			Integer rowId1 = Integer.parseInt(rowId);
			rowId = rowId1.toString();

		}
		String columns = "action,userName," + attributes.getString("uniqueIdentifier") + ",row_data";
		String colvalues = "'" + action + "'," + "'" + user + "'," + "'" + rowId + "'," + "'"
				+ rowdata + "'";
		String qryinsert = String.format("INSERT INTO %s_audit (%s) VALUES(%s)", tableName, columns, colvalues);
		JSONObject obj = new JSONObject(dataset.getDatasource().getConnectionDetails());
		try (Connection conn = getDbConnection(obj)) {
			try (PreparedStatement stmt = conn.prepareStatement(qryinsert)) {
				stmt.executeUpdate();
			}
		}

}


}