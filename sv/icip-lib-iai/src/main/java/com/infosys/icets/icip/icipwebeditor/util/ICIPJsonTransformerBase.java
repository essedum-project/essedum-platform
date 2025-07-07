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
package com.infosys.icets.icip.icipwebeditor.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.JsonElement;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPJsonTransformerBase.
 *
 * @param <T> the generic type
 * @author icets
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