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
