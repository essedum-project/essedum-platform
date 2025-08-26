package com.lfn.icip.icipwebeditor.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.lfn.ai.comm.lib.util.event.IAPIEvent;

// TODO: Auto-generated Javadoc
/**
 * The Class SampleAPIEvent.
 */
@Component("SampleAPIEvent")
public class SampleAPIEvent implements IAPIEvent {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(SampleAPIEvent.class);
	
	/**
	 * Run.
	 *
	 * @param data the data
	 * @return the string
	 */
	@Override
	public String run(String data) {
		logger.info("API EVENT DATA: " + data);
		return null;
	}

	/**
	 * Gets the name.
	 *
	 * @return the name
	 */
	@Override
	public String getName() {
		return "SampleAPIEvent";
	}
	
	

}
