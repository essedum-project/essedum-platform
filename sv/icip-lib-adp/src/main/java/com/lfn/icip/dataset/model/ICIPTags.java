package com.lfn.icip.dataset.model;

import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;


import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
//@MappedSuperclass


@Getter

@Setter

@Table(name="mltags", uniqueConstraints = @UniqueConstraint(columnNames = { "label" }))

@NoArgsConstructor


@EqualsAndHashCode
public class ICIPTags {
	
	
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
	@EqualsAndHashCode.Include
	private Integer id;
	private String label;
	private String category;
	public ICIPTags(Integer id, String label, String category) {
		this.id = id;
		this.label = label;
		this.category = category;
	}

	
//	@Override
//	public boolean equals(Object obj) {
//		if (this == obj)
//			return true;
//		if (obj == null)
//			return false;
//		if (getClass() != obj.getClass())
//			return false;
//		ICIPTags other = (ICIPTags) obj;
//		return Objects.equals(category, other.category) && id == other.id && Objects.equals(label, other.label);
//	}
	@Override
	public boolean equals(Object obj) {
	    if (this == obj)
	        return true;
	    if (obj == null || getClass() != obj.getClass())
	        return false;
	    ICIPTags other = (ICIPTags) obj;
	    return Objects.equals(getCategory(), other.getCategory()) && getId() == other.getId() && Objects.equals(getLabel(), other.getLabel());
	}


	@Override
	public int hashCode() {
		//return Objects.hash(category, id, label);
		return Objects.hash(getCategory(), getId(), getLabel());
	}

}
