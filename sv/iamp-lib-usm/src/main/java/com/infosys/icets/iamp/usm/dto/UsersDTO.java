/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.infosys.icets.iamp.usm.dto;

import java.io.Serializable;
import java.time.ZonedDateTime;

import lombok.Getter;
import lombok.Setter;






// TODO: Auto-generated Javadoc
/**
 * The Class UsersDTO.
 *
 * @author icets
 */

/**
 * Gets the client details.
 *
 * @return the client details
 */

/**
 * Gets the client details.
 *
 * @return the client details
 */
@Getter

/**
 * Sets the client details.
 *
 * @param clientDetails the new client details
 */

/**
 * Sets the client details.
 *
 * @param clientDetails the new client details
 */
@Setter
public class UsersDTO implements Serializable{
	
	/** The id. */
	private Integer id;


	/** The user f name. */
	private String user_f_name;


	/** The user m name. */
	private String user_m_name;


	/** The user l name. */
	private String user_l_name;


	/** The user email. */
	private String user_email;


	/** The user login. */
	private String user_login;


	/** The . */
	private String password;


	/** The user act ind. */
	private boolean user_act_ind;


	/** The user added by. */
	private Long user_added_by;


	/** The last updated dts. */
	private ZonedDateTime last_updated_dts;


	/** The activated. */
	private boolean activated;


	/** The onboarded. */
	private boolean onboarded;


	/** The context. */
	private ContextDTO context;
	

	/** The force  change. */
	private boolean force_password_change;
	
	/** The profile image. */
	private byte[] profileImage;
	
	/** The profile image name. */
	private String profileImageName;
	
	/** The client details. */
	private String clientDetails;
	
	private String country;
	
	private String timezone;
	
	private String other_details;
	
	private String contact_number;
	
	private String designation;
	
	private String old_password;
	
	private Boolean isUiInactivityTracked;
}
