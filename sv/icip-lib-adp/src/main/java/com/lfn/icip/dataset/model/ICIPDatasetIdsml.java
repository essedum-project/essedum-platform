package com.lfn.icip.dataset.model;
import java.sql.Timestamp;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import com.lfn.ai.comm.lib.util.listener.AuditListener;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@DynamicInsert
@DynamicUpdate
@Entity
@EntityListeners(AuditListener.class)
@Table(name = "mldatasetidsml", 
		uniqueConstraints = {@UniqueConstraint(columnNames = { "dataset", "is_chart", "chart_name" }),
							@UniqueConstraint(columnNames = { "dataset", "is_recipe", "recipe_name" })})
@Data
public class ICIPDatasetIdsml {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;
	
	@Column(name = "dataset")
	private String dataset;
	
	@Column(name = "org")
	private String org;
	
	@Column(name = "is_recipe")
	private Boolean isRecipe;
	
	@Column(name = "is_chart")
	private Boolean isChart;
	
	@Column(name = "chart_details")
	private String chartDetails;
	
	@Column(name = "chart_name")
	private String chartName;
	
	@Column(name = "recipe_name")
	private String recipeName;
	
	@Column(name = "recipe_details")
	private String recipeDetails;
	
	@Column(name = "description")
	private String description;
	
	
}
