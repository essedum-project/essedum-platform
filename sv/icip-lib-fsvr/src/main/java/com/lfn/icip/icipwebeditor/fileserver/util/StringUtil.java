package com.lfn.icip.icipwebeditor.fileserver.util;

import java.util.Date;
import java.util.UUID;

// TODO: Auto-generated Javadoc
/**
 * The Class StringUtil.
 */
public class StringUtil {
	
	/**
	 * Instantiates a new string util.
	 */
	private StringUtil() {
	}

	/**
	 * Removes the special character.
	 *
	 * @param name the name
	 * @return the string
	 */
	public static String removeSpecialCharacter(String name) {
		return name.replaceAll("[^a-zA-Z0-9_]", "");
	}

	/**
	 * Gets the random string.
	 *
	 * @return the random string
	 */
	public static String getRandomString() {
		String name = UUID.randomUUID().toString();
		name = StringUtil.removeSpecialCharacter(name);
		return name;
	}

	/**
	 * Adds the prefix.
	 *
	 * @param prefix the prefix
	 * @param fileid the fileid
	 * @return the string
	 */
	public static String addPrefix(String prefix, String fileid) {
		Date today = new Date();
		int date = today.getDate();
		int month = today.getMonth() + 1;
		int year = today.getYear() + 1900;
		String dateString = String.format("YY%dMM%dDD%dEE", year, month, date);
		return String.format("%s%s%s", prefix, dateString, fileid);
	}

	/**
	 * Sets the standard bucket name.
	 *
	 * @param bucket the bucket
	 * @return the string
	 */
	public static String setStandardBucketName(String bucket) {
		String lowerCaseText = bucket.toLowerCase();
		String trimmedText = lowerCaseText.substring(0, lowerCaseText.length() > 60 ? 60 : lowerCaseText.length());
		return trimmedText;
	}

}
