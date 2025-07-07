/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
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
