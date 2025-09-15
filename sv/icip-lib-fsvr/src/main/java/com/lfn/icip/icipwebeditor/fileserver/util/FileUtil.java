package com.lfn.icip.icipwebeditor.fileserver.util;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/** The Constant log. */
@Log4j2
public class FileUtil {

	/**
	 * Instantiates a new file util.
	 */
	private FileUtil() {
	}

	/**
	 * Gets the last call.
	 *
	 * @param path the path
	 * @return the last call
	 * @throws Exception the exception
	 */
	public static boolean getLastCall(Path path) throws Exception {
		String read = getFirstLine(path);
		Timestamp oldTimestamp = Timestamp.valueOf(read);
		Timestamp currentTimestamp = Timestamp.from(Instant.now());
		long milliseconds1 = oldTimestamp.getTime();
		long milliseconds2 = currentTimestamp.getTime();
		long diff = milliseconds2 - milliseconds1;
		long diffMinutes = diff / (60 * 1000);
		return diffMinutes < 4L;
	}

	/**
	 * Gets the first line.
	 *
	 * @param path the path
	 * @return the first line
	 * @throws Exception the exception
	 */
	public static String getFirstLine(Path path) throws Exception {
		return Files.readAllLines(path).get(0);
	}

	/**
	 * Merge file.
	 *
	 * @param filename the filename
	 * @param path the path
	 * @return the file
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static File mergeFile(String filename, Path path) throws IOException {
		File merged = null;
		if (Files.exists(path)) {
			try (Stream<Path> streamPath = Files.walk(path.getParent())) {
				List<Path> paths = streamPath.parallel().filter(p -> !p.toFile().isDirectory()
						&& p.getParent().equals(path.getParent()) && p.getFileName().toString().matches("\\d+"))
						.sorted((path1, path2) -> {
							int count1 = Integer.parseInt(path1.getFileName().toString());
							int count2 = Integer.parseInt(path2.getFileName().toString());
							return Integer.compare(count1, count2);
						}).collect(Collectors.toList());
				Path mergedPath = Paths.get(path.getParent().toString(), filename);
				Files.deleteIfExists(mergedPath);
				Files.createFile(mergedPath);
				merged = mergedPath.toFile();
				for (int i = 0, j = paths.size(); i < j; i++) {
					Path chunkPath = paths.get(i);
					File chunk = chunkPath.toFile();
					try (FileOutputStream fos = new FileOutputStream(merged, true)) {
						Files.copy(Paths.get(chunk.getAbsolutePath()), fos);
						fos.flush();
					} catch (IOException e) {
						log.error("Error merging file: {}", e.getMessage());
					}
				}
			}
		}
		return merged;
	}

	/**
	 * Delete directory.
	 *
	 * @param path the path
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static void deleteDirectory(Path path) throws IOException {
		try (Stream<Path> stream = Files.walk(path)) {
			stream.sorted(Comparator.reverseOrder()).map(Path::toFile).forEach(File::delete);
		}
	}

	/**
	 * Checks if is empty directory.
	 *
	 * @param path the path
	 * @return true, if is empty directory
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static boolean isEmptyDirectory(Path path) throws IOException {
		if (Files.isDirectory(path)) {
			try (Stream<Path> entries = Files.list(path)) {
				return !entries.findFirst().isPresent();
			}
		}
		return false;
	}

	/**
	 * Zip.
	 *
	 * @param fileToZip the file to zip
	 * @param targetFile the target file
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static void zip(File fileToZip, File targetFile) throws IOException {
		try (FileOutputStream fos = new FileOutputStream(targetFile)) {
			try (ZipOutputStream zipOut = new ZipOutputStream(fos)) {
				zipFolder(fileToZip, fileToZip.getName(), zipOut);
			}
		}
	}


	/**
	 * Zip folder.
	 *
	 * @param fileToZip the file to zip
	 * @param fileName the file name
	 * @param zipOut the zip out
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	private static void zipFolder(File fileToZip, String fileName, ZipOutputStream zipOut) throws IOException {
		if (fileToZip.isHidden()) {
			return;
		}
		if (fileToZip.isDirectory()) {
			if (fileName.endsWith("/")) {
				zipOut.putNextEntry(new ZipEntry(fileName));
				zipOut.closeEntry();
			} else {
				zipOut.putNextEntry(new ZipEntry(fileName + "/"));
				zipOut.closeEntry();
			}
			File[] children = fileToZip.listFiles();
			for (File childFile : children) {
				zipFolder(childFile, fileName + "/" + childFile.getName(), zipOut);
			}
			return;
		}
		try (FileInputStream fis = new FileInputStream(fileToZip)) {
			ZipEntry zipEntry = new ZipEntry(fileName);
			zipOut.putNextEntry(zipEntry);
			byte[] bytes = new byte[1024];
			int length;
			while ((length = fis.read(bytes)) >= 0) {
				zipOut.write(bytes, 0, length);
			}
		}
	}


	/**
	 * Split file.
	 *
	 * @param path the path
	 * @return the splitted file
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static SplittedFile splitFile(Path path) throws IOException {
		Path target = Files.createTempDirectory("logchucks");
		int partCounter = 0;
		int sizeOfFiles = 1024 * 200;
		byte[] buffer = new byte[sizeOfFiles];
		BufferedInputStream bis = null;
		try (FileInputStream fis = new FileInputStream(path.toFile())) {
			bis = new BufferedInputStream(fis);
			int bytesAmount = 0;
			while ((bytesAmount = bis.read(buffer)) > 0) {
				Path newPath = Paths.get(target.toAbsolutePath().toString(), String.valueOf(partCounter));
				Files.deleteIfExists(newPath);
				Files.createFile(newPath);
				try (FileOutputStream out = new FileOutputStream(newPath.toFile())) {
					out.write(buffer, 0, bytesAmount);
				}
				partCounter++;
			}
		}
		 finally {
				if(bis != null)
				{
				try {
					 bis.close();
					 } catch (IOException e) {
						 log.error(e.getMessage(), e);
					 }
				}
			}
		return new SplittedFile(target, partCounter);
	}

	/**
	 * To string.
	 *
	 * @return the java.lang. string
	 */
	@Data
	
	/**
	 * Instantiates a new splitted file.
	 *
	 * @param path the path
	 * @param totalCount the total count
	 */
	@AllArgsConstructor
	
	/**
	 * Instantiates a new splitted file.
	 */
	@NoArgsConstructor
	public static class SplittedFile {
		
		/** The path. */
		private Path path;
		
		/** The total count. */
		private int totalCount;
	}

}
