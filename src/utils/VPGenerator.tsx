import * as nacl from 'tweetnacl';
import base64url from 'base64url';
import bs58 from 'bs58';
import {getItem} from './AsyncStorage';

const canonicalize = require('canonicalize') as (input: any) => string;

// JSON-LD 문서를 표준화된 순서로 정렬(canonicalize)
export function canonicalizeJsonLd(input: any): string {
  return canonicalize(input);
}

// VP의 타입을 정의
interface VerifiablePresentation {
  '@context': string[];
  type: string[];
  verifiableCredential: any[];
  holder: string;
  proof?: {
    type: string;
    created: string;
    verificationMethod: string;
    jws: string;
  };
}

// VP를 Detached JWS 형식으로 서명하는 함수
export const createVP = async (vc: any) => {
  const userDid = await getItem('DID');

  // VP 데이터 구성
  const vp: VerifiablePresentation = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiablePresentation'],
    verifiableCredential: [
      {
        ...vc.credential,
        proof: vc.proof, // proof 필드 다시 붙이기
      },
    ],
    // verifiableCredential: [vc],
    // "holder": "did:sov:4Lq1PHHxh2Pb8aFMQXr7N7", // DID 추가
    holder: `did:sov:${userDid}`,
  };

  // VP를 canonicalize하여 정렬된 JSON-LD 문자열 생성
  const canonicalizedPayload = canonicalizeJsonLd(vp);

  // 비밀키 가져오기 (Base58로 인코딩된 비밀키)
  const ed25519Key = await getItem('edSecretkey'); // 여기에 await 추가

  // Base58 비밀키를 Uint8Array로 디코딩
  const privateKey = bs58.decode(ed25519Key);

  // Detached JWS header 생성
  const header = {
    alg: 'EdDSA', // Ed25519 알고리즘
    b64: false, // Payload를 base64url 인코딩하지 않음f
    crit: ['b64'], // b64 필드는 필수 항목
  };

  // Header를 base64url로 인코딩
  const encodedHeader = base64url.encode(JSON.stringify(header));

  // 서명할 입력값 생성 (header.payload 형태)
  const signingInput = new TextEncoder().encode(
    `${encodedHeader}.${base64url.encode(canonicalizedPayload)}`,
  );

  // Ed25519로 서명 생성
  const signature = nacl.sign.detached(signingInput, privateKey);

  // 서명값을 base64url로 인코딩
  const encodedSignature = base64url.encode(Buffer.from(signature));

  const did = await getItem('DID');

  const verificationMethod = `did:sov:${did}#key-1`;
  // VP의 proof 필드에 서명 추가
  vp.proof = {
    type: 'Ed25519Signature2020', // 서명 타입
    created: new Date().toISOString(),
    verificationMethod, // DID 공개키를 나타내는 식별자
    jws: `${encodedHeader}..${encodedSignature}`, // JWS 서명 값
  };

  // 서명된 VP 반환
  return vp;
};
