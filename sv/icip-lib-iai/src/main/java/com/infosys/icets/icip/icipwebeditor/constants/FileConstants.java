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
package com.infosys.icets.icip.icipwebeditor.constants;

import org.springframework.stereotype.Component;

// TODO: Auto-generated Javadoc
//
/**
 * The Class FileConstants.
 *
 * @author icets
 */

@Component
public class FileConstants {

	/**
	 * Instantiates a new file constants.
	 */
	private FileConstants() {
	}

	/** JAR CONSTANT. */
	public static final String JAR = "jar/";

	/** BINARY CONSTANT. */
	public static final String BINARY = "binary/";

	/** NATIVE CODE CONSTANT. */
	public static final String NATIVE_CODE = "code/native/";

	/** The Constant AGENTS_CODE. */
	public static final String AGENTS_CODE = "code/agents/";

	/** SCRIPT CONSTANT. */
	public static final String SCRIPT_CODE = "code/script/";

	/** DRAG AND DROP CONSTANT. */
	public static final String DRAGANDDROP_CODE = "code/draganddrop/";

	/** The Constant INVALID_PATH. */
	public static final String INVALID_PATH = "Invalid Path";

	/** The Constant INVALID_FILE_NAME. */
	public static final String INVALID_FILE_NAME = "Invalid FileName";

	/** The Constant INVALID_FILE_FORMAT. */
	public static final String INVALID_FILE_FORMAT = "Invalid File Format";

	/** The Constant CHECKING_FILE. */
	public static final String CHECKING_FILE = "checking file type";

	/** The Constant OCTET_STREAM. */
	public static final String OCTET_STREAM = "application/octet-stream";
	
	/** The Constant ATTACHMENT. */
	public static final String ATTACHMENT = "attachment; filename=";
	
	/** The Constant APPFILESDIRECTORY. */
	public static final String APPFILESDIRECTORY = "appfiles/";

}
