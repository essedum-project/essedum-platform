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
package com.infosys.icets.iamp.usm.domain;

import java.io.Serializable;
import java.util.Date;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import lombok.EqualsAndHashCode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

// TODO: Auto-generated Javadoc
/**
 * A Users.
 */
/**
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

/* (non-Javadoc)
 * @see java.lang.Object#toString()
 */

/**
 * To string.
 *
 * @return the java.lang. string
 */
@ToString
@Entity
@Table(name = "usm_users")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Users implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@EqualsAndHashCode.Include
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	/** The user f name. */
	@NotNull
	@Column(name = "user_f_name")
	@Size(max = 256)
	private String user_f_name;

	/** The user m name. */
	@Size(max = 256)
	@Column(name = "user_m_name")
	private String user_m_name;

	/** The user l name. */
	@Column(name = "user_l_name")
	@Size(max = 256)
	private String user_l_name;

	/** The user email. */
	@NotNull
	@Column(name = "user_email")
	@Size(max = 256)
	private String user_email;

	/** The user login. */
	@NotNull
	@Column(name = "user_login", unique = true)
	@Size(max = 256)
	private String user_login;

	/** The . */
	@NotNull
	@Size(max = 256)
	@JsonIgnore
	private String password;

	/** The user act ind. */
	@NotNull
	@Column(name = "user_act_ind")
	private Boolean user_act_ind;

	/** The user added by. */
	@Column(name = "user_added_by")
	private Long user_added_by;

	/** The last updated dts. */
	@Column(name = "last_updated_dts")
	private Date last_updated_dts;

	/** The activated. */
	@NotNull
	private Boolean activated;

	/** The onboarded. */
	@Column(name = "onboarded", columnDefinition = "bit")
	@NotNull
	private Boolean onboarded;

	/** The context. */
	@JoinColumn(name = "context")
	@ManyToOne
	private Context context;

	/** The force  change. */
	@Column(name = "force_password_change", columnDefinition = "bit")
	@NotNull
	private Boolean force_password_change;

	/** The profile image. */
	@Column(name = "profile_image")
	private byte[] profileImage;
	
	/** The profile image name. */
	@Column(name = "profile_image_name")
	private String profileImageName;

	/** The client details. */
	@Size(max = 429496)
	@Column(name = "client_details")
	private String clientDetails;
	
	@Size(max = 100)
	private String country;
	
	@Size(max = 100)
	private String timezone;

	@Size(max = 100)
	@Column(name = "other_details")
	private String other_details;
	
	@Size(max = 15)
	@Column(name = "contact_number")
	private String contact_number;
	
	@Column(name ="designation")
	private String designation;


	@Column(name = "is_ui_inactivity_tracked")
	@NotNull
	private Boolean isUiInactivityTracked;
	
	/**
	 * With username.
	 *
	 * @param string the string
	 * @return the user details
	 */
	public static UserDetails withUsername(String string) {
		// TODO Auto-generated method stub
		return null;
	}

}
