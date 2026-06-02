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

package com.lfn.icip.icipwebeditor.service;

import com.lfn.icip.icipwebeditor.model.ICIPPluginDetails;
import java.util.List;

//TODO: Auto-generated Javadoc
//
/**
* The Interface IICIPPluginService.
*
* @author essedum
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
