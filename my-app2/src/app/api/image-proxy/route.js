import { NextResponse } from "next/server";
import { storage } from "@/app/firebase/config";
import { ref, getDownloadURL } from "firebase/storage";

export async function GET(request) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  // Common headers for all responses
  const commonHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // Parse the request URL
    let parsedUrl;
    try {
      parsedUrl = new URL(request.url);
      console.log(`[${requestId}] Parsed URL:`, {
        full: request.url,
        pathname: parsedUrl.pathname,
        search: parsedUrl.search,
        host: parsedUrl.host,
        protocol: parsedUrl.protocol,
      });
    } catch (urlError) {
      console.error(`[${requestId}] Invalid request URL:`, {
        error: urlError.message,
        url: request.url,
        stack: urlError.stack,
      });
      return new NextResponse(
        JSON.stringify({
          error: "Invalid request URL",
          details: { message: urlError.message, url: request.url },
        }),
        {
          status: 400,
          headers: { ...commonHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const imageUrl = parsedUrl.searchParams.get("url");
    const storagePath = parsedUrl.searchParams.get("path");

    if (!imageUrl && !storagePath) {
      console.error(`[${requestId}] Missing URL and path parameters`);
      return new NextResponse(
        JSON.stringify({
          error: "Missing URL and path parameters",
          details: { requestUrl: request.url },
        }),
        {
          status: 400,
          headers: { ...commonHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let finalImageUrl = imageUrl;

    // If we have a storage path, get a fresh URL
    if (storagePath) {
      try {
        console.log(`[${requestId}] Getting fresh URL for path:`, storagePath);
        const storageRef = ref(storage, storagePath);
        finalImageUrl = await getDownloadURL(storageRef);
        console.log(`[${requestId}] Got fresh URL:`, {
          path: storagePath,
          url: finalImageUrl,
        });
      } catch (storageError) {
        console.error(`[${requestId}] Storage path error:`, {
          error: storageError.message,
          path: storagePath,
          code: storageError.code,
        });
        return new NextResponse(
          JSON.stringify({
            error: "Storage path error",
            details: {
              message: storageError.message,
              path: storagePath,
              code: storageError.code,
            },
          }),
          {
            status: 500,
            headers: { ...commonHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Decode and validate the URL
    let decodedUrl;
    try {
      decodedUrl = decodeURIComponent(finalImageUrl);
      console.log(`[${requestId}] Decoded URL:`, {
        original: finalImageUrl,
        decoded: decodedUrl,
      });

      // Parse the decoded URL to validate and extract components
      const parsedImageUrl = new URL(decodedUrl);
      console.log(`[${requestId}] Parsed image URL components:`, {
        protocol: parsedImageUrl.protocol,
        host: parsedImageUrl.host,
        pathname: parsedImageUrl.pathname,
        search: parsedImageUrl.search,
        hash: parsedImageUrl.hash,
      });
    } catch (urlError) {
      console.error(`[${requestId}] Invalid image URL format:`, {
        error: urlError.message,
        originalUrl: finalImageUrl,
        decodedUrl: decodedUrl,
        stack: urlError.stack,
      });
      return new NextResponse(
        JSON.stringify({
          error: "Invalid image URL format",
          details: { message: urlError.message, url: finalImageUrl },
        }),
        {
          status: 400,
          headers: { ...commonHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate Firebase Storage domain
    if (
      !decodedUrl.includes("firebasestorage.googleapis.com") &&
      !decodedUrl.includes(".firebasestorage.app")
    ) {
      console.error(`[${requestId}] Invalid storage domain:`, {
        url: decodedUrl,
        allowedDomains: [
          "firebasestorage.googleapis.com",
          ".firebasestorage.app",
        ],
        urlComponents: {
          protocol: new URL(decodedUrl).protocol,
          host: new URL(decodedUrl).host,
          pathname: new URL(decodedUrl).pathname,
        },
      });
      return new NextResponse(
        JSON.stringify({
          error: "Invalid storage domain",
          details: { url: decodedUrl },
        }),
        {
          status: 400,
          headers: { ...commonHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch the image with more detailed options
    const fetchOptions = {
      headers: {
        Accept: "image/*, */*",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "User-Agent": "Mozilla/5.0 Next.js Image Proxy",
      },
      next: { revalidate: 0 },
      redirect: "follow",
      mode: "cors",
    };

    console.log(`[${requestId}] Fetching image:`, {
      url: decodedUrl,
      options: fetchOptions,
      timestamp: new Date().toISOString(),
    });

    let response;
    try {
      response = await fetch(decodedUrl, fetchOptions);
    } catch (fetchError) {
      // If fetch fails and we have a storage path, try getting a fresh URL
      if (storagePath && fetchError.message.includes("401")) {
        try {
          console.log(
            `[${requestId}] Token expired, getting fresh URL for path:`,
            storagePath
          );
          const storageRef = ref(storage, storagePath);
          const freshUrl = await getDownloadURL(storageRef);
          response = await fetch(freshUrl, fetchOptions);
        } catch (retryError) {
          console.error(`[${requestId}] Retry fetch error:`, {
            error: retryError.message,
            stack: retryError.stack,
            path: storagePath,
          });
          return new NextResponse(
            JSON.stringify({
              error: "Failed to fetch image after refresh",
              details: {
                message: retryError.message,
                path: storagePath,
              },
            }),
            {
              status: 503,
              headers: { ...commonHeaders, "Content-Type": "application/json" },
            }
          );
        }
      } else {
        console.error(`[${requestId}] Fetch error:`, {
          error: fetchError.message,
          stack: fetchError.stack,
          url: decodedUrl,
          code: fetchError.code,
          type: fetchError.type,
          cause: fetchError.cause,
        });
        return new NextResponse(
          JSON.stringify({
            error: "Failed to fetch image",
            details: {
              message: fetchError.message,
              url: decodedUrl,
              code: fetchError.code,
              type: fetchError.type,
            },
          }),
          {
            status: 503,
            headers: { ...commonHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    if (!response.ok) {
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: decodedUrl,
        redirected: response.redirected,
        type: response.type,
        timestamp: new Date().toISOString(),
      };

      // If we get a 401/403 and have a storage path, try getting a fresh URL
      if ((response.status === 401 || response.status === 403) && storagePath) {
        try {
          console.log(
            `[${requestId}] Token expired, getting fresh URL for path:`,
            storagePath
          );
          const storageRef = ref(storage, storagePath);
          const freshUrl = await getDownloadURL(storageRef);
          response = await fetch(freshUrl, fetchOptions);

          if (!response.ok) {
            throw new Error(
              `Failed to fetch with fresh URL: ${response.status}`
            );
          }
        } catch (retryError) {
          console.error(`[${requestId}] Retry error:`, {
            error: retryError.message,
            path: storagePath,
            originalStatus: errorDetails.status,
          });
          return new NextResponse(
            JSON.stringify({
              error: "Failed to refresh image URL",
              details: {
                message: retryError.message,
                path: storagePath,
                originalStatus: errorDetails.status,
              },
            }),
            {
              status: 503,
              headers: { ...commonHeaders, "Content-Type": "application/json" },
            }
          );
        }
      } else {
        console.error(`[${requestId}] Storage response error:`, errorDetails);
        return new NextResponse(
          JSON.stringify({
            error: "Storage response error",
            details: errorDetails,
          }),
          {
            status: response.status,
            headers: { ...commonHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Get image data
    let imageData;
    try {
      imageData = await response.arrayBuffer();
    } catch (dataError) {
      console.error(`[${requestId}] Failed to read image data:`, {
        error: dataError.message,
        stack: dataError.stack,
        url: decodedUrl,
      });
      return new NextResponse(
        JSON.stringify({
          error: "Failed to read image data",
          details: { message: dataError.message, url: decodedUrl },
        }),
        {
          status: 500,
          headers: { ...commonHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const duration = Date.now() - startTime;

    console.log(`[${requestId}] Success:`, {
      contentType,
      size: imageData.byteLength,
      duration: `${duration}ms`,
      url: decodedUrl,
    });

    return new NextResponse(imageData, {
      headers: {
        ...commonHeaders,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "Content-Length": imageData.byteLength.toString(),
        "X-Proxy-Duration": duration.toString(),
        "X-Proxy-Request-ID": requestId,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Unexpected error:`, {
      error: error.message,
      stack: error.stack,
      url: request?.url,
      duration: `${duration}ms`,
    });

    return new NextResponse(
      JSON.stringify({
        error: "Unexpected error",
        details: { message: error.message, url: request?.url },
      }),
      {
        status: 500,
        headers: { ...commonHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
