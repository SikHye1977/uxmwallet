import axios from 'axios';

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

export async function verify_challenge(
  did: string,
  decryptedChallenge: string,
): Promise<boolean> {
  try {
    const url = ` https://verifier.bluerack.org/api/v1/verify/verify-holder-challenge`;

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
