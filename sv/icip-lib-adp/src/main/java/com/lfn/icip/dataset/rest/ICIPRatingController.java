package com.lfn.icip.dataset.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.ai.comm.lib.util.ICIPHeaderUtil;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.icip.dataset.model.ICIPRating;
import com.lfn.icip.dataset.model.dto.ICIPRatingDTO;
import com.lfn.icip.dataset.service.IICIPRatingService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Timed
@RequestMapping(path = "/${icip.pathPrefix}/rating")
@Tag(name= "rating")
public class ICIPRatingController {
	
	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPRatingController.class);
	
	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "rating";
	
	/** The rating service. */
	@Autowired
	private IICIPRatingService ratingService;
	
	/** Rating details. */
	@GetMapping("/getAllByUserAndOrg")
	public ResponseEntity<?> getAllByUserAndOrg(
			@RequestParam(name = "page", defaultValue = "1", required = false) String page,
			@RequestParam(name = "size", defaultValue = "10", required = false) String size,
			@RequestParam(name = "user", required = true) String user,
			@RequestParam(name = "element", required = false) String element,
			@RequestParam(name = "module", required = false) String module,
			@RequestParam(name = "org", required = true) String org) {
		logger.info("Get all rating details for the user {}", user);
		return new ResponseEntity<>(ratingService.getAllByUserAndOrg(Integer.parseInt(user), module, org, Integer.parseInt(page), Integer.parseInt(size)),
				new HttpHeaders(), HttpStatus.OK);
	}
	
	/** Rating details count*/
	@GetMapping("/getAllCountByUserAndOrg")
	public ResponseEntity<?> getAllCountByUserAndOrg(
			@RequestParam(name = "user", required = true) String user,
			@RequestParam(name = "element", required = false) String element,
			@RequestParam(name = "module", required = false) String module,
			@RequestParam(name = "org", required = true) String org) {
		logger.info("Get all rating details for the user {}", user);
		return new ResponseEntity<>(ratingService.getAllCountByUserAndOrg(Integer.parseInt(user), module, org),
				new HttpHeaders(), HttpStatus.OK);
	}
	
	/** Rating details to get modules*/
	@GetMapping("/getAllModule/{user}/{org}")
	public ResponseEntity<List<String>> getAllModules(
			@PathVariable(name = "user") Integer user,
			@PathVariable(name = "org") String org) {
		logger.info("Get all modules by org {}", org);
		return new ResponseEntity<>(ratingService.getAllModuleByUserOrganization(user, org), new HttpHeaders(), HttpStatus.OK);
	}
	
	/** Individual rating from different screens*/
	@GetMapping("/getByUserAndModule/{user}/{module}/{org}")
	public ResponseEntity<List<ICIPRating>> getRating(
			@PathVariable(name = "user") Integer user,
			@PathVariable(name = "module") String module,
			@PathVariable(name = "org") String org) {
		logger.info("Get all rating of the module {}", module);
		return new ResponseEntity<>(ratingService.getRatingByUserAndModuleAndOrganization(user, module, org), new HttpHeaders(), HttpStatus.OK);
	}
	
	/** To save individual rating from different screens*/
	@PostMapping("/add")
	public ResponseEntity<ICIPRating> createRelationship(@RequestBody ICIPRatingDTO ratingDTO)
			throws URISyntaxException, SQLException {
		logger.info("Saving rating for {}",ratingDTO.getElement());
		ModelMapper modelmapper = new ModelMapper();
		ICIPRating rel = modelmapper.map(ratingDTO, ICIPRating.class);
		ICIPRating result = ratingService.save(rel);
		return new ResponseEntity<ICIPRating>(result, new HttpHeaders(), HttpStatus.OK);
	}
	
	@DeleteMapping("/deleteRatingByElementAndOrg")
	public ResponseEntity<Void> deleteRatingByElementAndModuleAndOrg(
			@RequestParam(name = "element", required = true) String element,
			@RequestParam(name = "module", required = true) String module,
			@RequestParam(name = "org", required = true) String org) {
		logger.info("deleting rating for element {}", element);
		ratingService.deleteRatingByElementAndModuleAndOrg(element, module, org);
		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, element)).build();
	}
}