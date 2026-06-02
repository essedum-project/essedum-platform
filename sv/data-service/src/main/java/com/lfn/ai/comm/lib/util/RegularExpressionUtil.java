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

package com.lfn.ai.comm.lib.util;

import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class RegularExpressionUtil {

	/** Maximum allowed length for a regex pattern to prevent ReDoS. */
	private static final int MAX_REGEX_LENGTH = 500;

	/** Pattern to detect potentially dangerous regex constructs (nested quantifiers causing catastrophic backtracking). */
	private static final Pattern DANGEROUS_REGEX_PATTERN = Pattern.compile(
			"(\\(.+\\))(\\*|\\+|\\{\\d+,\\d*\\})(\\*|\\+|\\{\\d+,\\d*\\})"
	);

	/**
	 * Validates that a regex pattern is safe to compile and use.
	 * Rejects patterns that are too long or contain dangerous constructs.
	 *
	 * @param regex the regex pattern to validate
	 * @return true if the pattern is safe, false otherwise
	 */
	private static boolean isSafeRegex(String regex) {
		if (regex == null || regex.isEmpty()) {
			return false;
		}
		if (regex.length() > MAX_REGEX_LENGTH) {
			log.warn("Regex pattern rejected: exceeds maximum length of {}", MAX_REGEX_LENGTH);
			return false;
		}
		if (DANGEROUS_REGEX_PATTERN.matcher(regex).find()) {
			log.warn("Regex pattern rejected: contains potentially dangerous nested quantifiers");
			return false;
		}
		return true;
	}

	public static boolean matchInputForRegex(String inputTobeVerified , String regEx) {
		try {
		  if (!isSafeRegex(regEx)) {
			  log.warn("Unsafe regex pattern rejected: {}", regEx);
			  return false;
		  }
		  if(inputTobeVerified.matches(regEx)) {
			  log.debug("input matched {} with regex {} ",inputTobeVerified, regEx);
			  return true;
		  }
		  log.debug("input match failed {} with regex {} ",inputTobeVerified, regEx);
		  return false;
		}
		catch (PatternSyntaxException e) {
			 log.debug("regex is invalid {} error is {} ",regEx,e.getMessage());
			 return false;
		}
		catch (Exception e) {
			 log.error("error occur in regex match regex :{} input :{} massage :{} ",regEx,inputTobeVerified,e.getMessage());
			 return false;
		}
	 }

	 public static boolean verifyRegEx(String regex) throws Exception {
	 try {
		 if (!isSafeRegex(regex)) {
			 throw new PatternSyntaxException("Regex pattern rejected: unsafe or too long", regex, -1);
		 }
		 Pattern.compile(regex);
		 return false;
	 } catch (PatternSyntaxException e) {
		 log.info("Pattern failed to be verified {}, error is {}" , regex, e.getDescription());
		 throw e;
	 }
  }

}
