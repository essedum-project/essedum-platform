package com.lfn.icip.icipwebeditor.v1.rest;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.icip.icipwebeditor.v1.dto.BaseEntity;
import com.lfn.icip.icipwebeditor.v1.service.IICIPSearchableService;

import io.micrometer.core.annotation.Timed;
import reactor.core.publisher.Flux;

@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/service/v1/search")
public class ICIPSearchableController {

	@Autowired
	private IICIPSearchableService searchable;

	@GetMapping(value="/", produces = "text/event-stream")
	public Flux<BaseEntity> searchAll(@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "size", required = false) String size,
			@RequestParam(name = "page", required = false) String page,
			@RequestParam(name = "project", required = true) String project)

	{
		Pageable pageable = Pageable.unpaged();
		;
		if (size != null) {
			try {
				pageable = Pageable.ofSize(Integer.parseInt(size)).withPage(Integer.parseInt(page));
			} catch (Exception e) {
			}
		}
		if (search == null) {
			search = "";
		}
		return searchable.getAllData(project, search, pageable);
	}

	@GetMapping("/type")
	public Flux<BaseEntity> searchByType(@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "size", required = false) String size,
			@RequestParam(name = "page", required = false) String page,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "type", required = true) String type)

	{
		Pageable pageable = Pageable.unpaged();
		if (size != null) {
			try {
				pageable = Pageable.ofSize(Integer.parseInt(size)).withPage(Integer.parseInt(page));
			} catch (Exception e) {

			}
		}
		if (search == null) {
			search = "";
		}
		return searchable.getAllDataByType(project, search, pageable, type);
	}

}
