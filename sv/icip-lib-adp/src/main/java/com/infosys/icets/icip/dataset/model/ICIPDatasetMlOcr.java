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

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "mlocr")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ICIPDatasetMlOcr implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@EqualsAndHashCode.Include
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;
	
	/** The filename. */
	private String fileName;
	
	/** The pageNo. */
	private int pageNo;

	/** The file upload id. */
	private String fileUploadId;
	
	/** The post response id. */
	private String postResponseId;
	
	/** The analysis Results. */
	private String analysisResults;
	
	/** The organization. */
	private String org;
	
	/** The last updated date. */
	private Timestamp lastUpdatedDate;
	
	/** The modified by. */
	private String modifiedBy;
	
	/** The consuming entity. */
	private String consumingEntity;
	
	/** The Tagged On Timestamp. */
	private Timestamp taggedOn;
	
	/** The Retrained On Timestamp. */
	private Timestamp retrainedOn;
	
	/** File Type. */
	private String fileType;
	
	/** The translated language. */
	private String targetLanguage;
	
	/** Document Id for a particular file. */
	private String documentId;
	
	private String documentType;
	

	public ICIPDatasetMlOcr(String fileName, int pageNo, String fileUploadId, String postResponseId,
			String analysisResults, String org, Timestamp lastUpdatedDate, String modifiedBy, String consumingEntity,
			Timestamp taggedOn, Timestamp retrainedOn) {
		super();
		this.fileName = fileName;
		this.pageNo = pageNo;
		this.fileUploadId = fileUploadId;
		this.postResponseId = postResponseId;
		this.analysisResults = analysisResults;
		this.org = org;
		this.lastUpdatedDate = lastUpdatedDate;
		this.modifiedBy = modifiedBy;
		this.consumingEntity = consumingEntity;
		this.taggedOn = taggedOn;
		this.retrainedOn = retrainedOn;
	}


	@Override
	public String toString() {
		return "ICIPDatasetMlOcr [id=" + id + ", fileName=" + fileName + ", pageNo=" + pageNo + ", fileUploadId="
				+ fileUploadId + ", postResponseId=" + postResponseId + ", analysisResults=" + analysisResults
				+ ", org=" + org + ", lastUpdatedDate=" + lastUpdatedDate + ", modifiedBy=" + modifiedBy
				+ ", consumingEntity=" + consumingEntity + ", taggedOn=" + taggedOn + ", retrainedOn=" + retrainedOn
				+ "]";
	}


	public ICIPDatasetMlOcr(String fileName, int pageNo, String fileUploadId, String postResponseId,
			String analysisResults, String org, Timestamp lastUpdatedDate, String modifiedBy, String consumingEntity, String documentId, String fileType, String targetLanguage, String documentType) {
		super();
		this.fileName = fileName;
		this.pageNo = pageNo;
		this.fileUploadId = fileUploadId;
		this.postResponseId = postResponseId;
		this.analysisResults = analysisResults;
		this.org = org;
		this.lastUpdatedDate = lastUpdatedDate;
		this.modifiedBy = modifiedBy;
		this.consumingEntity = consumingEntity;
		this.documentId = documentId;
		this.fileType = fileType;
		this.targetLanguage = targetLanguage;
		this.documentType = documentType;
		
	}

	

}
