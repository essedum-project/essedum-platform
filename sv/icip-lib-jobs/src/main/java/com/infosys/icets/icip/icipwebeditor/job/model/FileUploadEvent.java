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

package com.infosys.icets.icip.icipwebeditor.job.model;

import java.nio.file.Path;

import org.springframework.context.ApplicationEvent;

import lombok.Getter;

// TODO: Auto-generated Javadoc
//
/**
 * The Class FileUploadEvent.
 *
 * @author icets
 */

/**
 * Gets the total count.
 *
 * @return the total count
 */

/**
 * Checks if is replace.
 *
 * @return true, if is replace
 */

/**
 * Checks if is replace.
 *
 * @return true, if is replace
 */
@Getter
public class FileUploadEvent extends ApplicationEvent {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The fileid. */
	private String fileid;

	/** The folder. */
	private String folder;

	/** The path. */
	private Path path;

	/** The total count. */
	private int totalCount;

	/** The org. */
	private String org;

	/** The replace. */
	private boolean replace;

	/**
	 * Instantiates a new file upload event.
	 *
	 * @param source     the source
	 * @param folder the folder
	 * @param fileid     the fileid
	 * @param path       the path
	 * @param totalCount the total count
	 * @param replace the replace
	 */
	public FileUploadEvent(Object source, String folder, String fileid, Path path, int totalCount, boolean replace) {
		super(source);
		this.folder = folder;
		this.fileid = fileid;
		this.path = path;
		this.totalCount = totalCount;
		this.replace = replace;
	}

}
