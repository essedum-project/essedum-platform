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

package com.lfn.icip.dataset.service.util;

import java.util.Map;
 
// TODO: Auto-generated Javadoc
/**
 * The Interface IICIPDataSetServiceUtil.
 *
 * @author essedum
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
