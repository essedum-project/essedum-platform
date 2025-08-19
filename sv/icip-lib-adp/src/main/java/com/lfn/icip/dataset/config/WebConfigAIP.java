package com.lfn.icip.dataset.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebConfigAIP {
	@Value("${commonAppUrl}")
	private String url;
	
	@Bean
	  public WebClient webClient() {

	    WebClient webClient = WebClient.builder()
	      .baseUrl(url)
	      .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
	      .build();
	    return webClient;
	  }
}
