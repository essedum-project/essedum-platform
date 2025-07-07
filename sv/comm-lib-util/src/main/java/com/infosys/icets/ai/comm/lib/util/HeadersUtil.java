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
package com.infosys.icets.ai.comm.lib.util;

import jakarta.servlet.http.HttpServletRequest;

import com.infosys.icets.ai.comm.lib.util.exceptions.InvalidProjectRequestHeader;

public class HeadersUtil {
	   public static String getHeader(HttpServletRequest request, String headerKey) {
	        return request.getHeader(headerKey);    
	    }
	    public static int getProjectHeader(HttpServletRequest request) throws InvalidProjectRequestHeader {
	    	if(request.getHeader("Project")==null){
				throw new InvalidProjectRequestHeader("Header Value with header value Project must be numeric value and must be present. ");
			}
	    	
	    	// Exception Handling if the ProjectId does not contains only numbers
	    	if(!request.getHeader("Project").matches("[0-9]+"))
	    		throw new InvalidProjectRequestHeader("Header Value for Project contains "+request.getHeader("Project")+ " which must be only numbers.");
	        return Integer.parseInt(request.getHeader("Project").trim());    
	    }
	    public static Integer getProjectId(HttpServletRequest request) throws InvalidProjectRequestHeader {
			 if(request.getHeader("Project")==null) return null;	
			 // Exception Handling if the ProjectId does not contains only numbers
			 if(!request.getHeader("Project").matches("[0-9]+"))
				 throw new InvalidProjectRequestHeader("Header Value for ProjectId contains "+request.getHeader("Project")+ " which must be only numbers.");
			 return Integer.parseInt(request.getHeader("Project").trim());    
		 }

		 public static String getProjectName(HttpServletRequest request) {
			 return request.getHeader("ProjectName");     
		 } 

		 public static String getRoleName(HttpServletRequest request) {
			 return request.getHeader("RoleName");     
		 }

		 public static Integer getRoleId(HttpServletRequest request) throws InvalidProjectRequestHeader{
			 if(request.getHeader("RoleId")==null) return null;
			 if(!request.getHeader("RoleId").matches("[0-9]+"))
				 throw new InvalidProjectRequestHeader("Header Value for RoleId contains "+request.getHeader("RoleId")+ " which must be only numbers.");
			 return Integer.parseInt(request.getHeader("RoleId").trim());

		 }

		 public static String getMethodType(HttpServletRequest request) {
			return request.getMethod();     
		}
	    

	    public static String getAuthorizationToken(HttpServletRequest request) {
	    	if(request.getHeader("Authorization")!=null){
				return request.getHeader("Authorization");
			}
	    	 return null;
	    }

}
