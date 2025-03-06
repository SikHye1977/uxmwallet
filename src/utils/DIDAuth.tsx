import axios from "axios";
import { MEDIATOR_URL } from "@env";

export async function DidAuth(did: string, token: string) {
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
