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

package com.lfn.icip.reader.sst;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import javax.xml.stream.XMLEventReader;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.events.XMLEvent;

import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.openxml4j.opc.PackagePart;
import org.apache.poi.ss.usermodel.RichTextString;
import org.apache.poi.util.StaxHelper;
import org.apache.poi.xssf.model.SharedStringsTable;
import org.apache.poi.xssf.usermodel.XSSFRelation;
import org.apache.poi.xssf.usermodel.XSSFRichTextString;
import org.openxmlformats.schemas.spreadsheetml.x2006.main.CTRst;
import org.springframework.stereotype.Component;

// TODO: Auto-generated Javadoc
/**
 * The Class BufferedStringsTable.
 */
@Component
public class BufferedStringsTable extends SharedStringsTable implements AutoCloseable {

	/** The list. */
	private FileBackedList list;

	/**
	 * Instantiates a new buffered strings table.
	 */
	public BufferedStringsTable() {
	}

	/**
	 * Gets the shared strings table.
	 *
	 * @param tmp the tmp
	 * @param cacheSize the cache size
	 * @param pkg the pkg
	 * @return the shared strings table
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static BufferedStringsTable getSharedStringsTable(File tmp, int cacheSize, OPCPackage pkg)
			throws IOException {
		List<PackagePart> parts = pkg.getPartsByContentType(XSSFRelation.SHARED_STRINGS.getContentType());
		return parts.isEmpty() ? null : new BufferedStringsTable(parts.get(0), tmp, cacheSize);
	}

	/**
	 * Instantiates a new buffered strings table.
	 *
	 * @param part the part
	 * @param file the file
	 * @param cacheSize the cache size
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	private BufferedStringsTable(PackagePart part, File file, int cacheSize) throws IOException {
		this.list = new FileBackedList(file, cacheSize);
		readFrom(part.getInputStream());
	}

	/**
	 * Read from.
	 *
	 * @param is the is
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	@Override
	public void readFrom(InputStream is) throws IOException {
		try {
			XMLEventReader xmlEventReader = StaxHelper.newXMLInputFactory().createXMLEventReader(is);
			while (xmlEventReader.hasNext()) {
				XMLEvent xmlEvent = xmlEventReader.nextEvent();
				if (xmlEvent.isStartElement() && xmlEvent.asStartElement().getName().getLocalPart().equals("si")) {
					list.add(parseCTRst(xmlEventReader));
				}
			}
		} catch (XMLStreamException e) {
			throw new IOException(e);
		}
	}

	/**
	 * Parses a {@code <si>} String Item. Returns just the text and drops the
	 * formatting. See <a href=
	 * "https://msdn.microsoft.com/en-us/library/documentformat.openxml.spreadsheet.sharedstringitem.aspx">xmlschema
	 * type {@code CT_Rst}</a>.
	 *
	 * @param xmlEventReader the xml event reader
	 * @return the string
	 * @throws XMLStreamException the XML stream exception
	 */
	private String parseCTRst(XMLEventReader xmlEventReader) throws XMLStreamException {
		// Precondition: pointing to <si>; Post condition: pointing to </si>
		StringBuilder buf = new StringBuilder();
		XMLEvent xmlEvent;
		while ((xmlEvent = xmlEventReader.nextTag()).isStartElement()) {
			switch (xmlEvent.asStartElement().getName().getLocalPart()) {
			case "t": // Text
				buf.append(xmlEventReader.getElementText());
				break;
			case "r": // Rich Text Run
				parseCTRElt(xmlEventReader, buf);
				break;
			case "rPh": // Phonetic Run
			case "phoneticPr": // Phonetic Properties
				skipElement(xmlEventReader);
				break;
			default:
				throw new IllegalArgumentException(xmlEvent.asStartElement().getName().getLocalPart());
			}
		}
		return buf.length() > 0 ? buf.toString() : null;
	}

	/**
	 * Parses a {@code <r>} Rich Text Run. Returns just the text and drops the
	 * formatting. See <a href=
	 * "https://msdn.microsoft.com/en-us/library/documentformat.openxml.spreadsheet.run.aspx">xmlschema
	 * type {@code CT_RElt}</a>.
	 *
	 * @param xmlEventReader the xml event reader
	 * @param buf the buf
	 * @throws XMLStreamException the XML stream exception
	 */
	private void parseCTRElt(XMLEventReader xmlEventReader, StringBuilder buf) throws XMLStreamException {
		// Precondition: pointing to <r>; Post condition: pointing to </r>
		XMLEvent xmlEvent;
		while ((xmlEvent = xmlEventReader.nextTag()).isStartElement()) {
			switch (xmlEvent.asStartElement().getName().getLocalPart()) {
			case "t": // Text
				buf.append(xmlEventReader.getElementText());
				break;
			case "rPr": // Run Properties
				skipElement(xmlEventReader);
				break;
			default:
				throw new IllegalArgumentException(xmlEvent.asStartElement().getName().getLocalPart());
			}
		}
	}

	/**
	 * Skip element.
	 *
	 * @param xmlEventReader the xml event reader
	 * @throws XMLStreamException the XML stream exception
	 */
	private void skipElement(XMLEventReader xmlEventReader) throws XMLStreamException {
		// Precondition: pointing to start element; Post condition: pointing to end
		// element
		while (xmlEventReader.nextTag().isStartElement()) {
			skipElement(xmlEventReader); // recursively skip over child
		}
	}

	/**
	 * Gets the item at.
	 *
	 * @param idx the idx
	 * @return the item at
	 */
	@Override
	public RichTextString getItemAt(int idx) {
		return new XSSFRichTextString(list.getAt(idx));
	}

	/**
	 * Gets the entry at.
	 *
	 * @param idx the idx
	 * @return the entry at
	 */
	public CTRst getEntryAt(int idx) {
		return ((XSSFRichTextString) getItemAt(idx)).getCTRst();
	}

	/**
	 * Close.
	 *
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	@Override
	public void close() throws IOException {
		super.close();
		list.close();
	}
}
