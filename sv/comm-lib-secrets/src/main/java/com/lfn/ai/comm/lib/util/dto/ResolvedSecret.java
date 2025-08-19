package com.lfn.ai.comm.lib.util.dto;

import org.springframework.beans.factory.annotation.Value;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResolvedSecret {
	@Value(value="false")
    Boolean isResolved;
	String resolvedSecret;
	String key;
	String organization;
	@Value(value="Not Resolved")
	String errorMessage;
}
