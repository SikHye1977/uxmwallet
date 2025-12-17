import axios from 'axios';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import {VERIFIER_X25519_PUBLIC_KEY} from '@env';

export async function get_request_object(
  ticektNumber: string,
  primaryPurchaserDid: string,
  holderDid: string,
) {
  const url = 'https://verifier.bluerack.org/api/v1/verify/request-object';

  const requestBody = {
    ticketNumber: ticektNumber,
    primaryPurchaserDid: primaryPurchaserDid,
    holderDid: holderDid,
  };

  try {
    const response = await axios.post(url, requestBody);
    console.log('서버 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('request object 반환 실패:', error);
    return null;
  }
}

export async function post_vp(vp: any) {
  const url = 'https://verifier.bluerack.org/api/v1/verify/presentation';

  const requestBody = {
    vp_format: 'ldp_vp',
    vp: vp,
  };

  try {
    const response = await axios.post(url, requestBody);
    console.log('vp 검증 결과:', response.data);
    return response.data;
  } catch (error) {
    console.error('vp 검증 실패:', error);
    return null;
  }
}

// issuer_x25519_public_key 쓰던 부분을 verifier로 전체 수정해야함
export async function decrypt_challenge(
  encryptedChallengeBase58: string,
  holderXSecretKey: string, // <--- 1️⃣ 비밀키를 외부에서 받도록 추가
) {
  try {
    console.log(
      `🔑 [Wallet] Received Encrypted Challenge: ${encryptedChallengeBase58}`,
    );

    // ❌ 삭제 또는 주석 처리 (AsyncStorage에서 가져오는 부분)
    // let holderxprivatekeyBase58 = await getItem('xSecretkey');

    // ✅ 변경: 전달받은 파라미터 사용
    let holderxprivatekeyBase58 = holderXSecretKey;

    if (!holderxprivatekeyBase58) {
      throw new Error('❌ Holder X25519 Private Key not provided!');
    }
    let holderxprivatekey = bs58.decode(holderxprivatekeyBase58);
    // 2️⃣ Issuer의 X25519 Public Key 가져오기
    const issuerX25519PublicKeyBase58 = VERIFIER_X25519_PUBLIC_KEY;
    if (!issuerX25519PublicKeyBase58) {
      throw new Error('❌ Issuer X25519 Public Key not found!');
    }
    const issuerX25519PublicKey = bs58.decode(issuerX25519PublicKeyBase58);
    if (issuerX25519PublicKey.length !== 32) {
      throw new Error(
        `❌ Invalid Issuer X25519 Public Key Length: ${issuerX25519PublicKey.length}`,
      );
    }
    console.log(
      `📢 Issuer X25519 Public Key (Decoded): ${issuerX25519PublicKey}`,
    );

    // 3️⃣ Base58 디코딩 (Nonce + CipherText)
    const combinedData = bs58.decode(encryptedChallengeBase58);
    if (combinedData.length < 24) {
      throw new Error('❌ Invalid Encrypted Challenge Data (Too Short)');
    }

    // 4️⃣ Nonce (24바이트) + 암호화된 Challenge 분리
    const nonce = combinedData.slice(0, 24);
    const encryptedChallenge = combinedData.slice(24);
    console.log(`📢 Extracted Nonce (Base58): ${bs58.encode(nonce)}`);
    console.log(
      `📩 Extracted Encrypted Challenge (Base58): ${bs58.encode(
        encryptedChallenge,
      )}`,
    );

    // 5️⃣ Challenge 복호화 (NaCl `box.open`)
    const decryptedChallenge = nacl.box.open(
      encryptedChallenge,
      nonce,
      issuerX25519PublicKey,
      holderxprivatekey,
    );

    if (!decryptedChallenge) {
      console.error('❌ Challenge 복호화 실패!');
      return null;
    }

    // 6️⃣ Base58로 Challenge 인코딩 후 반환
    const decryptedChallengeBase58 = bs58.encode(decryptedChallenge);
    console.log(
      `✅ [Wallet] Decrypted Challenge (Base58): ${decryptedChallengeBase58}`,
    );

    return decryptedChallengeBase58;
  } catch (error) {
    console.error('❌ Challenge 복호화 중 오류 발생:', error);
    return null;
  }
}

export async function verify_challenge(
  did: string,
  decryptedChallenge: string,
): Promise<boolean> {
  try {
    const url = `https://verifier.bluerack.org/api/v1/verify/verify-holder-challenge`;

    const requestBody = {
      decrypted_challenge: decryptedChallenge,
      holder_did: did,
    };

    console.log(
      `🔎 [Wallet] Sending challenge verification request:`,
      requestBody,
    );

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
      console.error('🔴 서버 오류:', error.response.data);
    } else if (error.request) {
      console.error(
        '🟡 요청이 전송되지 않음 (네트워크 오류 가능):',
        error.request,
      );
    } else {
      console.error(
        '🔵 Challenge 검증 중 알 수 없는 오류 발생:',
        error.message,
      );
    }
    return false;
  }
}
