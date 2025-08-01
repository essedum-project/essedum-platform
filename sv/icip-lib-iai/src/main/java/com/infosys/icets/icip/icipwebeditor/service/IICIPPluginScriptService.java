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
