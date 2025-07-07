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
package com.infosys.icets.icip.dataset.model;

import java.io.Serializable;
import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDatasetFiles.
 *
 * @author icets
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
