package com.lfn.icip.dataset.service.util;

import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.slf4j.Marker;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.dto.ICIPDataAuditResponse;

// TODO: Auto-generated Javadoc
/**
 * The Interface IICIPDataSetServiceUtilSql.
 */
public interface IICIPDataSetServiceUtilSql extends IICIPDataSetServiceUtil {

	/**
	 * Extract schema.
	 *
	 * @param dataset the dataset
	 * @return the list
	 */
	List<String> extractSchema(ICIPDataset dataset);
	
	/**
	 * Execute update.
	 *
	 * @param dataset the dataset
	 * @param marker the marker
	 * @throws SQLException the SQL exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	void executeUpdate(ICIPDataset dataset, Marker marker) throws SQLException, NoSuchAlgorithmException;

	/**
	 * Execute updatewith generated ID.
	 *
	 * @param dataset the dataset
	 * @param marker the marker
	 * @return the int
	 * @throws SQLException the SQL exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	int executeUpdatewithGeneratedID(ICIPDataset dataset, Marker marker) throws SQLException, NoSuchAlgorithmException;

	/**
	 * Checks if is table present.
	 *
	 * @param ds the ds
	 * @param tableName the table name
	 * @return true, if is table present
	 * @throws SQLException the SQL exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	boolean isTablePresent(ICIPDataset ds, String tableName) throws SQLException, NoSuchAlgorithmException;
	
	/**
	 * Adds the entry.
	 *
	 * @param dataset the dataset
	 * @param rowData the row data
	 * @return the ICIP data audit response
	 */
	ICIPDataAuditResponse addEntry(ICIPDataset dataset, String rowData);
	
	/**
	 * Update entry.
	 *
	 * @param dataset the dataset
	 * @param rowData the row data
	 * @return the ICIP data audit response
	 */
	ICIPDataAuditResponse updateEntry(ICIPDataset dataset, String rowData);

    

	
	
}
