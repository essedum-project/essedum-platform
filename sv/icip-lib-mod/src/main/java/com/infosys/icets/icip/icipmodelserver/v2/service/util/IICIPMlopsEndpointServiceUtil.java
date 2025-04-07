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
package com.infosys.icets.icip.icipmodelserver.v2.service.util;

import com.infosys.icets.icip.icipmodelserver.v2.model.dto.ICIPPolyAIRequestWrapper;
import com.infosys.icets.icip.icipmodelserver.v2.model.dto.ICIPPolyAIResponseWrapper;
 
// TODO: Auto-generated Javadoc
/**
 * The Interface IICIPDataSetServiceUtil.
 *
 * @author icets
 */
public interface IICIPMlopsEndpointServiceUtil {

	ICIPPolyAIResponseWrapper createEndpoints(ICIPPolyAIRequestWrapper request);

	ICIPPolyAIResponseWrapper getEndpointsList(ICIPPolyAIRequestWrapper request);

	ICIPPolyAIResponseWrapper readEndpoints(ICIPPolyAIRequestWrapper request);

	ICIPPolyAIResponseWrapper deleteEndpoints(ICIPPolyAIRequestWrapper request);

	ICIPPolyAIResponseWrapper endpointsDeployModel(ICIPPolyAIRequestWrapper request);

	ICIPPolyAIResponseWrapper explainEndpoints(ICIPPolyAIRequestWrapper request);

	ICIPPolyAIResponseWrapper inferEndpoints(ICIPPolyAIRequestWrapper request);

	ICIPPolyAIResponseWrapper endpointsUndeployModels(ICIPPolyAIRequestWrapper request);

		
	
}
