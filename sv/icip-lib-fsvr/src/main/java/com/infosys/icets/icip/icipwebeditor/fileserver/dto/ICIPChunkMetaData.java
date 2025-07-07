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
package com.infosys.icets.icip.icipwebeditor.fileserver.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class DatasetChunkMetaData.
 *
 * @author icets
 */

/**
 * Gets the file guid.
 *
 * @return the file guid
 */

/**
 * Gets the file description.
 *
 * @return the file description
 */

/**
 * Gets the file description.
 *
 * @return the file description
 */
@Getter

/**
 * Sets the file guid.
 *
 * @param fileGuid the new file guid
 */

/**
 * Sets the file description.
 *
 * @param fileDescription the new file description
 */

/**
 * Sets the file description.
 *
 * @param fileDescription the new file description
 */
@Setter

/**
 * Instantiates a new dataset chunk meta data.
 */

/**
 * Instantiates a new ICIP chunk meta data.
 */

/**
 * Instantiates a new ICIP chunk meta data.
 */
@NoArgsConstructor

/**
 * Instantiates a new dataset chunk meta data.
 *
 * @param fileName the file name
 * @param index the index
 * @param totalCount the total count
 * @param fileSize the file size
 * @param fileType the file type
 * @param fileGuid the file guid
 */

/**
 * Instantiates a new ICIP chunk meta data.
 *
 * @param fileName the file name
 * @param index the index
 * @param totalCount the total count
 * @param fileSize the file size
 * @param fileType the file type
 * @param fileGuid the file guid
 * @param fileDescription the file description
 */

/**
 * Instantiates a new ICIP chunk meta data.
 *
 * @param fileName the file name
 * @param index the index
 * @param totalCount the total count
 * @param fileSize the file size
 * @param fileType the file type
 * @param fileGuid the file guid
 * @param fileDescription the file description
 */
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ICIPChunkMetaData {
	
	/** The file name. */
	@JsonProperty("FileName")
	private String fileName;
	
	/** The index. */
	@JsonProperty("Index")
	private int index;
	
	/** The total count. */
	@JsonProperty("TotalCount")
	private int totalCount;
	
	/** The file size. */
	@JsonProperty("FileSize")
	private long fileSize;
	
	@Override
	public String toString() {
		return "[fileName=" + fileName + ", index=" + index + ", totalCount=" + totalCount
				+ ", fileSize=" + fileSize + ", fileType=" + fileType + ", fileGuid=" + fileGuid + ", fileDescription="
				+ fileDescription + "]";
	}

	/** The file type. */
	@JsonProperty("FileType")
	private String fileType;
	
	/** The file guid. */
	@JsonProperty("FileGuid")
	private String fileGuid;
	
	/**  The file description. */
	@JsonProperty("FileDescription")
	private String fileDescription;
}
