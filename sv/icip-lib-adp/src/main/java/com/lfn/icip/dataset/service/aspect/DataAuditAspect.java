package com.lfn.icip.dataset.service.aspect;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.sql.Timestamp;
import java.time.Instant;

import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.icip.dataset.model.dto.ICIPDataAuditResponse;
import com.lfn.icip.dataset.model.dto.ICIPDataAuditResponse.Status;

import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/**
 * The Class DataAuditAspect.
 */
@Aspect
@Component

/** The Constant log. */
@Log4j2
public class DataAuditAspect {

	/** The logging path. */
	@Value("${LOG_PATH}")
	private String loggingPath;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	/**
	 * Resolve ICIP dataset service name.
	 *
	 * @param dataAuditResponse the data audit response
	 */
	@AfterReturning(pointcut = "execution(* com.lfn.icip.dataset.service.util.*.*(..))", returning = "dataAuditResponse")
	public void resolveICIPDatasetServiceName(ICIPDataAuditResponse dataAuditResponse) {
		if (dataAuditResponse.getStatus().equals(Status.SUCCESS)) {
			try {
				Timestamp now = Timestamp.from(Instant.now());
				String log = "[" + now.toString() + "] USER : [" + ICIPUtils.getUser(claim) + "] - ["
						+ dataAuditResponse.getOperation().toString() + "] " + dataAuditResponse.getQuery()
						+ System.lineSeparator();
				Path path = Paths.get(loggingPath,
						ICIPUtils.removeSpecialCharacter(dataAuditResponse.getDataset().getAlias()) + ".log");
				if (!Files.exists(path)) {
					Files.createDirectories(path.getParent());
					Files.createFile(path);
				}
				Files.write(path, log.getBytes(), StandardOpenOption.APPEND);
			} catch (IOException e) {
				log.error(e.getMessage(), e);
			}
		}
	}

}
