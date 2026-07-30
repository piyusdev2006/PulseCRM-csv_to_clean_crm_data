import type { ImportResult } from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Upload a CSV file to the backend for AI-powered processing.
 * Uses a 5-minute timeout to accommodate AI processing time.
 */
export async function uploadCSV(
  file: File,
  onProgress?: (percent: number) => void
): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 30); // Upload is 0-30%
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result: ImportResult = JSON.parse(xhr.responseText);
          onProgress?.(100);
          resolve(result);
        } catch {
          reject(new Error('Invalid response from server. Please try again.'));
        }
      } else if (xhr.status === 413) {
        reject(new Error('File is too large. Please upload a smaller CSV file.'));
      } else if (xhr.status === 415) {
        reject(new Error('Invalid file type. Please upload a .csv file.'));
      } else if (xhr.status === 422) {
        try {
          const errorBody = JSON.parse(xhr.responseText);
          reject(new Error(errorBody.error || 'The CSV file could not be processed.'));
        } catch {
          reject(new Error('The CSV file could not be processed. Please check the format.'));
        }
      } else if (xhr.status >= 500) {
        reject(new Error('Server error. Please try again later.'));
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}. Please try again.`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(
        new Error(
          'Network error. Please check your connection and ensure the backend server is running.'
        )
      );
    });

    xhr.addEventListener('timeout', () => {
      reject(
        new Error(
          'Request timed out. The file may be too large or the server is busy. Please try again.'
        )
      );
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled.'));
    });

    xhr.open('POST', `${API_BASE_URL}/api/import`);
    xhr.timeout = 5 * 60 * 1000; // 5 minutes
    xhr.send(formData);
  });
}
