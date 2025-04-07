package com.infosys.icets.icip.icipwebeditor.event.factory;

import com.infosys.icets.ai.comm.lib.util.event.IAPIEvent;

// TODO: Auto-generated Javadoc
/**
 * A factory for creating IAPIEvent objects.
 */
public interface IAPIEventFactory {

	/**
	 * Gets the API event.
	 *
	 * @param name the name
	 * @return the API event
	 */
	IAPIEvent getAPIEvent(String name);
}
