/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.reader.impl;

import static com.lfn.icip.reader.impl.TempFileUtil.writeInputStreamToFile;
import static com.lfn.icip.reader.xlsx.XmlUtils.document;
import static com.lfn.icip.reader.xlsx.XmlUtils.searchForNodeList;
import static java.util.Arrays.asList;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.xml.stream.XMLEventReader;
import javax.xml.stream.XMLStreamException;

import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.openxml4j.exceptions.OpenXML4JException;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.poifs.crypt.Decryptor;
import org.apache.poi.poifs.crypt.EncryptionInfo;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.util.XMLHelper;
import org.apache.poi.xssf.eventusermodel.XSSFReader;
import org.apache.poi.xssf.eventusermodel.XSSFReader.SheetIterator;
import org.apache.poi.xssf.model.SharedStrings;
import org.apache.poi.xssf.model.SharedStringsTable;
import org.apache.poi.xssf.model.StylesTable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.lfn.icip.reader.exceptions.OpenException;
import com.lfn.icip.reader.exceptions.ReadException;
import com.lfn.icip.reader.sst.BufferedStringsTable;
import com.lfn.icip.reader.xlsx.StreamingReader.Builder;

// TODO: Auto-generated Javadoc
/**
 * The Class StreamingWorkbookReader.
 */
public class StreamingWorkbookReader implements Iterable<Sheet>, AutoCloseable {
	
	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(StreamingWorkbookReader.class);

	/** The sheets. */
	private final List<StreamingSheet> sheets;
	
	/** The sheet properties. */
	private final List<Map<String, String>> sheetProperties = new ArrayList<>();
	
	/** The builder. */
	private final Builder builder;
	
	/** The tmp. */
	private File tmp;
	
	/** The sst cache. */
	private File sstCache;
	
	/** The pkg. */
	private OPCPackage pkg;
	
	/** The sst. */
	private SharedStrings sst;
	
	/** The use 1904 dates. */
	private boolean use1904Dates = false;

	/**
	 * This constructor exists only so the StreamingReader can instantiate a
	 * StreamingWorkbook using its own reader implementation. Do not use going
	 * forward.
	 *
	 * @param sst      The SST data for this workbook
	 * @param sstCache The backing cache file for the SST data
	 * @param pkg      The POI package that should be closed when this workbook is
	 *                 closed
	 * @param reader   A single streaming reader instance
	 * @param builder  The builder containing all options
	 */
	
	public StreamingWorkbookReader(SharedStrings sst, File sstCache, OPCPackage pkg, StreamingSheetReader reader,
			Builder builder) {
		this.sst = sst;
		this.sstCache = sstCache;
		this.pkg = pkg;
		this.sheets = asList(new StreamingSheet(null, reader));
		this.builder = builder;
	}

	/**
	 * Instantiates a new streaming workbook reader.
	 *
	 * @param builder the builder
	 */
	public StreamingWorkbookReader(Builder builder) {
		this.sheets = new ArrayList<>();
		this.builder = builder;
	}

	/**
	 * First.
	 *
	 * @return the streaming sheet reader
	 */
	public StreamingSheetReader first() {
		return sheets.get(0).getReader();
	}

	/**
	 * Inits the.
	 *
	 * @param is the is
	 */
	public void init(InputStream is) {
		File f = null;
		try {
			f = writeInputStreamToFile(is, builder.getBufferSize());
			log.debug("Created temp file [" + f.getAbsolutePath() + "]");

			init(f);
			tmp = f;
		} catch (IOException e) {
			throw new ReadException("Unable to read input stream", e);
		} catch (RuntimeException e) {
			if (f != null) {
				f.delete();
			}
			throw e;
		}
	}

	/**
	 * Inits the.
	 *
	 * @param f the f
	 */
	public void init(File f) {
		try {
			if (builder.getPassword() != null) {
				// Based on: https://poi.apache.org/encryption.html
				POIFSFileSystem poifs = new POIFSFileSystem(f);
				EncryptionInfo info = new EncryptionInfo(poifs);
				Decryptor d = Decryptor.getInstance(info);
				d.verifyPassword(builder.getPassword());
				pkg = OPCPackage.open(d.getDataStream(poifs));
			} else {
				pkg = OPCPackage.open(f);
			}

			XSSFReader reader = new XSSFReader(pkg);
			if (builder.getSstCacheSize() > 0) {
				sstCache = Files.createTempFile("", "").toFile();
				log.debug("Created sst cache file [" + sstCache.getAbsolutePath() + "]");
				sst = BufferedStringsTable.getSharedStringsTable(sstCache, builder.getSstCacheSize(), pkg);
			} else {
				sst = (SharedStringsTable) reader.getSharedStringsTable();
			}

			StylesTable styles = reader.getStylesTable();
			NodeList workbookPr = searchForNodeList(document(reader.getWorkbookData()), "/ss:workbook/ss:workbookPr");
			if (workbookPr.getLength() == 1) {
				final Node date1904 = workbookPr.item(0).getAttributes().getNamedItem("date1904");
				if (date1904 != null) {
					use1904Dates = ("1".equals(date1904.getTextContent()));
				}
			}

			loadSheets(reader, sst, styles, builder.getRowCacheSize());
		} catch (IOException e) {
			throw new OpenException("Failed to open file", e);
		} catch (OpenXML4JException | XMLStreamException e) {
			throw new ReadException("Unable to read workbook", e);
		} catch (GeneralSecurityException e) {
			throw new ReadException("Unable to read workbook - Decryption failed", e);
		}
	}

	/**
	 * Load sheets.
	 *
	 * @param reader the reader
	 * @param sst the sst
	 * @param stylesTable the styles table
	 * @param rowCacheSize the row cache size
	 * @throws IOException Signals that an I/O exception has occurred.
	 * @throws InvalidFormatException the invalid format exception
	 * @throws XMLStreamException the XML stream exception
	 */
	void loadSheets(XSSFReader reader, SharedStrings sst, StylesTable stylesTable, int rowCacheSize)
			throws IOException, InvalidFormatException, XMLStreamException {
		lookupSheetNames(reader);

		// Some workbooks have multiple references to the same sheet. Need to filter
		// them out before creating the XMLEventReader by keeping track of their URIs.
		// The sheets are listed in order, so we must keep track of insertion order.
		SheetIterator iter = (SheetIterator) reader.getSheetsData();
		Map<URI, InputStream> sheetStreams = new LinkedHashMap<>();
		while (iter.hasNext()) {
			InputStream is = iter.next();
			sheetStreams.put(iter.getSheetPart().getPartName().getURI(), is);
		}

		// Iterate over the loaded streams
		int i = 0;
		for (URI uri : sheetStreams.keySet()) {
			XMLEventReader parser = XMLHelper.newXMLInputFactory().createXMLEventReader(sheetStreams.get(uri));
			sheets.add(new StreamingSheet(sheetProperties.get(i++).get("name"),
					new StreamingSheetReader(sst, stylesTable, parser, use1904Dates, rowCacheSize)));
		}
	}

	/**
	 * Lookup sheet names.
	 *
	 * @param reader the reader
	 * @throws IOException Signals that an I/O exception has occurred.
	 * @throws InvalidFormatException the invalid format exception
	 */
	void lookupSheetNames(XSSFReader reader) throws IOException, InvalidFormatException {
		sheetProperties.clear();
		NodeList nl = searchForNodeList(document(reader.getWorkbookData()), "/ss:workbook/ss:sheets/ss:sheet");
		for (int i = 0; i < nl.getLength(); i++) {
			Map<String, String> props = new HashMap<>();
			props.put("name", nl.item(i).getAttributes().getNamedItem("name").getTextContent());

			Node state = nl.item(i).getAttributes().getNamedItem("state");
			props.put("state", state == null ? "visible" : state.getTextContent());
			sheetProperties.add(props);
		}
	}

	/**
	 * Gets the sheets.
	 *
	 * @return the sheets
	 */
	List<? extends Sheet> getSheets() {
		return sheets;
	}

	/**
	 * Gets the sheet properties.
	 *
	 * @return the sheet properties
	 */
	public List<Map<String, String>> getSheetProperties() {
		return sheetProperties;
	}

	/**
	 * Iterator.
	 *
	 * @return the iterator
	 */
	@Override
	public Iterator<Sheet> iterator() {
		return new StreamingSheetIterator(sheets.iterator());
	}

	/**
	 * Close.
	 *
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	@Override
	public void close() throws IOException {
		try {
			for (StreamingSheet sheet : sheets) {
				sheet.getReader().close();
			}
			pkg.revert();
		} finally {
			try{
				if (tmp != null) {
					if (log.isDebugEnabled()) {
						log.debug("Deleting tmp file [" + tmp.getAbsolutePath() + "]");
					}
					if (!tmp.delete()) {
						log.debug("Error in deleting file");
					}
				}
			}
			catch(Exception e){
				log.error(e.getMessage());
			}
			try{
				if (sst instanceof BufferedStringsTable) {
					if (log.isDebugEnabled()) {
						log.debug("Deleting sst cache file [" + this.sstCache.getAbsolutePath() + "]");
					}
					((BufferedStringsTable) sst).close();
					if (!sstCache.delete()) {
						log.debug("Error in deleting file");
					}
				}
			}
			catch(Exception exc){
				log.error(exc.getMessage());
			}
		}
	}

	/**
	 * The Class StreamingSheetIterator.
	 */
	static class StreamingSheetIterator implements Iterator<Sheet> {
		
		/** The iterator. */
		private final Iterator<StreamingSheet> iterator;

		/**
		 * Instantiates a new streaming sheet iterator.
		 *
		 * @param iterator the iterator
		 */
		public StreamingSheetIterator(Iterator<StreamingSheet> iterator) {
			this.iterator = iterator;
		}

		/**
		 * Checks for next.
		 *
		 * @return true, if successful
		 */
		@Override
		public boolean hasNext() {
			return iterator.hasNext();
		}

		/**
		 * Next.
		 *
		 * @return the sheet
		 */
		@Override
		public Sheet next() {
			return iterator.next();
		}

		/**
		 * Removes the.
		 */
		@Override
		public void remove() {
			throw new RuntimeException("NotSupported");
		}
	}
}
