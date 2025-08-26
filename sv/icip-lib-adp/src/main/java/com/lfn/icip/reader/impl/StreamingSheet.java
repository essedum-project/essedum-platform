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

import org.apache.poi.ss.util.PaneInformation;
import org.apache.poi.ss.usermodel.AutoFilter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellRange;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Comment;
import org.apache.poi.ss.usermodel.DataValidation;
import org.apache.poi.ss.usermodel.DataValidationHelper;
import org.apache.poi.ss.usermodel.Drawing;
import org.apache.poi.ss.usermodel.Footer;
import org.apache.poi.ss.usermodel.Header;
import org.apache.poi.ss.usermodel.Hyperlink;
import org.apache.poi.ss.usermodel.PrintSetup;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.SheetConditionalFormatting;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellAddress;
import org.apache.poi.ss.util.CellRangeAddress;

import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

// TODO: Auto-generated Javadoc
/**
 * The Class StreamingSheet.
 */
public class StreamingSheet implements Sheet {

  /** The name. */
  private final String name;
  
  /** The reader. */
  private final StreamingSheetReader reader;

  /**
   * Instantiates a new streaming sheet.
   *
   * @param name the name
   * @param reader the reader
   */
  public StreamingSheet(String name, StreamingSheetReader reader) {
    this.name = name;
    this.reader = reader;
    reader.setSheet(this);
  }

  /**
   * Gets the reader.
   *
   * @return the reader
   */
  StreamingSheetReader getReader() {
    return reader;
  }

  /* Supported */

  /**
   * {@inheritDoc}
   */
  @Override
  public Iterator<Row> iterator() {
    return reader.iterator();
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public Iterator<Row> rowIterator() {
    return reader.iterator();
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public String getSheetName() {
    return name;
  }

  /**
   * Get the hidden state for a given column.
   *
   * @param columnIndex - the column to set (0-based)
   * @return hidden - <code>false</code> if the column is visible
   */
  @Override
  public boolean isColumnHidden(int columnIndex) {
    return reader.isColumnHidden(columnIndex);
  }

  /* Unsupported */

  /**
   * Not supported.
   *
   * @param rownum the rownum
   * @return the row
   */
  @Override
  public Row createRow(int rownum) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param row the row
   */
  @Override
  public void removeRow(Row row) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param rownum the rownum
   * @return the row
   */
  @Override
  public Row getRow(int rownum) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the physical number of rows
   */
  @Override
  public int getPhysicalNumberOfRows() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the first row num
   */
  @Override
  public int getFirstRowNum() {
    throw new UnsupportedOperationException();
  }

  /**
   * Gets the last row on the sheet.
   *
   * @return last row contained n this sheet (0-based)
   */
  @Override
  public int getLastRowNum() {
    return reader.getLastRowNum();
  }

  /**
   * Not supported.
   *
   * @param columnIndex the column index
   * @param hidden the hidden
   */
  @Override
  public void setColumnHidden(int columnIndex, boolean hidden) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param value the new right to left
   */
  @Override
  public void setRightToLeft(boolean value) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return true, if is right to left
   */
  @Override
  public boolean isRightToLeft() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param columnIndex the column index
   * @param width the width
   */
  @Override
  public void setColumnWidth(int columnIndex, int width) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param columnIndex the column index
   * @return the column width
   */
  @Override
  public int getColumnWidth(int columnIndex) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param columnIndex the column index
   * @return the column width in pixels
   */
  @Override
  public float getColumnWidthInPixels(int columnIndex) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param width the new default column width
   */
  @Override
  public void setDefaultColumnWidth(int width) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the default column width
   */
  @Override
  public int getDefaultColumnWidth() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the default row height
   */
  @Override
  public short getDefaultRowHeight() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the default row height in points
   */
  @Override
  public float getDefaultRowHeightInPoints() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param height the new default row height
   */
  @Override
  public void setDefaultRowHeight(short height) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param height the new default row height in points
   */
  @Override
  public void setDefaultRowHeightInPoints(float height) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param column the column
   * @return the column style
   */
  @Override
  public CellStyle getColumnStyle(int column) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param region the region
   * @return the int
   */
  @Override
  public int addMergedRegion(CellRangeAddress region) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param cellRangeAddress the cell range address
   * @return the int
   */
  @Override
  public int addMergedRegionUnsafe(CellRangeAddress cellRangeAddress) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   */
  @Override
  public void validateMergedRegions() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param value the new vertically center
   */
  @Override
  public void setVerticallyCenter(boolean value) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param value the new horizontally center
   */
  @Override
  public void setHorizontallyCenter(boolean value) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the horizontally center
   */
  @Override
  public boolean getHorizontallyCenter() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the vertically center
   */
  @Override
  public boolean getVerticallyCenter() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param index the index
   */
  @Override
  public void removeMergedRegion(int index) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param collection the collection
   */
  @Override
  public void removeMergedRegions(Collection<Integer> collection) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the num merged regions
   */
  @Override
  public int getNumMergedRegions() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param index the index
   * @return the merged region
   */
  @Override
  public CellRangeAddress getMergedRegion(int index) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the merged regions
   */
  @Override
  public List<CellRangeAddress> getMergedRegions() {
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
   * @param value the new autobreaks
   */
  @Override
  public void setAutobreaks(boolean value) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param value the new display guts
   */
  @Override
  public void setDisplayGuts(boolean value) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param value the new display zeros
   */
  @Override
  public void setDisplayZeros(boolean value) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return true, if is display zeros
   */
  @Override
  public boolean isDisplayZeros() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param value the new fit to page
   */
  @Override
  public void setFitToPage(boolean value) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param value the new row sums below
   */
  @Override
  public void setRowSumsBelow(boolean value) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param value the new row sums right
   */
  @Override
  public void setRowSumsRight(boolean value) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the autobreaks
   */
  @Override
  public boolean getAutobreaks() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the display guts
   */
  @Override
  public boolean getDisplayGuts() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the fit to page
   */
  @Override
  public boolean getFitToPage() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the row sums below
   */
  @Override
  public boolean getRowSumsBelow() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the row sums right
   */
  @Override
  public boolean getRowSumsRight() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return true, if is prints the gridlines
   */
  @Override
  public boolean isPrintGridlines() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param show the new prints the gridlines
   */
  @Override
  public void setPrintGridlines(boolean show) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return true, if is prints the row and column headings
   */
  @Override
  public boolean isPrintRowAndColumnHeadings() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param b the new prints the row and column headings
   */
  @Override
  public void setPrintRowAndColumnHeadings(boolean b) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the prints the setup
   */
  @Override
  public PrintSetup getPrintSetup() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the header
   */
  @Override
  public Header getHeader() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the footer
   */
  @Override
  public Footer getFooter() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param value the new selected
   */
  @Override
  public void setSelected(boolean value) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param margin the margin
   * @return the margin
   */
  @Override
  public double getMargin(short margin) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param margin the margin
   * @param size the size
   */
  @Override
  public void setMargin(short margin, double size) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the protect
   */
  @Override
  public boolean getProtect() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param password the password
   */
  @Override
  public void protectSheet(String password) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the scenario protect
   */
  @Override
  public boolean getScenarioProtect() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param i the new zoom
   */
  @Override
  public void setZoom(int i) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the top row
   */
  @Override
  public short getTopRow() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the left col
   */
  @Override
  public short getLeftCol() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param toprow the toprow
   * @param leftcol the leftcol
   */
  @Override
  public void showInPane(int toprow, int leftcol) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param startRow the start row
   * @param endRow the end row
   * @param n the n
   */
  @Override
  public void shiftRows(int startRow, int endRow, int n) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param startRow the start row
   * @param endRow the end row
   * @param n the n
   * @param copyRowHeight the copy row height
   * @param resetOriginalRowHeight the reset original row height
   */
  @Override
  public void shiftRows(int startRow, int endRow, int n, boolean copyRowHeight, boolean resetOriginalRowHeight) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param startColumn the start column
   * @param endColumn the end column
   * @param n the n
   */
  @Override
  public void shiftColumns(int startColumn, int endColumn, final int n) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param colSplit the col split
   * @param rowSplit the row split
   * @param leftmostColumn the leftmost column
   * @param topRow the top row
   */
  @Override
  public void createFreezePane(int colSplit, int rowSplit, int leftmostColumn, int topRow) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param colSplit the col split
   * @param rowSplit the row split
   */
  @Override
  public void createFreezePane(int colSplit, int rowSplit) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param xSplitPos the x split pos
   * @param ySplitPos the y split pos
   * @param leftmostColumn the leftmost column
   * @param topRow the top row
   * @param activePane the active pane
   */
  @Override
  public void createSplitPane(int xSplitPos, int ySplitPos, int leftmostColumn, int topRow, int activePane) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the pane information
   */
  @Override
  public PaneInformation getPaneInformation() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param show the new display gridlines
   */
  @Override
  public void setDisplayGridlines(boolean show) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return true, if is display gridlines
   */
  @Override
  public boolean isDisplayGridlines() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param show the new display formulas
   */
  @Override
  public void setDisplayFormulas(boolean show) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return true, if is display formulas
   */
  @Override
  public boolean isDisplayFormulas() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param show the new display row col headings
   */
  @Override
  public void setDisplayRowColHeadings(boolean show) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return true, if is display row col headings
   */
  @Override
  public boolean isDisplayRowColHeadings() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param row the new row break
   */
  @Override
  public void setRowBreak(int row) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param row the row
   * @return true, if is row broken
   */
  @Override
  public boolean isRowBroken(int row) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param row the row
   */
  @Override
  public void removeRowBreak(int row) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the row breaks
   */
  @Override
  public int[] getRowBreaks() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the column breaks
   */
  @Override
  public int[] getColumnBreaks() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param column the new column break
   */
  @Override
  public void setColumnBreak(int column) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param column the column
   * @return true, if is column broken
   */
  @Override
  public boolean isColumnBroken(int column) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param column the column
   */
  @Override
  public void removeColumnBreak(int column) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param columnNumber the column number
   * @param collapsed the collapsed
   */
  @Override
  public void setColumnGroupCollapsed(int columnNumber, boolean collapsed) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param fromColumn the from column
   * @param toColumn the to column
   */
  @Override
  public void groupColumn(int fromColumn, int toColumn) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param fromColumn the from column
   * @param toColumn the to column
   */
  @Override
  public void ungroupColumn(int fromColumn, int toColumn) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param fromRow the from row
   * @param toRow the to row
   */
  @Override
  public void groupRow(int fromRow, int toRow) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param fromRow the from row
   * @param toRow the to row
   */
  @Override
  public void ungroupRow(int fromRow, int toRow) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param row the row
   * @param collapse the collapse
   */
  @Override
  public void setRowGroupCollapsed(int row, boolean collapse) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param column the column
   * @param style the style
   */
  @Override
  public void setDefaultColumnStyle(int column, CellStyle style) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param column the column
   */
  @Override
  public void autoSizeColumn(int column) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param column the column
   * @param useMergedCells the use merged cells
   */
  @Override
  public void autoSizeColumn(int column, boolean useMergedCells) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param cellAddress the cell address
   * @return the cell comment
   */
  @Override
  public Comment getCellComment(CellAddress cellAddress) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the cell comments
   */
  @Override
  public Map<CellAddress, ? extends Comment> getCellComments() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the drawing patriarch
   */
  @Override
  public Drawing getDrawingPatriarch() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the drawing
   */
  @Override
  public Drawing createDrawingPatriarch() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the workbook
   */
  @Override
  public Workbook getWorkbook() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return true, if is selected
   */
  @Override
  public boolean isSelected() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param formula the formula
   * @param range the range
   * @return the cell range<? extends cell>
   */
  @Override
  public CellRange<? extends Cell> setArrayFormula(String formula, CellRangeAddress range) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param cell the cell
   * @return the cell range<? extends cell>
   */
  @Override
  public CellRange<? extends Cell> removeArrayFormula(Cell cell) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the data validation helper
   */
  @Override
  public DataValidationHelper getDataValidationHelper() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the data validations
   */
  @Override
  public List<? extends DataValidation> getDataValidations() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param dataValidation the data validation
   */
  @Override
  public void addValidationData(DataValidation dataValidation) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param range the range
   * @return the auto filter
   */
  @Override
  public AutoFilter setAutoFilter(CellRangeAddress range) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the sheet conditional formatting
   */
  @Override
  public SheetConditionalFormatting getSheetConditionalFormatting() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the repeating rows
   */
  @Override
  public CellRangeAddress getRepeatingRows() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the repeating columns
   */
  @Override
  public CellRangeAddress getRepeatingColumns() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param rowRangeRef the new repeating rows
   */
  @Override
  public void setRepeatingRows(CellRangeAddress rowRangeRef) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param columnRangeRef the new repeating columns
   */
  @Override
  public void setRepeatingColumns(CellRangeAddress columnRangeRef) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param columnIndex the column index
   * @return the column outline level
   */
  @Override
  public int getColumnOutlineLevel(int columnIndex) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param i the i
   * @param i1 the i 1
   * @return the hyperlink
   */
  @Override
  public Hyperlink getHyperlink(int i, int i1) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param cellAddress the cell address
   * @return the hyperlink
   */
  @Override
  public Hyperlink getHyperlink(CellAddress cellAddress) {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the hyperlink list
   */
  @Override
  public List<? extends Hyperlink> getHyperlinkList() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @return the active cell
   */
  @Override
  public CellAddress getActiveCell() {
    throw new UnsupportedOperationException();
  }

  /**
   * Not supported.
   *
   * @param cellAddress the new active cell
   */
  @Override
  public void setActiveCell(CellAddress cellAddress) {
    throw new UnsupportedOperationException();
  }
}
