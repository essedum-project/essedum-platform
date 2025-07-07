/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
/**
 * 
 */
package com.infosys.icets.ai.comm.lib.util.constants;

/**
 * @author icets
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
	public static final String DB_QUERY_FILE_PATH = "dbQueries.leapqueries";
	/**	DEFAULT_DB_TYPE */
	public static final String DEFAULT_DB_TYPE = "mysql";

}
