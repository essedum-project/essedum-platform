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

import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Component;

import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDataSetServiceUtilMySQLPoolMap.
 *
 * @author icets
 */
@Component
@RefreshScope
public class ICIPDataSetServiceUtilMySQLPoolMap {

	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(ICIPDataSetServiceUtilMySQLPoolMap.class);

	/** The hikari max pool size. */
	@LeapProperty("icip.hikari-max-pool-size")
	private String hikariMaxPoolSize;

	/** The connection timeout. */
	@LeapProperty("icip.connectionTimeout")
	private String connectionTimeout;

	/** The idle timeout. */
	@LeapProperty("icip.idleTimeout")
	private String idleTimeout;

	/** The max lifetime. */
	@LeapProperty("icip.maxLifetime")
	private String maxLifetime;

	/** The leak detection threshold. */
	@LeapProperty("icip.leakDetectionThreshold")
	private String leakDetectionThreshold;

	/** The datasource map. */
	private Map<String, DataSource> datasourceMap = new ConcurrentHashMap<>();

	/** The Constant JDBC_DRIVER_CLASS. */
	private static final String JDBC_DRIVER_CLASS = "com.mysql.cj.jdbc.Driver";

	/** The lock. */
	private final Object lock = new Object();

	/**
	 * Gets the datasource.
	 *
	 * @param server the server
	 * @param user   the user
	 * @param pass   the pass
	 * @return the datasource
	 * @throws SQLException             the SQL exception
	 * @throws NoSuchAlgorithmException
	 */
	public DataSource getDatasource(String server, String user, String pass)
			throws SQLException {
		synchronized (lock) {
			String key = generateKey(server, user, pass);
			logger.info("Key : {} for server : {}, user : {} and pass : [password:YES]", key, server, user);
			logger.info("finding datasource from connection pool : {} and key : {}", datasourceMap, key);
			if (datasourceMap.containsKey(key)) {
				logger.info("found datasource with key {}", key);
				if (validateDatasource(key)) {
					return datasourceMap.get(key);
				} else {
					removeInvalidPool(key);
				}
			}
			try {
				return createNewDatasource(server, user, pass);
			} catch (NoSuchAlgorithmException e) {
				
				logger.error(e.getMessage(), e);
			}
		}
		return null;
	}

	public void deleteDatasource(String server, String user, String pass) throws NoSuchAlgorithmException {
		String key = generateKey(server, user, pass);
		removeInvalidPool(key);
		logger.info("Key : {} deleted from poolmap", key);
	}

	private String generateKey(String server, String user, String pass) {
		try {
			return ICIPUtils.createHashString(String.format("%s%s%s", server, user, pass));
		} catch (NoSuchAlgorithmException e) {
			
			logger.error(e.getMessage(), e);
		}
		return null;
		
	}

	private boolean validateDatasource(String key) {
		logger.info("Checking Key : {} in poolmap", key);
		try {
			if (datasourceMap.get(key) != null) {
				datasourceMap.get(key).getConnection().close();
				logger.info("Connection found! {}", key);
				return true;
			}
		} catch (Exception ex) {
			logger.error("Datasource Connection Issue : {}", ex.getMessage());
		}
		logger.info("Connection not found! {}", key);
		return false;
	}

	private void removeInvalidPool(String key) {
		if (datasourceMap.get(key) != null) {
			HikariDataSource ds = (HikariDataSource) datasourceMap.get(key);
			ds.close();
		}
		logger.error("Removing Datasource {}", key);
		datasourceMap.remove(key);
	}

	
	/**
	 * @param server
	 * @param user
	 * @param pass
	 * @return
	 * @throws NoSuchAlgorithmException
	 */
	private DataSource createNewDatasource(String server, String user, String pass) throws NoSuchAlgorithmException {
		String key = generateKey(server, user, pass);
		logger.info("creating new datasource with key {}", key);
		DataSource newDS = createDatasource(server, user, pass);
		try {
			newDS.getConnection().close();
		} catch (Exception ex) {
			logger.error("destroying pool (Key : {})", key);
			HikariDataSource ds = (HikariDataSource) newDS;
			ds.close();
			return null;
		}
		datasourceMap.put(key, newDS);
		logger.info("connection pool map : {} with new key : {}", datasourceMap, key);
		return newDS;
	}

	/**
	 * Creates the datasource.
	 *
	 * @param server the server
	 * @param user   the user
	 * @param pass   the pass
	 * @return the data source
	 */
	private DataSource createDatasource(String server, String user, String pass) {
		HikariConfig config = new HikariConfig();
		config.setJdbcUrl(server);
		config.setDriverClassName(JDBC_DRIVER_CLASS);
		config.setUsername(user);
		config.setPassword(pass);
		config.setMaximumPoolSize(Integer.parseInt(hikariMaxPoolSize));
		config.setConnectionTimeout(Integer.parseInt(connectionTimeout));
		config.setIdleTimeout(Integer.parseInt(idleTimeout));
		config.setMaxLifetime(Integer.parseInt(maxLifetime));
		return new HikariDataSource(config);
	}

}
