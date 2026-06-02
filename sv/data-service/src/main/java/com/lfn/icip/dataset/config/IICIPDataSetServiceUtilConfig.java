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

package com.lfn.icip.dataset.config;

import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.config.ServiceLocatorFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import com.lfn.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
import com.lfn.icip.dataset.factory.IICIPDataSourcePoolUtilFactory;
import com.lfn.icip.dataset.factory.IICIPDataSourceServiceUtilFactory;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class IICIPDataSetServiceUtilConfig.
 *
 * @author essedum
 */
@Configuration
@ComponentScan(basePackages = { "com.lfn.icip.dataset.service.util", "com.lfn.icip.plugins.service.util" })
public class IICIPDataSetServiceUtilConfig {

	/**
	 * Data source service locator factory bean.
	 *
	 * @return the factory bean
	 */
	@Bean
	public FactoryBean dataSourceServiceLocatorFactoryBean() {
		ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
		factoryBean.setServiceLocatorInterface(IICIPDataSourceServiceUtilFactory.class);
		return factoryBean;
	}

	/**
	 * Data set service locator factory bean.
	 *
	 * @return the factory bean
	 */
	@Bean
	public FactoryBean dataSetServiceLocatorFactoryBean() {
		ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
		factoryBean.setServiceLocatorInterface(IICIPDataSetServiceUtilFactory.class);
		return factoryBean;
	}

	/**
	 * Data source pool locator factory bean.
	 *
	 * @return the factory bean
	 */
	@Bean
	public FactoryBean dataSourcePoolLocatorFactoryBean() {
		ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
		factoryBean.setServiceLocatorInterface(IICIPDataSourcePoolUtilFactory.class);
		return factoryBean;
	}
}
