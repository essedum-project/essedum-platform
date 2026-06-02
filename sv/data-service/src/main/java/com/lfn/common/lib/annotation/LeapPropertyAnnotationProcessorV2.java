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

package com.lfn.common.lib.annotation;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.stereotype.Component;
import org.springframework.util.ReflectionUtils;
import org.springframework.util.ReflectionUtils.FieldCallback;


@Component
public class LeapPropertyAnnotationProcessorV2 implements BeanPostProcessor {
	
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
		FieldCallback fieldCallback = new LeapPropertyFieldCallbackV2(value,commonAppUrl);
		ReflectionUtils.doWithFields(managedBeanClass, fieldCallback);
	}

}
