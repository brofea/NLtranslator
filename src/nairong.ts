export const HA = "\u54C8"; // 哈
const ZW_ZERO = "\u200B"; // 0 位对应的零宽字符
const ZW_ONE = "\u200C"; // 1 位对应的零宽字符

export function encodeToNairong(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let zwc = "";
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i--) {
      zwc += (byte & (1 << i)) === 0 ? ZW_ZERO : ZW_ONE;
    }
  }
  let result = "";
  for (const ch of zwc) {
    result += HA + ch;
  }
  return result + HA;
}

export function decodeFromNairong(input: string): string {
  let zwc = "";
  for (const ch of input) {
    if (ch === HA) continue;
    if (ch === ZW_ZERO || ch === ZW_ONE) {
      zwc += ch;
    } else {
      throw new Error("包含非奶龙语字符，无法解析");
    }
  }
  if (zwc.length === 0) {
    throw new Error("没有可解析的内容");
  }
  if (zwc.length % 8 !== 0) {
    throw new Error("零宽字符数量不是 8 的倍数，内容不完整");
  }
  const bytes = new Uint8Array(zwc.length / 8);
  for (let i = 0; i < bytes.length; i++) {
    let value = 0;
    for (let j = 0; j < 8; j++) {
      value = (value << 1) | (zwc[i * 8 + j] === ZW_ONE ? 1 : 0);
    }
    bytes[i] = value;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
