import { NextResponse } from "next/server";

export async function GET(request) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    // Parse the request URL
    let parsedUrl;
    try {
      parsedUrl = new URL(request.url);
    } catch (urlError) {
      console.error(`[${requestId}] Invalid request URL:`, urlError);
      return new NextResponse(
        JSON.stringify({
          error: "Invalid request URL",
          details: { message: urlError.message },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const imageUrl = parsedUrl.searchParams.get("url");
    if (!imageUrl) {
      console.error(`[${requestId}] Missing URL parameter`);
      return new NextResponse(
        JSON.stringify({
          error: "Missing URL parameter",
          details: { requestUrl: request.url },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Decode and validate the URL
    let decodedUrl;
    try {
      decodedUrl = decodeURIComponent(imageUrl);
      new URL(decodedUrl); // Validate URL format
    } catch (urlError) {
      console.error(`[${requestId}] Invalid image URL format:`, {
        error: urlError.message,
        url: imageUrl,
      });
      return new NextResponse(
        JSON.stringify({
          error: "Invalid image URL format",
          details: {
            message: urlError.message,
            url: imageUrl,
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate Firebase Storage domain
    if (
      !decodedUrl.includes("firebasestorage.googleapis.com") &&
      !decodedUrl.includes(".firebasestorage.app")
    ) {
      console.error(`[${requestId}] Invalid storage domain:`, decodedUrl);
      return new NextResponse(
        JSON.stringify({
          error: "Invalid storage domain",
          details: { url: decodedUrl },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch the image
    const fetchOptions = {
      headers: {
        Accept: "image/*, */*",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      next: { revalidate: 0 },
    };

    console.log(`[${requestId}] Fetching image:`, {
      url: decodedUrl,
      options: fetchOptions,
    });

    let response;
    try {
      response = await fetch(decodedUrl, fetchOptions);
    } catch (fetchError) {
      console.error(`[${requestId}] Fetch error:`, {
        error: fetchError.message,
        url: decodedUrl,
      });
      return new NextResponse(
        JSON.stringify({
          error: "Failed to fetch image",
          details: {
            message: fetchError.message,
            url: decodedUrl,
          },
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!response.ok) {
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: decodedUrl,
      };

      console.error(`[${requestId}] Storage response error:`, errorDetails);

      return new NextResponse(
        JSON.stringify({
          error: "Storage response error",
          details: errorDetails,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get image data
    let imageData;
    try {
      imageData = await response.arrayBuffer();
    } catch (dataError) {
      console.error(`[${requestId}] Failed to read image data:`, {
        error: dataError.message,
        url: decodedUrl,
      });
      return new NextResponse(
        JSON.stringify({
          error: "Failed to read image data",
          details: {
            message: dataError.message,
            url: decodedUrl,
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
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
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
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
        details: {
          message: error.message,
          url: request?.url,
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
