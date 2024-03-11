const UINT_8_MAX = 255;
const UINT_16_MAX = 65535;
const UINT_32_MAX = 4294967295;

export function getTypedArray(maxIndex: number) {
  if (maxIndex <= UINT_8_MAX) {
    return new Uint8Array(maxIndex);
  }
  if (maxIndex <= UINT_16_MAX) {
    return new Uint16Array(maxIndex);
  }
  if (maxIndex <= UINT_32_MAX) {
    return new Uint32Array(maxIndex);
  }
  throw new Error(`maxIndex of ${maxIndex} > ${UINT_32_MAX}`);
}
