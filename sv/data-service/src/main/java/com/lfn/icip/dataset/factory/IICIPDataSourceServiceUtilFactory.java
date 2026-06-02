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

package com.lfn.icip.dataset.factory;

import com.lfn.icip.dataset.service.util.ICIPDataSourceServiceUtilRestAbstract;
import com.lfn.icip.dataset.service.util.IICIPDataSourceServiceUtil;

// TODO: Auto-generated Javadoc
// 
/**
 * A factory for creating IICIPDataSourceServiceUtil objects.
 *
 * @author essedum
 */
public interface IICIPDataSourceServiceUtilFactory {
	
	/**
	 * Gets the data source util.
	 *
	 * @param name the name
	 * @return the data source util
	 */
	IICIPDataSourceServiceUtil getDataSourceUtil(String name);
	
	/**
	 * Gets the data source util rest.
	 *
	 * @param name the name
	 * @return the data source util rest
	 */
	ICIPDataSourceServiceUtilRestAbstract getDataSourceUtilRest(String name);
}
