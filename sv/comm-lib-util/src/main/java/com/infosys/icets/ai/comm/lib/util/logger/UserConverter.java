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
package com.infosys.icets.ai.comm.lib.util.logger;

import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import ch.qos.logback.classic.pattern.ClassicConverter;
import ch.qos.logback.classic.spi.ILoggingEvent;

// 
/**
 * The Class UserConverter.
 *
 * @author icets
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