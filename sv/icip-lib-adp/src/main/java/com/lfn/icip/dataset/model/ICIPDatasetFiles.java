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

package com.lfn.icip.dataset.model;

import java.io.Serializable;
import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.lfn.ai.comm.lib.util.listener.AuditListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDatasetFiles.
 *
 * @author essedum
 */
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mldatasetfiles")

/**
 * Gets the headers.
 *
 * @return the headers
 */

/**
 * Gets the uploaded at.
 *
 * @return the uploaded at
 */

/**
 * Gets the metadata.
 *
 * @return the metadata
 */
@Getter

/**
 * Sets the headers.
 *
 * @param headers the new headers
 */

/**
 * Sets the uploaded at.
 *
 * @param uploadedAt the new uploaded at
 */

/**
 * Sets the metadata.
 *
 * @param metadata the new metadata
 */
@Setter

/**
 * Instantiates a new ICIP dataset files.
 */

/**
 * Instantiates a new ICIP dataset files.
 */

/**
 * Instantiates a new ICIP dataset files.
 */
@NoArgsConstructor

/**
 * Hash code.
 *
 * @return the int
 */

/**
 * Hash code.
 *
 * @return the int
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ICIPDatasetFiles implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@EqualsAndHashCode.Include
	private String id;

	/** The datasetname. */
	private String datasetname;

	/** The organization. */
	private String organization;

	/** The filename. */
	private String filename;

	/** The filepath. */
	private String filepath;

	/** The headers. */
	private String headers;
	
	/** The filesize. */
	private int fileSize;
	
	/** The filetype. */
	private String fileType;

	/** The uploaded at. */
	@Column(name = "timestamp")
	private Timestamp uploadedAt;

	/** The metadata. */
	private String metadata;

	/**
	 * Equals.
	 *
	 * @param obj the obj
	 * @return the boolean value
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ICIPDatasetFiles other = (ICIPDatasetFiles) obj;
		if (this.getId() == null) {
			if (other.getId() != null)
				return false;
		} else if (!id.equals(other.getId()))
			return false;
		return true;
	}

	/**
	 * hashCode.
	 *
	 * @return the hashcode
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((this.getId() == null) ? 0 : id.hashCode());
		return result;
	}

	@Override
	public String toString() {
		return "ICIPDatasetFiles [id=" + id + ", datasetname=" + datasetname + ", organization=" + organization
				+ ", filename=" + filename + ", filepath=" + filepath + ", headers=" + headers + ", fileSize="
				+ fileSize + ", fileType=" + fileType + ", uploadedAt=" + uploadedAt + ", metadata=" + metadata + "]";
	}

	public ICIPDatasetFiles(String id, String datasetname, String organization, String filename, String filepath,
			String headers, int fileSize, String fileType, Timestamp uploadedAt, String metadata) {
		super();
		this.id = id;
		this.datasetname = datasetname;
		this.organization = organization;
		this.filename = filename;
		this.filepath = filepath;
		this.headers = headers;
		this.fileSize = fileSize;
		this.fileType = fileType;
		this.uploadedAt = uploadedAt;
		this.metadata = metadata;
	}

}
