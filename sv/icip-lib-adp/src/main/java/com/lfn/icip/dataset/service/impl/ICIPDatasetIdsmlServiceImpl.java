package com.lfn.icip.dataset.service.impl;

import java.sql.SQLIntegrityConstraintViolationException;
import java.util.List;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.lfn.icip.dataset.model.ICIPDatasetIdsml;
import com.lfn.icip.dataset.repository.ICIPDatasetIdsmlRepository;
import com.lfn.icip.dataset.service.IICIPDatasetIdsmlService;
@Service
public class ICIPDatasetIdsmlServiceImpl implements IICIPDatasetIdsmlService{
	
	private static final Object ConstraintViolationException = null;
	@Autowired
	private ICIPDatasetIdsmlRepository idsmlRepository;
	
	@Override
	public ICIPDatasetIdsml saveIdsmlData(String datasetId, String org, String toSave, String idsmlData) throws Exception, DataIntegrityViolationException {
		ICIPDatasetIdsml dataObj = new ICIPDatasetIdsml();
		JSONObject data = new JSONObject(idsmlData);
		try {
			dataObj.setOrg(org);
			dataObj.setDataset(datasetId);
			if(toSave.equalsIgnoreCase("chart")) {
				dataObj.setIsChart(true);
				dataObj.setChartName(data.getString("story_name"));
				dataObj.setChartDetails(data.getJSONObject("details").toString());
			}else {
				dataObj.setIsRecipe(true);
				dataObj.setRecipeName(data.getString("recipe_name"));
				dataObj.setRecipeDetails(data.getJSONObject("details").toString());
			}
			dataObj.setDescription(data.getString("description"));
			ICIPDatasetIdsml result =  idsmlRepository.save(dataObj);
			return result;
		}catch(DataIntegrityViolationException e) {
			Throwable cause = e.getCause();
			if(cause instanceof org.hibernate.exception.ConstraintViolationException) {
				JSONObject msgObj = new JSONObject();
				msgObj.put("message", "Name already exists for this dataset");
				throw new DataIntegrityViolationException(msgObj.toString());
			}
			throw new DataIntegrityViolationException(e.getMessage());
//			throw new DataIntegrityViolationException(new JSONObject("message",e.getMessage()).toString()));
		}catch(Exception e) {
			throw new Exception(e.getMessage());
		}
	}
	
	@Override
	public ICIPDatasetIdsml updateIdsmlData(String datasetId, String org, String toSave, String idsmlData) throws Exception {
		ICIPDatasetIdsml dataObj = new ICIPDatasetIdsml();
		JSONObject data = new JSONObject(idsmlData);
		try {
			if(toSave.equalsIgnoreCase("chart")) {
				dataObj = idsmlRepository.getChartIdsmlDataForDataset(datasetId,data.getString("story_name"));
				dataObj.setChartDetails(data.getJSONObject("details").toString());
			}else {
				dataObj = idsmlRepository.getRecipeIdsmlDataForDataset(datasetId, data.getString("recipe_name"));
				dataObj.setRecipeDetails(data.getJSONObject("details").toString());
			}
			dataObj.setDescription(data.getString("description"));
			ICIPDatasetIdsml result =  idsmlRepository.save(dataObj);
			return result;
		}catch(Exception e) {
			throw new Exception(e.getMessage());
		}
	}
	

	public List<ICIPDatasetIdsml> getChartListByDataset(String datasetId, String org) {
		List<ICIPDatasetIdsml> listAll = idsmlRepository.getChartListByDataset(datasetId, org);
		return listAll;
	}
}
