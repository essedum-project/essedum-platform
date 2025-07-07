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

import com.google.gson.JsonArray;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPJsonVisitor.
 *
 * @param <T> the generic type
 * @author icets
 */
public interface ICIPJsonVisitor<T> {
	
	/**
	 * Visit.
	 *
	 * @param json the json
	 * @param org the org
	 * @return the t
	 */
	T visit(JsonNull json, String org);
	
	/**
	 * Visit.
	 *
	 * @param json the json
	 * @param org the org
	 * @return the t
	 * @throws Exception the exception
	 */
	T visit(JsonObject json, String org) throws Exception;
	
	/**
	 * Visit.
	 *
	 * @param json the json
	 * @param org the org
	 * @return the t
	 */
	T visit(JsonArray json, String org);
	
	/**
	 * Visit.
	 *
	 * @param json the json
	 * @param org the org
	 * @return the t
	 */
	T visit(JsonPrimitive json, String org);
}