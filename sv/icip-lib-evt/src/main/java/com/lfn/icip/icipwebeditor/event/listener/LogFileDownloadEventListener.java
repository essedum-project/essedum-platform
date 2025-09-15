package com.lfn.icip.icipwebeditor.event.listener;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.lfn.icip.icipwebeditor.event.model.LogFileDownloadEvent;
import com.lfn.icip.icipwebeditor.fileserver.service.impl.FileServerService;
import com.lfn.icip.icipwebeditor.job.constants.JobConstants;

import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/**
 *  The Constant log.
 *
 * @see LogFileDownloadEventEvent
 */

/** The Constant log. */
@Log4j2
@Component
public class LogFileDownloadEventListener {

	/** The file server service. */
	@Autowired
	private FileServerService fileServerService;

	/**
	 * On application event.
	 *
	 * @param event the event
	 */
	@Async
	@EventListener
	public void onApplicationEvent(LogFileDownloadEvent event) {
		try {
			Path target = Paths.get(event.getPath());
			Path parent = target.getParent();
			Path source = Paths.get(parent.toAbsolutePath().toString(), "temp_" + target.getFileName().toString());
			Files.createDirectories(source.getParent());
			Files.deleteIfExists(source);
			Files.createFile(source);
			for (int index = 0; index <= event.getCount(); index++) {
				Files.write(source, fileServerService.download(event.getJobId(), String.valueOf(index), event.getOrg()),
						StandardOpenOption.APPEND);
				JobConstants.PROGRESS_MAP.put(event.getJobId(), getPercent(index, event.getCount()));
			}
			Files.move(source, target, StandardCopyOption.REPLACE_EXISTING);
			log.info("Log file of Job with Job-ID {} - Download process completed", event.getJobId());
			JobConstants.PROGRESS_MAP.remove(event.getJobId());
		} catch (Exception e) {
			log.error("Unable to download or merge log files");
			log.error(e.getMessage(), e);
		}
	}

	/**
	 * Gets the percent.
	 *
	 * @param num the num
	 * @param total the total
	 * @return the percent
	 */
	private static int getPercent(int num, int total) {
		return ((num + 1) * 100) / (total + 1);
	}

}
