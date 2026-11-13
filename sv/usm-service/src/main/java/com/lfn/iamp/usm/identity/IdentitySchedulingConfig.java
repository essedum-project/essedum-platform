package com.lfn.iamp.usm.identity;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Enables @Scheduled so IdentityProjectionWorker's drain loop runs (§8). */
@Configuration
@EnableScheduling
public class IdentitySchedulingConfig {
}
