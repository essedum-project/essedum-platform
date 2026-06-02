/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
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

/**
 * Utility class to sanitize command-line arguments to prevent command injection attacks.
 */
public class CommandSanitizer {

	/** Pattern matching dangerous shell metacharacters that could enable command injection. */
	private static final Pattern SHELL_METACHAR_PATTERN = Pattern.compile("[;&|`$(){}\\[\\]!<>\\n\\r]");

	/** Pattern for validating that a command argument contains only safe characters. */
	private static final Pattern SAFE_ARG_PATTERN = Pattern.compile("^[a-zA-Z0-9_.\\-/\\\\:= @\"']+$");

	private CommandSanitizer() {
		// Utility class
	}

	/**
	 * Sanitizes a command-line argument by removing dangerous shell metacharacters.
	 *
	 * @param input the raw input string
	 * @return the sanitized string with shell metacharacters removed
	 */
	public static String sanitizeArgument(String input) {
		if (input == null || input.isEmpty()) {
			return input;
		}
		return SHELL_METACHAR_PATTERN.matcher(input).replaceAll("");
	}

	/**
	 * Validates that a command-line argument contains only safe characters.
	 *
	 * @param input the input string to validate
	 * @return true if the input is safe, false otherwise
	 */
	public static boolean isSafeArgument(String input) {
		if (input == null || input.isEmpty()) {
			return true;
		}
		return SAFE_ARG_PATTERN.matcher(input).matches();
	}

	/**
	 * Validates and returns the argument if safe, otherwise throws IllegalArgumentException.
	 *
	 * @param input the input to validate
	 * @param paramName the parameter name for error reporting
	 * @return the validated input
	 * @throws IllegalArgumentException if the input contains unsafe characters
	 */
	public static String validateArgument(String input, String paramName) {
		if (input != null && !isSafeArgument(input)) {
			throw new IllegalArgumentException(
					String.format("Invalid characters detected in parameter '%s'", paramName));
		}
		return input;
	}

	/**
	 * Sanitizes an array of command arguments.
	 *
	 * @param cmd the command array to sanitize
	 * @return the sanitized command array
	 */
	public static String[] sanitizeCommand(String[] cmd) {
		if (cmd == null) {
			return cmd;
		}
		String[] sanitized = new String[cmd.length];
		for (int i = 0; i < cmd.length; i++) {
			// Don't sanitize the shell executable itself (index 0) or flag (index 1)
			if (i <= 1) {
				sanitized[i] = cmd[i];
			} else {
				sanitized[i] = sanitizeArgument(cmd[i]);
			}
		}
		return sanitized;
	}
}

