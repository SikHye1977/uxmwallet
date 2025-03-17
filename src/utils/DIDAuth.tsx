import axios from "axios";
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import * as ed2curve from 'ed2curve';
import { Buffer } from 'buffer';
import { MEDIATOR_URL } from "@env";
import { ISSUER_BACKEND_URL, ISSUER_INNER_PUBLIC_DID } from "@env";
import { serialize } from "v8";

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
export async function get_challenge(did: string) {
  const url = `http://${ISSUER_BACKEND_URL}/indy/api/v1/did-auth/challenge`; // HTTPS 사용
  
  const requestBody = { did };

  try {
    const response = await axios.post(url, requestBody);
    
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

// Challenge 복호화 함수
export function decrypt_challenge(challenge: string, verkey: string, secretkey: string) {
  const encryptedData = bs58.decode(challenge);

  const nonce = encryptedData.slice(0, 24);
  const encrypteChallenge = encryptedData.slice(24);

  const holderEd25519PublicKey = bs58.decode(verkey);
  const holderEd25519PrivateKey = bs58.decode(secretkey);
  const IssuerEd25519PublicKey = bs58.decode(ISSUER_INNER_PUBLIC_DID);

  const holderX25519PublicKey = ed2curve.convertPublicKey(holderEd25519PublicKey);
  const holderX25519PrivateKey = ed2curve.convertSecretKey(holderEd25519PrivateKey);
  const IssuerX25519PublicKey = ed2curve.convertPublicKey(IssuerEd25519PublicKey);

  if(!holderX25519PrivateKey || !IssuerX25519PublicKey){
    throw new Error("Key conversion to X25519 failed");
  }

  const decrpytedchallenge = nacl.box.open(
    encrypteChallenge,
    nonce,
    IssuerX25519PublicKey,
    holderX25519PrivateKey
  );

  if(!decrpytedchallenge) {
    console.warn("Challenge decryption failed");
    return null;
  }

  const originalChallengeBase58 = bs58.encode(decrpytedchallenge);
  console.log(`Decrypted Challenge: ${originalChallengeBase58}`);
  return originalChallengeBase58;
}