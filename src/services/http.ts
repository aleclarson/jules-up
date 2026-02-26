import { fetch } from "@tauri-apps/plugin-http";

export async function fetchWithLogging(url: string, options?: RequestInit): Promise<Response> {
  const method = options?.method || 'GET';

  console.log(`=== HTTP Request ===`);
  console.log(`URL: ${url}`);
  console.log(`Method: ${method}`);
  if (options?.body) {
    try {
      // Try to parse if it's a JSON string for better readability
      if (typeof options.body === 'string') {
        const parsed = JSON.parse(options.body);
        console.log(`Body:`, parsed);
      } else {
        console.log(`Body:`, options.body);
      }
    } catch {
      console.log(`Body:`, options.body);
    }
  }

  const response = await fetch(url, options);

  console.log(`=== HTTP Response ===`);
  console.log(`URL: ${url}`);
  console.log(`Status: ${response.status} ${response.statusText}`);

  try {
    const clone = response.clone();
    const text = await clone.text();
    try {
        const parsed = JSON.parse(text);
        console.log(`Body:`, parsed);
    } catch {
        console.log(`Body:`, text);
    }
  } catch (e) {
    console.error(`Failed to read response body:`, e);
  }
  console.log(`=====================`);

  return response;
}
