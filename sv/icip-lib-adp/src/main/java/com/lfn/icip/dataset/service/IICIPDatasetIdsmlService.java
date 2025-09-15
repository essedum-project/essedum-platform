package com.lfn.icip.dataset.service;

import java.sql.SQLIntegrityConstraintViolationException;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;

import com.lfn.icip.dataset.model.ICIPDatasetIdsml;

public interface IICIPDatasetIdsmlService {

	ICIPDatasetIdsml saveIdsmlData(String datasetId, String org, String toSave, String idsmlData) throws Exception, DataIntegrityViolationException;

	List<ICIPDatasetIdsml> getChartListByDataset(String datasetId, String org);

	ICIPDatasetIdsml updateIdsmlData(String datasetId, String org, String toSave, String idsmlData) throws Exception;
}
