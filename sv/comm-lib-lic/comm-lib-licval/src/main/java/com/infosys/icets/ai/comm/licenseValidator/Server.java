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
package com.infosys.icets.ai.comm.licenseValidator;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import com.infosys.icets.ai.comm.licenseValidator.exception.LicenseDormantException;
import com.infosys.icets.ai.comm.licenseValidator.exception.LicenseExpiredException;

import lombok.Getter;

// 
/**
 * The Class Server.
 *
 * @author icets
 */
@Getter
class Server {

	/**
	 * Checks if is dormant license.
	 *
	 * @param startDate the start date
	 * @return true, if is dormant license
	 */
	public boolean isDormantLicense(String startDate) {
		LocalDate serverTodayDate = LocalDate.now();
		LocalDate licenseStartDate = LocalDate.parse(startDate, DateTimeFormatter.ISO_DATE);
		return serverTodayDate.isBefore(licenseStartDate);
	}

	/**
	 * Checks if is valid date range.
	 *
	 * @param startDate    the start date
	 * @param durationDays the duration days
	 * @return true, if is valid date range
	 * @throws LicenseDormantException the license dormant exception
	 * @throws LicenseExpiredException the license expired exception
	 */
	public boolean isValidDateRange(String startDate, String durationDays)
			throws LicenseDormantException, LicenseExpiredException {
		LocalDate serverTodayDate = LocalDate.now();
		LocalDate licenseStartDate = LocalDate.parse(startDate, DateTimeFormatter.ISO_DATE);
		int licenseDuration = new Integer(durationDays).intValue();

		if (serverTodayDate.isBefore(licenseStartDate))
			throw new LicenseDormantException();
		if (serverTodayDate.isAfter(licenseStartDate.plusDays(licenseDuration))) {
			throw new LicenseExpiredException();
		}
		return true;
	}
}
