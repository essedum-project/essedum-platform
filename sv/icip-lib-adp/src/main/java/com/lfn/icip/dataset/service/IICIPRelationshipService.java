package com.lfn.icip.dataset.service;

import java.sql.SQLException;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Marker;

import com.google.gson.JsonElement;
import com.lfn.icip.dataset.model.ICIPRelationship;

// TODO: Auto-generated Javadoc
/**
 * The Interface IICIPRelationshipService.
 */
public interface IICIPRelationshipService {
	
	/**
	 * Save.
	 *
	 * @param relationship the relationship
	 * @return the ICIP relationship
	 */
	public ICIPRelationship save(ICIPRelationship relationship);
	
	/**
	 * Update.
	 *
	 * @param relationship the relationship
	 * @return the ICIP relationship
	 * @throws SQLException the SQL exception
	 */
	public ICIPRelationship update(ICIPRelationship relationship) throws SQLException;
	
	/**
	 * Delete.
	 *
	 * @param id the id
	 * @throws SQLException the SQL exception
	 */
	public void delete(Integer id) throws SQLException;
	
	/**
	 * Gets the all pipelines.
	 *
	 * @return the all pipelines
	 */
	List<ICIPRelationship> getAllRelationships();
	
	List<ICIPRelationship> getAllRelationshipsByOrg(String org);
	/**
	 * Find one.
	 *
	 * @param id the id
	 * @return the ICIP relationship
	 */
	public ICIPRelationship findOne(Integer id);

	public JsonElement export(Marker marker, String source, JSONArray modNames);


}
