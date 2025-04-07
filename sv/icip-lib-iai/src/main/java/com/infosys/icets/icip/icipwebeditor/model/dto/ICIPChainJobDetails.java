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
package com.infosys.icets.icip.icipwebeditor.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

// TODO: Auto-generated Javadoc
/**
 * Instantiates a new ICIP chain job details.
 */

/**
 * Instantiates a new ICIP chain job details.
 *
 * @param chain the chain
 * @param chainNumber the chain number
 * @param totalChainElement the total chain element
 */
@AllArgsConstructor

/**
 * To string.
 *
 * @return the java.lang. string
 */

/**
 * To string.
 *
 * @return the java.lang. string
 */
@Data
public class ICIPChainJobDetails {

	/** The chain. */
	private boolean chain;

	/** The chain number. */
	private int chainNumber;

	/** The total chain element. */
	private int totalChainElement;

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
		ICIPChainJobDetails other = (ICIPChainJobDetails) obj;
		if (chain != other.chain)
			return false;
		if (chainNumber != other.chainNumber)
			return false;
		if (totalChainElement != other.totalChainElement)
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
		result = prime * result + (chain ? 1231 : 1237);
		result = prime * result + chainNumber;
		result = prime * result + totalChainElement;
		return result;
	}

}
