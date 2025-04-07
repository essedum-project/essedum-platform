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
package com.infosys.common.lib.annotation;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.stereotype.Component;
import org.springframework.util.ReflectionUtils;
import org.springframework.util.ReflectionUtils.FieldCallback;


@Component
public class LeapPropertiesAnnotationProcessorV2 implements BeanPostProcessor {

	@Value("${commonAppUrl}")
	private String commonAppUrl;
	
	@Override
	public Object postProcessBeforeInitialization(Object value, String beanName) {
		this.scanDataAccessAnnotation(value);
		return value;
	}

	@Override
	public Object postProcessAfterInitialization(Object value, String beanName) {
		return value;
	}

	protected void scanDataAccessAnnotation(Object value) {
		this.configureFieldInjection(value);
	}

	private void configureFieldInjection(Object value) {
		Class<?> managedBeanClass = value.getClass();
		FieldCallback fieldCallback = new LeapPropertiesFieldCallbackV2(value,commonAppUrl);
		ReflectionUtils.doWithFields(managedBeanClass, fieldCallback);
	}

}
