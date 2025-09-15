package com.lfn.icip.dataset.model;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lfn.ai.comm.lib.util.domain.BaseDomain;
import com.lfn.ai.comm.lib.util.listener.AuditListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlsearchtopics", uniqueConstraints = @UniqueConstraint(columnNames = {"organization","topicname" }))

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
public class ICIPTopic implements Serializable {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The topic/index. */
	@Column(name = "topicname")
	private String topicname ;

	/** The adapterinstance. */
	@Column(name = "adapterinstance")
	private String adapterinstance;

	/** The organization. */
	@Column(name = "organization")
	private String organization;
	
	/** The suggested_quries. */
	@Column(name = "suggested_queries")
	private String suggested_queries;

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
		ICIPTopic other = (ICIPTopic) obj;
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
