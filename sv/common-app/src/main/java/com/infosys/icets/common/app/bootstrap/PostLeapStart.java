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
package com.infosys.icets.common.app.bootstrap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.infosys.Common;
import com.infosys.icets.ai.comm.lib.util.annotation.service.ConstantsService;
import com.infosys.icets.iamp.usm.service.UsmPermissionApiService;
import com.infosys.icets.iamp.usm.service.impl.UsmNotificationsServiceImpl;

@Component
public class PostLeapStart implements ApplicationRunner {



   private static final Logger logger = LoggerFactory.getLogger(Common.class);
    
    @Autowired
    private  UsmNotificationsServiceImpl usmNotificationsService;
    
    @Autowired
    private ConstantsService dashConstantService;
    
    @Autowired 
    private UsmPermissionApiService usmPermissionApiService;

   @Override
    public void run(ApplicationArguments args) throws Exception {

       if (args.getSourceArgs().length>0) {
            usmNotificationsService.licenseExpiryNotification(args.getSourceArgs()[0]);
        }
       
       dashConstantService.refreshConfigKeyMap();
       usmPermissionApiService.refreshConfigAPIsMap();

    }



}