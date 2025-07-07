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
package com.infosys.icets.iamp.usm.config;

// TODO: Auto-generated Javadoc
/**
 * Application constants.
 */
/**
 * @author icets
 */
public final class Constants {

	/**
	 * Instantiates a new constants.
	 */
	private Constants() {
	}

	/** The Constant LOGIN_REGEX. */
	// Regex for acceptable logins
	public static final String LOGIN_REGEX = "^[_'.@A-Za-z0-9-]*$";

	/** The Constant SYSTEM_ACCOUNT. */
	public static final String SYSTEM_ACCOUNT = "system";

	/** The Constant ANONYMOUS_USER. */
	public static final String ANONYMOUS_USER = "anonymoususer";

	/** The Constant DEFAULT_LANGUAGE. */
	public static final String DEFAULT_LANGUAGE = "en";

	/** The Constant MODULE_NAME. */
	public static final String MODULE_NAME = "usm";

	/** The Constant QUERY_PROJECT_UPDATEPROJECT. */
	public static final String QUERY_PROJECT_UPDATEPROJECT = "usm.project.updateProject";

	/** The Constant QUERY_PROJECT_FINDALLNAMES. */
	public static final String QUERY_PROJECT_FINDALLNAMES = "usm.project.findAllNames";

	/** The Constant QUERY_USERAPIPERMISSIONS_FINDAPIROLES. */
	public static final String QUERY_USERAPIPERMISSIONS_FINDAPIROLES = "usm.userApiPermissions.findApiRoles";

	/** The Constant QUERY_USERPROJECTROLE_FINDBYPROJECTIDID. */
	public static final String QUERY_USERPROJECTROLE_FINDBYPROJECTIDID = "usm.userProjectRole.findByProjectIdId";

	/** The Constant QUERY_USERPROJECTROLE_FINDBYUSERIDUSERLOGIN. */
	public static final String QUERY_USERPROJECTROLE_FINDBYUSERIDUSERLOGIN = "usm.userProjectRole.findByUserIdUserLogin";

	/** The Constant QUERY_USERPROJECTROLE_FINDBYUSERID. */
	public static final String QUERY_USERPROJECTROLE_FINDBYUSERID = "usm.userProjectRole.findByUserId";

	/** The Constant QUERY_USERPROJECTROLE_GETMAPPEDROLES. */
	public static final String QUERY_USERPROJECTROLE_GETMAPPEDROLES = "usm.userProjectRole.getMappedRoles";

	/** The Constant QUERY_USERS_FINDBYUSERLOGIN. */
	public static final String QUERY_USERS_FINDBYUSERLOGIN = "usm.users.findByUserLogin";

	/** The Constant QUERY_USERS_FINDBYUSEREMAIL. */
	public static final String QUERY_USERS_FINDBYUSEREMAIL = "usm.users.findByUserEmail";

	/** The Constant QUERY_USERS_ONKEYUPUSERSFOREXPERIMENTS. */
	public static final String QUERY_USERS_ONKEYUPUSERSFOREXPERIMENTS = "usm.users.onKeyupUsersForExperiments";

	/** The Constant QUERY_USERS_FINDUSERBYIDS. */
	public static final String QUERY_USERS_FINDUSERBYIDS = "usm.users.findUserByIds";

	/** The Constant QUERY_USERUNIT_FINDBYUSERANDORG. */
	public static final String QUERY_USERUNIT_FINDBYUSERANDORG = "usm.userUnit.findByUserAndOrg";

	/** The Constant QUERY_PERMISSIONS_ROLE. */
	public static final String QUERY_PERMISSIONS_ROLE = "usm.permissions.role";
	
	//********************************** Custom Message constant *********************************************
	
	/** The Constant EXCEPTION_USERSERVICEIMPL_FINDEMAIL. */
	public static final String EXCEPTION_USERSERVICEIMPL_FINDEMAIL = "exception.userserviceimpl.findemail";
	
	/** The Constant MSG_EMAILSERVICEIMPL_SENDEMAILWITHMESSAGE. */
	public static final String MSG_EMAILSERVICEIMPL_SENDEMAILWITHMESSAGE = "msg.emailserviceimpl.sendemailwithmessage";
	
	/** The Constant MSG_EMAILSERVICEIMPL_SENDEMAILWITHMESSAGE_ERROR. */
	public static final String MSG_EMAILSERVICEIMPL_SENDEMAILWITHMESSAGE_ERROR = "msg.emailserviceimpl.sendemailwithmessage.error";
	
	/** The Constant MSG_USM_LAZY_LOAD_EVENT. */
	public static final String MSG_USM_LAZY_LOAD_EVENT = "msg.usm.lazy.load.event";
	
	/** The Constant MSG_USM_CONSTRAINT_VIOLATED. */
	public static final String MSG_USM_CONSTRAINT_VIOLATED = "msg.usm.constraint.violated"; 
	
	/** The Constant CCL_MSG_LAZY_LOAD_EVENT. */
	public static final String CCL_MSG_LAZY_LOAD_EVENT = "ccl.msg.lazy.load.event";
	
	/** The Constant CCL_MSG_CONSTRAINT_VIOLATED. */
	public static final String CCL_MSG_CONSTRAINT_VIOLATED = "ccl.msg.constraint.violated";
	
	public static final String ACTION_GENERATE_NEW_TOKEN = "generate-new-token";

	public static final String ACTION_CHANGE_EXPIRY_DATE = "change-expiry-date";

	public static final String ACTION_NEVER = "Never";
	
	public static final String STATUS_MSG = "status";
	
	public static final String STATUS_MSG_REVOKED = "revoked successfully";

}
