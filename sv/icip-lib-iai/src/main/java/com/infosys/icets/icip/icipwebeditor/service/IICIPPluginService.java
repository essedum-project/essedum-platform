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

import java.util.List;
import java.util.Map;

import com.infosys.icets.icip.icipwebeditor.model.ICIPPlugin;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPPluginService.
 *
 * @author icets
 */
public interface IICIPPluginService {
	
	// to get all plugins from mlplugins
	public List<ICIPPlugin> findAll();
	
	public List<ICIPPlugin> findByOrg(String org);
	
	// to add new plugin
	public boolean save(ICIPPlugin plugin);
	
	// to update config
	public ICIPPlugin updateConfig(String config, String type, String org);
	
	// to update config
	public ICIPPlugin updatePlugin(String updateJson, int id);
	
	// to delete a plugin
	public boolean delete(String name, String org);

	public ICIPPlugin getPluginByTypeAndOrg(String type, String org);

	public List<ICIPPlugin> findPluginByOrg(String org);

}
