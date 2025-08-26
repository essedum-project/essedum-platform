package com.lfn.icip.dataset.service.util;

import java.io.IOException;
import java.nio.file.Paths;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.json.JSONArray;
import org.slf4j.Marker;

import com.google.gson.JsonObject;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.DATATYPE;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPDataSetServiceUtil.
 */
public abstract class ICIPDataSetServiceUtil implements IICIPDataSetServiceUtil{

	

	@Override
	public IndexWriter createWriter(String indexPath) throws IOException {
		FSDirectory dir = FSDirectory.open(Paths.get(indexPath));
		IndexWriterConfig config = new IndexWriterConfig(new StandardAnalyzer());
		IndexWriter writer = new IndexWriter(dir, config);
		return writer;

	}
	 
	public static IndexSearcher createSearcher(String indexPath) throws IOException {
	    Directory dir = FSDirectory.open(Paths.get(indexPath));
	    IndexReader reader = DirectoryReader.open(dir);
	    IndexSearcher searcher = new IndexSearcher(reader);
	    return searcher;
	  }

	/**
	 * Update dataset.
	 *
	 * @param dataset the dataset
	 * @return the ICIP dataset
	 */
	@Override
	public ICIPDataset updateDataset(ICIPDataset dataset) {
		return dataset;
	}
	
	/**
	 * Load dataset.
	 *
	 * @param dataset the dataset
	 * @param marker the marker
	 * @param map the map
	 * @param id the id
	 * @param projectId the project id
	 * @param overwrite the overwrite
	 * @param org the org
	 * @throws Exception the exception
	 */
	public void loadDataset(ICIPDataset dataset, Marker marker, List<Map<String, ?>> map, String id, int projectId,
			boolean overwrite, String org) throws Exception{		
	}
	
	/**
	 * Checks if is table present.
	 *
	 * @param ds the ds
	 * @param tableName the table name
	 * @return true, if is table present
	 * @throws SQLException the SQL exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	public boolean isTablePresent(ICIPDataset ds, String tableName) throws SQLException, NoSuchAlgorithmException {
		return false;
	
	}
	@Override
	public <T> T getDatasetDataAudit(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype, String id,
			Class<T> clazz) throws SQLException {
	
		return null;
	}

	public void transformLoad(ICIPDataset dataset, Marker marker, List<Map<String, ?>> map, JSONArray response) {
		// TODO Auto-generated method stub
		
	}

	public JSONArray getFileData(ICIPDataset dataset, String fileName) {
		// TODO Auto-generated method stub
		return null;
	}
    
	
	public void deleteFiledata(ICIPDataset dataset, String fileName) {
		
	}
	
	public JSONArray getFileInfo(ICIPDataset dataset, String fileName) {
		// TODO Auto-generated method stub
		return null;
	}
	
	public <T> T getDatasetDataAsList(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype, Class<T> clazz)
			throws SQLException {
		return null;
	}

}
