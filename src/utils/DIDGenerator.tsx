import nacl, { verify } from 'tweetnacl';
import bs58 from 'bs58';
import { PoolCreate, NymRequest, NymRequestOptions, GetNymRequest } from '@hyperledger/indy-vdr-react-native';
import 'fast-text-encoding';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import { DID_PRIVATEKEY_FOR_REGISTER } from '@env';
import 'react-native-get-random-values'

// 25.02.10 추가
// ED25519 키 쌍 생성 및 DID 생성
export async function generateDID() {
  // ✅ ED25519 키 쌍 생성 (32바이트)
  const keyPair = nacl.sign.keyPair();

  // ✅ Base58 인코딩 (DID는 16바이트 또는 32바이트 키를 사용해야 함)
  const publicKeyBase58 = bs58.encode(keyPair.publicKey); // 44~45자
  const privateKeyBase58 = bs58.encode(keyPair.secretKey);

  // ✅ DID 생성 (첫 22~23자 사용하여 Indy 규격 충족)
  const did = publicKeyBase58.slice(0, 22); // 22~23자 유지

  console.log("✅ 생성된 DID:", did);
  console.log("✅ Public Key (Base58):", publicKeyBase58);
  console.log("✅ Private Key (Base58):", privateKeyBase58);

  return {
    did,
    publicKey: publicKeyBase58,
    privateKey: privateKeyBase58,
  };
}

// 환경변수 unit8array로 디코딩 하기 위한 함수
function decodeBase64ToUint8Array(base64String: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64String, "base64"));
}

export async function registerDID(subDid: string, targetDid: string, publicKey: string) {
  console.log(DID_PRIVATEKEY_FOR_REGISTER);
  const pool = await setupIndyPool();
  try {
    // ✅ DID에서 "did:indy:" 접두사를 제거해야 함
    const submitterDid = subDid;
    const dest = targetDid.replace(/^did:indy:/, '');
    const verkey = publicKey;
    const alias = "Holder_test_did_indy_vdr";
    const role: "ENDORSER" = "ENDORSER";  // ✅ 역할을 정확한 타입으로 설정

    // ✅ Indy 원장이 요구하는 JSON 형식으로 NYM 트랜잭션 생성
    const nymTransaction = {
      submitterDid,  // ✅ 트랜잭션을 제출하는 기존 DID (TRUST_ANCHOR 권한 필요)
      dest,  // ✅ 새로 등록할 DID
      verkey,  // ✅ 해당 DID의 Public Key (Base58)
      // alias,  // ✅ (선택 사항) DID의 별칭
      // role,  // ✅ 역할을 "ENDORSER"로 설정
      version: 1,  // ✅ 필수 프로토콜 버전 추가
    };

    console.log("✅ NYM 트랜잭션 JSON:", JSON.stringify(nymTransaction, null, 2));

    // ✅ NymRequest 객체 생성
    const nymRequest = new NymRequest(nymTransaction);

    console.log("✅ NYM Request 생성 완료:", nymRequest);

    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(
      nymRequest.signatureInput,
    );

    // const decoded_key = decodeBase64ToUint8Array(DID_PRIVATEKEY_FOR_REGISTER);
    const decoded_key = decodeBase64ToUint8Array(DID_PRIVATEKEY_FOR_REGISTER);
    const privateKey64 = new Uint8Array(decoded_key);
    const signature = nacl.sign.detached(messageBytes, privateKey64);
    nymRequest.setSignature({ signature });
    if(!pool){
      console.log("there are no Pool");
    }else{
      // ✅ Indy Ledger에 트랜잭션 제출
      const response = await pool.submitRequest(nymRequest);
      console.log("✅ DID 등록 완료:", response);
      pool.close();
      return response;
    }
  } catch (error) {
    console.error("❌ DID 등록 실패:", error);
    return null;
  }
}

// create pool for register did
export async function setupIndyPool(): Promise<PoolCreate | null> {
  const genesisFilePath = `/Users/hanseunghun/2025-w/uxmwallet/src/misc/genesis.txn`;

  const genesisData = await RNFS.readFile(genesisFilePath, 'utf8');

  const pool = new PoolCreate({
    parameters: {
      transactions : genesisData
    }
  });
  return pool;
}