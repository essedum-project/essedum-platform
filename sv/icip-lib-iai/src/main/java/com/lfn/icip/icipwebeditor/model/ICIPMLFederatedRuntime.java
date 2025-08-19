package com.lfn.icip.icipwebeditor.model;

import org.hibernate.annotations.Cascade;

import com.lfn.icip.dataset.model.ICIPDatasource;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "mlfederatedruntimes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ICIPMLFederatedRuntime {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	private Integer connid;

	@Column(name = "connport", nullable = true)
	private Integer connport;

	@Column(name = "isEXIPorts", nullable = true)
	private Boolean isEXIPorts;

	@Column(name = "isDefaultPorts", nullable = true)
	private Boolean isDefaultPorts;

	@Column(name = "exiPorts", nullable = true)
	private Integer exiPorts;

	private Integer pipelineid;

	private Integer appid;

	@Column(name = "connendpoint", length = 255, nullable = true)
	private String connendpoint;

	@Column(name = "isAssigned", nullable = true)
	private Boolean isAssigned;

	@OneToOne
	@JoinColumn(updatable = false, insertable = false, name = "connid", referencedColumnName = "id")
	private ICIPDatasource icipDataSource;

	@OneToOne
	@JoinColumn(updatable = false, insertable = false, name = "pipelineid", referencedColumnName = "cid")
	private ICIPStreamingServices icipStreamingServices;

	@OneToOne
	@JoinColumn(updatable = false, insertable = false, name = "appid", referencedColumnName = "id")
	private ICIPApps icipApps;
}
