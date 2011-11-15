import java.io.BufferedReader;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Formatter;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.TreeMap;

/**
 * Builds the normalization tables. This is a separate class so that it can be
 * unloaded once not needed.<br>
 * Copyright (c) 1991-2005 Unicode, Inc. For terms of use, see
 * http://www.unicode.org/terms_of_use.html For documentation, see UAX#15.<br>
 * 
 * @author Mark Davis
 */
class UnormNormalizerBuilder {
	static final String copyright = "Copyright � 1998-1999 Unicode, Inc.";

	/**
	 * Testing flags
	 */

	private static final boolean DEBUG = false;

	/**
	 * Constants for the data file version to use.
	 */
	static final boolean NEW_VERSION = true;
	private static final String DIR = "C:/Documents and Settings/matsuza/My Documents/eclipseWorkspace/UnicodeNormalizer/";

	public static final String UNICODE_DATA = DIR + "UnicodeData.txt";
	public static final String COMPOSITION_EXCLUSIONS = DIR + "CompositionExclusions.txt";

	/**
	 * Called exactly once by NormalizerData to build the static data
	 */

	static class UChar {
		final int codepoint;
		boolean isCompatibility = false;
		boolean isExcluded = false;
		Integer[] decompose;
		int canonicalClass;
		Map<Integer, Integer> composeTrie = new TreeMap<Integer, Integer>();
		public UChar(int cp) {
			this.codepoint = cp;
		}

		private String toJSON_flag() {
			return Long.toString(canonicalClass | (isCompatibility ? 1 << 8 : 0) | (isExcluded ? 1 << 9 : 0));
		}

		private String toJSON_decomp() {
			StringBuilder sb = new StringBuilder();
			Formatter f = new Formatter(sb);
			/*
			 * sb.append("'"); for (int i = 0; decompose != null && i <
			 * decompose.length; ++i) { String s = cpconv(decompose[i]);
			 * f.format("%s", s); } sb.append("'");
			 */
			sb.append("[");
			for (int i = 0; decompose != null && i < decompose.length; ++i) {
				f.format("%d,", decompose[i]);
			}
			sb.deleteCharAt(sb.length() - 1);
			sb.append("]");

			return sb.toString();
		}
		private String toJSON_comp() {
			StringBuilder sb = new StringBuilder();
			Formatter f = new Formatter(sb);
			sb.append("{");
			for (Iterator<Map.Entry<Integer, Integer>> iterator = composeTrie.entrySet().iterator(); iterator.hasNext();) {
				Map.Entry<Integer, Integer> i = iterator.next();
				f.format("%d:%d,", i.getKey(), i.getValue());
			}
			sb.deleteCharAt(sb.length() - 1);
			sb.append("}");
			return sb.toString();
		}

		public String toJSON() {
			StringBuilder sb = new StringBuilder();
			Formatter f = new Formatter(sb);
			f.format("%d:[", codepoint);

			String flagStr = toJSON_flag();
			String decompStr = toJSON_decomp();
			String compStr = toJSON_comp();
			if (decompose != null) {
				sb.append(decompStr);
			}
			if (flagStr.equals("0") && composeTrie.size() == 0) {
				sb.append("]");
				return sb.toString();
			}
			sb.append(",");
			if (!flagStr.equals("0")) {
				sb.append(flagStr);
			}
			if (composeTrie.size() == 0) {
				f.format("]");
				return sb.toString();
			}
			sb.append(",").append(compStr).append("]");
			return sb.toString();
		}

		static TreeMap<Integer, UChar> cmap = new TreeMap<Integer, UChar>();
		public static UChar getUChar(int cp) {
			UChar ret = cmap.get(cp);
			if (ret == null) {
				ret = new UChar(cp);
				cmap.put(cp, ret);
			}
			return ret;
		}
		public static String toJSONAll() {
			StringBuilder sb = new StringBuilder();
			UChar uc = null;
			sb.append("if(!this.UNorm || !this.UNorm.UChar){throw 'must include unorm.js prior to unormdata.js';} UNorm.UChar.udata={\n");
			Map<Integer, StringBuilder> res = new HashMap<Integer, StringBuilder>();
			for (int i = 0; i < 256; ++i) {
				res.put(i, new StringBuilder());
			}
			for (Iterator<UChar> iterator = cmap.values().iterator(); iterator.hasNext();) {
				uc = iterator.next();
				if (uc.canonicalClass == 0 && !uc.isCompatibility && !uc.isExcluded && uc.decompose == null
						&& uc.composeTrie.size() == 0) {
					// do nothing
				} else {
					res.get((uc.codepoint >> 8) & 0xff).append(uc.toJSON()).append(",");
				}
			}
			for (int i = 0; i < 256; ++i) {
				StringBuilder sbout = (StringBuilder) res.get(i);
				if (sbout.length() == 0) {
					continue;
				}
				sbout.deleteCharAt(sbout.length() - 1);
				sb.append(i << 8).append(":\"{").append(sbout).append("}\",\n");
			}
			sb.delete(sb.length() - 2, sb.length() - 1);
			sb.append("\n};");
			/*
			 * 
			 * 
			 * 
			 * for (Iterator<UChar> iterator = cmap.values().iterator();
			 * iterator.hasNext();) { uc = iterator.next(); if
			 * (uc.canonicalClass == 0 && !uc.isCompatibility && !uc.isExcluded &&
			 * uc.decompose == null && uc.composeTrie.size() == 0) { } else {
			 * unitsb.append(uc.toJSON()).append(","); ++cnt; } if (cnt ==
			 * cntUnit) { cnt = 0; unitsb.deleteCharAt(unitsb.length() - 1);
			 * sb.append(uc.codepoint).append(":\"{").append(unitsb).append("}\",\n");
			 * unitsb = new StringBuilder(); } }
			 * unitsb.deleteCharAt(unitsb.length() - 1);
			 * sb.append(uc.codepoint).append(":\"{").append(unitsb).append("}\"");
			 * sb.append("\n};");
			 */
			return sb.toString();
		}
	}

	private static void write(Writer w) throws IOException {
		w.append(UChar.toJSONAll());
	}

	public static void main(String[] args) {
		try {
			readExclusionList();
			buildDecompositionTables();
			OutputStreamWriter w = new OutputStreamWriter(new FileOutputStream("unormdata.js"), "utf-8");
			write(w);
			w.close();
		} catch (java.io.IOException e) {
			System.err.println("Can't load data file." + e + ", " + e.getMessage());
		}
	}

	// =============================================================
	// Building Decomposition Tables
	// =============================================================

	/**
	 * Reads exclusion list and stores the data
	 */
	private static void readExclusionList() throws java.io.IOException {
		if (DEBUG)
			System.out.println("Reading Exclusions");
		BufferedReader in = new BufferedReader(new FileReader(COMPOSITION_EXCLUSIONS), 5 * 1024);
		while (true) {

			// read a line, discarding comments and blank lines

			String line = in.readLine();
			if (line == null)
				break;
			int comment = line.indexOf('#'); // strip comments
			if (comment != -1)
				line = line.substring(0, comment);
			if (line.length() == 0)
				continue; // ignore blanks

			// store -1 in the excluded table for each character hit

			int value = Integer.parseInt(line.split("[^\\da-fA-F]")[0], 16);
			UChar.getUChar(value).isExcluded = true;
			System.out.println("Excluding " + hex(value));
		}
		in.close();
		if (DEBUG)
			System.out.println("Done reading Exclusions");

		// workaround
		UChar.getUChar(0x0F81).isExcluded = true;
		UChar.getUChar(0x0F73).isExcluded = true;
		UChar.getUChar(0x0F75).isExcluded = true;
	}

	/**
	 * Builds a decomposition table from a UnicodeData file
	 */
	private static void buildDecompositionTables() throws java.io.IOException {
		if (DEBUG)
			System.out.println("Reading Unicode Character Database");
		BufferedReader in = new BufferedReader(new FileReader(UNICODE_DATA), 64 * 1024);
		int value;
		int counter = 0;
		while (true) {

			// read a line, discarding comments and blank lines

			String line = in.readLine();
			if (line == null)
				break;
			int comment = line.indexOf('#'); // strip comments
			if (comment != -1)
				line = line.substring(0, comment);
			if (line.length() == 0)
				continue;
			if (DEBUG) {
				counter++;
				if ((counter & 0xFF) == 0)
					System.out.println("At: " + line);
			}

			// find the values of the particular fields that we need
			// Sample line: 00C0;LATIN ...A GRAVE;Lu;0;L;0041 0300;;;;N;LATIN
			// ... GRAVE;;;00E0;

			int start = 0;
			int end = line.indexOf(';'); // code
			value = Integer.parseInt(line.substring(start, end), 16);
			UChar uchar = UChar.getUChar(value);
			if (true && value == '\u00c0') {
				System.out.println("debug: " + line);
			}
			end = line.indexOf(';', start = end + 1); // name
			end = line.indexOf(';', start = end + 1); // general category
			end = line.indexOf(';', start = end + 1); // canonical class

			// check consistency: canonical classes must be from 0 to 255

			int cc = Integer.parseInt(line.substring(start, end));
			if (cc != (cc & 0xFF))
				System.err.println("Bad canonical class at: " + line);

			// canonicalClass.put(value, cc);
			uchar.canonicalClass = cc;
			end = line.indexOf(';', start = end + 1); // BIDI
			end = line.indexOf(';', start = end + 1); // decomp

			// decomp requires more processing.
			// store whether it is canonical or compatibility.
			// store the decomp in one table, and the reverse mapping (from
			// pairs) in another

			if (start != end) {
				String segment = line.substring(start, end);
				boolean compat = segment.charAt(0) == '<';
				if (compat) {
					// isCompatibility.set(value);
					uchar.isCompatibility = true;
				}
				Integer[] decomp = fromHex(segment);

				// check consistency: all canon decomps must be singles or
				// pairs!

				if (decomp.length < 1 || decomp.length > 2 && !compat) {
					System.err.println("Bad decomp at: " + line);
				}
				// decompose.put(value, decomp);
				uchar.decompose = decomp;

				// only compositions are canonical pairs
				// skip if script exclusion

				if (!compat && !uchar.isExcluded && decomp.length != 1) {
					// <decomp>とかの表記がない && 除外指定されていない && singletonでない
					UChar.getUChar(decomp[0]).composeTrie.put(decomp[1], value);
				} else if (DEBUG) {
					System.out.println("Excluding: " + decomp);
				}
			}
		}
		in.close();
		if (DEBUG)
			System.out.println("Done reading Unicode Character Database");

		// add algorithmic Hangul decompositions
		// this is more compact if done at runtime, but for simplicity we
		// do it this way.
		/*
		 * if (DEBUG) System.out.println("Adding Hangul");
		 * 
		 * for (int SIndex = 0; SIndex < SCount; ++SIndex) { int TIndex = SIndex %
		 * TCount; int first, second; if (TIndex != 0) { // triple first =
		 * (SBase + SIndex - TIndex); second = (TBase + TIndex); } else { first =
		 * (LBase + SIndex / NCount); second = (VBase + (SIndex % NCount) /
		 * TCount); } value = SIndex + SBase;
		 * 
		 * UChar uchar = UChar.getUChar(value); uchar.decompose = new
		 * Integer[]{first, second};
		 * UChar.getUChar(first).composeTrie.put(second, value); } if (DEBUG)
		 * System.out.println("Done adding Hangul");
		 */
	}

	/**
	 * Hangul composition constants
	 */
	static final int SBase = 0xAC00, LBase = 0x1100, VBase = 0x1161, TBase = 0x11A7, LCount = 19, VCount = 21, TCount = 28,
			NCount = VCount * TCount, // 588
			SCount = LCount * NCount; // 11172

	/**
	 * Utility: Parses a sequence of hex Unicode characters separated by spaces
	 */
	static public Integer[] fromHex(String source) {
		ArrayList<Integer> result = new ArrayList<Integer>();
		for (int i = 0; i < source.length(); ++i) {
			char c = source.charAt(i);
			switch (c) {
				case ' ' :
					break; // ignore
				case '0' :
				case '1' :
				case '2' :
				case '3' :
				case '4' :
				case '5' :
				case '6' :
				case '7' :
				case '8' :
				case '9' :
				case 'A' :
				case 'B' :
				case 'C' :
				case 'D' :
				case 'E' :
				case 'F' :
				case 'a' :
				case 'b' :
				case 'c' :
				case 'd' :
				case 'e' :
				case 'f' :
					String num = source.substring(i).split("[^\\dA-Fa-f]")[0];
					result.add(Integer.parseInt(num, 16));
					i += num.length() - 1; // skip rest of number
					break;
				case '<' :
					int j = source.indexOf('>', i); // skip <...>
					if (j > 0) {
						i = j;
						break;
					} // else fall through--error
				default :
					throw new IllegalArgumentException("Bad hex value in " + source);
			}
		}
		return result.toArray(new Integer[result.size()]);
	}

	/**
	 * Utility: Supplies a zero-padded hex representation of an integer (without
	 * 0x)
	 */
	static public String hex(int i) {
		String result = Long.toString(i & 0xFFFFFFFFL, 16).toUpperCase();
		return "00000000".substring(result.length(), 8) + result;
	}

	/**
	 * Utility: Supplies a zero-padded hex representation of a Unicode character
	 * (without 0x, \\u)
	 */
	public static String hex(String s, String sep) {
		StringBuffer result = new StringBuffer();
		for (int i = 0; i < s.length(); ++i) {
			if (i != 0)
				result.append(sep);
			result.append(hex(s.charAt(i)));
		}
		return result.toString();
	}
}