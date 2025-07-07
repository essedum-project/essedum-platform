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

import java.lang.reflect.Field;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.ReflectionUtils;
import org.springframework.util.ReflectionUtils.FieldCallback;

import com.infosys.common.lib.rest.RestClientUtil;

import lombok.extern.log4j.Log4j2;

@Log4j2
public class LeapPropertiesFieldCallbackV2 implements FieldCallback {
	
	private String commonAppUrl;

	private static String ERROR_PROPERTY_NOT_FOUND = "@LeapProperties(entity) does not exist in the constant DB.";
	private Object value;

	public LeapPropertiesFieldCallbackV2(Object value,@Value("${commonAppUrl}") String commonAppUrl) {
		this.value = value;
		this.commonAppUrl = commonAppUrl;
	}

	@Override
	public void doWith(Field field) throws IllegalAccessException {
		if (!field.isAnnotationPresent(LeapPropertiesV2.class)) {
			return;
		}
		ReflectionUtils.makeAccessible(field);
		String key = field.getDeclaredAnnotation(LeapPropertiesV2.class).value();
		try {
			String result = RestClientUtil.getApiCall(commonAppUrl + "api/get-startup-constants/array/" + key+"/Core","");
			field.set(value, Arrays.asList(result));
		} catch (Exception ex) {
			String error = String.format("%s : Key %s", ERROR_PROPERTY_NOT_FOUND, key);
			log.error(error, ex);
			throw new IllegalArgumentException(error);
		}
	}

}