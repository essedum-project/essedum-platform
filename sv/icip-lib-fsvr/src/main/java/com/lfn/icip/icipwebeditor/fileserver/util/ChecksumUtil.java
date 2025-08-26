package com.lfn.icip.icipwebeditor.fileserver.util;

import java.io.FileInputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import org.apache.commons.codec.digest.DigestUtils;

// TODO: Auto-generated Javadoc
/**
 * The Class ChecksumUtil.
 */
public class ChecksumUtil {

	/**
	 * Instantiates a new checksum util.
	 */
	private ChecksumUtil() {
	}

	/**
	 * Check.
	 *
	 * @param receivedCheckSum the received check sum
	 * @param path the path
	 * @param metaPath the meta path
	 * @throws Exception the exception
	 */
	public static void check(String receivedCheckSum, Path path, Path metaPath) throws Exception {
		//FileInputStream fis = null;
		try (FileInputStream fis = new FileInputStream(path.toFile())) {
			
			String checksum = DigestUtils.sha256Hex(fis);
			if (!checksum.equals(receivedCheckSum)) {
				throw new Exception("Checksum mismatch");
			} else {
				Files.createDirectories(metaPath.getParent());
				byte[] strToBytes = checksum.getBytes();
				Files.write(metaPath, strToBytes);
			}
		}
		
	}

}
