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

import java.sql.SQLException;

import javax.sql.DataSource;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPDataSourcePoolUtil.
 *
 * @author icets
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
