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
