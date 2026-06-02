package com.lfn.icip.icipwebeditor.job.config;

import java.util.Set;

import org.reflections.Reflections;
import org.springframework.stereotype.Component;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.icip.icipwebeditor.job.util.InternalJob;

import lombok.Getter;
import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/**
 * The Class InternalJobListConfig.
 */
@Component

/**
 * Gets the classes.
 *
 * @return the classes
 */
@Getter

/** The Constant log. */
@Log4j2
public class InternalJobListConfig {

	/** The job details. */
	private JsonArray jobDetails;
	
	/** The classes. */
	private Set<Class<? extends InternalJob>> classes;

	/**
	 * Instantiates a new internal job list config.
	 */
	public InternalJobListConfig() {
		jobDetails = new JsonArray();
		Reflections reflections = new Reflections("com.lfn");
		classes = reflections.getSubTypesOf(InternalJob.class);
		classes.stream().forEach(clazz -> {
			try {
				InternalJob job = clazz.newInstance();
				JsonObject obj = new JsonObject();
				obj.addProperty("name", job.getName());
				obj.addProperty("url", job.getUrl());
				obj.addProperty("desc", job.getDescription());
				jobDetails.add(obj);
			} catch (IllegalAccessException | InstantiationException e) {
				log.error(e.getMessage(), e);
			}
		});
	}

}
