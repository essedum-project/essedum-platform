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

// 
/**
 * The Class License.
 *
 * @author icets
 */
public class License {
	
	/** The license version. */
	private String licenseVersion = "1.0";
	
	/** The mac id. */
	private String macId = "";

	/** The is valid license. */
	private boolean isValidLicense = false;
	
	/** The start date. */
	private String startDate = "";
	
	/** The duration days. */
	private String durationDays = "";
	
	private String noOfUsers = "";

	/**
	 * Gets the mac id.
	 *
	 * @return the mac id
	 */
	public String getMacId() {
		return this.macId;
	}

	/**
	 * Gets the license version.
	 *
	 * @return the license version
	 */
	public String getLicenseVersion() {
		return licenseVersion;
	}

	/**
	 * Sets the license version.
	 *
	 * @param licenseVersion the new license version
	 */
	public void setLicenseVersion(String licenseVersion) {
		this.licenseVersion = licenseVersion;
	}

	/**
	 * Checks if is valid license.
	 *
	 * @return true, if is valid license
	 */
	public boolean isValidLicense() {
		return isValidLicense;
	}

	/**
	 * Sets the valid license.
	 *
	 * @param isValidLicense the new valid license
	 */
	public void setValidLicense(boolean isValidLicense) {
		this.isValidLicense = isValidLicense;
	}

	/**
	 * Gets the start date.
	 *
	 * @return the start date
	 */
	public String getStartDate() {
		return startDate;
	}

	/**
	 * Sets the start date.
	 *
	 * @param startDate the new start date
	 */
	public void setStartDate(String startDate) {
		this.startDate = startDate;
	}

	/**
	 * Gets the duration days.
	 *
	 * @return the duration days
	 */
	public String getDurationDays() {
		return durationDays;
	}

	/**
	 * Sets the duration days.
	 *
	 * @param durationDays the new duration days
	 */
	public void setDurationDays(String durationDays) {
		this.durationDays = durationDays;
	}

	/**
	 * Sets the mac id.
	 *
	 * @param macId the new mac id
	 */
	public void setMacId(String macId) {
		this.macId = macId;
	}

	public String getNoOfUsers() {
		return noOfUsers;
	}

	public void setNoOfUsers(String noOfUsers) {
		this.noOfUsers = noOfUsers;
	}

	@Override
	public String toString() {
		return "License [licenseVersion=" + licenseVersion + ", macId=" + macId + ", isValidLicense=" + isValidLicense
				+ ", startDate=" + startDate + ", durationDays=" + durationDays + ", noOfUsers=" + noOfUsers + "]";
	}

}
