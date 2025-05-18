// utils/compressVP.ts
import {gzip} from 'pako';
import {Buffer} from 'buffer';

/**
 * VP 객체에서 '@context'와 'type' 필드를 재귀적으로 제거
 */
function cleanVp(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(cleanVp);
  } else if (obj && typeof obj === 'object') {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      if (key === '@context' || key === 'type') continue;
      newObj[key] = cleanVp(obj[key]);
    }
    return newObj;
  }
  return obj;
}

/**
 * 객체 키를 재귀적으로 정렬
 */
function sortJsonDeep(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortJsonDeep);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((acc: any, key: string) => {
        acc[key] = sortJsonDeep(obj[key]);
        return acc;
      }, {});
  }
  return obj;
}

/**
 * VP를 정제 + 정렬 + gzip 압축 + base64 인코딩
 */
export const compressVP = (vp: any): string => {
  const cleaned = cleanVp(vp); // ✅ @context, type 제거
  const sorted = sortJsonDeep(cleaned); // ✅ 키 정렬
  const jsonStr = JSON.stringify(sorted);
  const originalSize = Buffer.byteLength(jsonStr, 'utf8');

  const compressed = gzip(jsonStr, {level: 9});
  const compressedSize = compressed.length;

  console.log(`📦 압축 전 크기: ${originalSize} bytes`);
  console.log(`📉 압축 후 크기: ${compressedSize} bytes`);
  console.log(
    `🪶 압축률: ${(100 - (compressedSize / originalSize) * 100).toFixed(2)}%`,
  );
  console.log(Buffer.from(compressed).toString('base64'));
  return Buffer.from(compressed).toString('base64');
};
