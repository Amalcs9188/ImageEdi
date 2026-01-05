export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/png;base64,") to get raw base64 if needed,
        // but for displaying we need the full string.
        // The Gemini API often expects just the base64 data part, so we'll store the full URL
        // and strip it when sending to API.
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const stripBase64Prefix = (base64Str: string): string => {
  return base64Str.replace(/^data:image\/\w+;base64,/, '');
};

export const getMimeTypeFromBase64 = (base64Str: string): string => {
  const match = base64Str.match(/^data:(image\/\w+);base64,/);
  return match ? match[1] : 'image/png';
};
