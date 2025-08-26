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

package com.infosys.icets.ai.comm.lib.util;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.Base64;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Base64;
import java.util.stream.Stream;

import org.apache.commons.io.input.ReversedLinesFileReader;
import org.apache.commons.lang3.RandomStringUtils;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.json.JSONObject;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.spi.MappingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.codec.Hex;
import org.springframework.security.oauth2.jwt.Jwt;

import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.ai.comm.lib.util.logger.JobLogger;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;

@Log4j2
public class ICIPUtils {

	private static final Integer IS_KEYWORD_ACTIVE = 0;
	private static final Integer IS_COUNT_ACTIVE = 1;
	private static final String LINE_SEPARATOR = "line.separator";
	public static final int LETTER_IN_A_SENTENCE = 250;

	private static final Logger logger = LoggerFactory.getLogger(JobLogger.class);

	private ICIPUtils() {
	}

	public static String getUser(String claim) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (claim != null && authentication!=null && authentication.getCredentials() instanceof Jwt) {
			String[] claimArr = claim.split("\\|\\|");
			String user = (String) ((Jwt) (authentication.getCredentials())).getClaim(claimArr[0]);
			/*
			 * When using client credential flow, there will be no user credentials, we must
			 * use the service-account
			 */
			if (user == null && claimArr.length > 1)
				user = claimArr[1];
			return user;
		}
		if (authentication != null && authentication.getName() != null) {
			return authentication.getName();
		} else {
			return "Anonymous";
		}
	}
	
	public static String getUserFromToken(String token, String claim) {
		if(token != null && !token.isEmpty()) {
			String[] chunks = token.split("\\.");
			Base64.Decoder decoder = Base64.getUrlDecoder();
			String payload = new String(decoder.decode(chunks[1]));
			JSONObject jsonObject = new JSONObject(payload);
			if (claim !=null ) {
				String userLogin = jsonObject.getString(claim);
				if (userLogin != null && !userLogin.isEmpty()) {
					return userLogin;
				}
			}
		}
		return "Anonymous";
	}

	public static String generateCorrelationId() {
		Timestamp submittedOn = new Timestamp(new Date().getTime());
		String corelid = String.format("%s%s", UUID.randomUUID().toString(), submittedOn.toInstant().toString());
		return removeSpecialCharacter(corelid);
	}

	public static String createHashString(String param) throws NoSuchAlgorithmException {
		MessageDigest digest = MessageDigest.getInstance("SHA-256");
		byte[] hash = digest.digest(param.getBytes(StandardCharsets.UTF_8));
		return new String(Hex.encode(hash));
	}

	/**
	 * Read file as string builder.
	 *
	 * @param path the path
	 * @return the string builder
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static StringBuilder readFileAsStringBuilder(Path path) throws IOException {
		int buffer_capacity = 5200;
		StringBuilder script = new StringBuilder(buffer_capacity);
		try (InputStream is = new FileInputStream(path.toAbsolutePath().toString())) {
			log.info("Reading file...");
			try (BufferedReader br = new BufferedReader(new InputStreamReader(is), 2048)) {
				String line;
				while ((line = br.readLine()) != null) {
					script.append(line);
					script.append(System.getProperty(LINE_SEPARATOR));
				}
				return script;
			} catch (IOException e) {
				log.error(e.getMessage(), e);
			}
		}
		return script;
	}

	public static BufferResult bufferedReadFileAsStringBuilder(Path path, int offset, long limit) throws IOException {
		StringBuilder script = new StringBuilder();
		String[] stringlines = { "", "" };
		int[] counter = { 0 };
		if (offset > 0) {
			offset--;
		}
		try (Stream<String> file = Files.lines(path)) {
			try (Stream<String> lines = file.skip(offset).limit(limit)) {
				lines.forEach(line -> {
					if (counter[0] == 0) {
						stringlines[0] = line + System.getProperty(LINE_SEPARATOR);
					} else {
						stringlines[1] = line + System.getProperty(LINE_SEPARATOR);
						script.append(line);
						script.append(System.getProperty(LINE_SEPARATOR));
					}
					counter[0] = counter[0] + 1;
				});
			}
		}
		if (counter[0] == 1) {
			stringlines[1] = stringlines[0];
		}
		return new BufferResult(counter[0], script, stringlines[0], stringlines[1]);
	}

	/**
	 * Read file.
	 *
	 * @param path the path
	 * @return the list
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static List<String> readFile(Path path) throws IOException {
		List<String> script = new ArrayList<>();
		try (InputStream is = new FileInputStream(path.toAbsolutePath().toString())) {
			log.info("Reading file...");
			try (BufferedReader br = new BufferedReader(new InputStreamReader(is), 2048)) {
				String line;
				while ((line = br.readLine()) != null) {
					script.add(line);
				}
				return script;
			} catch (IOException e) {
				log.error(e.getMessage(), e);
			}
		}
		return Collections.emptyList();
	}

	/**
	 * Read file from last lines.
	 *
	 * @param path the path
	 * @param size the size
	 * @return the list
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static List<String> readFileFromLastLines(Path path, int size) throws IOException {
		List<String> script = new ArrayList<>();
		try (ReversedLinesFileReader reader = new ReversedLinesFileReader(path.toFile(), StandardCharsets.UTF_8)) {
			String line = "";
			while ((line = reader.readLine()) != null && script.size() < size) {
				script.add(line);
			}
			return script;
		}
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

	/*
	 * 1. Generate Random String %randomstring - with its length, say 5
	 * %randomstring#5!
	 * 
	 * 2. Generate Random Number %randomdigit - with its length, say 3
	 * %randomdigit#3!
	 * 
	 * 3. Use Parameter %parameter_ - with its index, say 1 (first parameter)
	 * %parameter_1 - with its length, say 2 %parameter_1#2!
	 * 
	 * 4. Hardcoded text (say INC) INC
	 *
	 * e.g., INC%parameter_1#2!%parameter_2#3!%randomdigit#3!%randomstring#5! output
	 * : INCABXYZ202nFICi
	 * 
	 */
	public static String randomStringGenerator(String regex, String... parameters) throws LeapException {
		try {
			StringBuilder result = new StringBuilder("");
			Map<String, Integer> map = new LinkedHashMap<>();
			char[] regexchars = regex.toCharArray();
			boolean[] flags = new boolean[] { false, false };
			StringBuilder hardcodedString = new StringBuilder("");
			String[] currentElements = new String[] { "", "" };
			for (char current : regexchars) {
				if (current == '%') {
					resetEveryBoolean(flags, IS_KEYWORD_ACTIVE);
					hardcodedString = addToMap(map, hardcodedString);
					continue;
				} else {
					if (flags[IS_KEYWORD_ACTIVE] && current == '#') {
						resetEveryBoolean(flags, IS_COUNT_ACTIVE);
						continue;
					} else {
						if (flags[IS_COUNT_ACTIVE] && current == '!') {
							resetEveryBoolean(flags, -1);
							resetElements(map, currentElements);
							continue;
						}
					}
				}
				appendCharacters(flags, hardcodedString, currentElements, current);
			}
			generateResult(result, map, parameters);
			return result.toString();
		} catch (Exception ex) {
			log.error("Some error occured", ex);
			throw new LeapException("Invalid Expression");
		}
	}

	private static void resetElements(Map<String, Integer> map, String[] currentElements) {
		map.put(currentElements[IS_KEYWORD_ACTIVE], Integer.parseInt(currentElements[IS_COUNT_ACTIVE]));
		Arrays.fill(currentElements, "");
	}

	private static StringBuilder addToMap(Map<String, Integer> map, StringBuilder hardcodedString) {
		String tmp = hardcodedString.toString();
		if (!tmp.trim().isEmpty()) {
			map.put(tmp, 1);
		}
		hardcodedString = new StringBuilder("");
		return hardcodedString;
	}

	private static void appendCharacters(boolean[] flags, StringBuilder hardcodedString, String[] currentElements,
			char current) {
		if (flags[IS_KEYWORD_ACTIVE]) {
			currentElements[IS_KEYWORD_ACTIVE] = currentElements[IS_KEYWORD_ACTIVE] + String.valueOf(current);
		} else {
			if (flags[IS_COUNT_ACTIVE]) {
				currentElements[IS_COUNT_ACTIVE] = currentElements[IS_COUNT_ACTIVE] + String.valueOf(current);
			} else {
				hardcodedString.append(String.valueOf(current));
			}
		}
	}

	private static void generateResult(StringBuilder result, Map<String, Integer> map, String... parameters) {
		final String parameter = "parameter_";
		final String randomdigit = "randomdigit";
		final String randomstring = "randomstring";
		map.forEach((key, value) -> {
			if (key.startsWith(parameter)) {
				int index = Integer.parseInt(key.substring(parameter.length())) - 1;
				int len = parameters[index].length();
				String subresult;
				if (value <= len) {
					subresult = parameters[index].substring(0, value);
				} else {
					subresult = parameters[index] + RandomStringUtils.random(value - len, true, false);
				}
				result.append(subresult);
			} else {
				if (key.startsWith(randomstring)) {
					String subresult = RandomStringUtils.random(value, true, false);
					result.append(subresult);
				} else {
					if (key.startsWith(randomdigit)) {
						String subresult = RandomStringUtils.random(value, false, true);
						result.append(subresult);
					} else {
						result.append(key);
					}
				}
			}
		});
	}

	private static void resetEveryBoolean(boolean[] flags, int index) {
		Arrays.fill(flags, false);
		if (index > -1) {
			flags[index] = true;
		}
	}

	/**
	 * Convert string to date.
	 *
	 * @param openDateStr the open date str
	 * @param dateFormat
	 * @return the timestamp
	 * @throws IllegalArgumentException the illegal argument exception
	 */
	public static DateTime convertStringToDate(String openDateStr, String dateFormat) {
		Map<String, String> dateMap = new HashMap<String, String>();
		dateMap.put("^\\d{8}$", "yyyyMMdd");
		dateMap.put("^\\d{1,2}-\\d{1,2}-\\d{4}$", "dd-MM-yyyy");
		dateMap.put("^\\d{4}-\\d{1,2}-\\d{1,2}$", "yyyy-MM-dd");
		dateMap.put("^\\d{1,2}/\\d{1,2}/\\d{4}$", "MM/dd/yyyy");
		dateMap.put("^\\d{4}/\\d{1,2}/\\d{1,2}$", "yyyy/MM/dd");
		dateMap.put("^\\d{1,2}\\s[a-z]{3}\\s\\d{4}$", "dd MMM yyyy");
		dateMap.put("^\\d{1,2}\\s[a-z]{4,}\\s\\d{4}$", "dd MMMM yyyy");
		dateMap.put("^\\d{12}$", "yyyyMMddHHmm");
		dateMap.put("^\\d{8}\\s\\d{4}$", "yyyyMMdd HHmm");
		dateMap.put("^\\d{1,2}-\\d{1,2}-\\d{4}\\s\\d{1,2}:\\d{2}$", "dd-MM-yyyy HH:mm");
		dateMap.put("^\\d{4}-\\d{1,2}-\\d{1,2}\\s\\d{1,2}:\\d{2}$", "yyyy-MM-dd HH:mm");
		dateMap.put("^\\d{1,2}/\\d{1,2}/\\d{4}\\s\\d{1,2}:\\d{2}$", "MM/dd/yyyy HH:mm");
		dateMap.put("^\\d{4}/\\d{1,2}/\\d{1,2}\\s\\d{1,2}:\\d{2}$", "yyyy/MM/dd HH:mm");
		dateMap.put("^\\d{1,2}\\s[a-z]{3}\\s\\d{4}\\s\\d{1,2}:\\d{2}$", "dd MMM yyyy HH:mm");
		dateMap.put("^\\d{1,2}\\s[a-z]{4,}\\s\\d{4}\\s\\d{1,2}:\\d{2}$", "dd MMMM yyyy HH:mm");
		dateMap.put("^\\d{14}$", "yyyyMMddHHmmss");
		dateMap.put("^\\d{8}\\s\\d{6}$", "yyyyMMdd HHmmss");
		dateMap.put("^\\d{1,2}-\\d{1,2}-\\d{4}\\s\\d{1,2}:\\d{2}:\\d{2}$", "dd-MM-yyyy HH:mm:ss");
		dateMap.put("^\\d{4}-\\d{1,2}-\\d{1,2}\\s\\d{1,2}:\\d{2}:\\d{2}$", "yyyy-MM-dd HH:mm:ss");
		dateMap.put("^\\d{1,2}/\\d{1,2}/\\d{4}\\s\\d{1,2}:\\d{2}:\\d{2}$", "MM/dd/yyyy HH:mm:ss");
		dateMap.put("^\\d{4}/\\d{1,2}/\\d{1,2}\\s\\d{1,2}:\\d{2}:\\d{2}$", "yyyy/MM/dd HH:mm:ss");
		dateMap.put("^\\d{1,2}\\s[a-z]{3}\\s\\d{4}\\s\\d{1,2}:\\d{2}:\\d{2}$", "dd MMM yyyy HH:mm:ss");
		dateMap.put("^\\d{1,2}\\s[a-z]{4,}\\s\\d{4}\\s\\d{1,2}:\\d{2}:\\d{2}$", "dd MMMM yyyy HH:mm:ss");

		if (!dateFormat.isEmpty()) {
			try {
				DateTimeFormatter formatter = DateTimeFormat.forPattern(dateFormat);
				DateTime dt = formatter.parseDateTime(openDateStr);
				return dt;
			} catch (NullPointerException | IllegalArgumentException de) {
				for (String regexp : dateMap.keySet()) {
					if (openDateStr.toLowerCase().matches(regexp)) {
						dateFormat = dateMap.get(regexp);
					}
				}
				if (!dateFormat.isEmpty() && !dateFormat.equals("yyyy-MM-dd'T'HH:mm:ssZ")) {
					DateTimeFormatter formatter = DateTimeFormat.forPattern(dateFormat);
					DateTime dt = formatter.parseDateTime(openDateStr);
					return dt;
				} else if (!dateFormat.isEmpty() && dateFormat.equals("yyyy-MM-dd'T'HH:mm:ssZ")) {
					SimpleDateFormat formatter;
					Date date = new Date();
					formatter = new SimpleDateFormat("E MMM dd HH:mm:ss Z yyyy");
					try {
						date = (Date) formatter.parse(openDateStr);
					} catch (ParseException e) {
					    log.error("Exception " + e);
					}
					Calendar cal = Calendar.getInstance();
					cal.setTime(date);
					String formatedDate;
					if (cal.get(Calendar.HOUR) != 0) {
						formatedDate = cal.get(Calendar.DATE) + "/" + (cal.get(Calendar.MONTH) + 1) + "/"
								+ cal.get(Calendar.YEAR) + " " + cal.get(Calendar.HOUR) + ":" + cal.get(Calendar.MINUTE)
								+ ":" + cal.get(Calendar.SECOND);
					} else {
						formatedDate = cal.get(Calendar.DATE) + "/" + (cal.get(Calendar.MONTH) + 1) + "/"
								+ cal.get(Calendar.YEAR);
					}
					DateTimeFormatter format = DateTimeFormat.forPattern("dd/MM/yyyy hh:mm:ss");
					DateTime dt = format.parseDateTime(formatedDate);
					return dt;

				}
			}

		}
		return null;
	}

	public static void deleteAllOlderFilesInDirectory(Marker marker, String filepath, int days, boolean recursive)
			throws IOException {
		Path path = Paths.get(filepath);
		deleteAllOlderFilesInDirectory(marker, path, days, recursive);
	}

	public static void deleteAllOlderFilesInDirectory(Marker marker, Path path, int days, boolean recursive)
			throws IOException {
		try (Stream<Path> files = Files.walk(path).filter(p -> !Files.isDirectory(p)
				&& (Instant.now().toEpochMilli() - p.toFile().lastModified()) / (1000 * 60 * 60 * 24) > days)) {
			files.forEach(file -> {
				logger.info(marker, "Checking {} {}", file, recursive ? "recursively" : "");
				if (recursive || (!recursive && file.getParent().equals(path))) {
					try {
						logger.info(marker, "Deleting {}...", file);
						Files.delete(file);
						logger.info(marker, "Deleted {}", file);
					} catch (IOException e) {
						log.error("Error in deleting file : {}", e.getMessage());
						logger.error(marker, "Error in deleting file : {}", e.getMessage());
					}
				}
			});
		}
	}

	/**
	 * Escape charecters.
	 *
	 * @param stringCellValue the string cell value
	 * @return the string
	 */
	public static String escapeCharecters(String stringCellValue) {
		stringCellValue = stringCellValue.replace("\"", "");
		stringCellValue = stringCellValue.replace("\\", "");
		stringCellValue = stringCellValue.replace("'", "");
		stringCellValue = stringCellValue.replace("\"", "");
		return stringCellValue;
	}

	public static int getGeneratedKey(Statement stmt) throws SQLException {
		ResultSet generatedkeys = stmt.getGeneratedKeys();
		try
		{
			if (generatedkeys.last())
				return generatedkeys.getInt(1);
			return 0;
			
		}
		catch(Exception e) {
			if (generatedkeys.next())
				return generatedkeys.getInt(1);
			return 0;
		}
		
	}

	@AllArgsConstructor
	@Getter
	public static class BufferResult {
		private int line;
		private StringBuilder stringBuilder;
		private String firstLine;
		private String lastLine;
	}

	public static String sanitizeRole(String role) {
		return role.toLowerCase().replaceAll("[^a-zA-Z0-9]", "");
	}
	
	public static String sanitizeEntity(String role) {
		return role.toLowerCase().replaceAll("[^a-zA-Z0-9.@_]", "");
	}

	public static ModelMapper getModelMapper() {
		ModelMapper modelmapper = new ModelMapper();
		Converter<Map<String, String>, String> converter = new Converter<>() {
			@Override
			public String convert(MappingContext<Map<String, String>, String> attr) {
				JSONObject jObj = new JSONObject();
				attr.getSource().entrySet().stream().forEach(entry -> {
					jObj.put(entry.getKey(), entry.getValue());
				});
				return jObj.toString();
			}
		};
		modelmapper.addConverter(converter);
		return modelmapper;
	}

	public static String convertLocalDate(Date date) {
		return java.time.format.DateTimeFormatter.ISO_INSTANT.format(date.toInstant().atZone(ZoneId.of("UTC")));
	}
}
