import axios from "axios";
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import * as ed2curve from 'ed2curve';
import { Buffer } from 'buffer';
import { ISSUER_INNER_PRIVATE_X25519_KEY, MEDIATOR_URL } from "@env";
import { getItem } from '../utils/AsyncStorage';
import { ISSUER_BACKEND_URL, ISSUER_INNER_PUBLIC_X25519_KEY } from "@env";

// 25.03.05 Mediator에 토큰 등록
export async function regist_token(did: string, token: string) {
  const url = `https://${MEDIATOR_URL}/message/regist-token`;

  const requestBody = {
    DID: did,
    token: token
  };

  try {
    const response = await axios.post(url, requestBody);
    console.log("서버 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error("DID 인증 실패:", error);
    return null; // 오류가 발생했을 때 null 반환
  }
}

// Issuer-Back으로부터 Challenge를 전달받기 위한 함수
export async function get_challenge(authRequestId: string,did: string, deviceToken: string) {
  console.log(ISSUER_BACKEND_URL);
  const url = `https://${ISSUER_BACKEND_URL}/indy/api/v1/did-auth/challenge`; // HTTPS 사용
  
  const requestBody = { authRequestId, did, deviceToken };

  try {
    const response = await axios.post(url, requestBody);
    console.log(deviceToken);
    console.log("서버 응답:", response.data);
    return response.data.challenge;
  } catch (error: any) {
    if (error.response) {
      console.error("서버 오류:", error.response.data);
    } else if (error.request) {
      console.error("요청이 전송되지 않음 (네트워크 오류 가능):", error.request);
    } else {
      console.error("Challenge 생성 중 알 수 없는 오류 발생:", error.message);
    }
    return null;
  }
}

// 25.03.19
// Challenge 복호화 함수
export async function decrypt_challenge(encryptedChallengeBase58: string) {
  try {
    console.log(`🔑 [Wallet] Received Encrypted Challenge: ${encryptedChallengeBase58}`);

    // 1️⃣ Holder의 X25519 Private Key 가져오기
    let holderxprivatekeyBase58 = await getItem('xSecretkey');
    if (!holderxprivatekeyBase58) {
      throw new Error('❌ Holder X25519 Private Key not found!');
    }
    let holderxprivatekey = bs58.decode(holderxprivatekeyBase58);

    if (holderxprivatekey.length !== 32) {
      throw new Error(`❌ Invalid Holder X25519 Private Key Length: ${holderxprivatekey.length}`);
    }
    console.log(`✅ Holder X25519 Private Key (Decoded): ${holderxprivatekey}`);

    // 2️⃣ Issuer의 X25519 Public Key 가져오기
    const issuerX25519PublicKeyBase58 = ISSUER_INNER_PUBLIC_X25519_KEY;
    if (!issuerX25519PublicKeyBase58) {
      throw new Error('❌ Issuer X25519 Public Key not found!');
    }
    const issuerX25519PublicKey = bs58.decode(issuerX25519PublicKeyBase58);
    if (issuerX25519PublicKey.length !== 32) {
      throw new Error(`❌ Invalid Issuer X25519 Public Key Length: ${issuerX25519PublicKey.length}`);
    }
    console.log(`📢 Issuer X25519 Public Key (Decoded): ${issuerX25519PublicKey}`);

    // 3️⃣ Base58 디코딩 (Nonce + CipherText)
    const combinedData = bs58.decode(encryptedChallengeBase58);
    if (combinedData.length < 24) {
      throw new Error('❌ Invalid Encrypted Challenge Data (Too Short)');
    }

    // 4️⃣ Nonce (24바이트) + 암호화된 Challenge 분리
    const nonce = combinedData.slice(0, 24);
    const encryptedChallenge = combinedData.slice(24);
    console.log(`📢 Extracted Nonce (Base58): ${bs58.encode(nonce)}`);
    console.log(`📩 Extracted Encrypted Challenge (Base58): ${bs58.encode(encryptedChallenge)}`);

    // 5️⃣ Challenge 복호화 (NaCl `box.open`)
    const decryptedChallenge = nacl.box.open(
      encryptedChallenge,
      nonce,
      issuerX25519PublicKey,
      holderxprivatekey
    );

    if (!decryptedChallenge) {
      console.error('❌ Challenge 복호화 실패!');
      return null;
    }

    // 6️⃣ Base58로 Challenge 인코딩 후 반환
    const decryptedChallengeBase58 = bs58.encode(decryptedChallenge);
    console.log(`✅ [Wallet] Decrypted Challenge (Base58): ${decryptedChallengeBase58}`);

    return decryptedChallengeBase58;
  } catch (error) {
    console.error('❌ Challenge 복호화 중 오류 발생:', error);
    return null;
  }
}

// 25.03.19
// challenge 검증
// 25.03.27
// authRequestId 파라미터 추가
export async function verify_challenge(authRequestId:string, did: string, decryptedChallenge: string): Promise<boolean> {
  try {
    const url = `https://${ISSUER_BACKEND_URL}/indy/api/v1/did-auth/verify`;

    const requestBody = { authRequestId ,did, decryptedChallenge };

    console.log(`🔎 [Wallet] Sending challenge verification request:`, requestBody);

    const response = await axios.post(url, requestBody);

    if (response.status === 201) {
      console.log(`✅ [Wallet] DID Authentication successful for ${did}`);
      return true;
    } else {
      console.warn(`❌ [Wallet] DID Authentication failed for ${did}`);
      return false;
    }
  } catch (error: any) {
    if (error.response) {
      console.error("🔴 서버 오류:", error.response.data);
    } else if (error.request) {
      console.error("🟡 요청이 전송되지 않음 (네트워크 오류 가능):", error.request);
    } else {
      console.error("🔵 Challenge 검증 중 알 수 없는 오류 발생:", error.message);
    }
    return false;
  }
}


