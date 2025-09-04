//package com.lfn.icip.icipwebeditor.rest;
//
//import java.io.FileNotFoundException;
//import java.io.IOException;
//import java.nio.file.Files;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.util.concurrent.ExecutorService;
//import java.util.concurrent.Executors;
//
//import org.apache.commons.io.FileUtils;
//import org.apache.commons.io.LineIterator;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.cloud.context.config.annotation.RefreshScope;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
//import org.springframework.web.servlet.mvc.method.annotation.SseEmitter.SseEventBuilder;
//
//import com.google.gson.Gson;
//import com.lfn.common.lib.annotation.LeapPropertyV2;
//import com.lfn.icip.icipwebeditor.constants.IAIJobConstants;
//import com.lfn.icip.icipwebeditor.constants.LoggerConstants;
//import com.lfn.icip.icipwebeditor.fileserver.service.impl.FileServerService;
//import com.lfn.icip.icipwebeditor.job.enums.JobMetadata;
//import com.lfn.icip.icipwebeditor.job.enums.JobStatus;
//import com.lfn.icip.icipwebeditor.model.ICIPJobs.MetaData;
//import com.lfn.icip.icipwebeditor.model.ICIPJobsPartial;
//import com.lfn.icip.icipwebeditor.repository.ICIPJobsPartialRepository;
//
//import lombok.extern.log4j.Log4j2;
//
//@Log4j2
//@RestController
//@RequestMapping(path = "/${icip.pathPrefix}/sse")
//@RefreshScope
//public class SSEController {
//
//	@EssedumProperty("icip.jobLogFileDir")
//	private String folderPath;
//
//	@Autowired
//	private ICIPJobsPartialRepository jobsPartialRepository;
//
//	@Autowired
//	private FileServerService fileServerService;
//
//	@GetMapping("/read/pipeline/{jobid}")
//	public SseEmitter readPipeline(@PathVariable("jobid") String jobId) {
//		SseEmitter emitter = new SseEmitter();
//		ExecutorService sseMvcExecutor = Executors.newSingleThreadExecutor();
//		sseMvcExecutor.execute(() -> {
//			String error = "ERROR";
//			String completed = "COMPLETED";
//			try {
//				ICIPJobsPartial job = jobsPartialRepository.findByJobId(jobId);
//				Path path;
//				Gson gson = new Gson();
//				MetaData metadata = gson.fromJson(job.getJobmetadata(), MetaData.class);
//				if (metadata.getTag().equals(JobMetadata.CHAIN.toString())) {
//					path = Paths.get(folderPath, IAIJobConstants.LOGPATH, IAIJobConstants.CHAINLOGPATH,
//							job.getCorrelationid(), String.format("%s%s", job.getJobId(), IAIJobConstants.OUTLOG));
//				} else {
//					path = Paths.get(folderPath, String.format(LoggerConstants.STRING_DECIMAL_STRING,
//							IAIJobConstants.PIPELINELOGPATH, job.getId(), IAIJobConstants.OUTLOG));
//				}
//				String[] status = new String[] { job.getJobStatus() };
//				if (Files.exists(path)) {
//					LineIterator it = FileUtils.lineIterator(path.toFile(), "UTF-8");
//					try {
//						int index = 0;
//						ExecutorService statusChanger = Executors.newSingleThreadExecutor();
//						statusChanger.execute(() -> {
//							try {
//								while (status[0].equalsIgnoreCase(JobStatus.RUNNING.toString())) {
//									Thread.sleep(5000);
//									status[0] = jobsPartialRepository.findByJobId(jobId).getJobStatus();
//								}
//							} catch (InterruptedException e) {
//								log.error(e.getMessage(), e);
//							}
//						});
//						while (status[0].equalsIgnoreCase(JobStatus.RUNNING.toString()) || it.hasNext()) {
//							if (it.hasNext()) {
//								String data = it.nextLine();
//								SseEventBuilder event = SseEmitter.event().data(data).id(String.valueOf(index))
//										.name(job.getJobId());
//								emitter.send(event);
//								if (index == Integer.MAX_VALUE) {
//									index = 0;
//								}
//								index++;
//							}
//						}
//						sendComplete(emitter, completed);
//						emitter.complete();
//					} catch (Exception ex) {
//						sendComplete(emitter, error);
//						emitter.completeWithError(ex);
//					} finally {
//						LineIterator.closeQuietly(it);
//					}
//				} else {
//					if (!status[0].equalsIgnoreCase(JobStatus.RUNNING.toString())) {
//						try {
//							String countStr = fileServerService.getLastIndex(job.getJobId(), job.getOrganization());
//							int count = Integer.parseInt(countStr);
//							for (int index = 0; index <= count; index++) {
//								byte[] data = fileServerService.download(job.getJobId(), String.valueOf(index),
//										job.getOrganization());
//								SseEventBuilder event = SseEmitter.event().data(data).id(String.valueOf(index))
//										.name(job.getJobId());
//								emitter.send(event);
//							}
//							sendComplete(emitter, completed);
//							emitter.complete();
//						} catch (Exception ex) {
//							log.error("Unable to fetch logs from fileserver : {}", ex.getMessage());
//							sendComplete(emitter, error);
//							emitter.completeWithError(ex);
//						}
//					} else {
//						log.error("File Not Found");
//						sendComplete(emitter, error);
//						emitter.completeWithError(new FileNotFoundException("File Not Found"));
//					}
//				}
//			} catch (Exception ex) {
//				log.error(ex.getMessage(), ex);
//				try {
//					sendComplete(emitter, error);
//				} catch (IOException e) {
//					log.error(e.getMessage(), e);
//				}
//				emitter.completeWithError(ex);
//			}
//		});
//		return emitter;
//	}
//
//	private void sendComplete(SseEmitter emitter, String data) throws IOException {
//		SseEventBuilder event = SseEmitter.event().data(data).id(String.valueOf(-1)).name("COMPLETE");
//		emitter.send(event);
//	}
//
//}


