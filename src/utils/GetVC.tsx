import axios from "axios";

export async function get_VC(target_url : string) {
  const url = target_url;
  
  try{
    const response = await axios.get(url);
    console.log("서버 응답:",response.data);
    return response.data;
  } catch(error) {
    console.log("VC 발급 실패:", error);
    return null;
  }
}