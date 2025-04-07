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
package com.infosys.icets.icip.dataset.service.util;

import java.util.Map;
 
// TODO: Auto-generated Javadoc
/**
 * The Interface IICIPDataSetServiceUtil.
 *
 * @author icets
 */
public interface IICIPMlopsServiceUtil {

	String datasetsCreate(String datasetbody, String adapterInstance, String project, Map<String, String> headers,
			Map<String, String> params);

	String getDatasetsList(String adapterInstance, String project, Map<String, String> headers,
			Map<String, String> params);

	String getDatasets( String adapterInstance, String project, Map<String, String> headers,
			Map<String, String> params);

	String deleteDataset(String adapterInstance, String project, Map<String, String> headers,
			Map<String, String> params);

	String exportDatasets(String datasetbody, String adapterInstance, String project, Map<String, String> headers,
			Map<String, String> params);

	String createTrainingPipelines(String datasetbody, String adapterInstance, String project,
			Map<String, String> headers, Map<String, String> params);

	String trainingCustomScriptCreate(String datasetbody, String adapterInstance, String project,
			Map<String, String> headers, Map<String, String> params);

	String listTraining(String adapterInstance, String project, Map<String, String> headers,
			Map<String, String> params);

	String createTrain(String datasetbody, String adapterInstance, String project, Map<String, String> headers,
			Map<String, String> params);

	String trainingCancelList(String adapterInstance, String project, Map<String, String> headers,
			Map<String, String> params);

	String deleteTraining(String adapterInstance, String project, Map<String, String> headers,
			Map<String, String> params);

	String getTrainingList(String adapterInstance, String project, Map<String, String> headers,
			Map<String, String> params);

	String createInferencePipeline(String datasetbody, String adapterInstance, String project,
			Map<String, String> headers, Map<String, String> params);

	String listInferencePipeline(String adapterInstance, String project,
			Map<String, String> headers, Map<String, String> params);

	String deleteInferencePipeine(String adapterInstance, String project,
			Map<String, String> headers, Map<String, String> params);

	String inferencePipelineCancel(String datasetbody, String adapterInstance, String project,
			Map<String, String> headers, Map<String, String> params);

	String getInferencePipelineList(String datasetbody, String adapterInstance, String project,
			Map<String, String> headers, Map<String, String> params);

		
	
}
