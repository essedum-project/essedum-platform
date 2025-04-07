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
package com.infosys.icets.icip.icipwebeditor.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Component;

import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperties;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;

import lombok.Data;

// TODO: Auto-generated Javadoc
//
/**
 * The Class ICIPAgentsFile.
 *
 * @author icets
 */

@Component

/**
 * Instantiates a new ICIP agents config.
 */

/**
 * Instantiates a new ICIP agents config.
 */
@Data
@RefreshScope
public class ICIPAgentsConfig {

	/** The Constant METRICKEYWORD. */
	private static final String METRICKEYWORD = "metric";

	/** The Constant FILEWATCHERKEYWORD. */
	private static final String FILEWATCHERKEYWORD = "filewatcher";

	/** The metricconfigfile. */
	@LeapProperty("icip.agents.metric.configfile")
	private String metricconfigfile;

	/** The metricxmlfile. */
	@LeapProperty("icip.agents.metric.xmlfile")
	private String metricxmlfile;

	/** The metriccollectkey. */
	@LeapProperty("icip.agents.metric.collectkey")
	private String metriccollectkey;

	/** The metricxmlkey. */
	@LeapProperty("icip.agents.metric.xmlkey")
	private String metricxmlkey;

	/** The metricpykey. */
	@LeapProperty("icip.agents.metric.pykey")
	private String metricpykey;

	/** The metricsamplefile. */
	@LeapProperty("icip.agents.metric.samplefile")
	private String metricsamplefile;

	/** The metricbasefile. */
	@LeapProperty("icip.agents.metric.basefile")
	private String metricbasefile;

	/** The metriceggfile. */
	@LeapProperty("icip.agents.metric.eggfile")
	private String metriceggfile;

	/** The metricreadme. */
	@LeapProperty("icip.agents.metric.readme")
	private String metricreadme;

	/** The metricrequirementfile. */
	@LeapProperty("icip.agents.metric.requirementfile")
	private String metricrequirementfile;

	/** The metricreadonlykeys. */
	@LeapProperties("icip.agents.metric.readonlykeys")
	private List<String> metricreadonlykeys;

	/** The metricpasswordkeys. */
	@LeapProperties("icip.agents.metric.passwordkeys")
	private List<String> metricpasswordkeys;

	/** The filewatcherconfigfile. */
	@LeapProperty("icip.agents.filewatcher.configfile")
	private String filewatcherconfigfile;

	/** The filewatcherlookupkey. */
	@LeapProperty("icip.agents.filewatcher.lookupkey")
	private String filewatcherlookupkey;

	/** The filewatcherpykey. */
	@LeapProperty("icip.agents.filewatcher.pykey")
	private String filewatcherpykey;

	/** The filewatchersamplefile. */
	@LeapProperty("icip.agents.filewatcher.samplefile")
	private String filewatchersamplefile;

	/** The filewatcherbasefile. */
	@LeapProperty("icip.agents.filewatcher.basefile")
	private String filewatcherbasefile;

	/** The filewatchereggfile. */
	@LeapProperty("icip.agents.filewatcher.eggfile")
	private String filewatchereggfile;

	/** The filewatcherreadme. */
	@LeapProperty("icip.agents.filewatcher.readme")
	private String filewatcherreadme;

	/** The filewatcherrequirementfile. */
	@LeapProperty("icip.agents.filewatcher.requirementfile")
	private String filewatcherrequirementfile;

	/** The filewatcherreadonlykeys. */
	@LeapProperties("icip.agents.filewatcher.readonlykeys")
	private List<String> filewatcherreadonlykeys;

	/** The filewatcherpasswordkeys. */
	@LeapProperties("icip.agents.filewatcher.passwordkeys")
	private List<String> filewatcherpasswordkeys;

	/**
	 * Gets the config file.
	 *
	 * @param agent the agent
	 * @return the config file
	 */
	public String getConfigFile(String agent) {
		switch (agent.toLowerCase()) {
		case METRICKEYWORD:
			return this.metricconfigfile;
		case FILEWATCHERKEYWORD:
			return this.filewatcherconfigfile;
		default:
			return "";
		}
	}

	/**
	 * Gets the sample file.
	 *
	 * @param agent the agent
	 * @return the sample file
	 */
	public String getSampleFile(String agent) {
		switch (agent.toLowerCase()) {
		case METRICKEYWORD:
			return this.metricsamplefile;
		case FILEWATCHERKEYWORD:
			return this.filewatchersamplefile;
		default:
			return "";
		}
	}

	/**
	 * Gets the base file.
	 *
	 * @param agent the agent
	 * @return the base file
	 */
	public String getBaseFile(String agent) {
		switch (agent.toLowerCase()) {
		case METRICKEYWORD:
			return this.metricbasefile;
		case FILEWATCHERKEYWORD:
			return this.filewatcherbasefile;
		default:
			return "";
		}
	}

	/**
	 * Gets the xml file.
	 *
	 * @param agent the agent
	 * @return the xml file
	 */
	public String getXmlFile(String agent) {
		return agent.equalsIgnoreCase(METRICKEYWORD) ? this.metricxmlfile : "";
	}

	/**
	 * Gets the readme file.
	 *
	 * @param agent the agent
	 * @return the readme file
	 */
	public String getReadmeFile(String agent) {
		switch (agent.toLowerCase()) {
		case METRICKEYWORD:
			return this.metricreadme;
		case FILEWATCHERKEYWORD:
			return this.filewatcherreadme;
		default:
			return "";
		}
	}

	/**
	 * Gets the requirement file.
	 *
	 * @param agent the agent
	 * @return the requirement file
	 */
	public String getRequirementFile(String agent) {
		switch (agent.toLowerCase()) {
		case METRICKEYWORD:
			return this.metricrequirementfile;
		case FILEWATCHERKEYWORD:
			return this.filewatcherrequirementfile;
		default:
			return "";
		}
	}

	/**
	 * Gets the egg file.
	 *
	 * @param agent the agent
	 * @return the egg file
	 */
	public String getEggFile(String agent) {
		switch (agent.toLowerCase()) {
		case METRICKEYWORD:
			return this.metriceggfile;
		case FILEWATCHERKEYWORD:
			return this.filewatchereggfile;
		default:
			return "";
		}
	}

	/**
	 * Gets the read only keys.
	 *
	 * @param agent the agent
	 * @return the read only keys
	 */
	public List<String> getReadOnlyKeys(String agent) {
		switch (agent.toLowerCase()) {
		case METRICKEYWORD:
			return this.metricreadonlykeys;
		case FILEWATCHERKEYWORD:
			return this.filewatcherreadonlykeys;
		default:
			return new ArrayList<>();
		}
	}

	/**
	 * Gets the password keys.
	 *
	 * @param agent the agent
	 * @return the password keys
	 */
	public List<String> getPasswordKeys(String agent) {
		switch (agent.toLowerCase()) {
		case METRICKEYWORD:
			return this.metricpasswordkeys;
		case FILEWATCHERKEYWORD:
			return this.filewatcherpasswordkeys;
		default:
			return new ArrayList<>();
		}
	}
}
