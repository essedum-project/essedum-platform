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
package com.infosys.icets.icip.icipwebeditor.job.config;

import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;
import org.springframework.stereotype.Component;

// TODO: Auto-generated Javadoc
/**
 * The Class MySQLUpperCaseStrategy.
 *
 * @author icets
 */
@Component
public class UpperCaseStrategy extends PhysicalNamingStrategyStandardImpl {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1383021413247872469L;

	/**
	 * To physical table name.
	 *
	 * @param name the name
	 * @param context the context
	 * @return the identifier
	 */
	@Override
	public Identifier toPhysicalTableName(Identifier name, JdbcEnvironment context) {
		return Identifier.toIdentifier(name.getText().toUpperCase());
	}

}
