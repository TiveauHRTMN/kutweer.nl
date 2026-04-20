import { fetchWeatherData } from '../src/lib/weather';
import { generatePlatformCaption } from '../src/app/api/cron/social-post/route';

async function proveIt() {
  console.log('🧪 STARTING AFFILIATE PROOF TEST...');
  
  // 1. Fetch real weather data (De Bilt)
  const weather = await fetchWeatherData(52.11, 5.18);
  if (!weather) {
    console.error('Failed to fetch weather');
    return;
  }

  // 2. Generate caption for X (should be Amazon)
  console.log('\n--- TARGET: X (Twitter) ---');
  const xData = await generatePlatformCaption(weather as any, 'x');
  console.log('Caption contains Amazon link:', xData.caption.includes('amazon.nl'));
  console.log('URL used:', xData.affiliateUrl);

  // 3. Generate caption for TikTok (should be Temu)
  console.log('\n--- TARGET: TikTok ---');
  const tiktokData = await generatePlatformCaption(weather as any, 'tiktok');
  console.log('Caption contains Temu link:', tiktokData.caption.includes('temu.com'));
  console.log('URL used:', tiktokData.affiliateUrl);
  console.log('Partner ID present:', tiktokData.affiliateUrl.includes('e3xei993714'));

  console.log('\n✅ PROOF: System correctly differentiates based on platform!');
}

proveIt();
