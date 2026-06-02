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

package com.lfn.icip.icipwebeditor.model.dto;

import java.nio.file.Path;

import com.lfn.icip.icipwebeditor.job.model.TriggerValues;

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
//
/**
 * The Class ICIPNativeJobDetails.
 *
 * @author essedum
 */

/**
 * Gets the pytemp file.
 *
 * @return the pytemp file
 */

/**
 * Gets the pytemp file.
 *
 * @return the pytemp file
 */
@Getter

/**
 * Sets the pytemp file.
 *
 * @param pytempFile the new pytemp file
 */

/**
 * Sets the pytemp file.
 *
 * @param pytempFile the new pytemp file
 */
@Setter
public class ICIPNativeJobDetails {

	/** The cname. */
	private String cname;
	
	/** The org. */
	private String org;
	
	/** The params. */
	private String params;

	/** The spark home. */
	private String sparkHome;
	
	/** The python 2 path. */
	private String python2Path;
	
	/** The python 3 path. */
	private String python3Path;

	/** The trigger values. */
	private TriggerValues triggerValues;

	/** The id. */
	private String id;
	
	/** The rest node. */
	private boolean restNode;

	/** The yamltemp file. */
	private Path yamltempFile;
	
	/** The pytemp file. */
	private Path pytempFile;

}
