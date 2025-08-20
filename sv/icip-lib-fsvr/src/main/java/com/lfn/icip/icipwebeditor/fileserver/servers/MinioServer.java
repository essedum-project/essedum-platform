package com.lfn.icip.icipwebeditor.fileserver.servers;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.StreamSupport;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.icip.icipwebeditor.fileserver.constants.FileServerConstants;
import com.lfn.icip.icipwebeditor.fileserver.constants.LoggerConstants;
import com.lfn.icip.icipwebeditor.fileserver.service.impl.CommonService;
import com.lfn.icip.icipwebeditor.fileserver.util.ChecksumUtil;
import com.lfn.icip.icipwebeditor.fileserver.util.FileServerUtil;
import com.lfn.icip.icipwebeditor.fileserver.util.FileUtil;
import com.lfn.icip.icipwebeditor.fileserver.util.StringUtil;

import io.minio.BucketExistsArgs;
import io.minio.DownloadObjectArgs;
import io.minio.ListObjectsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.RemoveObjectArgs;
import io.minio.RemoveObjectsArgs;
import io.minio.Result;
import io.minio.UploadObjectArgs;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.InsufficientDataException;
import io.minio.errors.InternalException;
import io.minio.errors.InvalidResponseException;
import io.minio.errors.ServerException;
import io.minio.errors.XmlParserException;
import io.minio.messages.DeleteError;
import io.minio.messages.DeleteObject;
import io.minio.messages.Item;
import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/**
 * The Class MinioServer.
 */
@Component("minio")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)

/** The Constant log. */

/** The Constant log. */
@Log4j2
@RefreshScope
public class MinioServer implements FileServerUtil {

	/** The constants. */
	@Autowired
	private FileServerConstants constants;

	/** The common service. */
	@Autowired
	private CommonService commonService;

	/** The bucket. */
	@EssedumProperty("icip.fileserver.minio.bucket")
	private String bucket;

	/** The minio client. */
	private MinioClient minioClient;

	/**
	 * Instantiates a new minio server.
	 *
	 * @param secretKey the secret key
	 * @param accessKey the access key
	 * @throws NoSuchAlgorithmException 
	 * @throws KeyManagementException 
	 */
	public MinioServer(@Value("${fileserver.minio.secret-key}") String secretKey,
			@Value("${fileserver.minio.access-key}") String accessKey, @Value("${fileserver.minio.url}") String url) throws KeyManagementException, NoSuchAlgorithmException {
		minioClient = MinioClient.builder().endpoint(url).credentials(accessKey, secretKey).build();
		minioClient.ignoreCertCheck();
	}

	/**
	 * Generate file ID.
	 *
	 * @param bucket the bucket
	 * @param prefix the prefix
	 * @return the string
	 * @throws Exception the exception
	 */
	@Override
	public String generateFileID(String bucket, String prefix) throws Exception {
		bucket = getBucket(bucket);
		String fileid = StringUtil.addPrefix(prefix, StringUtil.getRandomString());
		if (!minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build())) {
			minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
		}
		return fileid;
	}

	/**
	 * Upload.
	 *
	 * @param path the path
	 * @param folder the folder
	 * @param fileid the fileid
	 * @param totalCount the total count
	 * @param replace the replace
	 * @param bucket the bucket
	 * @return the integer
	 * @throws Exception the exception
	 */
	@Override
	public Integer upload(Path path, String folder, String fileid, int totalCount, boolean replace, String bucket)
			throws Exception {

		bucket = getBucket(bucket);
		String filename = path.getFileName().toString();
		Path dirpath = commonService.createTempPath();
		//FileInputStream fis = null;
		try (FileInputStream fis = new FileInputStream(path.toFile());) {
			
			String checksum = DigestUtils.sha256Hex(fis);
			Path checksumPath = Paths.get(dirpath.toAbsolutePath().toString(), constants.getChecksum(), filename);
			ChecksumUtil.check(checksum, path, checksumPath);

			if (folder != null) {
				fileid = String.format(LoggerConstants.STRING_SLASH_STRING, fileid, folder);
			}

			if (Files.exists(path)) {

				minioClient.uploadObject(UploadObjectArgs.builder().bucket(bucket)
						.object(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING_SLASH_STRING, fileid,
								constants.getMetadata(), constants.getChecksum(), filename))
						.filename(checksumPath.toAbsolutePath().toString()).build());

				if (replace) {
					minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucket)
							.object(String.format(LoggerConstants.STRING_SLASH_STRING, fileid, filename)).build());
				}
				minioClient.uploadObject(UploadObjectArgs.builder().bucket(bucket)
						.object(String.format(LoggerConstants.STRING_SLASH_STRING, fileid, filename))
						.filename(path.toAbsolutePath().toString()).build());

				// Updating totalcount
				Path countPath = Paths.get(dirpath.toAbsolutePath().toString(), constants.getCountFile());
				byte[] countBytes = String.valueOf(totalCount).getBytes();
				Files.write(countPath, countBytes);
				minioClient.uploadObject(UploadObjectArgs.builder().bucket(bucket)
						.object(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING, fileid,
								constants.getMetadata(), constants.getCountFile()))
						.filename(countPath.toAbsolutePath().toString()).build());

				// Updating timestamp
				Path timePath = Paths.get(dirpath.toAbsolutePath().toString(), constants.getTimestampFile());
				String currentTime = Timestamp.from(Instant.now()).toString();
				byte[] timeBytes = currentTime.getBytes();
				Files.write(timePath, timeBytes);
				minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucket)
						.object(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING, fileid,
								constants.getMetadata(), constants.getTimestampFile()))
						.build());
				minioClient.uploadObject(UploadObjectArgs.builder().bucket(bucket)
						.object(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING, fileid,
								constants.getMetadata(), constants.getTimestampFile()))
						.filename(timePath.toAbsolutePath().toString()).build());
			}

			Iterable<Result<Item>> result1 = minioClient
					.listObjects(ListObjectsArgs.builder().bucket(bucket).recursive(true).prefix(fileid).build());
			Iterable<Result<Item>> result2 = minioClient.listObjects(ListObjectsArgs.builder().bucket(bucket)
					.recursive(true)
					.prefix(String.format(LoggerConstants.STRING_SLASH_STRING, fileid, constants.getMetadata())).build());
			long count1 = StreamSupport.stream(result1.spliterator(), false).count();
			long count2 = StreamSupport.stream(result2.spliterator(), false).count();
			long count = count1 - count2;
			return Math.round(count * 100F / totalCount);
		}
	}

	/**
	 * Download.
	 *
	 * @param fileid the fileid
	 * @param index the index
	 * @param bucket the bucket
	 * @return the byte[]
	 * @throws Exception the exception
	 */
	@Override
	public byte[] download(String fileid, String index, String bucket) throws Exception {
		bucket = getBucket(bucket);
		Path dirpath = commonService.createTempPath();
		Path path = Paths.get(dirpath.toAbsolutePath().toString(), index);
		Files.createDirectories(path.getParent());
		minioClient.downloadObject(DownloadObjectArgs.builder().bucket(bucket)
				.object(String.format(LoggerConstants.STRING_SLASH_STRING, fileid, index))
				.filename(path.toAbsolutePath().toString()).build());
		return Files.readAllBytes(path);
	}

	/**
	 * Delete.
	 *
	 * @param fileid the fileid
	 * @param bucket the bucket
	 * @return the string
	 * @throws Exception the exception
	 */
	@Override
	public String delete(String fileid, String bucket) throws Exception {
		bucket = getBucket(bucket);
		List<DeleteObject> objects = new LinkedList<>();
		Iterable<Result<Item>> lists = minioClient
				.listObjects(ListObjectsArgs.builder().bucket(bucket).recursive(true).prefix(fileid).build());
		lists.forEach(element -> {
			try {
				Item item = element.get();
				objects.add(new DeleteObject(item.objectName()));
			} catch (InvalidKeyException | ErrorResponseException | IllegalArgumentException | InsufficientDataException
					| InternalException | InvalidResponseException | NoSuchAlgorithmException | ServerException
					| XmlParserException | IOException e) {
				log.error(e.getMessage(), e);
			}
		});
		StringBuilder strBuilder = new StringBuilder();
		Iterable<Result<DeleteError>> results = minioClient
				.removeObjects(RemoveObjectsArgs.builder().bucket(bucket).objects(objects).build());
		results.forEach(result -> {
			try {
				DeleteError error = result.get();
				strBuilder.append("Error in deleting object " + error.objectName() + "; " + error.message());
				strBuilder.append(System.getProperty("line.separator"));
			} catch (InvalidKeyException | ErrorResponseException | IllegalArgumentException | InsufficientDataException
					| InternalException | InvalidResponseException | NoSuchAlgorithmException | ServerException
					| XmlParserException | IOException e) {
				log.error(e.getMessage(), e);
			}
		});
		strBuilder.append("Done");
		String msg = strBuilder.toString();
		log.info(msg);
		return msg;
	}

	/**
	 * Last call.
	 *
	 * @param fileid the fileid
	 * @param bucket the bucket
	 * @return true, if successful
	 * @throws Exception the exception
	 */
	@Override
	public boolean lastCall(String fileid, String bucket) throws Exception {
		bucket = getBucket(bucket);
		Path dirpath = commonService.createTempPath();
		Path path = Paths.get(dirpath.toAbsolutePath().toString(), fileid, constants.getTimestampFile());
		Files.createDirectories(path.getParent());
		minioClient.downloadObject(DownloadObjectArgs
				.builder().bucket(bucket).object(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING, fileid,
						constants.getMetadata(), constants.getTimestampFile()))
				.filename(path.toAbsolutePath().toString()).build());
		return FileUtil.getLastCall(path);
	}

	/**
	 * Gets the last index.
	 *
	 * @param fileid the fileid
	 * @param bucket the bucket
	 * @return the last index
	 * @throws Exception the exception
	 */
	@Override
	public String getLastIndex(String fileid, String bucket) throws Exception {
		bucket = getBucket(bucket);
		Path dirpath = commonService.createTempPath();
		Path path = Paths.get(dirpath.toAbsolutePath().toString(), fileid, constants.getCountFile());
		Files.createDirectories(path.getParent());
		minioClient.downloadObject(DownloadObjectArgs
				.builder().bucket(bucket).object(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING, fileid,
						constants.getMetadata(), constants.getCountFile()))
				.filename(path.toAbsolutePath().toString()).build());
//		return FileUtil.getFirstLine(path);
		int lastIndex = Integer.valueOf(FileUtil.getFirstLine(path)) - 1;
		return String.valueOf(lastIndex);
	}

	/**
	 * Gets the checksum.
	 *
	 * @param fileid the fileid
	 * @param index the index
	 * @param bucket the bucket
	 * @return the checksum
	 * @throws Exception the exception
	 */
	@Override
	public String getChecksum(String fileid, String index, String bucket) throws Exception {
		bucket = getBucket(bucket);
		Path dirpath = commonService.createTempPath();
		Path path = Paths.get(dirpath.toAbsolutePath().toString(), fileid, constants.getMetadata(),
				constants.getChecksum(), index);
		Files.createDirectories(path.getParent());
		minioClient.downloadObject(DownloadObjectArgs.builder().bucket(bucket)
				.object(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING_SLASH_STRING, fileid,
						constants.getMetadata(), constants.getChecksum(), index))
				.filename(path.toAbsolutePath().toString()).build());
		return FileUtil.getFirstLine(path);
	}

	/**
	 * Deploy.
	 *
	 * @param authserviceSession the authservice session
	 * @param url the url
	 * @param filename the filename
	 * @param inferenceClassFileName the inference class file name
	 * @param modelClassFileName the model class file name
	 * @param requirementsFileName the requirements file name
	 * @param fileid the fileid
	 * @param bucket the bucket
	 * @return the string
	 * @throws Exception the exception
	 */
	@Override
	public String deploy(String authserviceSession, String url, String filename, String inferenceClassFileName,
			String modelClassFileName, String requirementsFileName, String fileid, String bucket) throws Exception {
		return commonService.deploy(authserviceSession, url, filename, inferenceClassFileName, modelClassFileName,
				requirementsFileName, fileid, getBucket(bucket));
	}

	@Override
	public Integer upload(Path path, String folder, String fileid, int totalCount, boolean replace,
			String bucket, String archivalFileserverurl) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getLastIndex(String fileid, String bucket, String datasource) throws Exception {
		Path dirpath = commonService.createTempPath();
		Path path = Paths.get(dirpath.toAbsolutePath().toString(), fileid, constants.getCountFile());
		Files.createDirectories(path.getParent());
		minioClient.downloadObject(DownloadObjectArgs
				.builder().bucket(bucket).object(String.format(LoggerConstants.STRING_SLASH_STRING_SLASH_STRING, fileid,
						constants.getMetadata(), constants.getCountFile()))
				.filename(path.toAbsolutePath().toString()).build());
		return FileUtil.getFirstLine(path);
	}

	@Override
	public byte[] download(String fileid, String index, String bucket, String fileserverurl)
			throws Exception {
		// TODO Auto-generated method stub
		return null;
	}
	
	private String getBucket(String bucket) {
		return this.bucket.toLowerCase().trim()!="null"&&!this.bucket.trim().isBlank()?this.bucket:bucket;
	}

	@Override
	public Integer upload(Path path, String folder, String fileid, int totalCount, boolean replace, String bucket, MultipartFile file)
			throws Exception {
		return null;
	}
}
