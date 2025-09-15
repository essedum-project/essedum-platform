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

package com.lfn.ai.comm.lib.util.exceptions;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import com.openpojo.log.Logger;
import com.openpojo.log.LoggerFactory;
import com.openpojo.random.RandomFactory;
import com.openpojo.reflection.PojoClass;
import com.openpojo.reflection.PojoField;
import com.openpojo.reflection.PojoMethod;
import com.openpojo.reflection.exception.ReflectionException;
import com.openpojo.reflection.filters.FilterClassName;
import com.openpojo.reflection.impl.PojoClassFactory;
import com.openpojo.reflection.impl.PojoFieldFactory;
import com.openpojo.reflection.impl.PojoMethodFactory;
import com.openpojo.validation.Validator;
import com.openpojo.validation.ValidatorBuilder;
import com.openpojo.validation.affirm.Affirm;
import com.openpojo.validation.test.impl.GetterTester;
import com.openpojo.validation.test.impl.SetterTester;
import com.openpojo.validation.utils.SameInstanceIdentityHandlerStub;
import com.openpojo.validation.utils.ValidationHelper;

public class PojoTest {

	private static final String[] packages = new String[] { "com.lfn.ai.comm.lib.util",
			"com.lfn.ai.comm.lib.util.exceptions", "com.lfn.ai.comm.lib.util.logger",
			"com.lfn.ai.comm.lib.util.mail", "com.lfn.ai.comm.lib.util.service.dto.support" };

	List<PojoClass> pojoClasses = new ArrayList<PojoClass>();
	private static Set<String> fieldPrefixes = new CopyOnWriteArraySet<String>();

	static Logger logger = LoggerFactory.getLogger(PojoTest.class);

	static int namingType = 1;

	static final int CAMEL_CASE = 1;
	static final int SNAKE_CASE = 2;
	static final int SET_CAMEL_CASE = 3;
	static final int SET_SNAKE_CASE = 4;

	@BeforeAll
	public void setup() {
		// Get all classes recursively under package
		for (String packageName : packages) {
			pojoClasses
					.addAll(PojoClassFactory.getPojoClassesRecursively(packageName, new FilterClassName(".+(?<!_)$")));
		}
	}

	@Test
	public void validate() {
		Validator validator = ValidatorBuilder.create()
				/*
				 * .with(new SetterMustExistRule(), new GetterMustExistRule())
				 */
				.with(new SetterTester(), new GetterTester()).build();

		for (PojoClass pojoClass : pojoClasses) {
			testPojo(pojoClass);
//			if ((pojoClass.getName().contains("domain") || (pojoClass.getName().contains("dto")))
//					& !pojoClass.getName().contains("$")) {
//				testPojo(pojoClass);
//			}

		}

		// validator.validate("com.lfn.iamp.ccl.domain");
		// validator.validate("com.lfn.iamp.twb.domain");

	}

	public static List<Field> getFields(final Class<?> clazz) {
		final List<Field> pojoFields = new LinkedList<Field>();
		for (final Field field : clazz.getDeclaredFields()) {
			pojoFields.add(field);
		}
		return Collections.unmodifiableList(pojoFields);
	}

	public void testPojo(final PojoClass pojoClass) {
		try {
			final Object classInstance = ValidationHelper.getBasicInstance(pojoClass);
			for (final PojoField fieldEntry : PojoFieldFactory.getPojoFields(pojoClass.getClazz())) {

				namingType = CAMEL_CASE;
				testSetter(fieldEntry, classInstance);
				namingType = SNAKE_CASE;
				testSetter(fieldEntry, classInstance);
				namingType = SET_CAMEL_CASE;
				testSetter(fieldEntry, classInstance);

				namingType = SET_SNAKE_CASE;
				testSetter(fieldEntry, classInstance);
			}
			classInstance.equals(null);
			classInstance.equals(classInstance);
			classInstance.hashCode();
			classInstance.toString();

		} catch (Throwable ex) {
			logger.warn("Error while testing the pojo " + pojoClass, ex);
		}

	}

	public Object invokeGetter(PojoMethod fieldGetter, final Object instance) {
		try {
			// logger.debug("invoking for getter " + fieldGetter);
			return fieldGetter.invoke(instance, (Object[]) null);
		} catch (Exception e) {
			String message = "";
			if (e.getMessage().isEmpty()) {
				message = "Null pointer exception invoking [" + fieldGetter + "] on instance [" + instance + "]";
			} else {
				message = e.getMessage();
			}
			throw ReflectionException.getInstance(message, e);
		}

	}

	void testSetter(PojoField fieldEntry, Object classInstance) {
		try {
			PojoMethod fieldSetter = getFieldSetter(fieldEntry);
			PojoMethod fieldGetter = getFieldGetter(fieldEntry);
			if (fieldSetter != null) {
				final Object value;

				value = RandomFactory.getRandomValue(fieldEntry);

				SameInstanceIdentityHandlerStub.registerIdentityHandlerStubForValue(value);
				// logger.debug("Testing Field [{0}] with value [{1}]", fieldEntry,
				// safeToString(value));
				invokeSetter(fieldSetter, classInstance, value);

				Object newValue = null;
				if (fieldGetter != null) {
					newValue = invokeGetter(fieldGetter, classInstance);
					Affirm.affirmEquals("Setter test failed, non equal value for field=[" + fieldEntry + "]", value,
							newValue);
				}

				SameInstanceIdentityHandlerStub.unregisterIdentityHandlerStubForValue(value);
			}
		} catch (Exception ex) {
			logger.warn("Error while testing the setter " + fieldEntry, ex);
		}

	}

	public void invokeSetter(PojoMethod fieldSetter, final Object instance, final Object value) {
		try {
			// logger.debug("invoking for setter " + fieldSetter);
			fieldSetter.invoke(instance, value);
		} catch (Exception e) {
			String message = "";
			if (e.getMessage().isEmpty()) {
				message = "Null pointer exception invoking [" + fieldSetter + "] on instance [" + instance
						+ "] with value [" + value + "]";
			} else {
				message = e.getMessage();
			}
			throw ReflectionException.getInstance(message, e);
		}
	}

	/**
	 * Returns the Getter Method for a field.
	 *
	 * @param field The field to lookup the getter on.
	 * @return The getter method or null if none exist.
	 */
	public static PojoMethod getFieldGetter(final PojoField field) {
		PojoMethod pojoMethod = null;
		for (final String candidateName : generateGetMethodNames(field)) {
			final Class<?> clazz = field.getDeclaringPojoClass().getClazz();
			pojoMethod = PojoMethodFactory.getMethod(clazz, candidateName);
			/*
			 * for (final PojoMethod pojoMethod1 : PojoMethodFactory.getPojoMethods(clazz))
			 * { logger.debug("Looking for getter " + candidateName + " got method " +
			 * pojoMethod1); if (pojoMethod1.getName().equals(candidateName)) {
			 * logger.debug("Looking for getter " + candidateName + " found method " +
			 * pojoMethod1); } }
			 */
			if (pojoMethod != null) {
				if (pojoMethod.getReturnType().isAssignableFrom(field.getType())) {
					if (pojoMethod.isAbstract()) {
						LoggerFactory.getLogger(PojoMethodFactory.class).warn(
								"Getter=[{0}] in class=[{1}] rejected due to method being abstract",
								pojoMethod.getName(), field.getDeclaringPojoClass().getClazz().getName());
						pojoMethod = null;
					}
					break;
				} else {
					LoggerFactory.getLogger(PojoMethodFactory.class).warn(
							"Getter=[{0}] in class=[{1}] rejected due non-equal return types [{2} != {3}]",
							pojoMethod.getName(), field.getDeclaringPojoClass().getClazz().getName(),
							pojoMethod.getReturnType(), field.getType());
					pojoMethod = null;
				}
			}
		}
		return pojoMethod;
	}

	/**
	 * Returns a list for candidate getter names.
	 *
	 * @param field Field to generate the candidate getter names for.
	 * @return List of candidate method names.
	 */
	private static List<String> generateGetMethodNames(final PojoField field) {
		final List<String> prefix = new LinkedList<String>();
		prefix.addAll(appendFieldNamesWithPrefix("get", field));
		if (field.getType() == boolean.class || field.getType() == Boolean.class) {
			prefix.addAll(appendFieldNamesWithPrefix("is", field));
			String fieldName = field.getName();
			if (fieldName.length() > 2 && fieldName.startsWith("is") && Character.isUpperCase(fieldName.charAt(2)))
				prefix.add(fieldName);
		}
		return prefix;
	}

	private static List<String> appendFieldNamesWithPrefix(String prefix, PojoField field) {
		List<String> appendedList = new ArrayList<String>();
		for (String entry : getFieldNameVariations(field)) {
			appendedList.add(prefix + entry);
		}
		return appendedList;
	}

	/**
	 * Returns the Setter Method for a field.
	 *
	 * @param field The field to lookup the setter on.
	 * @return The setter method or null if none exist.
	 */
	public static PojoMethod getFieldSetter(final PojoField field) {
		PojoMethod pojoMethod = null;

		for (final String candidateName : generateSetMethodNames(field)) {
			final Class<?> clazz = field.getDeclaringPojoClass().getClazz();
			pojoMethod = PojoMethodFactory.getMethod(clazz, candidateName, field.getType());

			// logger.debug("Looking for setter " + candidateName + " got method " +
			// pojoMethod);

			if (pojoMethod != null) {
				if (pojoMethod.isAbstract()) {
					LoggerFactory.getLogger(PojoMethodFactory.class).warn(
							"Setter=[{0}] in class=[{1}] rejected due to method being abstract", pojoMethod.getName(),
							field.getDeclaringPojoClass().getClazz().getName());
					pojoMethod = null;
				}
				break;
			}
		}
		return pojoMethod;
	}

	/**
	 * Returns a list for candidate setter names.
	 *
	 * @param field The field to generate for.
	 * @return List of candidate setter names, or empty list if there are none.
	 */
	private static List<String> generateSetMethodNames(final PojoField field) {
		final List<String> prefix = new LinkedList<String>();
		if ((namingType == SET_CAMEL_CASE) || (namingType == SET_SNAKE_CASE)) {
			prefix.addAll(appendFieldNamesWithPrefix("set", field));
		} else {
			prefix.addAll(appendFieldNamesWithPrefix("", field));
		}
		String fieldName = field.getName();
		if (fieldName.length() > 2 && fieldName.startsWith("is") && Character.isUpperCase(fieldName.charAt(2)))
			prefix.add("set" + fieldName.substring(2));

		return prefix;
	}

	public static List<String> getFieldNameVariations(final PojoField field) {
		List<String> fieldNameVariations = new ArrayList<String>();
		if ((namingType == SET_CAMEL_CASE) || (namingType == SET_SNAKE_CASE)) {
			fieldNameVariations.add(formattedFieldName(field.getName()));
			fieldNameVariations.add(snakeformattedFieldName(field.getName()));
		} else {
			fieldNameVariations.add(snakeformattedFieldName(field.getName()));
			fieldNameVariations.add(formattedFieldName(field.getName()));
		}
		try {
			String withoutPrefix = getAttributeName(field);
			if (!fieldNameVariations.contains(withoutPrefix))
				fieldNameVariations.add(withoutPrefix);
		} catch (ReflectionException ignored) {
			/* ignored */
			throw new RuntimeException("Ignored");
		}
		return fieldNameVariations;
	}

	/**
	 * This method returns the attribute name given a field name. The field name
	 * will get stripped of prefixes
	 * 
	 * @deprecated Please rewire to utilize getFieldNameVariations instead.
	 *
	 * @param field The field to inspect for attribute name
	 * @return Normalized attribute name
	 */
	@Deprecated
	public static String getAttributeName(final PojoField field) {
		String normalizedFieldName = field.getName();
		normalizedFieldName = stripPrefix(normalizedFieldName);
		return formattedFieldName(normalizedFieldName);
	}

	private static String stripPrefix(final String fieldName) {
		for (String prefix : fieldPrefixes) {
			if (fieldName.equals(prefix)) {
				throw ReflectionException.getInstance(String.format(
						"Field name =[%s] matches registered prefix=[%s], if stripped, empty string will result",
						fieldName, prefix));
			}
			if (fieldName.startsWith(prefix)) {
				return fieldName.substring(prefix.length(), fieldName.length());
			}
		}
		return fieldName;
	}

	/**
	 * Properly formatted field name, this will change the first letter to upper
	 * case only if the second letter isn't upper.
	 *
	 * @param fieldName The field to proper case.
	 * @return Formatted field name.
	 */
	private static String formattedFieldName(final String fieldName) {
		if (isSecondLetterUpperCase(fieldName)) {
			return fieldName;
		}
		return camelCase(fieldName);
	}

	private static String snakeformattedFieldName(final String fieldName) {
		String regex = "([a-z])([A-Z]+)";
		String replacement = "$1_$2";

		String newFieldName = fieldName.replaceAll(regex, replacement).toLowerCase();
		if (newFieldName.endsWith("_")) {
			newFieldName = newFieldName.substring(0, newFieldName.length() - 1);
		}
		if (namingType == SET_SNAKE_CASE) {
			newFieldName = newFieldName.substring(0, 1).toUpperCase()
					+ newFieldName.substring(1, newFieldName.length());
		}

		return newFieldName;

	}

	private static boolean isSecondLetterUpperCase(String fieldName) {
		return fieldName.length() > 1 && Character.isUpperCase(Character.codePointAt(fieldName, 1));
	}

	private static String camelCase(String fieldName) {
		return fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1, fieldName.length());
	}
}
