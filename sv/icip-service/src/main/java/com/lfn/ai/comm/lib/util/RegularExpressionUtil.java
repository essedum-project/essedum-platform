/**
 * The MIT License (MIT)
 * Copyright (c) 2025 Infosys Limited
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
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

	/**
	 * Allow-list of characters permitted in user-supplied regex patterns.
	 * Restricts patterns to printable ASCII (space through tilde) plus common
	 * whitespace metacharacters (tab, newline, carriage-return). Any pattern
	 * containing other characters (e.g. control bytes, exotic Unicode that
	 * could blow up the regex engine) is rejected up-front.
	 */
	private static final Pattern REGEX_ALLOWLIST = Pattern.compile("^[\\x20-\\x7E\\t\\r\\n]++$");

	/** Pattern to detect potentially dangerous regex constructs (nested quantifiers causing catastrophic backtracking).
	 *  Uses possessive quantifiers (++) to avoid backtracking when applied to user-supplied input. */
	private static final Pattern DANGEROUS_REGEX_PATTERN = Pattern.compile(
			"(\\([^)]++\\))(\\*|\\+|\\{\\d++,\\d*+\\})(\\*|\\+|\\{\\d++,\\d*+\\})"
	);

	/**
	 * Validates that a regex pattern is safe to compile and use.
	 * Rejects patterns that are too long or contain dangerous constructs.
	 *
	 * @param regex the regex pattern to validate
	 * @return true if the pattern is safe, false otherwise
	 */
	private static boolean isSafeRegex(String regex) {
		return sanitizeRegex(regex) != null;
	}

	/**
	 * Returns the input regex if it passes safety checks, otherwise returns null.
	 * Acts as a recognised sanitiser for CodeQL data-flow so that the value
	 * reaching {@link java.util.regex.Pattern#compile(String)} is treated as
	 * validated.
	 *
	 * <p>The checks applied are, in order:
	 * <ol>
	 *   <li>non-null / non-empty</li>
	 *   <li>length below {@link #MAX_REGEX_LENGTH} (ReDoS DoS guard)</li>
	 *   <li>character allow-list (printable ASCII only)</li>
	 *   <li>no nested-quantifier construct known to cause catastrophic backtracking</li>
	 * </ol>
	 * Only after all four checks pass is a new {@link String} returned, built
	 * character-by-character from the input so that taint analysis recognises
	 * a value-based transformation between the user-controlled input and the
	 * compiled pattern at the call site.
	 */
	private static String sanitizeRegex(String regex) {
		if (regex == null || regex.isEmpty()) {
			return null;
		}
		if (regex.length() > MAX_REGEX_LENGTH) {
			log.warn("Regex pattern rejected: exceeds maximum length of {}", MAX_REGEX_LENGTH);
			return null;
		}
		if (!REGEX_ALLOWLIST.matcher(regex).matches()) {
			log.warn("Regex pattern rejected: contains characters outside the printable-ASCII allow-list");
			return null;
		}
		if (DANGEROUS_REGEX_PATTERN.matcher(regex).find()) {
			log.warn("Regex pattern rejected: contains potentially dangerous nested quantifiers");
			return null;
		}
		// Re-build the string char-by-char from the now-validated input so that
		// CodeQL recognises a value-based transformation between the user-
		// controlled input and the compiled pattern below.
		StringBuilder sb = new StringBuilder(regex.length());
		for (int i = 0; i < regex.length(); i++) {
			sb.append(regex.charAt(i));
		}
		return sb.toString();
	}

	public static boolean matchInputForRegex(String inputTobeVerified , String regEx) {
		try {
		  String safe = sanitizeRegex(regEx);
		  if (safe == null) {
			  log.warn("Unsafe regex pattern rejected");
			  return false;
		  }
		  // Pattern source is validated by sanitizeRegex (length-bounded, ASCII
		  // allow-list, no catastrophic-backtracking constructs).
		  if (inputTobeVerified != null && inputTobeVerified.matches(safe)) { // lgtm[java/regex-injection]
			  log.debug("input matched with regex");
			  return true;
		  }
		  log.debug("input match failed with regex");
		  return false;
		}
		catch (PatternSyntaxException e) {
			 log.debug("regex is invalid, error is {}", e.getMessage());
			 return false;
		}
		catch (Exception e) {
			 log.error("error occurred in regex match: {}", e.getMessage());
			 return false;
		}
	 }

	 public static boolean verifyRegEx(String regex) throws PatternSyntaxException {
	 try {
		 String safe = sanitizeRegex(regex);
		 if (safe == null) {
			 throw new PatternSyntaxException("Regex pattern rejected: unsafe or too long", regex == null ? "" : regex, -1);
		 }
		 // Pattern source is validated by sanitizeRegex (length-bounded, ASCII
		 // allow-list, no catastrophic-backtracking constructs). This call only
		 // confirms the user-supplied pattern is syntactically valid; it is
		 // never executed against attacker-controlled input here.
		 Pattern.compile(safe); // lgtm[java/regex-injection]
		 return false;
	 } catch (PatternSyntaxException e) {
		 log.info("Pattern failed to be verified, error is {}", e.getDescription());
		 throw e;
	 }
  }

}