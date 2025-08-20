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

package com.lfn.icip.icipwebeditor.constants;

import org.springframework.stereotype.Component;

// TODO: Auto-generated Javadoc
//
/**
 * The Class FileConstants.
 *
 * @author essedum
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
