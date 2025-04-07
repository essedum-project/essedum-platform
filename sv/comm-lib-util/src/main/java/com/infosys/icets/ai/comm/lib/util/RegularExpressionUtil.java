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
package com.infosys.icets.ai.comm.lib.util;

import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class RegularExpressionUtil {

	public static boolean matchInputForRegex(String inputTobeVerified , String regEx) {
		try {
		  if(inputTobeVerified.matches(regEx)) {
			  log.debug("input matched {} with regex {} ",inputTobeVerified, regEx);
			  return true;
		  }
		  log.debug("input match failed {} with regex {} ",inputTobeVerified, regEx);
		  return false;
		}
		catch (PatternSyntaxException e) {
			 log.debug("regex is invalid {} error is {} ",regEx,e.getMessage());
			 return false;
		}
		catch (Exception e) {
			 log.error("error occur in regex match regex :{} input :{} massage :{} ",regEx,inputTobeVerified,e.getMessage());
			 return false;
		}
	 }

	 public static boolean verifyRegEx(String regex) throws Exception {
	 try {
		 Pattern.compile(regex);
		 return false;
	 } catch (PatternSyntaxException e) {
		 log.info("Pattern failed to be verified {}, error is {}" , regex, e.getDescription());
		 throw e;
	 }
 }

}
