package com.lfn.icip.dataset.model.dto;

import java.io.Serializable;
import java.sql.Timestamp;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPRatingDetails.
 */
public interface ICIPRatingDetails extends Serializable{

	public String getId();

	public String getModule();
	
	public String getElementAlias();

	public Double getAvgRating();

	public Integer getUser();

	public String getRating();
	
	public String getFeedback();


}