package com.lfn.icip.icipwebeditor.fileserver.service.impl;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Service;

import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.icip.icipwebeditor.fileserver.constants.LoggerConstants;
import com.lfn.icip.icipwebeditor.fileserver.factory.FileServerFactory;
import com.lfn.icip.icipwebeditor.fileserver.util.APIUtil;
import com.lfn.icip.icipwebeditor.fileserver.util.FileUtil;

// TODO: Auto-generated Javadoc
/**
 * The Class CommonService.
 */
@Service
@RefreshScope
public class CommonService {

	/** The factory. */
	@Autowired
	private FileServerFactory factory;

	/** The active server. */
	@EssedumProperty("icip.fileserver.active.server")
	private String activeServer;

	/**
	 * Deploy.
	 *
	 * @param authserviceSession the authservice session
	 * @param url the url
	 * @param filename the filename
	 * @param inferenceClassFileName the inference class file name
	 * @param modelClassFileName the model class file name
	 * @param requirementsFileName the requirements file name
	 * @param fileid the fileid
	 * @param bucket the bucket
	 * @return the string
	 * @throws Exception the exception
	 */
	public String deploy(String authserviceSession, String url, String filename, String inferenceClassFileName,
			String modelClassFileName, String requirementsFileName, String fileid, String bucket) throws Exception {
		Path dirpath = createTempPath();
		downloadAllFiles(fileid, bucket, dirpath);
		downloadAllFiles(String.format(LoggerConstants.STRING_SLASH_STRING, fileid, "inferenceClass"), bucket, dirpath);
		downloadAllFiles(String.format(LoggerConstants.STRING_SLASH_STRING, fileid, "modelClass"), bucket, dirpath);
		downloadAllFiles(String.format(LoggerConstants.STRING_SLASH_STRING, fileid, "requirements"), bucket, dirpath);
		File merged = FileUtil.mergeFile(filename, Paths.get(dirpath.toAbsolutePath().toString(), fileid, "0"));
		File inferenceClassFile = FileUtil.mergeFile(inferenceClassFileName,
				Paths.get(dirpath.toAbsolutePath().toString(),
						String.format(LoggerConstants.STRING_SLASH_STRING, fileid, "inferenceClass"), "0"));
		File modelClassFile = FileUtil.mergeFile(modelClassFileName, Paths.get(dirpath.toAbsolutePath().toString(),
				String.format(LoggerConstants.STRING_SLASH_STRING, fileid, "modelClass"), "0"));
		File requirementsFile = FileUtil.mergeFile(requirementsFileName, Paths.get(dirpath.toAbsolutePath().toString(),
				String.format(LoggerConstants.STRING_SLASH_STRING, fileid, "requirements"), "0"));
		return APIUtil.callDeployAPI(authserviceSession, url, merged, inferenceClassFile, modelClassFile,
				requirementsFile);
	}

	/**
	 * Download all files.
	 *
	 * @param fileid the fileid
	 * @param bucket the bucket
	 * @param dirpath the dirpath
	 * @throws Exception the exception
	 */
	private void downloadAllFiles(String fileid, String bucket, Path dirpath) throws Exception {
		int limit = Integer.parseInt(factory.getServiceUtil(activeServer).getLastIndex(fileid, bucket));
		for (int index = 0; index < limit; index++) {
			Path path = Paths.get(dirpath.toAbsolutePath().toString(), fileid, String.valueOf(index));
			Files.createDirectories(path.getParent());
			Files.deleteIfExists(path);
			Files.createFile(path);
			byte[] bytes = factory.getServiceUtil(activeServer).download(fileid, String.valueOf(index), bucket);
			Files.write(path, bytes, StandardOpenOption.CREATE);
		}
	}

	/**
	 * Creates the temp path.
	 *
	 * @return the path
	 * @throws Exception the exception
	 */
	public Path createTempPath() throws Exception {
		return Files.createTempDirectory(activeServer);
	}
}
