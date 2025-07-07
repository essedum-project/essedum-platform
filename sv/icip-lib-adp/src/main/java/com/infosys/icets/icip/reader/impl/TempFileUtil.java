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
package com.infosys.icets.icip.reader.impl;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
// TODO: Auto-generated Javadoc
/**
 * The Class TempFileUtil.
 */
public class TempFileUtil {
	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(TempFileUtil.class);


	/**
	 * Instantiates a new temp file util.
	 */
	private TempFileUtil() {
	}

	/**
	 * Write input stream to file.
	 *
	 * @param is the is
	 * @param bufferSize the buffer size
	 * @return the file
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static File writeInputStreamToFile(InputStream is, int bufferSize) throws IOException {
		File f = Files.createTempFile("tmp-", ".xlsx").toFile();
		try (FileOutputStream fos = new FileOutputStream(f)) {
			int read;
			byte[] bytes = new byte[bufferSize];
			while ((read = is.read(bytes)) != -1) {
				fos.write(bytes, 0, read);
			}
			return f;
		} finally {
			try{
				is.close();
			}
			catch(Exception e){
				log.error(e.getMessage());
			}
		}
	}
}