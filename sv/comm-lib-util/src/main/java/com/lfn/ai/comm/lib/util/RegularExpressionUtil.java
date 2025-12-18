/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.ai.comm.lib.util;

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
