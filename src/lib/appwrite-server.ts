import { Client, Storage, ID } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
const bucketId = process.env.APPWRITE_BUCKET_ID || "";

/**
 * Server-only Appwrite Storage helper
 * Use this inside API routes / Server Actions
 */
export function getServerStorage() {
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  const apiKey = process.env.APPWRITE_API_KEY;
  if (!apiKey) {
    throw new Error("APPWRITE_API_KEY is missing");
  }

  client.setKey(apiKey);
  return new Storage(client);
}

export async function uploadFileToAppwrite(
  file: File | Buffer,
  fileName?: string
) {
  const storage = getServerStorage();
  const id = ID.unique();

  const result = await storage.createFile(
    bucketId,
    id,
    file as any,
    undefined // permissions – bucket permissions will apply
  );

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
