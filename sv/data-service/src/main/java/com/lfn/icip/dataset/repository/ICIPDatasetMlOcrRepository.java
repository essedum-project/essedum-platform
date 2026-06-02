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

package com.lfn.icip.dataset.repository;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.icip.dataset.model.ICIPDatasetMlOcr;

public interface ICIPDatasetMlOcrRepository extends JpaRepository<ICIPDatasetMlOcr,Integer> {

	/**
	 * Find by id.
	 *
	 * @param id the file id
	 * @return the Dataset MlOcr
	 */
	ICIPDatasetMlOcr findById(int id);
	
	/**
	 * Find by filename and Page Number.
	 *
	 * @param filename the filename
	 * @param pageNo  the file Page Number
	 * @return the ICIP dataset MlOcr
	 */
	@Query("SELECT c FROM ICIPDatasetMlOcr c WHERE c.fileName =?1 and c.pageNo =?2")
	public ICIPDatasetMlOcr findByFileNameAndPageNo(String filename,String pageno);
	
	/**
	 * Find by file name.
	 *
	 * @param fileName the file name
	 * @return the Dataset MlOcr
	 */
	public List<ICIPDatasetMlOcr> findByFileName(String filename);
	
	/**
	 * Find by Consuming Entity.
	 *
	 * @param consumingEntity the Consuming Entity
	 * @return the Dataset MlOcr
	 */
	public ICIPDatasetMlOcr findByConsumingEntity(String consumingentity);
	
	/**
	 * Find by Consuming Entity.
	 *
	 * @param consumingEntity the Consuming Entity
	 * @return the list
	 */
	@Query("SELECT c FROM ICIPDatasetMlOcr c WHERE c.consumingEntity = ?2 and c.fileName =?1 and c.pageNo =?3")
	public ICIPDatasetMlOcr findByConsumingEntityAndFileNameAndPageNo(String filename,String consumingentity,String pageno);

	@Query("SELECT postResponseId FROM ICIPDatasetMlOcr WHERE  id = :id")
	String findPostResponseIdById(@Param("id") int id);
	
	@Modifying
	@Transactional
	@Query("UPDATE ICIPDatasetMlOcr SET analysisResults = :analysisResults WHERE id = :id")
	public int updateAnalysisResultsById(@Param("analysisResults") String analysisResults,@Param("id") int id);
	
	@Modifying
	@Transactional
	@Query("UPDATE ICIPDatasetMlOcr SET analysisResults = :analysisResults, consumingEntity = :consumingEntity WHERE id = :id")
	public int updateAnalysisResultsAndConsumingEntityById(@Param("analysisResults") String analysisResults, @Param("consumingEntity") String consumingEntity, @Param("id") int id);
	
	@Query("SELECT fileUploadId FROM ICIPDatasetMlOcr WHERE  id = :id")
	String findFileUploadIdById(@Param("id") int id);
	
	@Query("SELECT analysisResults FROM ICIPDatasetMlOcr WHERE  id = :id")
	String findAnalysisResultsId(@Param("id") int id);
	
	@Modifying
	@Transactional
	@Query("UPDATE ICIPDatasetMlOcr SET consumingEntity = :consumingEntity WHERE id = :id")
	public int updateConsumingEntityById(@Param("id") int id, @Param("consumingEntity") String consumingEntity);

	public List<ICIPDatasetMlOcr> findByConsumingEntityAndOrg(String consumingEntity, String org);
	
	@Query("SELECT c FROM ICIPDatasetMlOcr c WHERE  c.consumingEntity LIKE %:prefix% AND c.org =:org GROUP BY  c.consumingEntity")
	public List<ICIPDatasetMlOcr> findQualityAuditData(@Param("prefix")String prefix,  @Param("org")String org);
	
	@Query("SELECT c FROM ICIPDatasetMlOcr c WHERE  c.consumingEntity LIKE %:prefix% AND c.org =:org AND c.taggedOn IS NOT NULL GROUP BY  c.consumingEntity")
	public List<ICIPDatasetMlOcr> findQualityAuditDataFlagged(@Param("prefix")String prefix,  @Param("org")String org);
	
	
	@Modifying
	@Transactional
	@Query("UPDATE ICIPDatasetMlOcr SET taggedOn = :taggedOn WHERE id = :id")
	public int setQualityAuditFlag(@Param("id") int id,@Param("taggedOn")Timestamp taggedOn);

	@Query("SELECT c FROM ICIPDatasetMlOcr c WHERE  c.documentId = :documentId AND c.org = :org")
	public List<ICIPDatasetMlOcr> findByDocumentId(@Param("documentId")String documentId, @Param("org")String org);
	
	@Query("SELECT c FROM ICIPDatasetMlOcr c WHERE  c.fileName = :fileName AND c.fileType = :fileType AND c.org = :org AND c.consumingEntity = :consumingEntity")
	public ICIPDatasetMlOcr findByfilename(@Param("fileName")String fileName, @Param("fileType")String fileType, @Param("org")String org,  @Param("consumingEntity") String consumingEntity );

	@Query("SELECT c FROM ICIPDatasetMlOcr c where c.documentId = :documentId AND c.pageNo = :pageNo")
	List<ICIPDatasetMlOcr> getListOfTranslateLanguage(@Param("documentId")String documentId, @Param("pageNo")int pageNo);
	
	@Query("SELECT targetLanguage FROM ICIPDatasetMlOcr c where c.consumingEntity = :consumingEntity AND c.org = :org ORDER BY lastUpdatedDate")
	public List<String> getLastUpdatedlanguage(@Param("consumingEntity")String consumingEntity, @Param("org")String org);
	
	@Query("SELECT c FROM ICIPDatasetMlOcr c WHERE  c.documentId = :documentId AND c.org = :org AND c.targetLanguage = :targetLanguage")
	public List<ICIPDatasetMlOcr> findByDocumentIdAndLanguage(@Param("documentId")String documentId, @Param("org")String org,  @Param("targetLanguage")String targetLanguage);
}
