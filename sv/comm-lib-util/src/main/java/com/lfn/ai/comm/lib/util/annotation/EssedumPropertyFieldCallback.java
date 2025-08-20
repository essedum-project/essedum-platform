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

package com.lfn.ai.comm.lib.util.annotation;

import java.lang.reflect.Field;

import org.springframework.util.ReflectionUtils;
import org.springframework.util.ReflectionUtils.FieldCallback;

import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;

import lombok.extern.log4j.Log4j2;

@Log4j2
public class EssedumPropertyFieldCallback implements FieldCallback {

	private static String ERROR_PROPERTY_NOT_FOUND = "@EssedumProperty(entity) does not exist in the constant DB.";
	private Object value;
	private ConstantsService constantsService;

	public EssedumPropertyFieldCallback(Object value, ConstantsService constantsService) {
		this.value = value;
		this.constantsService = constantsService;
	}

	@Override
	public void doWith(Field field) throws IllegalAccessException {
		if (!field.isAnnotationPresent(EssedumProperty.class)) {
			return;
		}
		ReflectionUtils.makeAccessible(field);
		String key = field.getDeclaredAnnotation(EssedumProperty.class).value();
		try {
			field.set(value, constantsService.findByKeys(key, "Core").trim());
		} catch (Exception ex) {
			String error = String.format("%s : Key %s", ERROR_PROPERTY_NOT_FOUND, key);
			log.error(error, ex);
			throw new IllegalArgumentException(error);
		}
	}

}