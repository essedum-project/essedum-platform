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

import com.lfn.icip.reader.exceptions.MissingSheetException;
import org.apache.poi.ss.SpreadsheetVersion;
import org.apache.poi.ss.formula.EvaluationWorkbook;
import org.apache.poi.ss.formula.udf.UDFFinder;
import org.apache.poi.ss.usermodel.CellReferenceType;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Name;
import org.apache.poi.ss.usermodel.PictureData;
import org.apache.poi.ss.usermodel.Row.MissingCellPolicy;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.SheetVisibility;
import org.apache.poi.ss.usermodel.Workbook;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Iterator;
import java.util.List;

// TODO: Auto-generated Javadoc
/**
 * The Class StreamingWorkbook.
 */
public class StreamingWorkbook implements Workbook, AutoCloseable {
  
  /** The reader. */
  private final StreamingWorkbookReader reader;

  /**
   * Instantiates a new streaming workbook.
   *
   * @param reader the reader
   */
  public StreamingWorkbook(StreamingWorkbookReader reader) {
    this.reader = reader;
  }

  /**
   * Find sheet by name.
   *
   * @param name the name
   * @return the int
   */
  int findSheetByName(String name) {
    for(int i = 0; i < reader.getSheetProperties().size(); i++) {
      if(reader.getSheetProperties().get(i).get("name").equals(name)) {
        return i;
      }
    }
    return -1;
  }

  /* Supported */

  /**
   * {@inheritDoc}
   */
  @Override
  public Iterator<Sheet> iterator() {
    return reader.iterator();
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public Iterator<Sheet> sheetIterator() {
    return iterator();
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public String getSheetName(int sheet) {
    return reader.getSheetProperties().get(sheet).get("name");
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public int getSheetIndex(String name) {
    return findSheetByName(name);
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public int getSheetIndex(Sheet sheet) {
    if(sheet instanceof StreamingSheet) {
      return findSheetByName(sheet.getSheetName());
    } else {
      throw new UnsupportedOperationException("Cannot use non-StreamingSheet sheets");
    }
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public int getNumberOfSheets() {
    return reader.getSheets().size();
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public Sheet getSheetAt(int index) {
    return reader.getSheets().get(index);
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public Sheet getSheet(String name) {
    int index = getSheetIndex(name);
    if(index == -1) {
      throw new MissingSheetException("Sheet '" + name + "' does not exist");
    }
    return reader.getSheets().get(index);
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public boolean isSheetHidden(int sheetIx) {
    return "hidden".equals(reader.getSheetProperties().get(sheetIx).get("state"));
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public boolean isSheetVeryHidden(int sheetIx) {
    return "veryHidden".equals(reader.getSheetProperties().get(sheetIx).get("state"));
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public void close() throws IOException {
    reader.close();
  }

  /* Not supported */

  /**
   * Not supported.
   *
   * @return the active sheet index
   */
  @Override
  public int getActiveSheetIndex() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param sheetIndex the new active sheet
   */
  @Override
  public void setActiveSheet(int sheetIndex) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the first visible tab
   */
  @Override
  public int getFirstVisibleTab() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param sheetIndex the new first visible tab
   */
  @Override
  public void setFirstVisibleTab(int sheetIndex) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param sheetname the sheetname
   * @param pos the pos
   */
  @Override
  public void setSheetOrder(String sheetname, int pos) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param index the new selected tab
   */
  @Override
  public void setSelectedTab(int index) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param sheet the sheet
   * @param name the name
   */
  @Override
  public void setSheetName(int sheet, String name) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the sheet
   */
  @Override
  public Sheet createSheet() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param sheetname the sheetname
   * @return the sheet
   */
  @Override
  public Sheet createSheet(String sheetname) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param sheetNum the sheet num
   * @return the sheet
   */
  @Override
  public Sheet cloneSheet(int sheetNum) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param index the index
   */
  @Override
  public void removeSheetAt(int index) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the font
   */
  @Override
  public Font createFont() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param b the b
   * @param i the i
   * @param i1 the i 1
   * @param s the s
   * @param b1 the b 1
   * @param b2 the b 2
   * @param i2 the i 2
   * @param b3 the b 3
   * @return the font
   */
  @Override
  public Font findFont(boolean b, short i, short i1, String s, boolean b1, boolean b2, short i2, byte b3) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the number of fonts as int
   */
  @Override
  public int getNumberOfFontsAsInt() { throw new UnsupportedOperationException(); }



  /**
   * Not supported.
   *
   * @param i the i
   * @return the font at
   */
  @Override
  public Font getFontAt(int i) { throw new UnsupportedOperationException(); }

  /**
   * Not supported.
   *
   * @return the cell style
   */
  @Override
  public CellStyle createCellStyle() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the num cell styles
   */
  @Override
  public int getNumCellStyles() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param i the i
   * @return the cell style at
   */
  @Override
  public CellStyle getCellStyleAt(int i) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param stream the stream
   * @throws IOException Signals that an I/O exception has occurred.
   */
  @Override
  public void write(OutputStream stream) throws IOException {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the number of names
   */
  @Override
  public int getNumberOfNames() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param name the name
   * @return the name
   */
  @Override
  public Name getName(String name) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param s the s
   * @return the names
   */
  @Override
  public List<? extends Name> getNames(String s) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the all names
   */
  @Override
  public List<? extends Name> getAllNames() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the name
   */
  @Override
  public Name createName() {
    throw new UnsupportedOperationException();
  }


  /**
   * Not supported.
   *
   * @param name the name
   */
  @Override
  public void removeName(Name name) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param name the name
   * @param workbook the workbook
   * @return the int
   */
  @Override
  public int linkExternalWorkbook(String name, Workbook workbook) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param sheetIndex the sheet index
   * @param reference the reference
   */
  @Override
  public void setPrintArea(int sheetIndex, String reference) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param sheetIndex the sheet index
   * @param startColumn the start column
   * @param endColumn the end column
   * @param startRow the start row
   * @param endRow the end row
   */
  @Override
  public void setPrintArea(int sheetIndex, int startColumn, int endColumn, int startRow, int endRow) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param sheetIndex the sheet index
   * @return the prints the area
   */
  @Override
  public String getPrintArea(int sheetIndex) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param sheetIndex the sheet index
   */
  @Override
  public void removePrintArea(int sheetIndex) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the missing cell policy
   */
  @Override
  public MissingCellPolicy getMissingCellPolicy() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param missingCellPolicy the new missing cell policy
   */
  @Override
  public void setMissingCellPolicy(MissingCellPolicy missingCellPolicy) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the data format
   */
  @Override
  public DataFormat createDataFormat() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param pictureData the picture data
   * @param format the format
   * @return the int
   */
  @Override
  public int addPicture(byte[] pictureData, int format) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the all pictures
   */
  @Override
  public List<? extends PictureData> getAllPictures() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the creation helper
   */
  @Override
  public CreationHelper getCreationHelper() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return true, if is hidden
   */
  @Override
  public boolean isHidden() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param hiddenFlag the new hidden
   */
  @Override
  public void setHidden(boolean hiddenFlag) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param sheetIx the sheet ix
   * @param hidden the hidden
   */
  @Override
  public void setSheetHidden(int sheetIx, boolean hidden) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param i the i
   * @return the sheet visibility
   */
  @Override
  public SheetVisibility getSheetVisibility(int i) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param i the i
   * @param sheetVisibility the sheet visibility
   */
  @Override
  public void setSheetVisibility(int i, SheetVisibility sheetVisibility) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param toopack the toopack
   */
  @Override
  public void addToolPack(UDFFinder toopack) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param value the new force formula recalculation
   */
  @Override
  public void setForceFormulaRecalculation(boolean value) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the force formula recalculation
   */
  @Override
  public boolean getForceFormulaRecalculation() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the spreadsheet version
   */
  @Override
  public SpreadsheetVersion getSpreadsheetVersion() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param bytes the bytes
   * @param s the s
   * @param s1 the s 1
   * @param s2 the s 2
   * @return the int
   * @throws IOException Signals that an I/O exception has occurred.
   */
  @Override
  public int addOlePackage(byte[] bytes, String s, String s1, String s2) throws IOException {
    throw new UnsupportedOperationException();
  }

/**
 * Gets the number of fonts.
 *
 * @return the number of fonts
 */
@Override
public int getNumberOfFonts() {
	// TODO Auto-generated method stub
	return 0;
}

/**
 * Creates the evaluation workbook.
 *
 * @return the evaluation workbook
 */
@Override
public EvaluationWorkbook createEvaluationWorkbook() {
	// TODO Auto-generated method stub
	return null;
}

@Override
public CellReferenceType getCellReferenceType() {
	// TODO Auto-generated method stub
	return null;
}

@Override
public void setCellReferenceType(CellReferenceType arg0) {
	// TODO Auto-generated method stub
	
}

}
