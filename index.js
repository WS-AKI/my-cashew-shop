/**
 * SAM SIAN ELIXIR - Coming Soon Landing Page
 * Cloudflare Worker with Basic Authentication
 * 
 * Credentials:
 * Username: admin
 * Password: secret2026
 */

// Basic Authentication credentials
const AUTH_USERNAME = 'admin';
const AUTH_PASSWORD = 'secret2026';

// Image configuration
// Option 1: Use external URL (replace with your image URL)
// Option 2: Upload image to Cloudflare Workers Assets and use relative path
// Option 3: Base64 encode the image and embed directly in CSS
const HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80'; // Replace with your image_3.png URL or path

/**
 * Check Basic Authentication
 */
function checkAuth(request) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }
  
  const base64Credentials = authHeader.substring(6);
  const credentials = atob(base64Credentials);
  const [username, password] = credentials.split(':');
  
  return username === AUTH_USERNAME && password === AUTH_PASSWORD;
}

/**
 * Generate HTML for the Coming Soon page
 */
function generateHTML() {
  const heroImageUrl = HERO_IMAGE_URL;
  
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SAM SIAN ELIXIR - Coming Soon</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@200;300;400&family=Inter:wght@200;300;400&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    :root {
      --black: #000000;
      --white: #FFFFFF;
      --pink-gold: #E6C7C2;
    }
    
    html, body {
      height: 100%;
      overflow-x: hidden;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background-color: var(--black);
      color: var(--white);
      line-height: 1.8;
      letter-spacing: 0.05em;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .serif {
      font-family: 'Noto Serif JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
      font-weight: 200;
      letter-spacing: 0.1em;
      line-height: 2.2;
    }
    
    .sans-serif {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-weight: 300;
      letter-spacing: 0.15em;
      line-height: 2;
    }
    
    /* Header */
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      padding: 3rem 2rem;
      text-align: center;
      background: transparent;
    }
    
    .logo {
      font-family: 'Inter', sans-serif;
      font-size: 1.2rem;
      font-weight: 300;
      letter-spacing: 0.5em;
      color: var(--white);
      text-transform: uppercase;
    }
    
    /* Hero Section */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8rem 2rem 4rem;
      overflow: hidden;
    }
    
    .hero-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url('${heroImageUrl}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      filter: blur(8px) brightness(0.3);
      transform: scale(1.1);
      z-index: 0;
    }
    
    .hero-background::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.6) 0%,
        rgba(0, 0, 0, 0.4) 50%,
        rgba(0, 0, 0, 0.7) 100%
      );
    }
    
    .hero-content {
      position: relative;
      z-index: 1;
      text-align: center;
      max-width: 900px;
      margin: 0 auto;
    }
    
    .hero-title {
      font-size: clamp(1.8rem, 5vw, 3.5rem);
      margin-bottom: 2rem;
      color: var(--white);
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
    }
    
    .hero-subtitle {
      font-size: clamp(0.9rem, 2vw, 1.4rem);
      color: var(--pink-gold);
      margin-top: 1.5rem;
      font-weight: 200;
    }
    
    /* Section */
    .section {
      padding: 8rem 2rem;
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }
    
    .concept-text {
      font-size: clamp(1rem, 2.5vw, 1.3rem);
      line-height: 2.5;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 3rem;
    }
    
    .concept-highlight {
      color: var(--pink-gold);
      font-weight: 400;
    }
    
    .tuning-note {
      font-size: clamp(0.85rem, 2vw, 1.1rem);
      color: rgba(255, 255, 255, 0.7);
      font-style: italic;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    /* Final Section */
    .final-section {
      padding: 8rem 2rem 12rem;
      max-width: 700px;
      margin: 0 auto;
      text-align: center;
    }
    
    .final-title {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      margin-bottom: 3rem;
      color: var(--white);
      line-height: 2.5;
    }
    
    .final-text {
      font-size: clamp(0.85rem, 2vw, 1.1rem);
      color: rgba(255, 255, 255, 0.8);
      letter-spacing: 0.2em;
      line-height: 2.2;
      margin-top: 2rem;
    }
    
    /* Bar Chart Styles */
    .chart-container {
      max-width: 600px;
      margin: 4rem auto 0;
      padding: 0 1rem;
    }
    
    .chart-title {
      font-size: clamp(0.75rem, 1.5vw, 0.9rem);
      color: rgba(255, 255, 255, 0.6);
      letter-spacing: 0.1em;
      margin-bottom: 2rem;
      text-align: left;
      font-weight: 300;
    }
    
    .chart-item {
      margin-bottom: 1.5rem;
    }
    
    .chart-label {
      font-size: clamp(0.7rem, 1.2vw, 0.85rem);
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      letter-spacing: 0.05em;
    }
    
    .chart-bar-container {
      position: relative;
      width: 100%;
      height: 2px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 1px;
      overflow: hidden;
    }
    
    .chart-bar {
      height: 100%;
      border-radius: 1px;
      transition: width 0.6s ease-out;
    }
    
    .chart-bar-white {
      background-color: rgba(255, 255, 255, 0.4);
    }
    
    .chart-bar-pink-gold {
      background-color: var(--pink-gold);
    }
    
    .chart-value {
      font-size: clamp(0.65rem, 1vw, 0.75rem);
      color: rgba(255, 255, 255, 0.5);
      margin-left: 0.5rem;
    }
    
    /* Spacing and Typography */
    .spacer {
      height: 4rem;
    }
    
    @media (max-width: 768px) {
      .header {
        padding: 2rem 1rem;
      }
      
      .hero {
        padding: 6rem 1.5rem 3rem;
      }
      
      .section {
        padding: 5rem 1.5rem;
      }
      
      .final-section {
        padding: 5rem 1.5rem 8rem;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="logo">SAM SIAN</div>
  </header>
  
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-background"></div>
    <div class="hero-content">
      <h1 class="hero-title serif">
        アジア初。食べるアンチエイジング。
      </h1>
      <p class="hero-subtitle sans-serif">Asian First. Edible Anti-Aging.</p>
    </div>
  </section>
  
  <!-- Concept Section -->
  <section class="section">
    <div class="concept-text serif">
      <p>
        オレンジの5倍の天然ビタミンC。<br>
        そして、強力な抗酸化作用を持つポリフェノール。<br>
        収穫後24時間で失われる幻の果実『カシューアップル』を、最も美しい形で閉じ込めました。<br>
        現在、究極の美味しさを求めてレシピを最終調整中。
      </p>
    </div>
    
    <!-- Bar Chart -->
    <div class="chart-container">
      <div class="chart-title sans-serif">天然ビタミンC含有量 (100gあたり)</div>
      
      <div class="chart-item">
        <div class="chart-label">
          <span>オレンジ</span>
          <span class="chart-value">40mg</span>
        </div>
        <div class="chart-bar-container">
          <div class="chart-bar chart-bar-white" style="width: 20%;"></div>
        </div>
      </div>
      
      <div class="chart-item">
        <div class="chart-label">
          <span>レモン</span>
          <span class="chart-value">50mg</span>
        </div>
        <div class="chart-bar-container">
          <div class="chart-bar chart-bar-white" style="width: 25%;"></div>
        </div>
      </div>
      
      <div class="chart-item">
        <div class="chart-label">
          <span>カシューアップル</span>
          <span class="chart-value">200mg</span>
        </div>
        <div class="chart-bar-container">
          <div class="chart-bar chart-bar-pink-gold" style="width: 100%;"></div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Final Section -->
  <section class="final-section">
    <h2 class="final-title serif">
      2026年 初夏。<br>
      バンコクにて、限定200個のみ発表。
    </h2>
  </section>
</body>
</html>`;
}

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    // Check authentication
    if (!checkAuth(request)) {
      return new Response('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="SAM SIAN ELIXIR - Internal Access"',
          'Content-Type': 'text/plain; charset=utf-8'
        }
      });
    }
    
    // Serve the HTML page
    return new Response(generateHTML(), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
};
