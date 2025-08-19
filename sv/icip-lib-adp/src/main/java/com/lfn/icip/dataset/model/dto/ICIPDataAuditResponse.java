package com.lfn.icip.dataset.model.dto;

import com.lfn.icip.dataset.model.ICIPDataset;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPDataAuditResponse.
 */
/*
 * class ICIPDataAuditResponse 
 * enum status and operations*/

/**
 * To string.
 *
 * @return the java.lang. string
 */
@Data

/**
 * Instantiates a new ICIP data audit response.
 *
 * @param response    the response
 * @param operation   the operation
 * @param status      the status
 * @param query       the query
 * @param dataset     the dataset
 * @param generatedId the generated id
 */
@AllArgsConstructor

/**
 * Instantiates a new ICIP data audit response.
 */
@NoArgsConstructor
public class ICIPDataAuditResponse {

	/** The response. */
	private String response;

	/** The operation. */
	private Operation operation;

	/** The status. */
	private Status status;

	/** The query. */
	private String query;

	/** The dataset. */
	private ICIPDataset dataset;

	/** The generated id. */
	private int generatedId;

	/**
	 * The Enum Status.
	 */
	public static enum Status {

		/** The success. */
		SUCCESS,
		/** The error. */
		ERROR
	}

	/**
	 * The Enum Operation.
	 */
	public static enum Operation {

		/** The insert. */
		INSERT,
		/** The update. */
		UPDATE,
		/** The delete. */
		DELETE
	}

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
		ICIPDataAuditResponse other = (ICIPDataAuditResponse) obj;
		if (dataset == null) {
			if (other.dataset != null)
				return false;
		} else if (!dataset.equals(other.dataset))
			return false;
		if (generatedId != other.generatedId)
			return false;
		if (operation != other.operation)
			return false;
		if (query == null) {
			if (other.query != null)
				return false;
		} else if (!query.equals(other.query))
			return false;
		if (response == null) {
			if (other.response != null)
				return false;
		} else if (!response.equals(other.response))
			return false;
		if (status != other.status)
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
		result = prime * result + ((dataset == null) ? 0 : dataset.hashCode());
		result = prime * result + generatedId;
		result = prime * result + ((operation == null) ? 0 : operation.hashCode());
		result = prime * result + ((query == null) ? 0 : query.hashCode());
		result = prime * result + ((response == null) ? 0 : response.hashCode());
		result = prime * result + ((status == null) ? 0 : status.hashCode());
		return result;
	}

}
