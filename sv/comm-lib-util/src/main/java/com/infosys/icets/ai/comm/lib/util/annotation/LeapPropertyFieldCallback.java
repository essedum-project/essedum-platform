/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.ai.comm.lib.util.annotation;

import java.lang.reflect.Field;

import org.springframework.util.ReflectionUtils;
import org.springframework.util.ReflectionUtils.FieldCallback;

import com.infosys.icets.ai.comm.lib.util.annotation.service.ConstantsService;

import lombok.extern.log4j.Log4j2;

@Log4j2
public class LeapPropertyFieldCallback implements FieldCallback {

	private static String ERROR_PROPERTY_NOT_FOUND = "@LeapProperty(entity) does not exist in the constant DB.";
	private Object value;
	private ConstantsService constantsService;

	public LeapPropertyFieldCallback(Object value, ConstantsService constantsService) {
		this.value = value;
		this.constantsService = constantsService;
	}

	@Override
	public void doWith(Field field) throws IllegalAccessException {
		if (!field.isAnnotationPresent(LeapProperty.class)) {
			return;
		}
		ReflectionUtils.makeAccessible(field);
		String key = field.getDeclaredAnnotation(LeapProperty.class).value();
		try {
			field.set(value, constantsService.findByKeys(key, "Core").trim());
		} catch (Exception ex) {
			String error = String.format("%s : Key %s", ERROR_PROPERTY_NOT_FOUND, key);
			log.error(error, ex);
			throw new IllegalArgumentException(error);
		}
	}

}