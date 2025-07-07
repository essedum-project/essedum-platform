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
package com.infosys.icets.icip.icipwebeditor.event.model;

import org.springframework.context.ApplicationEvent;
import org.springframework.web.multipart.MultipartFile;

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
 * Gets the total count.
 *
 * @return the total count
 */

/**
 * Gets the total count.
 *
 * @return the total count
 */
@Getter
public class ExpFileUploadEvent extends ApplicationEvent {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The file id. */
	private String fileId;
	
	/** The file path. */
	private String filePath;
	
	/** The file. */
	private MultipartFile file;
	
	/** The url. */
	private String url;
	
	/** The total count. */
	private int totalCount;

	/**
	 * Instantiates a new exp file upload event.
	 *
	 * @param source the source
	 * @param fileId the file id
	 * @param filePath the file path
	 * @param file the file
	 * @param url the url
	 * @param totalCount the total count
	 */
	public ExpFileUploadEvent(Object source, String fileId, String filePath, MultipartFile file, String url,
			int totalCount) {
		super(source);
		this.fileId = fileId;
		this.filePath = filePath;
		this.file = file;
		this.url = url;
		this.totalCount = totalCount;
	}

}
