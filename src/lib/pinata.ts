import axios from 'axios';

// Pinata API endpoints
const PINATA_API_URL = 'https://api.pinata.cloud';
const PIN_FILE_ENDPOINT = `${PINATA_API_URL}/pinning/pinFileToIPFS`;
const PIN_JSON_ENDPOINT = `${PINATA_API_URL}/pinning/pinJSONToIPFS`;

// In Vite, environment variables are exposed through import.meta.env instead of process.env
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET || '';

/**
 * Upload a file to IPFS via Pinata
 * @param file The file to upload
 * @param metadata Optional metadata for the file
 * @returns The IPFS hash (CID) of the uploaded file
 */
export async function uploadFileToPinata(file: File, metadata?: Record<string, any>): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Add metadata if provided
    if (metadata) {
      formData.append('pinataMetadata', JSON.stringify({
        name: metadata.name || file.name,
        keyvalues: metadata
      }));
    }

    // Add options for pinning
    formData.append('pinataOptions', JSON.stringify({
      cidVersion: 0
    }));

    const response = await axios.post(PIN_FILE_ENDPOINT, formData, {
      headers: {
        'Content-Type': `multipart/form-data;`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET
      }
    });

    if (response.status === 200) {
      return response.data.IpfsHash;
    } else {
      throw new Error(`Failed to upload file to Pinata: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}

/**
 * Upload JSON data to IPFS via Pinata
 * @param jsonData The JSON data to upload
 * @param name Optional name for the JSON file
 * @returns The IPFS hash (CID) of the uploaded JSON
 */
export async function uploadJsonToPinata(jsonData: Record<string, any>, name?: string): Promise<string> {
  try {
    const data = {
      pinataContent: jsonData,
      pinataMetadata: {
        name: name || 'project-metadata.json'
      },
      pinataOptions: {
        cidVersion: 0
      }
    };

    const response = await axios.post(PIN_JSON_ENDPOINT, data, {
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET
      }
    });

    if (response.status === 200) {
      return response.data.IpfsHash;
    } else {
      throw new Error(`Failed to upload JSON to Pinata: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    throw error;
  }
}

/**
 * Get the IPFS gateway URL for a given CID
 * @param cid The IPFS CID (hash)
 * @returns The gateway URL
 */
export function getIpfsGatewayUrl(cid: string): string {
  // Using Pinata's dedicated gateway
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

/**
 * Get the IPFS URL for a given CID
 * @param cid The IPFS CID (hash)
 * @returns The IPFS URL
 */
export function getIpfsUrl(cid: string): string {
  return `ipfs://${cid}`;
}
