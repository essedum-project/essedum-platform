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

import com.lfn.icip.reader.exceptions.NotSupportedException;
//import org.apache.poi.hssf.usermodel.HSSFDateUtil;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.formula.FormulaParseException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Comment;
import org.apache.poi.ss.usermodel.Hyperlink;
import org.apache.poi.ss.usermodel.RichTextString;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.util.CellAddress;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFRichTextString;

import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.Date;

// TODO: Auto-generated Javadoc
/**
 * The Class StreamingCell.
 */
public class StreamingCell implements Cell {

	/** The Constant NULL_SUPPLIER. */
	private static final Supplier NULL_SUPPLIER = new Supplier() {
		@Override
		public Object getContent() {
			return null;
		}
	};

	/** The Constant FALSE_AS_STRING. */
	private static final String FALSE_AS_STRING = "0";
	
	/** The Constant TRUE_AS_STRING. */
	private static final String TRUE_AS_STRING = "1";

	/** The sheet. */
	private final Sheet sheet;
	
	/** The column index. */
	private int columnIndex;
	
	/** The row index. */
	private int rowIndex;
	
	/** The use 1904 dates. */
	private final boolean use1904Dates;

	/** The contents supplier. */
	private Supplier contentsSupplier = NULL_SUPPLIER;
	
	/** The raw contents. */
	private Object rawContents;
	
	/** The formula. */
	private String formula;
	
	/** The numeric format. */
	private String numericFormat;
	
	/** The numeric format index. */
	private Short numericFormatIndex;
	
	/** The type. */
	private String type;
	
	/** The cell style. */
	private CellStyle cellStyle;
	
	/** The row. */
	private Row row;
	
	/** The formula type. */
	private boolean formulaType;

	/**
	 * Instantiates a new streaming cell.
	 *
	 * @param sheet the sheet
	 * @param columnIndex the column index
	 * @param rowIndex the row index
	 * @param use1904Dates the use 1904 dates
	 */
	public StreamingCell(Sheet sheet, int columnIndex, int rowIndex, boolean use1904Dates) {
		this.sheet = sheet;
		this.columnIndex = columnIndex;
		this.rowIndex = rowIndex;
		this.use1904Dates = use1904Dates;
	}

	/**
	 * Sets the content supplier.
	 *
	 * @param contentsSupplier the new content supplier
	 */
	public void setContentSupplier(Supplier contentsSupplier) {
		this.contentsSupplier = contentsSupplier;
	}

	/**
	 * Sets the raw contents.
	 *
	 * @param rawContents the new raw contents
	 */
	public void setRawContents(Object rawContents) {
		this.rawContents = rawContents;
	}

	/**
	 * Gets the numeric format.
	 *
	 * @return the numeric format
	 */
	public String getNumericFormat() {
		return numericFormat;
	}

	/**
	 * Sets the numeric format.
	 *
	 * @param numericFormat the new numeric format
	 */
	public void setNumericFormat(String numericFormat) {
		this.numericFormat = numericFormat;
	}

	/**
	 * Gets the numeric format index.
	 *
	 * @return the numeric format index
	 */
	public Short getNumericFormatIndex() {
		return numericFormatIndex;
	}

	/**
	 * Sets the numeric format index.
	 *
	 * @param numericFormatIndex the new numeric format index
	 */
	public void setNumericFormatIndex(Short numericFormatIndex) {
		this.numericFormatIndex = numericFormatIndex;
	}

	/**
	 * Sets the formula.
	 *
	 * @param formula the new formula
	 */
	public void setFormula(String formula) {
		this.formula = formula;
	}

	/**
	 * Gets the type.
	 *
	 * @return the type
	 */
	public String getType() {
		return type;
	}

	/**
	 * Sets the type.
	 *
	 * @param type the new type
	 */
	public void setType(String type) {
		this.type = type;
	}

	/**
	 * Checks if is formula type.
	 *
	 * @return true, if is formula type
	 */
	public boolean isFormulaType() {
		return formulaType;
	}

	/**
	 * Sets the formula type.
	 *
	 * @param formulaType the new formula type
	 */
	public void setFormulaType(boolean formulaType) {
		this.formulaType = formulaType;
	}

	/**
	 * Sets the cell style.
	 *
	 * @param cellStyle the new cell style
	 */
	@Override
	public void setCellStyle(CellStyle cellStyle) {
		this.cellStyle = cellStyle;
	}

	/* Supported */

	/**
	 * Returns column index of this cell.
	 *
	 * @return zero-based column index of a column in a sheet.
	 */
	@Override
	public int getColumnIndex() {
		return columnIndex;
	}

	/**
	 * Returns row index of a row in the sheet that contains this cell.
	 *
	 * @return zero-based row index of a row in the sheet that contains this cell
	 */
	@Override
	public int getRowIndex() {
		return rowIndex;
	}

	/**
	 * Returns the Row this cell belongs to. Note that keeping references to cell
	 * rows around after the iterator window has passed <b>will</b> preserve them.
	 *
	 * @return the Row that owns this cell
	 */
	@Override
	public Row getRow() {
		return row;
	}

	/**
	 * Sets the Row this cell belongs to. Note that keeping references to cell rows
	 * around after the iterator window has passed <b>will</b> preserve them.
	 * 
	 * The row is not automatically set.
	 *
	 * @param row the new row
	 */
	public void setRow(Row row) {
		this.row = row;
	}

	/**
	 * Return the cell type.
	 *
	 * @return the cell type
	 */
	@Override
	public CellType getCellType() {
		if (formulaType) {
			return CellType.FORMULA;
		} else if (contentsSupplier.getContent() == null || type == null) {
			return CellType.BLANK;
		} else if ("n".equals(type)) {
			return CellType.NUMERIC;
		} else if ("s".equals(type) || "inlineStr".equals(type) || "str".equals(type)) {
			return CellType.STRING;
		} else if ("str".equals(type)) {
			return CellType.FORMULA;
		} else if ("b".equals(type)) {
			return CellType.BOOLEAN;
		} else if ("e".equals(type)) {
			return CellType.ERROR;
		} else {
			throw new UnsupportedOperationException("Unsupported cell type '" + type + "'");
		}
	}

	/**
	 * Get the value of the cell as a string. For blank cells we return an empty
	 * string.
	 *
	 * @return the value of the cell as a string
	 */
	@Override
	public String getStringCellValue() {
		Object c = contentsSupplier.getContent();

		return c == null ? "" : c.toString();
	}

	/**
	 * Get the value of the cell as a number. For strings we throw an exception. For
	 * blank cells we return a 0.
	 *
	 * @return the value of the cell as a number
	 * @throws NumberFormatException if the cell value isn't a parsable
	 *                               <code>double</code>.
	 */
	@Override
	public double getNumericCellValue() {
		return rawContents == null ? 0.0 : Double.parseDouble((String) rawContents);
	}

	/**
	 * Get the value of the cell as a date. For strings we throw an exception. For
	 * blank cells we return a null.
	 *
	 * @return the value of the cell as a date
	 * @throws IllegalStateException if the cell type returned by
	 *                               {@link #getCellType()} is CELL_TYPE_STRING
	 * @throws NumberFormatException if the cell value isn't a parsable
	 *                               <code>double</code>.
	 */
	@Override
	public Date getDateCellValue() {
		if (getCellType() == CellType.STRING) {
			throw new IllegalStateException("Cell type cannot be CELL_TYPE_STRING");
		}
		return rawContents == null ? null : DateUtil.getJavaDate(getNumericCellValue(), use1904Dates);
	}

	/**
	 * Get the value of the cell as a boolean. For strings we throw an exception.
	 * For blank cells we return a false.
	 *
	 * @return the value of the cell as a date
	 */
	@Override
	public boolean getBooleanCellValue() {
		CellType cellType = getCellType();
		switch (cellType) {
		case BLANK:
			return false;
		case BOOLEAN:
			return rawContents != null && TRUE_AS_STRING.equals(rawContents);
		case FORMULA:
			throw new NotSupportedException();
		default:
			throw typeMismatch(CellType.BOOLEAN, cellType, false);
		}
	}

	/**
	 * Get the value of the cell as a XSSFRichTextString
	 * <p>
	 * For numeric cells we throw an exception. For blank cells we return an empty
	 * string. For formula cells we return the pre-calculated value if a string,
	 * otherwise an exception
	 * </p>
	 * 
	 * @return the value of the cell as a XSSFRichTextString
	 */
	@Override
	public XSSFRichTextString getRichStringCellValue() {
		CellType cellType = getCellType();
		XSSFRichTextString rt;
		switch (cellType) {
		case BLANK:
			rt = new XSSFRichTextString("");
			break;
		case STRING:
			rt = new XSSFRichTextString(getStringCellValue());
			break;
		default:
			throw new NotSupportedException();
		}
		return rt;
	}

	/**
	 * Gets the sheet.
	 *
	 * @return the sheet
	 */
	@Override
	public Sheet getSheet() {
		return sheet;
	}

	/**
	 * Type mismatch.
	 *
	 * @param expectedType the expected type
	 * @param actualType the actual type
	 * @param isFormulaCell the is formula cell
	 * @return the runtime exception
	 */
	private static RuntimeException typeMismatch(CellType expectedType, CellType actualType, boolean isFormulaCell) {
		String msg = "Cannot get a " + getCellTypeName(expectedType) + " value from a " + getCellTypeName(actualType)
				+ " " + (isFormulaCell ? "formula " : "") + "cell";
		return new IllegalStateException(msg);
	}

	/**
	 * Used to help format error messages.
	 *
	 * @param cellType the cell type
	 * @return the cell type name
	 */
	private static String getCellTypeName(CellType cellType) {
		switch (cellType) {
		case BLANK:
			return "blank";
		case STRING:
			return "text";
		case BOOLEAN:
			return "boolean";
		case ERROR:
			return "error";
		case NUMERIC:
			return "numeric";
		case FORMULA:
			return "formula";
		}
		return "#unknown cell type (" + cellType + ")#";
	}

	/**
	 * Gets the cell style.
	 *
	 * @return the style of the cell
	 */
	@Override
	public CellStyle getCellStyle() {
		return this.cellStyle;
	}

	/**
	 * Return a formula for the cell, for example, <code>SUM(C4:E4)</code>.
	 *
	 * @return a formula for the cell
	 * @throws IllegalStateException if the cell type returned by
	 *                               {@link #getCellType()} is not CELL_TYPE_FORMULA
	 */
	@Override
	public String getCellFormula() {
		if (!formulaType)
			throw new IllegalStateException("This cell does not have a formula");
		return formula;
	}

	/**
	 * Only valid for formula cells.
	 *
	 * @return one of ({@link CellType#NUMERIC}, {@link CellType#STRING},
	 *         {@link CellType#BOOLEAN}, {@link CellType#ERROR}) depending on the
	 *         cached value of the formula
	 */
	@Override
	public CellType getCachedFormulaResultType() {
		if (formulaType) {
			if (contentsSupplier.getContent() == null || type == null) {
				return CellType.BLANK;
			} else if ("n".equals(type)) {
				return CellType.NUMERIC;
			} else if ("s".equals(type) || "inlineStr".equals(type) || "str".equals(type)) {
				return CellType.STRING;
			} else if ("b".equals(type)) {
				return CellType.BOOLEAN;
			} else if ("e".equals(type)) {
				return CellType.ERROR;
			} else {
				throw new UnsupportedOperationException("Unsupported cell type '" + type + "'");
			}
		} else {
			throw new IllegalStateException("Only formula cells have cached results");
		}
	}

	/* Not supported */

	/**
	 * Not supported.
	 *
	 * @param cellType the new cell type
	 */
	@Override
	public void setCellType(CellType cellType) {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @param value the new cell value
	 */
	@Override
	public void setCellValue(double value) {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @param value the new cell value
	 */
	@Override
	public void setCellValue(Date value) {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @param value the new cell value
	 */
	@Override
	public void setCellValue(Calendar value) {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @param value the new cell value
	 */
	@Override
	public void setCellValue(RichTextString value) {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @param value the new cell value
	 */
	@Override
	public void setCellValue(String value) {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @param formula the new cell formula
	 * @throws FormulaParseException the formula parse exception
	 */
	@Override
	public void setCellFormula(String formula) throws FormulaParseException {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @param value the new cell value
	 */
	@Override
	public void setCellValue(boolean value) {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @param value the new cell error value
	 */
	@Override
	public void setCellErrorValue(byte value) {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @return the error cell value
	 */
	@Override
	public byte getErrorCellValue() {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 */
	@Override
	public void setAsActiveCell() {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @return the address
	 */
	@Override
	public CellAddress getAddress() {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @param comment the new cell comment
	 */
	@Override
	public void setCellComment(Comment comment) {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @return the cell comment
	 */
	@Override
	public Comment getCellComment() {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 */
	@Override
	public void removeCellComment() {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @return the hyperlink
	 */
	@Override
	public Hyperlink getHyperlink() {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @param link the new hyperlink
	 */
	@Override
	public void setHyperlink(Hyperlink link) {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 */
	@Override
	public void removeHyperlink() {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @return the array formula range
	 */
	@Override
	public CellRangeAddress getArrayFormulaRange() {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @return true, if is part of array formula group
	 */
	@Override
	public boolean isPartOfArrayFormulaGroup() {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 */
	@Override
	public void setBlank() {
		throw new NotSupportedException();
	}

	/**
	 * Not supported.
	 *
	 * @throws IllegalStateException the illegal state exception
	 */
	@Override
	public void removeFormula() throws IllegalStateException {
		throw new NotSupportedException();
	}

	/**
	 * Sets the cell value.
	 *
	 * @param value the new cell value
	 */
	@Override
	public void setCellValue(LocalDateTime value) {
		throw new NotSupportedException();
	}

	/**
	 * Gets the local date time cell value.
	 *
	 * @return the local date time cell value
	 */
	@Override
	public LocalDateTime getLocalDateTimeCellValue() {
		throw new NotSupportedException();
	}
}
