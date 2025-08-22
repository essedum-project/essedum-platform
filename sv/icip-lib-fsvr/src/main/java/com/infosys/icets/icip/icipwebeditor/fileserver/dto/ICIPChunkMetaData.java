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
