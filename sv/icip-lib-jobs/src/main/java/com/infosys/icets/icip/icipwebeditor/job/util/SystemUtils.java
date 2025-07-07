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
package com.infosys.icets.icip.icipwebeditor.job.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;

import com.infosys.icets.ai.comm.lib.util.ICIPUtils;

// TODO: Auto-generated Javadoc
/**
 * The Class MachineConfiguration.
 * 
 * @author icets
 *
 */
public class SystemUtils {

	/**
	 * Instantiates a new system utils.
	 */
	private SystemUtils() {
	}

	/**
	 * Gets the system UUID.
	 *
	 * @return the system UUID
	 * @throws IOException              Signals that an I/O exception has occurred.
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	public static String getSystemUUID() throws IOException, NoSuchAlgorithmException {
		String osName = System.getProperty("os.name")!=null ? System.getProperty("os.name").toLowerCase(Locale.ENGLISH):"";
		String[] cmd = new String[3];
		if (osName.startsWith("win")) {
			if (osName.equals("windows 95")) { // windows 95 only
				cmd[0] = "command.com";
			} else {
				cmd[0] = "cmd.exe";
			}
			cmd[1] = "/C";
			cmd[2] = "wmic csproduct get UUID";
		} else {
			if (osName.startsWith("linux")) {
				cmd[0] = "/bin/sh";
				cmd[1] = "-c";
				cmd[2] = "cat /sys/class/dmi/id/product_uuid";
			}
		}
		ProcessBuilder pb = new ProcessBuilder(cmd[0], cmd[1], cmd[2]);
		Process p = pb.start();
		InputStream is = p.getInputStream();
		StringBuilder stringBuilder = new StringBuilder("");
		try (BufferedReader br = new BufferedReader(new InputStreamReader(is), 2048)) {
			String line;
			while ((line = br.readLine()) != null) {
				stringBuilder.append(line);
				stringBuilder.append(" ");
			}
		}
		return ICIPUtils.createHashString(stringBuilder.toString().replaceAll("\\s+", " "));
	}

}
