/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.reader.impl;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import javax.xml.namespace.QName;
import javax.xml.stream.XMLEventReader;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.events.Attribute;
import javax.xml.stream.events.Characters;
import javax.xml.stream.events.EndElement;
import javax.xml.stream.events.StartElement;
import javax.xml.stream.events.XMLEvent;

import org.apache.poi.ss.usermodel.BuiltinFormats;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.xssf.model.SharedStrings;
import org.apache.poi.xssf.model.StylesTable;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFRichTextString;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.infosys.icets.icip.reader.exceptions.CloseException;
import com.infosys.icets.icip.reader.exceptions.ParseException;

// TODO: Auto-generated Javadoc
/**
 * The Class StreamingSheetReader.
 */
public class StreamingSheetReader implements Iterable<Row> {
	
	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(StreamingSheetReader.class);

	/** The sst. */
	private final SharedStrings sst;
	
	/** The styles table. */
	private final StylesTable stylesTable;
	
	/** The parser. */
	private final XMLEventReader parser;
	
	/** The data formatter. */
	private final DataFormatter dataFormatter = new DataFormatter();
	
	/** The hidden columns. */
	private final Set<Integer> hiddenColumns = new HashSet<>();

	/** The last row num. */
	private int lastRowNum;
	
	/** The current row num. */
	private int currentRowNum;
	
	/** The first col num. */
	private int firstColNum = 0;
	
	/** The current col num. */
	private int currentColNum;
	
	/** The row cache size. */
	private int rowCacheSize;
	
	/** The row cache. */
	private List<Row> rowCache = new ArrayList<>();
	
	/** The row cache iterator. */
	private Iterator<Row> rowCacheIterator;

	/** The last contents. */
	private String lastContents;
	
	/** The sheet. */
	private Sheet sheet;
	
	/** The current row. */
	private StreamingRow currentRow;
	
	/** The current cell. */
	private StreamingCell currentCell;
	
	/** The use 1904 dates. */
	private boolean use1904Dates;

	/**
	 * Instantiates a new streaming sheet reader.
	 *
	 * @param sst the sst
	 * @param stylesTable the styles table
	 * @param parser the parser
	 * @param use1904Dates the use 1904 dates
	 * @param rowCacheSize the row cache size
	 */
	public StreamingSheetReader(SharedStrings sst, StylesTable stylesTable, XMLEventReader parser,
			final boolean use1904Dates, int rowCacheSize) {
		this.sst = sst;
		this.stylesTable = stylesTable;
		this.parser = parser;
		this.use1904Dates = use1904Dates;
		this.rowCacheSize = rowCacheSize;
	}

	/**
	 * Sets the sheet.
	 *
	 * @param sheet the new sheet
	 */
	void setSheet(StreamingSheet sheet) {
		this.sheet = sheet;
	}

	/**
	 * Read through a number of rows equal to the rowCacheSize field or until there
	 * is no more data to read.
	 *
	 * @return true if data was read
	 */
	private boolean getRow() {
		try {
			rowCache.clear();
			while (rowCache.size() < rowCacheSize && parser.hasNext()) {
				handleEvent(parser.nextEvent());
			}
			rowCacheIterator = rowCache.iterator();
			return rowCacheIterator.hasNext();
		} catch (XMLStreamException e) {
			throw new ParseException("Error reading XML stream", e);
		}
	}

	/**
	 * Split cell ref.
	 *
	 * @param ref the ref
	 * @return the string[]
	 */
	private String[] splitCellRef(String ref) {
		int splitPos = -1;

		// start at pos 1, since the first char is expected to always be a letter
		for (int i = 1; i < ref.length(); i++) {
			char c = ref.charAt(i);

			if (c >= '0' && c <= '9') {
				splitPos = i;
				break;
			}
		}

		return new String[] { ref.substring(0, splitPos), ref.substring(splitPos) };
	}

	/**
	 * Handles a SAX event.
	 *
	 * @param event the event
	 */
	private void handleEvent(XMLEvent event) {
		if (event.getEventType() == XMLStreamConstants.CHARACTERS) {
			Characters c = event.asCharacters();
			lastContents += c.getData();
		} else if (event.getEventType() == XMLStreamConstants.START_ELEMENT
				&& isSpreadsheetTag(event.asStartElement().getName())) {
			StartElement startElement = event.asStartElement();
			String tagLocalName = startElement.getName().getLocalPart();

			if ("row".equals(tagLocalName)) {
				Attribute rowNumAttr = startElement.getAttributeByName(new QName("r"));
				int rowIndex = currentRowNum;
				if (rowNumAttr != null) {
					rowIndex = Integer.parseInt(rowNumAttr.getValue()) - 1;
					currentRowNum = rowIndex;
				}
				Attribute isHiddenAttr = startElement.getAttributeByName(new QName("hidden"));
				boolean isHidden = isHiddenAttr != null
						&& ("1".equals(isHiddenAttr.getValue()) || "true".equals(isHiddenAttr.getValue()));
				currentRow = new StreamingRow(sheet, rowIndex, isHidden);
				currentColNum = firstColNum;
			} else if ("col".equals(tagLocalName)) {
				Attribute isHiddenAttr = startElement.getAttributeByName(new QName("hidden"));
				boolean isHidden = isHiddenAttr != null
						&& ("1".equals(isHiddenAttr.getValue()) || "true".equals(isHiddenAttr.getValue()));
				if (isHidden) {
					Attribute minAttr = startElement.getAttributeByName(new QName("min"));
					Attribute maxAttr = startElement.getAttributeByName(new QName("max"));
					int min = Integer.parseInt(minAttr.getValue()) - 1;
					int max = Integer.parseInt(maxAttr.getValue()) - 1;
					for (int columnIndex = min; columnIndex <= max; columnIndex++)
						hiddenColumns.add(columnIndex);
				}
			} else if ("c".equals(tagLocalName)) {
				Attribute ref = startElement.getAttributeByName(new QName("r"));

				if (ref != null) {
					String[] coord = splitCellRef(ref.getValue());
					currentColNum = CellReference.convertColStringToIndex(coord[0]);
					currentCell = new StreamingCell(sheet, currentColNum, Integer.parseInt(coord[1]) - 1, use1904Dates);
				} else {
					currentCell = new StreamingCell(sheet, currentColNum, currentRowNum, use1904Dates);
				}
				setFormatString(startElement, currentCell);

				Attribute type = startElement.getAttributeByName(new QName("t"));
				if (type != null) {
					currentCell.setType(type.getValue());
				} else {
					currentCell.setType("n");
				}

				Attribute style = startElement.getAttributeByName(new QName("s"));
				if (style != null) {
					String indexStr = style.getValue();
					try {
						int index = Integer.parseInt(indexStr);
						currentCell.setCellStyle(stylesTable.getStyleAt(index));
					} catch (NumberFormatException nfe) {
						log.warn("Ignoring invalid style index {}", indexStr);
					}
				} else {
					currentCell.setCellStyle(stylesTable.getStyleAt(0));
				}
			} else if ("dimension".equals(tagLocalName)) {
				Attribute refAttr = startElement.getAttributeByName(new QName("ref"));
				String ref = refAttr != null ? refAttr.getValue() : null;
				if (ref != null) {
					// ref is formatted as A1 or A1:F25. Take the last numbers of this string and
					// use it as lastRowNum
					for (int i = ref.length() - 1; i >= 0; i--) {
						if (!Character.isDigit(ref.charAt(i))) {
							try {
								lastRowNum = Integer.parseInt(ref.substring(i + 1)) - 1;
							} catch (NumberFormatException ignore) {
								log.error(ignore.getMessage(), ignore);
							}
							break;
						}
					}
					for (int i = 0; i < ref.length(); i++) {
						if (!Character.isAlphabetic(ref.charAt(i))) {
							firstColNum = CellReference.convertColStringToIndex(ref.substring(0, i));
							break;
						}
					}
				}
			} else if ("f".equals(tagLocalName)) {
				if (currentCell != null) {
					currentCell.setFormulaType(true);
				}
			}

			// Clear contents cache
			lastContents = "";
		} else if (event.getEventType() == XMLStreamConstants.END_ELEMENT
				&& isSpreadsheetTag(event.asEndElement().getName())) {
			EndElement endElement = event.asEndElement();
			String tagLocalName = endElement.getName().getLocalPart();

			if ("v".equals(tagLocalName) || "t".equals(tagLocalName)) {
				currentCell.setRawContents(unformattedContents());
				currentCell.setContentSupplier(formattedContents());
			} else if ("row".equals(tagLocalName) && currentRow != null) {
				rowCache.add(currentRow);
				currentRowNum++;
			} else if ("c".equals(tagLocalName)) {
				currentRow.getCellMap().put(currentCell.getColumnIndex(), currentCell);
				currentCell = null;
				currentColNum++;
			} else if ("f".equals(tagLocalName)) {
				if (currentCell != null) {
					currentCell.setFormula(lastContents);
				}
			}

		}
	}

	/**
	 * Returns true if a tag is part of the main namespace for SpreadsheetML:
	 * <ul>
	 * <li>http://schemas.openxmlformats.org/spreadsheetml/2006/main
	 * <li>http://purl.oclc.org/ooxml/spreadsheetml/main
	 * </ul>
	 * As opposed to
	 * http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing, etc.
	 *
	 * @param name the name
	 * @return true, if is spreadsheet tag
	 */
	private boolean isSpreadsheetTag(QName name) {
		return (name.getNamespaceURI() != null && name.getNamespaceURI().endsWith("/main"));
	}

	/**
	 * Get the hidden state for a given column.
	 *
	 * @param columnIndex - the column to set (0-based)
	 * @return hidden - <code>false</code> if the column is visible
	 */
	boolean isColumnHidden(int columnIndex) {
		if (rowCacheIterator == null) {
			getRow();
		}
		return hiddenColumns.contains(columnIndex);
	}

	/**
	 * Gets the last row on the sheet.
	 *
	 * @return the last row num
	 */
	int getLastRowNum() {
		if (rowCacheIterator == null) {
			getRow();
		}
		return lastRowNum;
	}

	/**
	 * Read the numeric format string out of the styles table for this cell. Stores
	 * the result in the Cell.
	 *
	 * @param startElement the start element
	 * @param cell the cell
	 */
	void setFormatString(StartElement startElement, StreamingCell cell) {
		Attribute cellStyle = startElement.getAttributeByName(new QName("s"));
		String cellStyleString = (cellStyle != null) ? cellStyle.getValue() : null;
		XSSFCellStyle style = null;

		if (cellStyleString != null) {
			style = stylesTable.getStyleAt(Integer.parseInt(cellStyleString));
		} else if (stylesTable.getNumCellStyles() > 0) {
			style = stylesTable.getStyleAt(0);
		}

		if (style != null) {
			cell.setNumericFormatIndex(style.getDataFormat());
			String formatString = style.getDataFormatString();

			if (formatString != null) {
				cell.setNumericFormat(formatString);
			} else {
				cell.setNumericFormat(BuiltinFormats.getBuiltinFormat(cell.getNumericFormatIndex()));
			}
		} else {
			cell.setNumericFormatIndex(null);
			cell.setNumericFormat(null);
		}
	}

	/**
	 * Tries to format the contents of the last contents appropriately based on the
	 * type of cell and the discovered numeric format.
	 *
	 * @return the supplier
	 */
	Supplier formattedContents() {
		return getFormatterForType(currentCell.getType());
	}

	/**
	 * Tries to format the contents of the last contents appropriately based on the
	 * provided type and the discovered numeric format.
	 *
	 * @param type the type
	 * @return the formatter for type
	 */
	private Supplier getFormatterForType(String type) {
		switch (type) {
		case "s": // string stored in shared table
			if (!lastContents.isEmpty()) {
				int idx = Integer.parseInt(lastContents);
				return new StringSupplier(new XSSFRichTextString(sst.getItemAt(idx).getString()).toString());
			}
			return new StringSupplier(lastContents);
		case "inlineStr": // inline string (not in sst)
		case "str":
			return new StringSupplier(new XSSFRichTextString(lastContents).toString());
		case "e": // error type
			return new StringSupplier("ERROR:  " + lastContents);
		case "n": // numeric type
			if (currentCell.getNumericFormat() != null && lastContents.length() > 0) {
				// the formatRawCellContents operation incurs a significant overhead on large
				// sheets,
				// and we want to defer the execution of this method until the value is actually
				// needed.
				// it is not needed in all cases..
				final String currentLastContents = lastContents;
				final int currentNumericFormatIndex = currentCell.getNumericFormatIndex();
				final String currentNumericFormat = currentCell.getNumericFormat();

				return new Supplier() {
					String cachedContent;

					@Override
					public Object getContent() {
						if (cachedContent == null) {
							cachedContent = dataFormatter.formatRawCellContents(Double.parseDouble(currentLastContents),
									currentNumericFormatIndex, currentNumericFormat);
						}

						return cachedContent;
					}
				};
			} else {
				return new StringSupplier(lastContents);
			}
		default:
			return new StringSupplier(lastContents);
		}
	}

	/**
	 * Returns the contents of the cell, with no formatting applied.
	 *
	 * @return the string
	 */
	String unformattedContents() {
		switch (currentCell.getType()) {
		case "s": // string stored in shared table
			if (!lastContents.isEmpty()) {
				int idx = Integer.parseInt(lastContents);
				return new XSSFRichTextString(sst.getItemAt(idx).getString()).toString();
			}
			return lastContents;
		case "inlineStr": // inline string (not in sst)
			return new XSSFRichTextString(lastContents).toString();
		default:
			return lastContents;
		}
	}

	/**
	 * Returns a new streaming iterator to loop through rows. This iterator is not
	 * guaranteed to have all rows in memory, and any particular iteration may
	 * trigger a load from disk to read in new data.
	 *
	 * @return the streaming iterator
	 */
	@Override
	public Iterator<Row> iterator() {
		return new StreamingRowIterator();
	}

	/**
	 * Close.
	 */
	public void close() {
		try {
			parser.close();
		} catch (XMLStreamException e) {
			throw new CloseException(e);
		}
	}

	/**
	 * The Class StreamingRowIterator.
	 */
	class StreamingRowIterator implements Iterator<Row> {
		
		/**
		 * Instantiates a new streaming row iterator.
		 */
		public StreamingRowIterator() {
			if (rowCacheIterator == null) {
				hasNext();
			}
		}

		/**
		 * Checks for next.
		 *
		 * @return true, if successful
		 */
		@Override
		public boolean hasNext() {
			return (rowCacheIterator != null && rowCacheIterator.hasNext()) || getRow();
		}

		/**
		 * Next.
		 *
		 * @return the row
		 */
		@Override
		public Row next() {
			return rowCacheIterator.next();
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
