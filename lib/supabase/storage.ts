import { supabase } from "../supabase";

export async function uploadFile(file: File, path: string, bucket: string = "gallery") {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteFile(path: string, bucket: string = "gallery") {
  // If path is a full URL, extract the relative path
  const relativePath = path.includes("storage/v1/object/public/") 
    ? path.split(`${bucket}/`)[1] 
    : path;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([relativePath]);

  if (error) throw error;
}

export function validateImageFile(file: File) {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeMB: number = 5) {
  const maxSizeInBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}
