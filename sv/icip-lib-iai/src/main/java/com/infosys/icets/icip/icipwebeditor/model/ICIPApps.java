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
package com.infosys.icets.icip.icipwebeditor.model;

import java.io.Serializable;

import org.hibernate.annotations.Cascade;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
// TODO: Auto-generated Javadoc
// 

/**
 * The Class ICIPApps.
 *
 * @author icets
 */
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlapps")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ICIPApps implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The name. */
	@Column(unique = true)
	private String name;

	/** The tryoutlink. */
	private String tryoutlink;

	/** The status. */
	private String status;

	/** The type. */
	private String type;

	/** The organization. */
	private String organization;

	/** The organization. */
	private String scope;

	/** The file. */
	private String file;

	@Column(name = "job_name")
	private String jobName;

	@Column(name = "video_file")
	private String videoFile;

	/*
	 * @Column(name = "mfe_app_name") private String mfeAppName;
	 */
	@OneToOne
	@JoinColumn(name = "name", referencedColumnName = "app_name", insertable = false, updatable = false)
	@JoinColumn(updatable = false, insertable = false, name = "organization", referencedColumnName = "organization")
	@Cascade(value = org.hibernate.annotations.CascadeType.SAVE_UPDATE)
	ICIPImageSaving icipImageSaving;

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
		ICIPScript other = (ICIPScript) obj;
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
		return "ICIPApps [id=" + id + ", name=" + name + ", tryoutlink=" + tryoutlink + ", status=" + status + ", type="
				+ type + ", organization=" + organization + ", scope=" + scope + ", file=" + file + ", jobName="
				+ jobName + ", videoFile=" + videoFile + "]";
	}

}
