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
package com.infosys.icets.icip.dataset.service;

import java.sql.Timestamp;
import java.util.List;

import org.json.JSONObject;

import com.infosys.icets.icip.dataset.model.ICIPDatasetMlOcr;

/**
 * The Interface IICIPDatasetMlOcrService.
 *
 * @author icets
 */
public interface IICIPDatasetMlOcrService {
	
	/**
	 * Save.
	 *
	 * @param icipdatasetmlocr Dataset MlOcr
	 * @return ICIP Dataset MlOcr
	 */
	ICIPDatasetMlOcr save(ICIPDatasetMlOcr icipdatasetmlocr);
	
	/**
	 * findAll.
	 *
	 * @return List of Dataset MlOcr
	 */
	List<ICIPDatasetMlOcr> findAll();
	
	/**
	 * findById.
	 *
	 * @param id the id
	 * @return ICIP Dataset MlOcr
	 */
	ICIPDatasetMlOcr findById(int id);
	
	/**
	 * update.
	 *
	 * @param id the id
	 * @param icipdatasetmlocr Dataset MlOcr
	 * @return ICIP Dataset MlOcr
	 */
	void update(String id,ICIPDatasetMlOcr icipdatasetmlocr);
	
	/**
	 * delete.
	 *
	 * @param icipdatasetmlocr the Dataset MlOcr
	 * @return ICIP Dataset MlOcr
	 */
	void delete(ICIPDatasetMlOcr icipdatasetmlocr);
	
	/**
	 * findFile.
	 *
	 * @param filename the file name
	 * @return ICIP Dataset MlOcr
	 */
	List<ICIPDatasetMlOcr> findFile(String filename);
	
	/**
	 * findFile.
	 *
	 * @param filename the file name
	 * @param pageno the page number
	 * @return ICIP Dataset MlOcr
	 */
	ICIPDatasetMlOcr findFile(String filename,String pageno);
	
	/**
	 * findFile.
	 *
	 * @param filename the file name
	 * @param consumingentity the consuming entity
	 * @param pageno the page number
	 * @return ICIP Dataset MlOcr
	 */
	ICIPDatasetMlOcr findFile(String filename,String consumingentity,String pageno);
	
	String getPostResponseIdById(int id);
	
	int updateAnalysisResultsById(String analysisResults,int id) throws Exception;
	
	String getFileUploadId(int id);

	String getAnalysisResults(int id);
	
	List<String> updateConsumingEntityById(List<Integer> idList, String consumingEntity);

	public List<JSONObject> getIdUploadIdResultsByConsumingEntity(String consumingEntity, String org) throws Exception;

	int updateAnalysisResultsAndConsumingEntityById(String analysisResults, int id, String consumingEntity) throws Exception;

	List<JSONObject> findQualityAuditData(String prefix, String org, String flag);

	void tagCaseForAudit(Timestamp taggedOn, int id);

	List<JSONObject> getFileName(String consumingEntity, String org) throws Exception;

	ICIPDatasetMlOcr findByfilename(String filename,String filetype,String org,String consumingentity);
	
}
