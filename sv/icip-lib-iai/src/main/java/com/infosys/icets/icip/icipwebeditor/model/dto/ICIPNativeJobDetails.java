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
package com.infosys.icets.icip.icipwebeditor.model.dto;

import java.nio.file.Path;

import com.infosys.icets.icip.icipwebeditor.job.model.TriggerValues;

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
//
/**
 * The Class ICIPNativeJobDetails.
 *
 * @author icets
 */

/**
 * Gets the pytemp file.
 *
 * @return the pytemp file
 */

/**
 * Gets the pytemp file.
 *
 * @return the pytemp file
 */
@Getter

/**
 * Sets the pytemp file.
 *
 * @param pytempFile the new pytemp file
 */

/**
 * Sets the pytemp file.
 *
 * @param pytempFile the new pytemp file
 */
@Setter
public class ICIPNativeJobDetails {

	/** The cname. */
	private String cname;
	
	/** The org. */
	private String org;
	
	/** The params. */
	private String params;

	/** The spark home. */
	private String sparkHome;
	
	/** The python 2 path. */
	private String python2Path;
	
	/** The python 3 path. */
	private String python3Path;

	/** The trigger values. */
	private TriggerValues triggerValues;

	/** The id. */
	private String id;
	
	/** The rest node. */
	private boolean restNode;

	/** The yamltemp file. */
	private Path yamltempFile;
	
	/** The pytemp file. */
	private Path pytempFile;

}
