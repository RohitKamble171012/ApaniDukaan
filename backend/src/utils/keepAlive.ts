// Pings the server every 14 minutes to prevent Render free tier sleep
export function startKeepAlive(url: string) {
  if (process.env.NODE_ENV !== 'production') return;
  
  setInterval(async () => {
    try {
      await fetch(`${url}/health`);
      console.log('Keep-alive ping sent');
    } catch {
      // silent
    }
  }, 14 * 60 * 1000); // every 14 minutes
}
