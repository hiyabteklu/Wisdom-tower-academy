import { Client, Storage, ID, InputFile } from "node-appwrite";

const endpoint =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
const bucketId = process.env.APPWRITE_BUCKET_ID || "";

/**
 * Server-only Appwrite Storage helper
 * Uses node-appwrite (supports setKey for API keys)
 */
export function getServerStorage() {
  const apiKey = process.env.APPWRITE_API_KEY;
  if (!apiKey) {
    throw new Error("APPWRITE_API_KEY is missing");
  }
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_APPWRITE_PROJECT_ID is missing");
  }
  if (!bucketId) {
    throw new Error("APPWRITE_BUCKET_ID is missing");
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return new Storage(client);
}

export async function uploadFileToAppwrite(file: File, fileName?: string) {
  const storage = getServerStorage();
  const id = ID.unique();

  const buffer = Buffer.from(await file.arrayBuffer());
  const input = InputFile.fromBuffer(buffer, fileName || file.name || "upload.bin");

  const result = await storage.createFile(bucketId, id, input);

  return {
    fileId: result.$id,
    name: result.name,
    mimeType: result.mimeType,
    size: result.sizeOriginal,
    viewUrl: `${endpoint}/storage/buckets/${bucketId}/files/${result.$id}/view?project=${projectId}`,
    downloadUrl: `${endpoint}/storage/buckets/${bucketId}/files/${result.$id}/download?project=${projectId}`,
  };
}

export { ID, bucketId as APPWRITE_BUCKET_ID };
