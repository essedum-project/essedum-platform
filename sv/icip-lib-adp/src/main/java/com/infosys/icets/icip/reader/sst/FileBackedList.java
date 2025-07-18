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
package com.infosys.icets.icip.reader.sst;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// TODO: Auto-generated Javadoc
/**
 * File-backed list-like class. Allows addition of arbitrary numbers of array
 * entries (serialized to JSON) in a binary packed file. Reading of entries is
 * done with an NIO channel that seeks to the entry in the file.
 * <p>
 * File entry format:
 * <ul>
 * <li>4 bytes: length of entry</li>
 * <li><i>length</i> bytes: JSON string containing the entry data</li>
 * </ul>
 * <p>
 * Pointers to the offset of each entry are kept in a {@code List<Long>}. The
 * values loaded from the the file are cached up to a maximum of
 * {@code cacheSize}. Items are evicted from the cache with an LRU algorithm.
 */
public class FileBackedList implements AutoCloseable {

	/** The pointers. */
	private final List<Long> pointers = new ArrayList<>();
	
	/** The raf. */
	private final RandomAccessFile raf;
	
	/** The channel. */
	private final FileChannel channel;
	
	/** The cache. */
	private final Map<Integer, String> cache;

	/** The filesize. */
	private long filesize;

	/**
	 * Instantiates a new file backed list.
	 *
	 * @param file the file
	 * @param cacheSize the cache size
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public FileBackedList(File file, final int cacheSize) throws IOException {
		this.raf = new RandomAccessFile(file, "rw");
		this.channel = raf.getChannel();
		this.filesize = raf.length();
		this.cache = new LinkedHashMap<Integer, String>(cacheSize, 0.75f, true) {
			public boolean removeEldestEntry(Map.Entry eldest) {
				return size() > cacheSize;
			}
		};
	}

	/**
	 * Adds the.
	 *
	 * @param str the str
	 */
	public void add(String str) {
		try {
			if (str != null && str.length() > 0) {
				writeToFile(str);
			}
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	/**
	 * Gets the at.
	 *
	 * @param index the index
	 * @return the at
	 */
	public String getAt(int index) {
		if (cache.containsKey(index)) {
			return cache.get(index);
		}

		try {
			String val = readFromFile(pointers.get(index));
			cache.put(index, val);
			return val;
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	/**
	 * Write to file.
	 *
	 * @param str the str
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	private void writeToFile(String str) throws IOException {
		synchronized (channel) {
			ByteBuffer bytes = ByteBuffer.wrap(str.getBytes(StandardCharsets.UTF_8));
			ByteBuffer length = ByteBuffer.allocate(4).putInt(bytes.array().length);

			channel.position(filesize);
			pointers.add(channel.position());
			length.flip();
			channel.write(length);
			channel.write(bytes);

			filesize += 4 + bytes.array().length;
		}
	}

	/**
	 * Read from file.
	 *
	 * @param pointer the pointer
	 * @return the string
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	private String readFromFile(long pointer) throws IOException {
		synchronized (channel) {
			FileChannel fc = channel.position(pointer);

			// get length of entry
			ByteBuffer buffer = ByteBuffer.wrap(new byte[4]);
			fc.read(buffer);
			buffer.flip();
			int length = buffer.getInt();

			// read entry
			buffer = ByteBuffer.wrap(new byte[length]);
			fc.read(buffer);
			buffer.flip();

			return new String(buffer.array(), StandardCharsets.UTF_8);
		}
	}

	/**
	 * Close.
	 */
	@Override
	public void close() {
		try {
			raf.close();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}
}
