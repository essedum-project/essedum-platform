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
package com.infosys.icets.icip.icipwebeditor.job.service.util;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.List;

import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Component;

import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperties;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.icip.icipwebeditor.job.util.SystemUtils;

import lombok.Getter;
import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPInitializeAnnotationServiceUtil.
 */
@Component

/**
 * Gets the python app name.
 *
 * @return the python app name
 */

/**
 * Gets the instance id.
 *
 * @return the instance id
 */
@Getter

/** The Constant log. */
@Log4j2
@RefreshScope
public class ICIPInitializeAnnotationServiceUtil {

	/** The environments. */
	@LeapProperties("icip.environment")
	private List<String> environments;

	/** The folder path. */
	@LeapProperty("icip.jobLogFileDir")
	private String folderPath;

	/** The agents timeout. */
	@LeapProperty("icip.agentsTimeout")
	private String agentsTimeout;

	/** The python main class. */
	@LeapProperty("icip.sparkServer.pythonMainClass")
	private String pythonMainClass;

	/** The python app name. */
	@LeapProperty("icip.sparkServer.pythonAppName")
	private String pythonAppName;

	/** The days string. */
	@LeapProperty("icip.cleanup.deletion.days")
	private String daysString;

	/** The fileupload dir. */
	@LeapProperty("icip.fileuploadDir")
	private String fileuploadDir;

	/** The instance id. */
	private String instanceId;

	/**
	 * Instantiates a new ICIP initialize annotation service util.
	 */
	public ICIPInitializeAnnotationServiceUtil() {
		try {
			this.instanceId = SystemUtils.getSystemUUID();
		} catch (NoSuchAlgorithmException | IOException e) {
			log.error(e.getMessage(), e);
		}
	}

}
