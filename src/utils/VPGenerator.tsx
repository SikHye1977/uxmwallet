// import * as nacl from 'tweetnacl';
// import base64url from 'base64url';
// import bs58 from 'bs58';
// import {getItem} from './AsyncStorage';

// const canonicalize = require('canonicalize') as (input: any) => string;

// // JSON-LD 문서를 표준화된 순서로 정렬(canonicalize)
// export function canonicalizeJsonLd(input: any): string {
//   return canonicalize(input);
// }

// // VP의 타입을 정의
// interface VerifiablePresentation {
//   '@context': string[];
//   type: string[];
//   verifiableCredential: any[];
//   holder: string;
//   proof?: {
//     type: string;
//     created: string;
//     verificationMethod: string;
//     jws: string;
//   };
// }

// // VP를 Detached JWS 형식으로 서명하는 함수
// export const createVP = async (vc: any) => {
//   const userDid = await getItem('DID');

//   // VP 데이터 구성
//   const vp: VerifiablePresentation = {
//     '@context': ['https://www.w3.org/2018/credentials/v1'],
//     type: ['VerifiablePresentation'],
//     verifiableCredential: [
//       {
//         ...vc.credential,
//         proof: vc.proof, // proof 필드 다시 붙이기
//       },
//     ],
//     // verifiableCredential: [vc],
//     // "holder": "did:sov:4Lq1PHHxh2Pb8aFMQXr7N7", // DID 추가
//     holder: `did:sov:${userDid}`,
//   };

//   // VP를 canonicalize하여 정렬된 JSON-LD 문자열 생성
//   const canonicalizedPayload = canonicalizeJsonLd(vp);

//   // 비밀키 가져오기 (Base58로 인코딩된 비밀키)
//   const ed25519Key = await getItem('edSecretkey'); // 여기에 await 추가

//   // Base58 비밀키를 Uint8Array로 디코딩
//   const privateKey = bs58.decode(ed25519Key);

//   // Detached JWS header 생성
//   const header = {
//     alg: 'EdDSA', // Ed25519 알고리즘
//     b64: false, // Payload를 base64url 인코딩하지 않음f
//     crit: ['b64'], // b64 필드는 필수 항목
//   };

//   // Header를 base64url로 인코딩
//   const encodedHeader = base64url.encode(JSON.stringify(header));

//   // 서명할 입력값 생성 (header.payload 형태)
//   const signingInput = new TextEncoder().encode(
//     `${encodedHeader}.${base64url.encode(canonicalizedPayload)}`,
//   );

//   // Ed25519로 서명 생성
//   const signature = nacl.sign.detached(signingInput, privateKey);

//   // 서명값을 base64url로 인코딩
//   const encodedSignature = base64url.encode(Buffer.from(signature));

//   const did = await getItem('DID');

//   const verificationMethod = `did:sov:${did}#key-1`;
//   // VP의 proof 필드에 서명 추가
//   vp.proof = {
//     type: 'Ed25519Signature2020', // 서명 타입
//     created: new Date().toISOString(),
//     verificationMethod, // DID 공개키를 나타내는 식별자
//     jws: `${encodedHeader}..${encodedSignature}`, // JWS 서명 값
//   };

//   // 서명된 VP 반환
//   return vp;
// };

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
    proofPurpose: string;
    jws: string;
  };
}

// DID 데이터 인터페이스 (ProfileScreen과 일치)
interface DidData {
  did: string;
  edVerkey: string;
  edSecretkey: string;
  xVerkey: string;
  xSecretkey: string;
  alias?: string;
}

// VP를 Detached JWS 형식으로 서명하는 함수
export const createVP = async (vc: any) => {
  try {
    // 1. 현재 선택된 DID 정보(Holder) 가져오기
    // 다중 DID 환경이므로 단순히 'DID' 키가 아니라 'SELECTED_DID'를 확인하거나,
    // 만약 VC의 소유자와 일치하는 DID를 찾아야 한다면 로직을 추가해야 합니다.
    // 여기서는 TicketScreen 등에서 이미 선택된 DID('SELECTED_DID')를 사용한다고 가정합니다.
    const selectedDidJson = await getItem('SELECTED_DID');
    let userDid = '';
    let edSecretKeyStr = '';

    if (selectedDidJson) {
      const didData: DidData = JSON.parse(selectedDidJson);
      userDid = didData.did;
      edSecretKeyStr = didData.edSecretkey;
    } else {
      // 기존 단일 DID 방식에 대한 폴백 (필요 시 유지)
      userDid = (await getItem('DID')) || '';
      edSecretKeyStr = (await getItem('edSecretkey')) || '';
    }

    if (!userDid || !edSecretKeyStr) {
      throw new Error('DID 또는 비밀키를 찾을 수 없습니다.');
    }

    // DID 형식 보정 (이미 did:sov:가 붙어있다면 그대로, 아니면 붙여줌)
    const holderDid = userDid.startsWith('did:')
      ? userDid
      : `did:sov:${userDid}`;

    // 2. VP 데이터 구성
    // 요구사항에 맞춰 @context와 type을 설정하고, VC를 그대로 포함시킵니다.
    const vp: VerifiablePresentation = {
      '@context': [
        'https://www.w3.org/ns/credentials/v2',
        'https://example.org/context/v1/ticket-schema.json', // 예시에 있는 컨텍스트
      ],
      type: ['VerifiablePresentation'],
      verifiableCredential: [vc], // 이미 proof가 포함된 VC 전체를 넣습니다.
      holder: holderDid,
    };

    // 3. 서명을 위해 Proof가 없는 상태의 VP를 정렬(Canonicalize)
    // 서명 생성 시 proof 필드는 제외해야 하므로 복사본 사용
    const vpToSign = {...vp};
    delete vpToSign.proof;

    const canonicalizedPayload = canonicalizeJsonLd(vpToSign);

    // 4. 서명 준비
    // Base58 비밀키를 Uint8Array로 디코딩
    const privateKey = bs58.decode(edSecretKeyStr);

    // Detached JWS header 생성
    const header = {
      alg: 'EdDSA', // Ed25519 알고리즘
      b64: false, // Payload를 base64url 인코딩하지 않음
      crit: ['b64'], // b64 필드는 필수 항목
    };

    // Header를 base64url로 인코딩
    const encodedHeader = base64url.encode(JSON.stringify(header));

    // 서명할 입력값 생성 (header.payload)
    const signingInput = new TextEncoder().encode(
      `${encodedHeader}.${base64url.encode(canonicalizedPayload)}`,
    );

    // 5. Ed25519로 서명 생성
    const signature = nacl.sign.detached(signingInput, privateKey);

    // 서명값을 base64url로 인코딩
    const encodedSignature = base64url.encode(Buffer.from(signature));

    // 6. VP에 Proof 필드 추가
    // Verification Method는 DID Document 내의 Key ID를 가리켜야 합니다. (보통 #key-1 또는 #keys-1)
    // 예시 양식에 맞춰 #key-1로 설정합니다.
    const verificationMethod = `${holderDid}#key-1`;

    vp.proof = {
      type: 'Ed25519Signature2020',
      created: new Date().toISOString(),
      proofPurpose: 'authentication', // VP 제출 목적은 보통 authentication
      verificationMethod,
      jws: `${encodedHeader}..${encodedSignature}`,
    };

    console.log('✅ 생성된 VP:', JSON.stringify(vp, null, 2));

    // 서명된 VP 반환
    return vp;
  } catch (error) {
    console.error('VP 생성 실패:', error);
    throw error;
  }
};
