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
package com.infosys.icets.common.app.config;

import java.io.IOException;

import org.ehcache.CacheManager;
import org.ehcache.config.builders.CacheManagerBuilder;
import org.ehcache.xml.XmlConfiguration;
import org.ehcache.xml.exceptions.XmlConfigurationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.ClassPathResource;

/**
 * The Class CacheConfig.
 *
 * @author icets
 */
@Configuration
@EnableCaching
@Primary
public class CacheConfig {
	private final static Logger logger = LoggerFactory.getLogger(CacheConfig.class);

	@Bean(name = "cacheManagerBean")
	public CacheManager getCacheManager() throws XmlConfigurationException, IOException {
		CacheManager cm;
		ClassPathResource resource = new ClassPathResource("ehcache.xml");
		XmlConfiguration xmlConfig = new XmlConfiguration(resource.getURL());
		cm = CacheManagerBuilder.newCacheManager(xmlConfig);
		cm.init();
		try {
			xmlConfig = new XmlConfiguration(resource.getURL());
		} catch (XmlConfigurationException e) {
			logger.error(e.getMessage());

		} catch (IOException e) {
			logger.error(e.getMessage());
		}

		return cm;
	}
}
