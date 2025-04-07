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

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.icipwebeditor.IICIPJobServiceUtil;
import com.infosys.icets.icip.icipwebeditor.config.ICIPAgentsConfig;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPNativeJobDetails;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPAgentService;

import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
//
/**
 * The Class ICIPJobServiceUtilAgents.
 *
 * @author icets
 */

@Component("agentsjob")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RefreshScope

/** The Constant log. */
@Log4j2
public class ICIPJobServiceUtilAgents extends ICIPCommonJobServiceUtil implements IICIPJobServiceUtil {

	/**
	 * Instantiates a new ICIP job service util agents.
	 */
	public ICIPJobServiceUtilAgents() {
		super();
	}

	/** The agents config. */
	@Autowired
	private ICIPAgentsConfig agentsConfig;

	/** The agent service. */
	@Autowired
	private ICIPAgentService agentService;

	/** The decryption key. */
	@Value("${encryption.key}")
	private String decryptionKey;

	/** The agent path. */
	@LeapProperty("icip.agentsDir")
	private String agentPath;

	/** The metric command. */
	@LeapProperty("icip.agents.metric.command")
	private String metricCommand;

	/** The filewatcher command. */
	@LeapProperty("icip.agents.filewatcher.command")
	private String filewatcherCommand;

	/**
	 * Gets the command.
	 *
	 * @param jobDetails the job details
	 * @return the command
	 * @throws LeapException the leap exception
	 */
	@Override
	public String getCommand(ICIPNativeJobDetails jobDetails) throws LeapException {
		String cname = jobDetails.getCname();
		String org = jobDetails.getOrg();
		String cmdStr = null;
		log.info("running agents");
		String data = agentService.getJson(cname, org);

		JsonObject binary = null;
		try {
			binary = gson.fromJson(data, JsonElement.class).getAsJsonObject().get("elements").getAsJsonArray().get(0)
					.getAsJsonObject().get("attributes").getAsJsonObject();
		} catch (Exception ex) {
			String msg = "Error in fetching elements[0].attributes : " + ex.getClass().getCanonicalName() + " - "
					+ ex.getMessage();
			log.error(msg, ex);
			throw new LeapException(msg, ex);
		}

		String tmpAgentType = null;
		try {
			tmpAgentType = binary.get("agenttype").getAsString().toLowerCase().trim();
		} catch (Exception ex) {
			String msg = "Error in getting agenttype : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new LeapException(msg, ex);
		}

		Path path = Paths.get(agentPath, tmpAgentType, ICIPUtils.removeSpecialCharacter(org.toLowerCase()),
				ICIPUtils.removeSpecialCharacter(cname.toLowerCase()), agentsConfig.getConfigFile(tmpAgentType));
		String configPath = path.toAbsolutePath().toString();
		switch (tmpAgentType) {
		case "metric":
			cmdStr = resolveCommand(metricCommand, new String[] { configPath, decryptionKey });
			break;
		case "filewatcher":
			cmdStr = resolveCommand(filewatcherCommand, new String[] { configPath, decryptionKey });
			break;
		default:
			log.error("Invalid Type");
		}
		return cmdStr;
	}

	@Override
	public Path getFilePath(ICIPNativeJobDetails jobDetails) {
		// TODO Auto-generated method stub
		return null;
	}

}
