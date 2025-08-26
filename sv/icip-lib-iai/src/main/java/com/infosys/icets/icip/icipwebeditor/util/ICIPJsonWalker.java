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

package com.infosys.icets.icip.icipwebeditor.util;

import java.util.Collection;
import java.util.Collections;
import java.util.Map.Entry;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPJsonWalker.
 *
 * @author icets
 */
public class ICIPJsonWalker {

	/**
	 * Instantiates a new ICIP json walker.
	 */
	private ICIPJsonWalker() {
		super();
	}

	/**
	 * Visit.
	 *
	 * @param <T>     the generic type
	 * @param json    the json
	 * @param visitor the visitor
	 * @param org     the org
	 * @return the t
	 * @throws Exception the exception
	 */
	public static <T> T visit(JsonElement json, ICIPJsonVisitor<T> visitor, String org) throws Exception {
		T result;
		if (json == null) {
			result = null;
		} else if (json.isJsonNull()) {
			JsonNull nil = json.getAsJsonNull();
			result = visitor.visit(nil, org);
		} else if (json.isJsonArray()) {
			JsonArray arr = json.getAsJsonArray();
			result = visitor.visit(arr, org);
		} else if (json.isJsonObject()) {
			JsonObject obj = json.getAsJsonObject();
			result = visitor.visit(obj, org);
		} else if (json.isJsonPrimitive()) {
			JsonPrimitive p = json.getAsJsonPrimitive();
			result = visitor.visit(p, org);
		} else {
			throw new RuntimeException("unknown type " + json);
		}
		return result;
	}

	/**
	 * Simple depth first traversal of a json element structure. Can be used for
	 * in-place changes. For cloning and/or rewriting the json structure, used
	 * JsonTransformerRewrite
	 *
	 * @param json    the json
	 * @param visitor the visitor
	 * @param org     the org
	 * @throws Exception the exception
	 * @author raven
	 */
	public static void walk(JsonElement json, ICIPJsonVisitor<?> visitor, String org) throws Exception {
		if (json == null) {
			// ignore
		} else if (json.isJsonNull()) {
			JsonNull nil = json.getAsJsonNull();
			visitor.visit(nil, org);
		} else if (json.isJsonArray()) {
			JsonArray arr = json.getAsJsonArray();
			visitor.visit(arr, org);
			for (JsonElement item : arr) {
				walk(item, visitor, org);
			}
		} else if (json.isJsonObject()) {
			JsonObject obj = json.getAsJsonObject();
			visitor.visit(obj, org);

			for (Entry<String, JsonElement> entry : obj.entrySet()) {
				JsonElement item = entry.getValue();
				walk(item, visitor, org);
			}
		} else if (json.isJsonPrimitive()) {
			JsonPrimitive p = json.getAsJsonPrimitive();
			visitor.visit(p, org);
		} else {
			throw new RuntimeException("unknown type " + json);
		}

	}

	/**
	 * Rewrite.
	 *
	 * @param json     the json
	 * @param rewriter the rewriter
	 * @param org      the org
	 * @return the json element
	 */
	public static JsonElement rewrite(JsonElement json, ICIPJsonVisitor<? extends JsonElement> rewriter, String org) {
		ICIPJsonTransformerRewrite walker = new ICIPJsonTransformerRewrite(rewriter, org);
		return walker.apply(json);
	}

	/**
	 * Rewrite dataset.
	 *
	 * @param json     the json
	 * @param rewriter the rewriter
	 * @param org      the org
	 * @return the json element
	 */
	public static JsonElement rewriteDataset(JsonElement json, ICIPJsonVisitor<? extends JsonElement> rewriter,
			String org) {
		ICIPJsonTransformerRewriteDataset walker = new ICIPJsonTransformerRewriteDataset(rewriter, org);
		return walker.apply(json);
	}

	/**
	 * Rewrite.
	 *
	 * @param json      the json
	 * @param rewriters the rewriters
	 * @param org       the org
	 * @return the json element
	 */
	public static JsonElement rewrite(JsonElement json,
			Iterable<? extends ICIPJsonVisitor<? extends JsonElement>> rewriters, String org) {
		JsonElement result = json;
		for (ICIPJsonVisitor<? extends JsonElement> rewriter : rewriters) {
			ICIPJsonTransformerRewrite walker = new ICIPJsonTransformerRewrite(rewriter, org);
			JsonElement n = walker.apply(result);
			result = n;
		}
		return result;
	}

	/**
	 * Rewrite until no change.
	 *
	 * @param json     the json
	 * @param rewriter the rewriter
	 * @param org      the org
	 * @return the json element
	 */
	public static JsonElement rewriteUntilNoChange(JsonElement json, ICIPJsonVisitor<? extends JsonElement> rewriter,
			String org) {
		Collection<ICIPJsonVisitor<? extends JsonElement>> rewriters = Collections
				.<ICIPJsonVisitor<? extends JsonElement>>singleton(rewriter);
		return rewriteUntilNoChange(json, rewriters, org);
	}

	/**
	 * Rewrite until no change.
	 *
	 * @param json      the json
	 * @param rewriters the rewriters
	 * @param org       the org
	 * @return the json element
	 */
	public static JsonElement rewriteUntilNoChange(JsonElement json,
			Iterable<? extends ICIPJsonVisitor<? extends JsonElement>> rewriters, String org) {
		JsonElement result = json;
		int max = 100;
		int i;
		for (i = 0; i < max; ++i) {
			JsonElement n = rewrite(result, rewriters, org);
			if (result == n) {
				break;
			}
			result = n;
		}
		if (i >= max) {
			throw new RuntimeException("Max iterations of rewriting json reached (" + i + ") - endless loop?");
		}
		return result;
	}
}