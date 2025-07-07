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
package com.infosys.icets.common.app.security.rest.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// 
/**
 * DTO for storing a user's credentials.
 */
/**
 * @author icets
 */
public class LoginDto {

	/** The username. */
	@NotNull
	@Size(min = 1, max = 50)
	private String username;

	@NotNull
	@Size(min = 4, max = 100)
	private String password;

	/** The remember me. */
	private Boolean rememberMe;

	/**
	 * Gets the username.
	 *
	 * @return the username
	 */
	public String getUsername() {
		return username;
	}

	/**
	 * Sets the username.
	 *
	 * @param username the new username
	 */
	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	/**
	 * Checks if is remember me.
	 *
	 * @return the boolean
	 */
	public Boolean isRememberMe() {
		return rememberMe;
	}

	/**
	 * Sets the remember me.
	 *
	 * @param rememberMe the new remember me
	 */
	public void setRememberMe(Boolean rememberMe) {
		this.rememberMe = rememberMe;
	}

	/**
	 * To string.
	 *
	 * @return the string
	 */
	@Override
	public String toString() {
		return "LoginVM{" + "username='" + username + '\'' + ", rememberMe=" + rememberMe + '}';
	}
}