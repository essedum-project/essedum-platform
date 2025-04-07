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

import java.util.Map;

import com.infosys.icets.icip.icipwebeditor.model.ICIPPluginScript;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPPluginService.
 *
 * @author icets
 */
public interface IICIPPluginScriptService {

	/**
	 * Fetch all.
	 *
	 * @return the string
	 */
	public String fetchAll();

	/**
	 * Fetch by type.
	 *
	 * @param type the type
	 * @return the string
	 */
	public String fetchByType(String type);

	/**
	 * Save.
	 *
	 * @param string      the string
	 * @param schemaValue the schema value
	 * @param type the type
	 * @return the ICIP plugin
	 */
	public ICIPPluginScript save(String string, String schemaValue, String type,String pluginName);


	public String updateScript(String pluginName, String script);

}
