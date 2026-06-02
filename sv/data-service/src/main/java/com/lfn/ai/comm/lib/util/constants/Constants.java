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

package com.lfn.ai.comm.lib.util.constants;

/**
 * @author essedum
 *
 */

public class Constants {
	private Constants() {
		throw new IllegalStateException("Utility class");
	}

	/** The Constant MESSAGE_PATH. */
	public static final String MESSAGE_PATH = "i18n";
	/** The Constant MESSAGE_FILE. */
	public static final String MESSAGE_FILE = "messages";
	/** key for DB type from the yml**/
	public static final String ENV_DATABASE_TYPE = "databaseType";
	/** DB queries file path **/
	public static final String DB_QUERY_FILE_PATH = "dbQueries.essedumqueries";
	/**	DEFAULT_DB_TYPE */
	public static final String DEFAULT_DB_TYPE = "mysql";

}
