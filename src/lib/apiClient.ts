// API client with logging
export async function apiRequest(url: string, options: RequestInit = {}) {
  const startTime = Date.now();
  
  console.log('🌐 Client Request:', {
    url,
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body,
    timestamp: new Date().toISOString()
  });

  try {
    const response = await fetch(url, options);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log('🌐 Client Response:', {
      url,
      method: options.method || 'GET',
      status: response.status,
      statusText: response.statusText,
      duration: `${duration}ms`,
      data,
      timestamp: new Date().toISOString()
    });

    return { response, data };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error('🌐 Client Error:', {
      url,
      method: options.method || 'GET',
      error: error instanceof Error ? error.message : String(error),
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
}
