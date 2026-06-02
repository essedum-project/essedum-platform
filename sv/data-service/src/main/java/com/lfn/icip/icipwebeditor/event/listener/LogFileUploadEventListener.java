package com.lfn.icip.icipwebeditor.event.listener;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.lfn.icip.icipwebeditor.event.model.LogFileUploadEvent;
import com.lfn.icip.icipwebeditor.fileserver.service.impl.FileServerService;
import com.lfn.icip.icipwebeditor.fileserver.util.FileUtil;
import com.lfn.icip.icipwebeditor.fileserver.util.FileUtil.SplittedFile;

import ch.qos.logback.classic.LoggerContext;
import lombok.extern.log4j.Log4j2;
import com.lfn.ai.comm.lib.util.ICIPUtils;

// TODO: Auto-generated Javadoc
/**
 *  The Constant log.
 *
 * @see LogFileUploadEventEvent
 */

/** The Constant log. */
@Log4j2
@Component
public class LogFileUploadEventListener {
	
	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(LogFileUploadEventListener.class);
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
	public void onApplicationEvent(LogFileUploadEvent event) {
		Marker marker = null;
		String uid = ICIPUtils.removeSpecialCharacter(UUID.randomUUID().toString());
		marker = MarkerFactory.getMarker(uid);
		LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
		loggerContext.putProperty("marker", String.valueOf(event.getJobId()));
		try {
			Path outPath = Paths.get(event.getPath());
			SplittedFile splittedFile = FileUtil.splitFile(outPath);
			String parent = splittedFile.getPath().toAbsolutePath().toString();
			for (int index = 0, limit = splittedFile.getTotalCount(); index < limit; index++) {
				fileServerService.upload(Paths.get(parent, String.valueOf(index)), event.getJobId(), limit, true,
						event.getOrg());
			}
		} catch (Exception e) {
//			log.error("Unable to upload or split log file");
//			log.error(e.getMessage(), e);
			logger.info(marker,"Unable to upload or split log file");

		}
	}

}
