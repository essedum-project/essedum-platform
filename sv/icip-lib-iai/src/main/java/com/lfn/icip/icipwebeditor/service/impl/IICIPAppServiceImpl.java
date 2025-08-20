package com.lfn.icip.icipwebeditor.service.impl;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.Optional;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.HttpMethod;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.icipwebeditor.constants.FileConstants;
import com.lfn.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;
import com.lfn.icip.icipwebeditor.fileserver.service.impl.FileServerService;
import com.lfn.icip.icipwebeditor.model.FedModelsID;
import com.lfn.icip.icipwebeditor.model.ICIPApps;
import com.lfn.icip.icipwebeditor.model.ICIPImageSaving;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedRuntime;
import com.lfn.icip.icipwebeditor.model.ICIPPlugin;
import com.lfn.icip.icipwebeditor.model.ICIPPluginDetails;
import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;
import com.lfn.icip.icipwebeditor.repository.ICIPAppsRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedRuntimeRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPStreamingServicesRepository;
import com.lfn.icip.icipwebeditor.rest.WebSocketController;
import com.lfn.icip.icipwebeditor.service.IICIPAppService;
import com.lfn.icip.icipwebeditor.v1.dto.BaseEntity;
import com.lfn.icip.icipwebeditor.v1.service.IICIPSearchable;

import io.minio.MinioClient;
import io.minio.UploadObjectArgs;
import reactor.core.publisher.Flux;

@Service("appservice")
@Transactional
public class IICIPAppServiceImpl implements IICIPAppService, IICIPSearchable {

	private final Logger log = LoggerFactory.getLogger(IICIPAppServiceImpl.class);

	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	private final ICIPAppsRepository appsRepository;

	@EssedumProperty("icip.fileuploadDir")
	private String folderPath;

	@Autowired
	private FileServerService fileserverService;

	@Autowired
	private ICIPStreamingServicesRepository streamingServicesRepository;

	@Autowired
	ICIPMLFederatedRuntimeRepository icipMlFederatedRuntimeRepo;

	/** The image service. */
	@Autowired
	private ICIPImageSavingServiceImpl imageService;

	@EssedumProperty("icip.fileserver.minio.bucket")
	private String bucket;

	@Value("${fileserver.minio.secret-key}")
	private String secretKey;

	final String TYPE = "APP";

	@Value("${fileserver.minio.access-key}")
	private String accessKey;

	@Value("${fileserver.minio.url}")
	private String url;

	private MinioClient minioClient;

	@Autowired
	private WebSocketController webSocketController;

	public IICIPAppServiceImpl(ICIPAppsRepository appsRepository) {

		this.appsRepository = appsRepository;
	}

	@Override
	public ICIPApps save(ICIPApps tag) {
		return this.appsRepository.customSave(tag);
	}

	@Override
	public ICIPApps getAppByName(String name, String orgid) {
		return this.appsRepository.getByNameAndOrganization(name, orgid);
	}

	public Optional<ICIPApps> findByID(Integer id) {
		return this.appsRepository.findById(id);
	}

	@Override
	public List<ICIPApps> getByOrganization(String organization) {
		return this.appsRepository.getAppsByOrganization(organization);
	}

	@Override
	public void delete(Integer id) {

		Optional<ICIPMLFederatedRuntime> icipApps = icipMlFederatedRuntimeRepo.findByAppid(id);
		if (icipApps.isPresent()) {
			ICIPMLFederatedRuntime icipAppDetail = icipApps.get();
			icipAppDetail.setAppid(null);
			icipMlFederatedRuntimeRepo.save(icipAppDetail);

		}
		this.appsRepository.deleteById(id);
	}

	@Override
	public void uploadFile(MultipartFile multipartfile, String fileid, ICIPChunkMetaData chunkMetaData, String org)
			throws Exception {
		Path filePath = Paths.get(folderPath, FileConstants.APPFILESDIRECTORY, fileid,
				Integer.toString(chunkMetaData.getIndex()));

		Files.createDirectories(filePath.getParent());
		File file = filePath.toFile();

		// Storing file in local server
		try (OutputStream os = new FileOutputStream(file)) {
			os.write(multipartfile.getBytes());
		}
		int totalcount = chunkMetaData.getTotalCount();

		fileserverService.upload(filePath, fileid, totalcount, true, org);

	}

	public boolean copy(String fromProjectName, String toProjectId) {
		List<ICIPApps> appList = this.appsRepository.getAppsByOrganization(fromProjectName);
		appList.stream().forEach(apps -> {
			ICIPApps app = this.appsRepository.getByNameAndOrganization(apps.getName(), fromProjectName);
			try {
				app.setId(null);
				app.setOrganization(toProjectId);
//			this.appsRepository.save(app);
				this.appsRepository.customSave(app);

			} catch (Exception e) {
				log.error("Error in ICIPApps Copy Blueprint {}", e.getMessage());
			}
		});
		return true;
	}

	public JsonObject export(Marker marker, String source, JSONArray modNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();

			List<ICIPApps> apps = new ArrayList<>();
			modNames.forEach(name -> {
				ICIPApps appPresent = this.appsRepository.getByNameAndOrganization(name.toString(), source);
				if (appPresent != null)
					apps.add(appPresent);
			});
			List<ICIPImageSaving> images = new ArrayList<>();

			apps.stream().forEach(app -> {
				images.add(imageService.getByNameAndOrg(app.getName(), source));
			});
			jsnObj.add("mlapps", gson.toJsonTree(apps));
			jsnObj.add("mlappimage", gson.toJsonTree(images));
		} catch (Exception ex) {
			joblogger.error(marker, "Error in exporting apps");
			joblogger.error(marker, ex.getMessage());
		}
		return jsnObj;
	}

	public void importData(Marker marker, String target, JSONObject jsonObject) {
		Gson g = new Gson();
		try {
			JsonArray apps = g.fromJson(jsonObject.get("mlapps").toString(), JsonArray.class);
			JsonArray images = g.fromJson(jsonObject.get("mlappimage").toString(), JsonArray.class);
			apps.forEach(x -> {
				ICIPApps app = g.fromJson(x, ICIPApps.class);
				ICIPApps appPresent = this.appsRepository.getByNameAndOrganization(app.getName().toString(), target);
				app.setOrganization(target);
				app.setId(null);
				try {
					log.info("Saving apps {}", app.getName());
					if (appPresent == null)
						this.appsRepository.save(app);
				} catch (Exception de) {
					joblogger.error(marker, "Error in importing duplicate app {}", app.getName());
				}
			});
			images.forEach(x -> {
				ICIPImageSaving img = g.fromJson(x, ICIPImageSaving.class);
				ICIPImageSaving imgPresent = imageService.getByNameAndOrg(img.getName(), target);
				img.setOrganization(target);
				img.setId(null);
				try {
					if (imgPresent == null)
						imageService.saveImage(img);
				} catch (Exception de) {
					joblogger.error(marker, "Error in importing duplicate appimage {}", img.getAlias());
				}
			});
		} catch (Exception ex) {
			joblogger.error(marker, "Error in importing apps");
			joblogger.error(marker, ex.getMessage());
		}
	}

	@Override
	public List<Map<String, Object>> getAllApps() {

		List<Map<String, Object>> appDetails = new ArrayList<>();

		List<ICIPApps> apps = this.appsRepository.findAll();
		for (ICIPApps app : apps) {
			Map<String, Object> appData = new HashMap<>();
			appData.put("name", app.getName());
			appData.put("organization", app.getOrganization());
			appData.put("tryoutlink", app.getTryoutlink());

			appDetails.add(appData);
		}

		return appDetails;

	}

	private String getBucket(String bucket) {
		return this.bucket.toLowerCase().trim() != "null" && !this.bucket.trim().isBlank() ? this.bucket : bucket;
	}

	public String uploadToActiveServer(String object, String uploadFile, String org) {
		try {
			ExecutorService service = Executors.newCachedThreadPool();
			service.execute(() -> {
				try {
					uploadToServer(object, uploadFile, org);
				} catch (Exception e) {
					log.info(e.getMessage());
				}
			});
			service.shutdown();
			return object;
		} catch (Exception e) {
			log.info(e.getMessage());
			return "failed to upload";
		}
	}

	private void uploadToServer(String object, String uploadFile, String org) throws Exception {
		String objectKey = "app/" + org + "/" + object;
		minioClient = MinioClient.builder().endpoint(url).credentials(this.accessKey, this.secretKey).build();
		minioClient.ignoreCertCheck();
		bucket = getBucket(bucket);
		minioClient
				.uploadObject(UploadObjectArgs.builder().bucket(bucket).object(objectKey).filename(uploadFile).build());
		webSocketController.sendUploadStatus("File Uploaded Successfully!");
		log.info("file uploaded successfully");
		// Code to delete local chunked files after file is uploaded to server

		String path = uploadFile;
		int lastIndex = path.lastIndexOf("\\");
		int secondLastIndex = path.lastIndexOf("\\", lastIndex - 1);
		String folderPath = path.substring(0, secondLastIndex);
		deleteDir(new File(folderPath));

	}

	void deleteDir(File file) {
		File[] contents = file.listFiles();
		if (contents != null) {
			for (File f : contents) {
				if (!Files.isSymbolicLink(f.toPath())) {
					deleteDir(f);
				}
			}
		}
		file.delete();
	}

	public String getPresignedUrl(String fileName, String org) {
		try {
			String objectKey = "app/" + org + "/" + fileName;
			bucket = getBucket(bucket);
			AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
					.withEndpointConfiguration(
							new AwsClientBuilder.EndpointConfiguration(this.url, Regions.US_EAST_1.getName()))
					.withCredentials(
							new AWSStaticCredentialsProvider(new BasicAWSCredentials(this.accessKey, this.secretKey)))
					.build();
			Date expiration = new Date(System.currentTimeMillis() + 3600000);
			GeneratePresignedUrlRequest generatePresignedUrlRequest = new GeneratePresignedUrlRequest(bucket, objectKey)
					.withMethod(HttpMethod.GET).withExpiration(expiration);
			URL url = s3Client.generatePresignedUrl(generatePresignedUrlRequest);
			log.info("Pre-signed URL: " + url.toString());
			return url.toString();
		} catch (Exception e) {
			log.info(e.getMessage());
			return "failed to generate presigned Url";
		}
	}

	@Override
	public List<String> getAppsType() {
		// TODO Auto-generated method stub
		return appsRepository.getAppsType();
	}

	@Override
	public String getType() {
		// TODO Auto-generated method stub
		return TYPE;
	}

	@Override
	public Flux<BaseEntity> getAllObjectsByOrganization(String organization, String search, Pageable page) {
		try {
			List<ICIPApps> appsList = appsRepository.findByOrganization(organization, page);
			return Flux.fromIterable(appsList).parallel().map(s -> {
				BaseEntity entity = new BaseEntity();
				entity.setAlias(s.getName());
				entity.setData(new JSONObject(s).toString());
				entity.setDescription(s.getName());
				entity.setId(s.getId());
				entity.setType(TYPE);
				return entity;
			}).sequential();
		} catch (Exception e) {
			log.error("Error while parsing Apps--->", e);
			return Flux.empty();
		}
	}

	@Override
	public Flux<BaseEntity> getObjectByIDTypeAndOrganization(String type, Integer id, String organization) {
		return Flux.just(appsRepository.findByIdAndType(id, "App")).defaultIfEmpty(new ICIPApps()).map(s -> {
			BaseEntity entity = new BaseEntity();
			entity.setAlias(s.getName());
			entity.setData(new JSONObject(s).toString());
			entity.setDescription(s.getName());
			entity.setId(s.getId());
			entity.setType(TYPE);
			return entity;

		});
	}
}
