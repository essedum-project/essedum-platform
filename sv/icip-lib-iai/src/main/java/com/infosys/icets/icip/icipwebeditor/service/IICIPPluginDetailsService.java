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
package com.infosys.icets.icip.icipwebeditor.service;

import com.infosys.icets.icip.icipwebeditor.model.ICIPPluginDetails;
import java.util.List;

//TODO: Auto-generated Javadoc
//
/**
* The Interface IICIPPluginService.
*
* @author icets
*/
public interface IICIPPluginDetailsService {

	// to get plugin details by distinct type
	public List<ICIPPluginDetails> fetchByTypeAndOrg(String type, String org);
	
	public int fetchCountByType(String type);

	// to add new plugin node	
	public ICIPPluginDetails save(ICIPPluginDetails nodeDetails);

	// to update plugin node
	public ICIPPluginDetails updateNode(String pluginName, String pluginValue, String org);

	// to delete pluginNodes from mlpluginDetails
	public boolean delete(String name,String org);
}
