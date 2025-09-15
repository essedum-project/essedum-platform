package com.lfn.common.app.schedule;

import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;
import com.lfn.iamp.usm.service.UserApiPermissionsService;
import com.lfn.iamp.usm.service.UsmPermissionApiService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduleJob {


  @Autowired
  UsmPermissionApiService usmPermissionApiService;

  @Autowired
  ConstantsService constantsService;

  /** Value from application.yml file */
  @Scheduled(fixedRateString = "${schedule.refreshPermissionApiRate}")
  public void scheduledRefreshConfigAPIsMap() {
	  usmPermissionApiService.refreshConfigAPIsMap();
  }

  @Scheduled(fixedRateString = "${schedule.refreshCofigurationPropertiesRate}")
  public void scheduledRefreshConfigKeyMap() {
    constantsService.refreshConfigKeyMap();
  }
}