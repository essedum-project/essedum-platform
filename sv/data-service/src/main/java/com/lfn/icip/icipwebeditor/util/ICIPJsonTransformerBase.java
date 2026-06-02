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

package com.lfn.icip.icipwebeditor.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.JsonElement;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPJsonTransformerBase.
 *
 * @param <T> the generic type
 * @author essedum
 */
public abstract class ICIPJsonTransformerBase<T> implements ICIPJsonTransformer<T>, ICIPJsonVisitor<T> {
	
	/** org value. */
	protected static String org;
	
	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPJsonTransformerBase.class);

	/**
	 * Instantiates a new ICIP json transformer base.
	 *
	 * @param org the org
	 */
	ICIPJsonTransformerBase(String org) {
		ICIPJsonTransformerBase.org = org;
	}

	/**
	 * Apply.
	 *
	 * @param json the json
	 * @return the t
	 */
	@Override
	public T apply(JsonElement json) {
		T result = null;
		try {
			result = ICIPJsonWalker.visit(json, this, org);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
		return result;

	}
}