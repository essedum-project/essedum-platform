package com.infosys.icets.icip.icipwebeditor.job.model;
import software.amazon.awssdk.regions.Region;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Credentials {
private String accesskey;
private String secretkey;
private Region region;
}
