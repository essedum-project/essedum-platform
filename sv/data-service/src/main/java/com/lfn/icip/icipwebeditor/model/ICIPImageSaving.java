package com.lfn.icip.icipwebeditor.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import com.lfn.ai.comm.lib.util.listener.AuditListener;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@EntityListeners(AuditListener.class)
@Table(name = "mlappimage",uniqueConstraints = @UniqueConstraint(columnNames = { "app_alias","file_name", "mime_type",
		"url", "organization","app_name" }))
@Data
public class ICIPImageSaving {
	
	
	
		@Id
		@GeneratedValue(strategy = GenerationType.IDENTITY)
		@EqualsAndHashCode.Include
	    Integer id;
		@Column(name = "app_alias")
		String alias;
		@Column(name = "app_name")
		String name;
	    @Column(name = "file_name")
		String filename;
	    @Column(name = "mime_type")
		String mimetype;
	    @Column(name = "url")
		String url;
	    @Column(name="organization")
		String organization;

		

}
