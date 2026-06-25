// Cloudinary — Upload de mídia e fotos de alunos

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

function generateSignature(params: Record<string, string>, timestamp: number): string {
  const crypto = require("crypto");
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const str = `${sorted}&timestamp=${timestamp}${API_SECRET}`;
  return crypto.createHash("sha256").update(str).digest("hex");
}

export async function uploadImage(
  file: Buffer,
  options: {
    folder?: string;
    publicId?: string;
    transformation?: string;
  } = {}
): Promise<{ url: string; publicId: string }> {
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string> = {
    folder: options.folder ?? "gymsaas/students",
    ...(options.publicId ? { public_id: options.publicId } : {}),
    ...(options.transformation ? { transformation: options.transformation } : {}),
  };

  const signature = generateSignature(params, timestamp);

  const formData = new FormData();
  formData.append("file", new Blob([file]));
  formData.append("api_key", API_KEY);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  Object.entries(params).forEach(([k, v]) => formData.append(k, v));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    throw new Error("Erro ao fazer upload para o Cloudinary.");
  }

  const data = (await response.json()) as { secure_url: string; public_id: string };
  return { url: data.secure_url, publicId: data.public_id };
}

export async function deleteImage(publicId: string): Promise<void> {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = generateSignature({ public_id: publicId }, timestamp);

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("api_key", API_KEY);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);

  await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
    method: "POST",
    body: formData,
  });
}
