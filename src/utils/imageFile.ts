/**
 * Returns a React Native compatible file object for FormData.
 * @param uri - The image URI (file://...)
 * @param fileName - The desired file name
 * @param mimeType - The MIME type
 * @returns { uri, name, type }
 */
export function rnFormDataFile(
  uri: string,
  fileName: string,
  mimeType: string = "image/jpeg"
): { uri: string; name: string; type: string } {
  return { uri, name: fileName, type: mimeType };
}
