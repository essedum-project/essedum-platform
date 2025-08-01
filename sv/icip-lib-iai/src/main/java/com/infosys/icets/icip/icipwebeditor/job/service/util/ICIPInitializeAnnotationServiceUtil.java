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
