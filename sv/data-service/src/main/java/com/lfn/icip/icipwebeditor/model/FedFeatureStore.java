package com.lfn.icip.icipwebeditor.model;

import java.io.Serializable;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@SuppressWarnings("serial")
@Data
@Embeddable
public class FedFeatureStore implements Serializable {
	@Column(name="fed_name")
	String sourceName;
	@Column(name="adapter_id")
	String adapterId;
	@Column(name = "app_org")
	String organization;

}
