package com.lfn.icip.dataset.rest;

import java.util.List;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.icip.dataset.model.ICIPTags;
import com.lfn.icip.dataset.service.IICIPTagsService;
import io.micrometer.core.annotation.Timed;

@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/tags")
@RefreshScope
public class ICIPTagsController {
	@Autowired
	private IICIPTagsService tagsService;

	private final Logger log = LoggerFactory.getLogger(IICIPTagsService.class);
	
	//Get the courses
	@GetMapping("/fetchAll")
	@Timed
	public ResponseEntity<List<ICIPTags>> getAllTags(){
	
		 log.debug("REST request to fetch : ");
	     List<ICIPTags> result = tagsService.getTags();
	     return new ResponseEntity<>(result, HttpStatus.OK);
		
	}
	@SuppressWarnings("unchecked")
	@GetMapping("/fetch/{id}")
	@Timed
	public ResponseEntity<ICIPTags> getTagsById(@PathVariable ("id") Integer id)
	{
		log.debug("REST request to fetch by id : ");
		ICIPTags result =  tagsService.getById(id);
		return new ResponseEntity<>(result, HttpStatus.OK);
		
	}
	@PostMapping("/create")
	@Timed
	public ResponseEntity<ICIPTags> AddTags(@RequestBody ICIPTags tags)
	{
	    log.debug("REST request to add tags : {}", tags);
	    ICIPTags result = tagsService.addTags(tags);
	    return new ResponseEntity<>(result, HttpStatus.OK);
		
	}
	@PutMapping("/update")
	@Timed
	public ResponseEntity<ICIPTags> UpdateTags(@RequestBody ICIPTags tags)
	{ 
		log.debug("REST request to update tags : {}", tags);
		if (Objects.isNull(tags.getId())) {
			ICIPTags result = tagsService.updateTags(tags.getId(),tags);
		    return new ResponseEntity<>(result, HttpStatus.OK);
			}
	else {
		ICIPTags result = tagsService.addTags(tags);
	    return new ResponseEntity<>(result, HttpStatus.OK);
	}
	}
	@DeleteMapping("/delete/{id}")
	@Timed
	public ResponseEntity<HttpStatus> deleteTags(@PathVariable("id") Integer id)
	{
		try{
			 this.tagsService.deleteTags(id);
			 return new ResponseEntity<>(HttpStatus.OK);
		}catch(Exception t) {
			 return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
		
	}

}
