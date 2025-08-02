import * as FileSystem from "expo-file-system";

/**
 * MOCKED STORAGE UTILS
 * All Supabase logic has been removed. This file now uses local mock logic.
 * Replace with real API calls when backend is ready.
 */

export const uploadImageToStorage = async (
  fileUri: string,
  bucketName: string
): Promise<{ path: string; url: string }> => {
  try {
    const fileExtension = fileUri.split(".").pop()?.toLowerCase() || "jpg";
    const finalFileName = `mock_${Date.now()}.${fileExtension}`;
    const mockPath = `${FileSystem.cacheDirectory || ""}${finalFileName}`;

    // Simulate file copy (mock upload)
    await FileSystem.copyAsync({
      from: fileUri,
      to: mockPath,
    });

    // Return mock path and fake public URL
    return {
      path: mockPath,
      url: `https://mock-storage.local/${bucketName}/${finalFileName}`,
    };
  } catch (error) {
    console.error("Error in mock uploadImageToStorage:", {
      error,
      fileUri,
      bucketName,
    });
    throw error;
  }
};

export const uploadMultipleImages = async (
  fileUris: string[],
  bucketName: string
): Promise<{ path: string; url: string }[]> => {
  try {
    const uploadPromises = fileUris.map((fileUri) => {
      return uploadImageToStorage(fileUri, bucketName);
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Error uploading multiple images (mock):", error);
    throw error;
  }
};
