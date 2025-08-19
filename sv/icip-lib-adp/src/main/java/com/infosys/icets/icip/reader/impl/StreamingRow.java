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

package com.infosys.icets.icip.reader.impl;

import com.infosys.icets.icip.reader.exceptions.NotSupportedException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;

import java.util.Iterator;
import java.util.Map;
import java.util.TreeMap;

// TODO: Auto-generated Javadoc
/**
 * The Class StreamingRow.
 */
public class StreamingRow implements Row {
  
  /** The sheet. */
  private final Sheet sheet;
  
  /** The row index. */
  private int rowIndex;
  
  /** The is hidden. */
  private boolean isHidden;
  
  /** The cell map. */
  private TreeMap<Integer, Cell> cellMap = new TreeMap<>();

  /**
   * Instantiates a new streaming row.
   *
   * @param sheet the sheet
   * @param rowIndex the row index
   * @param isHidden the is hidden
   */
  public StreamingRow(Sheet sheet, int rowIndex, boolean isHidden) {
    this.sheet = sheet;
    this.rowIndex = rowIndex;
    this.isHidden = isHidden;
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
   * Gets the cell map.
   *
   * @return the cell map
   */
  public Map<Integer, Cell> getCellMap() {
    return cellMap;
  }

  /**
   * Sets the cell map.
   *
   * @param cellMap the cell map
   */
  public void setCellMap(TreeMap<Integer, Cell> cellMap) {
    this.cellMap = cellMap;
  }

 /* Supported */

  /**
  * Get row number this row represents.
  *
  * @return the row number (0 based)
  */
  @Override
  public int getRowNum() {
    return rowIndex;
  }

  /**
   * Cell iterator.
   *
   * @return Cell iterator of the physically defined cells for this row.
   */
  @Override
  public Iterator<Cell> cellIterator() {
    return cellMap.values().iterator();
  }

  /**
   * Iterator.
   *
   * @return Cell iterator of the physically defined cells for this row.
   */
  @Override
  public Iterator<Cell> iterator() {
    return cellMap.values().iterator();
  }

  /**
   * Get the cell representing a given column (logical cell) 0-based.  If you
   * ask for a cell that is not defined, you get a null.
   *
   * @param cellnum 0 based column number
   * @return Cell representing that column or null if undefined.
   */
  @Override
  public Cell getCell(int cellnum) {
    return cellMap.get(cellnum);
  }

  /**
   * Gets the index of the last cell contained in this row <b>PLUS ONE</b>.
   *
   * @return short representing the last logical cell in the row <b>PLUS ONE</b>,
   * or -1 if the row does not contain any cells.
   */
  @Override
  public short getLastCellNum() {
    return (short) (cellMap.size() == 0 ? -1 : cellMap.lastEntry().getValue().getColumnIndex() + 1);
  }

  /**
   * Get whether or not to display this row with 0 height.
   *
   * @return - zHeight height is zero or not.
   */
  @Override
  public boolean getZeroHeight() {
    return isHidden;
  }

  /**
   * Gets the number of defined cells (NOT number of cells in the actual row!).
   * That is to say if only columns 0,4,5 have values then there would be 3.
   *
   * @return int representing the number of defined cells in the row.
   */
  @Override
  public int getPhysicalNumberOfCells() {
    return cellMap.size();
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public short getFirstCellNum() {
    if(cellMap.size() == 0) {
      return -1;
    }
    return cellMap.firstKey().shortValue();
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public Cell getCell(int cellnum, MissingCellPolicy policy) {
    StreamingCell cell = (StreamingCell) cellMap.get(cellnum);
    if(policy == MissingCellPolicy.CREATE_NULL_AS_BLANK) {
      if(cell == null) { return new StreamingCell(sheet, cellnum, rowIndex, false); }
    } else if(policy == MissingCellPolicy.RETURN_BLANK_AS_NULL) {
      if(cell == null || cell.getCellType() == CellType.BLANK) { return null; }
    }
    return cell;
  }

  /* Not supported */

  /**
   * Not supported.
   *
   * @param column the column
   * @return the cell
   */
  @Override
  public Cell createCell(int column) {
    throw new NotSupportedException();
  }

  /**
   * Not supported.
   *
   * @param i the i
   * @param cellType the cell type
   * @return the cell
   */
  @Override
  public Cell createCell(int i, CellType cellType) {
    throw new NotSupportedException();
  }

  /**
   * Not supported.
   *
   * @param cell the cell
   */
  @Override
  public void removeCell(Cell cell) {
    throw new NotSupportedException();
  }

  /**
   * Not supported.
   *
   * @param rowNum the new row num
   */
  @Override
  public void setRowNum(int rowNum) {
    throw new NotSupportedException();
  }

  /**
   * Not supported.
   *
   * @param height the new height
   */
  @Override
  public void setHeight(short height) {
    throw new NotSupportedException();
  }

  /**
   * Not supported.
   *
   * @param zHeight the new zero height
   */
  @Override
  public void setZeroHeight(boolean zHeight) {
    throw new NotSupportedException();
  }

  /**
   * Not supported.
   *
   * @param height the new height in points
   */
  @Override
  public void setHeightInPoints(float height) {
    throw new NotSupportedException();
  }

  /**
   * Not supported.
   *
   * @return the height
   */
  @Override
  public short getHeight() {
    throw new NotSupportedException();
  }

  /**
   * Not supported.
   *
   * @return the height in points
   */
  @Override
  public float getHeightInPoints() {
    throw new NotSupportedException();
  }

  /**
   * Not supported.
   *
   * @return true, if is formatted
   */
  @Override
  public boolean isFormatted() {
    throw new NotSupportedException();
  }

  /**
   * Not supported.
   *
   * @return the row style
   */
  @Override
  public CellStyle getRowStyle() {
    throw new NotSupportedException();
  }

  /**
   * Not supported.
   *
   * @param style the new row style
   */
  @Override
  public void setRowStyle(CellStyle style) {
    throw new NotSupportedException();
  }

  /**
   * Not supported.
   *
   * @return the outline level
   */
  @Override
  public int getOutlineLevel() {
    throw new NotSupportedException();
  }

  /**
   * Not supported.
   *
   * @param firstShiftColumnIndex the first shift column index
   * @param lastShiftColumnIndex the last shift column index
   * @param step the step
   */
  @Override
  public void shiftCellsRight(int firstShiftColumnIndex, int lastShiftColumnIndex, int step) {
    throw new NotSupportedException();
  }

  /**
   * Not supported.
   *
   * @param firstShiftColumnIndex the first shift column index
   * @param lastShiftColumnIndex the last shift column index
   * @param step the step
   */
  @Override
  public void shiftCellsLeft(int firstShiftColumnIndex, int lastShiftColumnIndex, int step) {
    throw new NotSupportedException();
  }

}
