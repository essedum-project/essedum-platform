package com.lfn.icip.icipwebeditor.model.dto;

import java.sql.Timestamp;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.lfn.icip.dataset.model.ICIPDatasource;

import groovy.transform.EqualsAndHashCode;
import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ICIPMLFederatedModelDTO {
	Integer id;
	String name;
	@Nullable
	String description;
	String dataSource;
	String attributes;
	String version;
	@DateTimeFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
    @JsonFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
	Timestamp createdOn;
	String createdBy;
	@DateTimeFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
    @JsonFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
	Timestamp modifiedDate;
	@DateTimeFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
    @JsonFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
	Timestamp sourceModifiedDate;
	@Nullable
	String modifiedBy;
	String organisation;
	String type;
	

}
