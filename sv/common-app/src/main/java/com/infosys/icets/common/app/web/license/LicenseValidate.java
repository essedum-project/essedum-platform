package com.infosys.icets.common.app.web.license;

import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.infosys.icets.ai.comm.licenseValidator.License;
import com.infosys.icets.ai.comm.licenseValidator.LicenseValidator;
import com.infosys.icets.common.app.web.rest.ApplicationConfigResource;

@Component
public class LicenseValidate {

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(ApplicationConfigResource.class);
	
	public long getValidDays() throws UnsupportedEncodingException, InvalidAlgorithmParameterException {
		String licensePath = System.getProperty("license.path");
		License lic = LicenseValidator.getLicenseDetails(licensePath);
		String startdate = lic.getStartDate();
		int daysCount = Integer.parseInt(lic.getDurationDays());
		LocalDate startDate = LocalDate.parse(startdate);

		LocalDate endDate = startDate.plusDays(daysCount);
		LocalDate today = LocalDate.now();

		long daysLeft = ChronoUnit.DAYS.between(today, endDate);
		logger.info(daysLeft+" Days left to expire the License");
		return daysLeft;
	}
}
