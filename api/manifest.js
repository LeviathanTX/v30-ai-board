export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const manifest = {
    "short_name": "AI Board",
    "name": "AI Board of Advisors", 
    "icons": [
      {
        "src": "favicon.ico",
        "sizes": "64x64 32x32 24x24 16x16",
        "type": "image/x-icon"
      }
    ],
    "start_url": ".",
    "display": "standalone",
    "theme_color": "#3B82F6",
    "background_color": "#ffffff"
  };
  
  res.status(200).json(manifest);
}