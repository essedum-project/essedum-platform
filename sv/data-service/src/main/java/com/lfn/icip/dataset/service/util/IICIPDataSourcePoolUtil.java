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

import java.sql.SQLException;

import javax.sql.DataSource;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPDataSourcePoolUtil.
 *
 * @author essedum
 */
public interface IICIPDataSourcePoolUtil {
	
	/**
	 * Gets the datasource.
	 *
	 * @param server the server
	 * @param db the db
	 * @param user the user
	 * @param pass the pass
	 * @return the datasource
	 * @throws SQLException the SQL exception
	 */
	public DataSource getDatasource(String server, String db, String user, String pass) throws SQLException;

	/**
	 * Gets the datasource.
	 *
	 * @param key the key
	 * @param ds the ds
	 * @return the datasource
	 */
	public DataSource getDatasource(String key, DataSource ds);

	/**
	 * Delete datasource.
	 *
	 * @param url the url
	 */
	public void deleteDatasource(String url);
}
