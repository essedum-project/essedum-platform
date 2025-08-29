package com.lfn.icip.dataset.model.dto;



	import java.util.Map;

	import com.lfn.ai.comm.lib.util.domain.BaseDomain;
	import com.lfn.icip.dataset.model.ICIPDatasource;

	import lombok.EqualsAndHashCode;
	import lombok.Getter;
	import lombok.NoArgsConstructor;
	import lombok.Setter;

	// TODO: Auto-generated Javadoc
	// 
	/**
	 * The Class ICIPDatasetDTO.
	 *
	 * @author essedum
	 */

	/**
	 * Gets the dataset type.
	 *
	 * @return the dataset type
	 */

	/**
	 * Gets the schemajson.
	 *
	 * @return the schemajson
	 */
	
	/**
	 * Gets the context.
	 *
	 * @return the context
	 */
	@Getter
	/**
	 * Sets the dataset type.
	 *
	 * @param datasetType the new dataset type
	 */

	/**
	 * Sets the schemajson.
	 *
	 * @param schemajson the new schemajson
	 */
	
	/**
	 * Sets the context.
	 *
	 * @param context the new context
	 */
	@Setter
	/**
	 * Instantiates a new ICIP dataset DTO.
	 */

	/**
	 * Instantiates a new ICIP dataset DTO.
	 */
	
	/**
	 * Instantiates a new ICIP dataset DTO 2.
	 */
	@NoArgsConstructor
	
	/**
	 * Hash code.
	 *
	 * @return the int
	 */
	@EqualsAndHashCode(callSuper = false)
	public class ICIPDatasetDTO2 extends BaseDomain {

		/** The id. */
		private Integer id;

		/** The name. */
		private String name;

		/** The description. */
		private String description;

		/** The schema. */
		private ICIPSchemaRegistryDTO schema;

		/** The attributes. */
		private Map<String, Object> attributes;

		/** The type. */
		private String type;

		/** The datasource. */
		private ICIPDatasource datasource;

		/** The backing dataset. */
		private ICIPDatasetDTO backingDataset;

		/** The organization. */
		private String organization;

		/** The expStatus. */
		private Integer expStatus;

		/** The schemajson. */
		private String schemajson;

		/** The views. */
		private String views;

		/** The archival config. */
		private String archivalConfig;
		
		/** The context. */
		private String context;
		
		private String taskdetails;
		/** The interfacetype. */
		private String interfacetype;

		private String event_details;
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
			ICIPDatasetDTO2 other = (ICIPDatasetDTO2) obj;
			if (archivalConfig == null) {
				if (other.archivalConfig != null)
					return false;
			} else if (!archivalConfig.equals(other.archivalConfig))
				return false;
			if (attributes == null) {
				if (other.attributes != null)
					return false;
			} else if (!attributes.equals(other.attributes))
				return false;
			if (backingDataset == null) {
				if (other.backingDataset != null)
					return false;
			} else if (!backingDataset.equals(other.backingDataset))
				return false;
			if (context == null) {
				if (other.context != null)
					return false;
			} else if (!context.equals(other.context))
				return false;
			if (datasource == null) {
				if (other.datasource != null)
					return false;
			} else if (!datasource.equals(other.datasource))
				return false;
			if (description == null) {
				if (other.description != null)
					return false;
			} else if (!description.equals(other.description))
				return false;
			if (expStatus == null) {
				if (other.expStatus != null)
					return false;
			} else if (!expStatus.equals(other.expStatus))
				return false;
			if (id == null) {
				if (other.id != null)
					return false;
			} else if (!id.equals(other.id))
				return false;
			if (name == null) {
				if (other.name != null)
					return false;
			} else if (!name.equals(other.name))
				return false;
			if (organization == null) {
				if (other.organization != null)
					return false;
			} else if (!organization.equals(other.organization))
				return false;
			if (schema == null) {
				if (other.schema != null)
					return false;
			} else if (!schema.equals(other.schema))
				return false;
			if (schemajson == null) {
				if (other.schemajson != null)
					return false;
			} else if (!schemajson.equals(other.schemajson))
				return false;
			if (type == null) {
				if (other.type != null)
					return false;
			} else if (!type.equals(other.type))
				return false;
			if (views == null) {
				if (other.views != null)
					return false;
			} else if (!views.equals(other.views))
				return false;
			if (interfacetype == null) {
				if (other.interfacetype != null)
					return false;
			} else if (!interfacetype.equals(other.interfacetype))
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
			result = prime * result + ((archivalConfig == null) ? 0 : archivalConfig.hashCode());
			result = prime * result + ((attributes == null) ? 0 : attributes.hashCode());
			result = prime * result + ((backingDataset == null) ? 0 : backingDataset.hashCode());
			result = prime * result + ((context == null) ? 0 : context.hashCode());
			result = prime * result + ((datasource == null) ? 0 : datasource.hashCode());
			result = prime * result + ((description == null) ? 0 : description.hashCode());
			result = prime * result + ((expStatus == null) ? 0 : expStatus.hashCode());
			result = prime * result + ((id == null) ? 0 : id.hashCode());
			result = prime * result + ((name == null) ? 0 : name.hashCode());
			result = prime * result + ((organization == null) ? 0 : organization.hashCode());
			result = prime * result + ((schema == null) ? 0 : schema.hashCode());
			result = prime * result + ((schemajson == null) ? 0 : schemajson.hashCode());
			result = prime * result + ((type == null) ? 0 : type.hashCode());
			result = prime * result + ((views == null) ? 0 : views.hashCode());
			result = prime * result + ((interfacetype == null) ? 0 : interfacetype.hashCode());
			return result;
		}
		
	}
