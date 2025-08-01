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

package com.infosys.icets.icip.icipwebeditor.job.enums;

// TODO: Auto-generated Javadoc
// 
/**
 * The Enum RuntimeType.
 *
 * @author icets
 */
public enum RuntimeType {

	/** The script. */
	SCRIPT("spark.jobserver.python.PythonSessionContextFactory"),
	/** The scala. */
	SCALA("spark.jobserver.context.SessionContextFactory"),
	/** The draganddrop. */
	DRAGANDDROP(""),
	/** The binary. */
	BINARY(""),
	/** The nativescript. */
	NATIVESCRIPT(""),
	/** The agents. */
	AGENTS(""), 
 /** The internal. */
 INTERNAL(""), 
 /** The dragndroplite. */
 DRAGNDROPLITE(""),
AZURE(""),
AWS(""),
ICMM(""),
VERTEX(""),
R(""),
// TEXTSUMMARIZATION(""),
HAYSTACK(""),
CODEBUDDY(""),
TEXTSUMMARIZATION(""),
MLFLOW(""),
APP(""),
LANGCHAIN(""),
TOOL("");



	/** The context factory. */
	private String contextFactory;

	/**
	 * Instantiates a new runtime type.
	 *
	 * @param contextFactory the context factory
	 */
	RuntimeType(String contextFactory) {
		this.contextFactory = contextFactory;
	}
}
