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
