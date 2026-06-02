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

package com.lfn.ai.comm.lib.util.logger;

import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import ch.qos.logback.classic.pattern.ClassicConverter;
import ch.qos.logback.classic.spi.ILoggingEvent;

// 
/**
 * The Class UserConverter.
 *
 * @author essedum
 */
public class UserConverter extends ClassicConverter {
    
    /**
     * Convert.
     *
     * @param event the event
     * @return the string
     */
    @Override
    public String convert(ILoggingEvent event) {
       Authentication auth = SecurityContextHolder.getContext().getAuthentication();
       if (auth != null) {
			if (event.getMDCPropertyMap() != null && event.getMDCPropertyMap().containsKey(auth.getName())) {
				String usernameByAaccessToken = event.getMDCPropertyMap().get(auth.getName());
				if (usernameByAaccessToken != null && !usernameByAaccessToken.isEmpty()) {
					MDC.remove(auth.getName());
					return usernameByAaccessToken;
				}
			}
            return auth.getName();
       }
       return "NO_USER";
    }
}