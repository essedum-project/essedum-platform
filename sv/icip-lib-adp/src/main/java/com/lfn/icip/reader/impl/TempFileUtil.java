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

package com.lfn.icip.reader.impl;

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