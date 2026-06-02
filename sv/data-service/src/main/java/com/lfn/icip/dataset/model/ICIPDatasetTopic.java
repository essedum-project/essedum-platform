package com.lfn.icip.dataset.model;

import java.io.Serializable;
import java.sql.Timestamp;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.lfn.ai.comm.lib.util.listener.AuditListener;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mldatasettopics", uniqueConstraints = @UniqueConstraint(columnNames = { "datasetid", "organization","topicname" }))

/**
 * Gets the metadata.
 *
 * @return the metadata
 */
@Getter

/**
 * Sets the metadata.
 *
 * @param metadata the new metadata
 */
@Setter

/**
 * Instantiates a new ICIP dataset.
 */
@NoArgsConstructor

/**
 * Hash code.
 *
 * @return the int
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)

/**
 * To string.
 *
 * @return the java.lang. string
 */
@ToString
public class ICIPDatasetTopic implements Serializable {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	@Column(name = "datasetid")
	private String datasetid;

	
	// @JoinColumn(name = "topicname",  referencedColumnName = "topicname")
	@ManyToOne
	@JoinColumns({
        @JoinColumn(name = "topicname", referencedColumnName = "topicname"),
        @JoinColumn(name = "organization", referencedColumnName = "organization")
    })
	private ICIPTopic topicname;

	/** The organization. */
	// @Column(name = "organization")
	@Column(name = "organization", insertable = false, updatable = false)
	private String organization;

	/** The status. */
	@Column(name = "status")
	private String status;
	
	@Column(name = "log")
	private String log;
	
	@Column(name = "description")
	private String description;
	
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	@Column(name = "starttime")
	private Timestamp startTime;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	@Column(name = "finishtime")
	private Timestamp finishTime;
	
	@Column(name = "duration")
	private String duration;
	
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
		if (!super.equals(obj))
			return false;
		if (getClass() != obj.getClass())
			return false;
		ICIPDatasetTopic other = (ICIPDatasetTopic) obj;
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
		int result = super.hashCode();
		result = prime * result + ((this.getId() == null) ? 0 : id.hashCode());
		return result;
	}


}
