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
package com.infosys.icets.ai.comm.lib.util.exceptions;


import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

public class ApiErrorTest {
	
	@Test
	public void TestApiError() {
		HttpStatus status=HttpStatus.ACCEPTED;
		String message="Message";
		List<String> errors=new ArrayList();
		errors.add("error1");
		String error="error";
		ApiError apiError1=new ApiError(status,message,errors);
		ApiError apiError2=new ApiError(status,message,error);
		assertEquals(apiError1.getMessage(),apiError2.getMessage());
	}

}
