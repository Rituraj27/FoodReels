import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URLENDPOINT_KEY,
});

const uploadFile = async (
  file,
  fileName,
  mimeType = 'application/octet-stream'
) => {
  try {
    if (!file || !fileName) {
      throw new Error('File and fileName are required');
    }

    // Convert buffer to base64
    const base64File = file.toString('base64');

    if (!base64File) {
      throw new Error('Failed to convert file to base64');
    }

    // Prepare data URI so ImageKit detects the file type
    const dataUri = `data:${mimeType};base64,${base64File}`;

    // Wrap upload in a timeout to prevent hanging requests
    const uploadPromise = imagekit.upload({
      file: dataUri,
      fileName: fileName,
      useUniqueFileName: true,
    });

    const timeoutMs = parseInt(process.env.UPLOAD_TIMEOUT_MS || '60000', 10);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => {
        const toErr = new Error('Upload timed out');
        toErr.code = 'UPLOAD_TIMEOUT';
        reject(toErr);
      }, timeoutMs)
    );

    const result = await Promise.race([uploadPromise, timeoutPromise]);

    if (!result || !result.url) {
      console.error('ImageKit upload returned invalid result:', result);
      throw new Error('ImageKit upload failed: No URL returned');
    }

    console.log('File uploaded successfully:', result.url);
    return {
      success: true,
      url: result.url,
      fileId: result.fileId,
      size: result.size,
      raw: result,
    };
  } catch (error) {
    // Log the full error for debugging (may include network/DNS errors)
    console.error('File upload failed:', error);

    // If it's our timeout error, rethrow with the same code
    if (error && error.code === 'UPLOAD_TIMEOUT') {
      const e = new Error('Upload timed out');
      e.code = 'UPLOAD_TIMEOUT';
      throw e;
    }

    // Network/DNS errors from Node often include ENOTFOUND or getaddrinfo
    if (
      error &&
      (error.code === 'ENOTFOUND' ||
        /getaddrinfo|ENOTFOUND/i.test(error.message))
    ) {
      const e = new Error(
        'Network/DNS error while contacting storage provider: ' +
          (error.message || 'unknown')
      );
      e.code = error.code || 'NETWORK_ERROR';
      throw e;
    }

    // Generic upload failure — keep original message for logs but wrap for clarity
    const e = new Error(
      `File upload failed: ${error.message || 'Unknown error occurred'}`
    );
    e.original = error;
    if (error && error.code) e.code = error.code;
    throw e;
  }
};

export { uploadFile };
