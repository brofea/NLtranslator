export const HA = "\u54C8"; // 哈

// 8 种零宽字符，每字符编码 3 位二进制
// 均为纯不可见格式字符，不含 bidi 控制符，不改变排版
const TABLE: string[] = [
  "\u200B", // 000
  "\u200C", // 001
  "\u200D", // 010
  "\u2060", // 011
  "\u2061", // 100
  "\u2062", // 101
  "\u2063", // 110
  "\u2064", // 111
];

const REVERSE = new Map<string, number>(TABLE.map((ch, i) => [ch, i]));

export function encodeToNairong(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let result = "";
  for (const byte of bytes) {
    const bits: number[] = [];
    for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
    while (bits.length % 3 !== 0) bits.push(0);
    for (let i = 0; i < bits.length; i += 3) {
      const value = bits[i] * 4 + bits[i + 1] * 2 + bits[i + 2];
      result += HA + TABLE[value];
    }
  }
  return result + HA;
}

export function decodeFromNairong(input: string): string {
  let zwc = "";
  for (const ch of input) {
    if (ch === HA) continue;
    if (REVERSE.has(ch)) {
      zwc += ch;
    } else {
      throw new Error("包含非奶龙语字符，无法解析");
    }
  }
  if (zwc.length === 0) {
    throw new Error("没有可解析的内容");
  }
  if (zwc.length % 3 !== 0) {
    throw new Error("零宽字符数量不是 3 的倍数，内容不完整");
  }
  const bytes = new Uint8Array(zwc.length / 3);
  for (let i = 0; i < bytes.length; i++) {
    let value = 0;
    for (let j = 0; j < 3; j++) {
      value = (value << 3) | (REVERSE.get(zwc[i * 3 + j]) ?? 0);
    }
    bytes[i] = value >> 1;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
