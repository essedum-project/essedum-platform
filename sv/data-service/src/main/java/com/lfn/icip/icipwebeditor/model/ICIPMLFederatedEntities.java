package com.lfn.icip.icipwebeditor.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "mlfederatedentities")
@Data
public class ICIPMLFederatedEntities {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	Integer id;
	
	@Column(name="ptype")
	String pType;
	@Column(name="pid")
	Integer pId;
	@Column(name="ctype")
	String cType;
	@Column(name="cid")
	Integer cId;
	@Column(name="organization")
	String organization;
	
}
