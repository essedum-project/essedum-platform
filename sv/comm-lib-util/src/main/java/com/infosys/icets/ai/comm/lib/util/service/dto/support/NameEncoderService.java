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

package com.infosys.icets.ai.comm.lib.util.service.dto.support;

//import java.util.Random;
import java.security.SecureRandom;

import org.springframework.stereotype.Service;

@Service
public class NameEncoderService {

	public String nameEncoder(String org, String alias) {
		SecureRandom test=new SecureRandom();
		String n1=org.length()>=3?org.substring(0, 3).toUpperCase():org;
		String aliasnew = alias.substring(0, 1) + alias.substring(1).replaceAll("[aeiouAEIOU\\s]", "");
		aliasnew = hasher(aliasnew);
		if (aliasnew.length() < 5) {
			for (int i = 0; i <= (6 - aliasnew.length()); i++) {
				//Random r = new Random();
				String abc = "BCDFGHJKLMNPQRSTVWXYZ";
				char letter = abc.charAt(test.nextInt(abc.length()));
				aliasnew = aliasnew.concat(String.valueOf(letter));
			}
		}
		String n2 = aliasnew.substring(0, 5).toUpperCase();
		String n3 = String.valueOf(Math.round(test.nextDouble() * (99999 - 10000 + 1) + 10000));
		return n1.concat(n2).concat(n3);
	}

	public String hasher(String alias) {
		if (alias.length() <= 1)
			return alias;
		if (alias.charAt(0) == alias.charAt(1))
			return hasher(alias.substring(1));
		else
			return alias.charAt(0) + hasher(alias.substring(1));
	}

}
