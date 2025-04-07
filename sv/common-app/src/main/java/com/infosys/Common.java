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
package com.infosys;

import jakarta.servlet.MultipartConfigElement;

import java.nio.file.Files;
import java.nio.file.Paths;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.util.unit.DataSize;
import org.springframework.web.client.RestTemplate;

import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.ai.comm.licenseValidator.LicenseValidator;

import lombok.Setter;

import javax.sql.DataSource;

// 
/**
 * The Class COMMON.
 *
 * @author icets
 */
@SpringBootApplication
@RefreshScope
@ServletComponentScan
@ComponentScan(basePackages = { "com.infosys", "macrobase" })
@EnableAspectJAutoProxy(proxyTargetClass = true)
@EnableAsync
@EnableScheduling
@EnableCaching
@Setter
public class Common {
	
	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(Common.class);

	/**
	 * The main method.
	 *
	 * @param args the arguments
	 * @throws Exception the exception
	 */
	public static void main(String[] args) throws Exception {
		if (null == System.getProperty("license.path")) {
			String licenseContent = System.getProperty("license");
			String publicKeyFileContent = System.getProperty("publickey");
			if (null == licenseContent){
				throw new IllegalArgumentException("Please provide license file as an argument");
			}
			if (null == publicKeyFileContent){
				throw new IllegalArgumentException("Please provide public key as an argument");
			}
			if (LicenseValidator.decryptAndValidateLicense(licenseContent,publicKeyFileContent)) {
				logger.info("License is valid");
				SpringApplication.run(Common.class, args);
				
			} else {
				throw new LeapException("Please check the license file");
			}	
		}
		else if (null == System.getProperty("license")) {
			String licensePath = System.getProperty("license.path");
			String publicKeyFilePath = System.getProperty("publickey.path");
			String licenseContent = new String(Files.readAllBytes(Paths.get(licensePath)));
			String publicKeyFileContent = new String(Files.readAllBytes(Paths.get(publicKeyFilePath)));
			if (null == licensePath){
				throw new IllegalArgumentException("Please provide license file path as an argument");
			}
			if (null == publicKeyFilePath){
				throw new IllegalArgumentException("Please provide public key path as an argument");
			}
			if (LicenseValidator.decryptAndValidateLicense(licenseContent,publicKeyFileContent)) {
				logger.info("License is valid");
				SpringApplication.run(Common.class, args);
				
			} else {
				throw new LeapException("Please check the license file");
			}	
		}
		else {
			throw new LeapException("Please check the arguments");
			}
	
	}

	/**
	 * Multipart config element.
	 *
	 * @return the multipart config element
	 */
	@Bean
	MultipartConfigElement multipartConfigElement() {
		MultipartConfigFactory factory = new MultipartConfigFactory();
		factory.setMaxFileSize(DataSize.ofBytes(314572800L));
		factory.setMaxRequestSize(DataSize.ofBytes(314572800L));
		return factory.createMultipartConfig();
	}

	/**
	 * Rest template.
	 *
	 * @return the rest template
	 */
	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

	@Bean
	@RefreshScope
	DataSource dataSource(DataSourceProperties properties) {
		DataSource db = DataSourceBuilder
				.create()
				.url(properties.getUrl())
				.username(properties.getUsername())
				.password(properties.getPassword())
				.build();
		logger.info("Rebuilding datasource with new configuration");
		return  db;
	}

}
