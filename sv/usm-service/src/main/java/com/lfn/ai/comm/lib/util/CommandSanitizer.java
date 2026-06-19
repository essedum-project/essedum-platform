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

import java.io.File;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Utility class to sanitize command-line arguments to prevent command injection attacks.
 */
public class CommandSanitizer {

	/** Pattern matching dangerous shell metacharacters that could enable command injection. */
	private static final Pattern SHELL_METACHAR_PATTERN = Pattern.compile("[;&|`$(){}\\[\\]!<>\\n\\r]");

	/** Pattern for validating that a command argument contains only safe characters. */
	private static final Pattern SAFE_ARG_PATTERN = Pattern.compile("^[a-zA-Z0-9_.\\-/\\\\:= @\"']+$");

	/** Allowlist of shell executable basenames that may be invoked via {@link ProcessBuilder}. */
	private static final Set<String> ALLOWED_EXECUTABLES = Collections.unmodifiableSet(new HashSet<>(Arrays.asList(
			"sh", "bash", "zsh", "cmd", "cmd.exe", "powershell", "powershell.exe", "pwsh", "pwsh.exe"
	)));

	/** Allowlist of shell flags. */
	private static final Set<String> ALLOWED_FLAGS = Collections.unmodifiableSet(new HashSet<>(Arrays.asList(
			"-c", "/c", "/C", "-Command", "-command"
	)));

	private CommandSanitizer() {
		// Utility class
	}

	/**
	 * Validates that the given executable path refers to a known, allowlisted shell.
	 * <p>
	 * This prevents an attacker-controlled value from causing {@link ProcessBuilder}
	 * to launch an arbitrary binary.
	 *
	 * @param executable the executable path (may be absolute or just a basename)
	 * @return the original value if it is allowlisted
	 * @throws IllegalArgumentException if the executable is not in the allowlist
	 */
	public static String validateExecutable(String executable) {
		if (executable == null) {
			throw new IllegalArgumentException("Executable must not be null");
		}
		String base = new File(executable).getName().toLowerCase();
		if (!ALLOWED_EXECUTABLES.contains(base)) {
			throw new IllegalArgumentException("Executable not in allowlist: " + base);
		}
		return executable;
	}

	/**
	 * Validates that the given shell flag is on a known allowlist (e.g. {@code -c}, {@code /c}).
	 *
	 * @param flag the flag value
	 * @return the original value if it is allowlisted
	 * @throws IllegalArgumentException if the flag is not in the allowlist
	 */
	public static String validateShellFlag(String flag) {
		if (flag == null) {
			throw new IllegalArgumentException("Shell flag not in allowlist: null");
		}
		for (String allowed : ALLOWED_FLAGS) {
			if (allowed.equals(flag)) {
				return allowed;
			}
		}
		throw new IllegalArgumentException("Shell flag not in allowlist: " + flag);
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
			if (i == 0) {
				sanitized[i] = validateExecutable(cmd[i]);
			} else if (i == 1) {
				sanitized[i] = validateShellFlag(cmd[i]);
			} else {
				sanitized[i] = sanitizeArgument(cmd[i]);
			}
		}
		return sanitized;
	}

	/**
	 * Safely builds a {@link ProcessBuilder} for a 3-element shell command of the form
	 * {@code [shell, flag, scriptArg]}. Single audited entry point for
	 * {@code ProcessBuilder} construction; satisfies CodeQL CWE-78/CWE-88 by routing
	 * all tainted input through {@link #validateExecutable}, {@link #validateShellFlag},
	 * and {@link #sanitizeArgument} before reaching the sink.
	 *
	 * @param cmd a 3-element command array: {shell, flag, argument}
	 * @return a {@link ProcessBuilder} initialized with the sanitized command tokens
	 * @throws IllegalArgumentException if {@code cmd} is null, not of length 3, or fails any check
	 */
	public static ProcessBuilder buildProcessBuilder(String[] cmd) {
		if (cmd == null || cmd.length != 3) {
			throw new IllegalArgumentException("Command must be a 3-element array: {shell, flag, argument}");
		}
		String shell = validateExecutable(cmd[0]);
		String flag = validateShellFlag(cmd[1]);
		String arg = sanitizeArgument(cmd[2]);
		return new ProcessBuilder(shell, flag, arg);
	}
}

