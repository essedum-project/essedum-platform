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
