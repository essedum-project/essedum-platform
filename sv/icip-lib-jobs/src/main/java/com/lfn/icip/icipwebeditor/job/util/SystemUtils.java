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

package com.lfn.icip.icipwebeditor.job.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;

import com.lfn.ai.comm.lib.util.ICIPUtils;

// TODO: Auto-generated Javadoc
/**
 * The Class MachineConfiguration.
 * 
 * @author essedum
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
