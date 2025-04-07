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
package com.infosys.icets.icip.icipwebeditor.job.listener;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import com.infosys.icets.icip.icipwebeditor.fileserver.service.impl.FileServerService;
import com.infosys.icets.icip.icipwebeditor.job.model.FileUploadEvent;

import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
//
/**
 * The Class FileUploadEventListener.
 *
 * @author icets
 */

@Component

/** The Constant log. */
@Log4j2
/** The Constant log. */
public class FileUploadEventListener implements ApplicationListener<FileUploadEvent> {

	/** The fileserver service. */
	@Autowired
	private FileServerService fileserverService;

	/**
	 * On application event.
	 *
	 * @param event the event
	 */
	@Override
	public void onApplicationEvent(FileUploadEvent event) {
		try {
			fileserverService.uploadExtraFiles(event.getPath(), event.getFolder(), event.getFileid(),
					event.getTotalCount(), event.isReplace(), event.getOrg());
		} catch (Exception e) {
			log.error(e.getMessage(), e);
		}
	}

}
