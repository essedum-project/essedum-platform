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

package com.infosys.icets.icip.icipwebeditor.job.constants;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// TODO: Auto-generated Javadoc
/**
 * The Class JobConstants.
 *
 * @author icets
 */

public class JobConstants {

	/**
	 * Instantiates a new job constants.
	 */
	private JobConstants() {
	}

	/** The Constant UNABLE_TO_PROCEED_IN_STANDBY_MODE. */
	public static final String UNABLE_TO_PROCEED_IN_STANDBY_MODE = "Unable to proceed in standby mode";

	/** The Constant REMOTEORLOCAL. */
	public static final String REMOTEORLOCAL = "isNative";

	/** The Constant CHAINJOBS. */
	public static final String CHAINJOBS = "chain-jobs";

	/** The Constant TRIGGERS. */
	public static final String TRIGGERS = "-triggers";

	/** The Constant RUNTIME. */
	public static final String RUNTIME = "runtime";

	/** The Constant CNAME. */
	public static final String CNAME = "cname";

	/** The Constant ORG. */
	public static final String ORG = "org";

	/** The Constant PARAMS. */
	public static final String PARAMS = "params";

	/** The Constant EXPRESSION. */
	public static final String EXPRESSION = "expression";

	/** The Constant SUBMITTEDBY. */
	public static final String SUBMITTEDBY = "submittedBy";

	/** The Constant DATETIME. */
	public static final String DATETIME = "dateTime";

	/** The Constant TIMEZONE. */
	public static final String TIMEZONE = "timeZone";

	/** The Constant CHAIN. */
	public static final String CHAIN = "chain";

	/** The Constant AGENT. */
	public static final String AGENT = "agent";

	/** The Constant CORELID. */
	public static final String CORELID = "corelid";

	/** The Constant CHAINID. */
	public static final String CHAINID = "chainId";

	/** The Constant TOTALCHAINELEMENTS. */
	public static final String TOTALCHAINELEMENTS = "totalChainNumber";

	/** The Constant CHAINNUMBER. */
	public static final String CHAINNUMBER = "chainNumber";

	/** The Constant CHAINNAME. */
	public static final String CHAINNAME = "chainName";

	/** The Constant CHAIN_LISTENER_FILE. */
	public static final String CHAIN_LISTENER_FILE = "listeners/";

	/** The Constant RESTNODEID. */
	public static final String RESTNODEID = "executionID";

	/** The Constant RESTNODE. */
	public static final String RESTNODE = "restnode";

	/** The Constant RUNNOW. */
	public static final int RUNNOW = 0;

	/** The Constant ISCRON. */
	public static final int ISCRON = 1;

	/** The Constant ISUPDATE. */
	public static final int ISUPDATE = 2;

	/** The Constant RESTNODEBOOLEAN. */
	public static final int RESTNODEBOOLEAN = 3;

	/** The Constant JOB_DATAMAP_VALUE. */
	public static final String JOB_DATAMAP_VALUE = "JOB";

	/** The Constant LINE_SEPARATOR. */
	public static final String LINE_SEPARATOR = "line.separator";

	/** The progress map. */
	public static Map<String, Integer> PROGRESS_MAP = new ConcurrentHashMap<>();

}
