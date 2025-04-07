/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

public class PageRequestCustomOffset extends PageRequest{
	private int offset;
	/**
	 * 
	 */
	private static final long serialVersionUID = 4973091720129362515L;


	public PageRequestCustomOffset(int page, int size, Sort sort) {
		super(page, size, sort);
		this.offset = page;
	}
	
	
	@Override
	public long getOffset() {
		return (long) this.offset;
	}
	
}
