/**
 * The MIT License (MIT)
 * Copyright © 2025 Essedum
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

package com.lfn.ai.comm.lib.util;

import jakarta.servlet.http.HttpServletRequest;

import com.lfn.ai.comm.lib.util.exceptions.InvalidProjectRequestHeader;

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
