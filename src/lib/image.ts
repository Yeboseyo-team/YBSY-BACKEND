/** 이미지를 가로 1600px 이하 JPEG 로 줄여 base64 로 (AI 서버로 보내는 크기를 줄이려고). 시간표 캡처에 써요 */
export async function toJpegBase64(file: File): Promise<{ media_type: string; data: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL("image/jpeg", 0.85);
  return { media_type: "image/jpeg", data: url.slice(url.indexOf(",") + 1) };
}

/** 시간표 캡처로 받을 수 있는 이미지인지 (이미지 파일, 8MB 이하). 문제가 있으면 안내 문장 */
export function imageFileProblem(file: File): string | null {
  if (!file.type.startsWith("image/")) return "이미지 파일(캡처)만 올릴 수 있어요.";
  if (file.size > 8 * 1024 * 1024) return "8MB 이하 이미지로 올려 주세요.";
  return null;
}
