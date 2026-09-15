import { Client, Storage, ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

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
  const name = fileName || file.name || "upload.bin";

  const buffer = Buffer.from(await file.arrayBuffer());
  const input = InputFile.fromBuffer(buffer, name);

  // Support both older positional API and newer object API
  let result: {
    $id: string;
    name: string;
    mimeType: string;
    sizeOriginal: number;
  };

  try {
    result = await (storage as any).createFile({
      bucketId,
      fileId: id,
      file: input,
    });
  } catch {
    result = await (storage as any).createFile(bucketId, id, input);
  }

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
