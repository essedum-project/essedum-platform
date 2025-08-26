package com.lfn.icip.icipwebeditor.model;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import com.lfn.ai.comm.lib.util.listener.AuditListener;
import com.lfn.icip.dataset.model.ICIPTags;

import lombok.Data;
import lombok.EqualsAndHashCode;


@Entity
@EntityListeners(AuditListener.class)
@Table(name = "mltagsentity",uniqueConstraints = @UniqueConstraint(columnNames = { "tag_id", "entity_id",
		"entity_type", "organization" }))
@Data
public class ICIPTagsEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
    Integer id;
    @Column(name = "tag_id")
	Integer tagId;
    @Column(name = "entity_id")
	Integer entityId;
    @Column(name = "entity_type")
	String entityType;
    @Column(name="organization")
	String organization;

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((this.getId() == null) ? 0 : id.hashCode());
		return result;
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ICIPTagsEntity other = (ICIPTagsEntity) obj;
		if (this.getId() == null) {
			if (other.getId() != null)
				return false;
		} else if (!id.equals(other.getId()))
			return false;
		return true;
	}
}
