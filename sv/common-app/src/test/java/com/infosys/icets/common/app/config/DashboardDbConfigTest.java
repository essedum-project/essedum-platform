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

import static org.junit.jupiter.api.Assertions.assertNotNull;

import jakarta.persistence.EntityManagerFactory;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.infosys.icets.common.app.config.DashboardDbConfig;

public class DashboardDbConfigTest {

	DashboardDbConfig dashboardDbConfig = new DashboardDbConfig();

	@Test
	public void testDataSourceProperties() throws Exception {
		assertNotNull(dashboardDbConfig.dataSourceProperties());
	}

	@Test
	public void testJpaProperties() throws Exception {
		assertNotNull(dashboardDbConfig.jpaProperties());
	}

	@Test
	public void testTransactionManager() throws Exception {
		EntityManagerFactory entityManagerFactory  = Mockito.mock(EntityManagerFactory.class);
		assertNotNull(dashboardDbConfig.transactionManager(entityManagerFactory));
	}

	@Test
	public void testPasswordEncoder() throws Exception {
		assertNotNull(dashboardDbConfig.passwordEncoder());
	}

}
