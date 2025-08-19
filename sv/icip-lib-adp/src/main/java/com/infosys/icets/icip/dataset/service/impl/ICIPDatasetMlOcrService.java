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

package com.infosys.icets.icip.dataset.service.impl;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.tools.ant.types.resources.Last;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Service;

import com.github.javaparser.utils.Log;
import com.infosys.icets.ai.comm.lib.util.annotation.service.ConstantsService;
import com.infosys.icets.icip.dataset.model.ICIPDatasetMlOcr;
import com.infosys.icets.icip.dataset.repository.ICIPDatasetMlOcrRepository;
import com.infosys.icets.icip.dataset.service.IICIPDatasetMlOcrService;

@Service
@RefreshScope
public class ICIPDatasetMlOcrService implements IICIPDatasetMlOcrService{
	
	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(ICIPDatasetMlOcrService.class);
	
	@Autowired
	private ICIPDatasetMlOcrRepository datasetMlOcrRepository;
	
	@Autowired
	private ConstantsService dashConstantService;

	@Override
	public ICIPDatasetMlOcr save(ICIPDatasetMlOcr icipdatasetmlocr) {
		logger.info("Saving dataset MlOcr");
		return datasetMlOcrRepository.save(icipdatasetmlocr);
		
	}
	
	@Override
	public List<ICIPDatasetMlOcr> findAll() {
		logger.info("fetching all entries of dataset MlOcr");
		return datasetMlOcrRepository.findAll();
		
	}
	
	@Override
	public ICIPDatasetMlOcr findById(int id) {
		logger.info("finding the entery for id: {}",id);
		return datasetMlOcrRepository.findById(id);
		
	}
	
	@Override
	public void update(String id,ICIPDatasetMlOcr icipdatasetmlocr) {
		logger.info("updating the entry of dataset MlOcr for id: {}",id);
		datasetMlOcrRepository.save(icipdatasetmlocr);
		
	}
	
	@Override
	public void delete(ICIPDatasetMlOcr icipdatasetmlocr) {
		logger.info("deleting the entry of dataset MlOcr");
		 datasetMlOcrRepository.delete(icipdatasetmlocr);
		
	}
	
	@Override
	public List<ICIPDatasetMlOcr> findFile(String filename){
		 logger.info("finding the file by name :{}",filename);
		 return datasetMlOcrRepository.findByFileName(filename);
		
	}
	
	@Override
	public ICIPDatasetMlOcr findFile(String filename,String pageno){
		 logger.info("finding the file by name :{} and page number: {}",filename,pageno);
		 return datasetMlOcrRepository.findByFileNameAndPageNo(filename,pageno);
		
	}
	
	@Override
	public ICIPDatasetMlOcr findFile(String filename,String consumingentity,String pageno){
		 logger.info("finding the file by name :{} and consumingentity: {} and page number: {}",filename,pageno,consumingentity);
		 return datasetMlOcrRepository.findByConsumingEntityAndFileNameAndPageNo(filename,consumingentity, pageno);
		
	}
	
	@Override
	public String getPostResponseIdById(int id) {
		 logger.info("getting post response Id for {}",id);
		 return datasetMlOcrRepository.findPostResponseIdById(id);
		
	}
	
	@Override
	public int updateAnalysisResultsById(String analysisResults,int id) throws Exception {
		 logger.info("Updating Analysis Results For: {}",id);
		 datasetMlOcrRepository.updateAnalysisResultsById(analysisResults, id);
		 return id;
	}
	
	@Override
	public int updateAnalysisResultsAndConsumingEntityById(String analysisResults, int id, String consumingEntity) throws Exception {
		 logger.info("Updating Analysis Results And Consuming Entity For: {}",id);
		 datasetMlOcrRepository.updateAnalysisResultsAndConsumingEntityById(analysisResults, consumingEntity, id);
		 return id;
	}
	
	@Override
	public String getFileUploadId(int id) {
		 logger.info("getting File Upload Id for {}",id);
		 return datasetMlOcrRepository.findFileUploadIdById(id);	
	}
	
	
	@Override
	public String getAnalysisResults(int id) {
		logger.info("getting Analysis Results for {}",id);
		 return datasetMlOcrRepository.findAnalysisResultsId(id);
	}
	
	
	@Override
	public List<String> updateConsumingEntityById(List<Integer> idList, String consumingEntity){
		List<String> updatedIdList = new ArrayList<>();
		idList.forEach(id -> {
		  try {
			  updatedIdList.add(Integer.valueOf(datasetMlOcrRepository.updateConsumingEntityById(id, consumingEntity)).toString());
		  }
		  catch(Exception ex) {
			  logger.error(ex.getMessage());
		  }
		});
		return updatedIdList;
	}
	
	@Override
	public List<JSONObject> getIdUploadIdResultsByConsumingEntity(String consumingEntity, String org) throws Exception{
		List<JSONObject> idAndResultList = new ArrayList<>();
		String lastUpdateLanguage = datasetMlOcrRepository.getLastUpdatedlanguage(consumingEntity, org).get(0);
		if(lastUpdateLanguage == null)
		{
			datasetMlOcrRepository.findByConsumingEntityAndOrg(consumingEntity, org)
			.stream().forEach(ele->{if(ele.getTargetLanguage() == null) {
				idAndResultList.add(
					new JSONObject()
					.put("id", ele.getId())
					.put("fileUploadId",ele.getFileUploadId())
					.put("analysisResults",ele.getAnalysisResults())
					.put("QAFlag",(ele.getTaggedOn() != null)?ele.getTaggedOn().toString():"")
					.put("currentLanguage", lastUpdateLanguage)
					.put("documentId", ele.getDocumentId())
				);
			}});
		}
		else {
		datasetMlOcrRepository.findByConsumingEntityAndOrg(consumingEntity, org)
		.stream().forEach(ele->{if(ele.getTargetLanguage().equals(lastUpdateLanguage)) {
			idAndResultList.add(
				new JSONObject()
				.put("id", ele.getId())
				.put("fileUploadId",ele.getFileUploadId())
				.put("analysisResults",ele.getAnalysisResults())
				.put("QAFlag",(ele.getTaggedOn() != null)?ele.getTaggedOn().toString():"")
				.put("currentLanguage", lastUpdateLanguage)
				.put("documentId", ele.getDocumentId())
			);
		}});
	}
		return idAndResultList;
	}
	
	@Override
	public List<JSONObject> findQualityAuditData(String prefix,String org,String flag) {
		List<JSONObject> idAndResultList = new ArrayList<>();
		
		if(flag.equals("All")) {
			
			datasetMlOcrRepository.findQualityAuditData(prefix, org)
			.stream().forEach(ele->{
				idAndResultList.add(
					new JSONObject()
					.put("Filename", ele.getFileName())
					.put("Page Number",String.valueOf(ele.getPageNo()+1))
					.put("Consuming Entity",ele.getConsumingEntity())
					.put("Tagged On",ele.getTaggedOn())
					.put("Retrained On", ele.getRetrainedOn())
					
					
					);
				
			});
			
		}
		else {
			datasetMlOcrRepository.findQualityAuditDataFlagged(prefix, org)
			.stream().forEach(ele->{
				idAndResultList.add(
						new JSONObject()
						.put("Filename", ele.getFileName())
						.put("Page Number",String.valueOf(ele.getPageNo()+1))
						.put("Consuming Entity",ele.getConsumingEntity())
						.put("Tagged On",ele.getTaggedOn())
						.put("Retrained On", ele.getRetrainedOn())
						
						);
			});
		}
//		Log.info("Fetching Quality Audit Data for prefix "+prefix+"and organization "+org);
		return idAndResultList;
	}
	
	@Override
	public void tagCaseForAudit(Timestamp taggedOn,int id) {
		datasetMlOcrRepository.setQualityAuditFlag(id,taggedOn);
	}

	public List<JSONObject> findById(String documentId, String targetLanguage, String org) {
		List<JSONObject> idAndResultList = new ArrayList<>();
		if(targetLanguage.isEmpty() || targetLanguage.isEmpty() || targetLanguage.equals("null")) {
			datasetMlOcrRepository.findByDocumentId(documentId, org)
			.stream().forEach(ele->{
				idAndResultList.add(
					new JSONObject()
					.put("id", ele.getId())
					.put("fileUploadId",ele.getFileUploadId())
					.put("analysisResults",ele.getAnalysisResults())
					.put("QAFlag",(ele.getTaggedOn() != null)?ele.getTaggedOn().toString():"")
//					.put("currentLanguage", lastUpdateLanguage)
					.put("documentId", ele.getDocumentId())
				);
			});
		}else {
			datasetMlOcrRepository.findByDocumentIdAndLanguage(documentId, org, targetLanguage)
			.stream().forEach(ele->{
				idAndResultList.add(
					new JSONObject()
					.put("id", ele.getId())
					.put("fileUploadId",ele.getFileUploadId())
					.put("analysisResults",ele.getAnalysisResults())
					.put("QAFlag",(ele.getTaggedOn() != null)?ele.getTaggedOn().toString():"")
//					.put("currentLanguage", lastUpdateLanguage)
					.put("documentId", ele.getDocumentId())
				);
			});
		}
		return idAndResultList;
		
	}
	
	public List<String> getLastUpdatedlanguage(String consumingEntity,String org) {
		return datasetMlOcrRepository.getLastUpdatedlanguage(consumingEntity, org);
		
	}
	public List<ICIPDatasetMlOcr> getListOfTranslateLanguage(String documentId, int pageNo) {
		return datasetMlOcrRepository.getListOfTranslateLanguage(documentId, pageNo);
		
	}
	
	@Override
	public List<JSONObject> getFileName(String consumingEntity, String org) throws Exception{
		List<JSONObject> idAndResultList = new ArrayList<>();
		String languageCode = dashConstantService.findByKeys("content_extraction_language","core");
		JSONObject json = new JSONObject(languageCode);
		datasetMlOcrRepository.findByConsumingEntityAndOrg(consumingEntity, org)
		.stream()
		.collect(Collectors.groupingBy(ICIPDatasetMlOcr::getDocumentType)).entrySet()
		.forEach(ele->{
			
			List<JSONObject> innerList = ele.getValue().stream().map(el -> {
				return new JSONObject().put("documentId", el.getDocumentId()).put("fileName", el.getFileName()).put(el.getTargetLanguage(), json.get(el.getTargetLanguage()));
			}).collect(Collectors.toList());
//			Set<Integer> set = new HashSet<>(items.size());
//			items.removeIf(p -> !set.add(p));
			idAndResultList.add(new JSONObject().put(ele.getKey(), innerList));
						});
		
		return idAndResultList;
	}
	
	@Override
	public ICIPDatasetMlOcr findByfilename(String filename,String filetype,String org,String consumingentity) {
		return datasetMlOcrRepository.findByfilename(filename, filetype, org, consumingentity);
	}
	
	
}
