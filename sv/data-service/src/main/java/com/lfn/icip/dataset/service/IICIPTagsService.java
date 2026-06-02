package com.lfn.icip.dataset.service;

import java.util.List;

import com.lfn.icip.dataset.model.ICIPTags;

public interface IICIPTagsService {
	
    public List<ICIPTags> getTags();
	
    public ICIPTags getById(Integer id);
	
	public ICIPTags addTags(ICIPTags tags);
	
	public ICIPTags updateTags(Integer id,ICIPTags tags);
	
	public void deleteTags(Integer parseLong);

	public List<ICIPTags> getAllTagsByProjectAndService(String project, String service);

	

	

	

	
}
