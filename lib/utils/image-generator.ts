import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import { TemplateStyle, TemplateFormat, TEMPLATE_FORMATS } from '@/lib/constants/templates'

interface GenerateImageOptions {
  html: string
  format: TemplateFormat
}

// Common Chrome paths for local development
const LOCAL_CHROME_PATHS = {
  win32: [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  ],
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ],
  linux: [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
  ],
}

async function getExecutablePath(): Promise<string> {
  const isDev = process.env.NODE_ENV === 'development'

  // Allow override via environment variable
  if (process.env.CHROME_EXECUTABLE_PATH) {
    console.log('[ImageGenerator] Using CHROME_EXECUTABLE_PATH:', process.env.CHROME_EXECUTABLE_PATH)
    return process.env.CHROME_EXECUTABLE_PATH
  }

  if (isDev) {
    // Try to find local Chrome for development
    const platform = process.platform as keyof typeof LOCAL_CHROME_PATHS
    const paths = LOCAL_CHROME_PATHS[platform] || []

    const fs = await import('fs')
    for (const chromePath of paths) {
      if (chromePath && fs.existsSync(chromePath)) {
        console.log('[ImageGenerator] Using local Chrome:', chromePath)
        return chromePath
      }
    }

    console.warn('[ImageGenerator] No local Chrome found, trying @sparticuz/chromium')
  }

  // Fallback to serverless chromium (for production/Vercel)
  return await chromium.executablePath()
}

export async function generateImage(options: GenerateImageOptions): Promise<Buffer> {
  const { html, format } = options
  const formatConfig = TEMPLATE_FORMATS[format]

  console.log('[ImageGenerator] Starting image generation:', {
    format,
    dimensions: `${formatConfig.width}x${formatConfig.height}`,
    env: process.env.NODE_ENV,
  })

  let browser

  try {
    const executablePath = await getExecutablePath()
    const isDev = process.env.NODE_ENV === 'development'

    // Launch browser
    browser = await puppeteer.launch({
      args: isDev ? ['--no-sandbox', '--disable-setuid-sandbox'] : chromium.args,
      defaultViewport: {
        width: formatConfig.width,
        height: formatConfig.height,
      },
      executablePath,
      headless: true,
    })

    const page = await browser.newPage()

    // Set viewport to exact dimensions
    await page.setViewport({
      width: formatConfig.width,
      height: formatConfig.height,
      deviceScaleFactor: 2, // High DPI for quality
    })

    // Load HTML content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    })

    console.log('[ImageGenerator] HTML loaded, capturing screenshot')

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      encoding: 'binary',
    })

    console.log('[ImageGenerator] Screenshot captured successfully')

    return screenshot as Buffer
  } catch (error) {
    console.error('[ImageGenerator] Error:', error)
    throw error
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

export function buildTemplateHTML(
  style: TemplateStyle,
  format: TemplateFormat,
  data: {
    title: string
    destination?: string
    coverPhotoUrl?: string
    dayCount?: number
    activityCount?: number
  }
): string {
  const formatConfig = TEMPLATE_FORMATS[format]
  const { width, height } = formatConfig

  // Base HTML structure with Tailwind CDN
  const baseHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Space+Grotesk:wght@400;500;600;700&family=Source+Sans+Pro:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
    }
    .font-display { font-family: 'Playfair Display', serif; }
    .font-heading { font-family: 'Space Grotesk', sans-serif; }
    .font-body { font-family: 'Source Sans Pro', sans-serif; }
    .bg-cream { background-color: #fffaf5; }
  </style>
</head>
<body>
  ${renderTemplate(style, data, width, height)}
</body>
</html>
  `

  return baseHTML
}

function renderTemplate(
  style: TemplateStyle,
  data: {
    title: string
    destination?: string
    coverPhotoUrl?: string
    dayCount?: number
    activityCount?: number
  },
  width: number,
  height: number
): string {
  if (style === 'clean') {
    return `
<div style="width: ${width}px; height: ${height}px;" class="bg-cream font-display">
  <div class="absolute inset-0 p-16 flex flex-col justify-between">
    <div>
      <h1 class="text-6xl font-bold text-gray-900 mb-4">
        ${data.title || 'Untitled Trip'}
      </h1>
      ${
        data.destination
          ? `<p class="text-3xl text-gray-600 font-body">${data.destination}</p>`
          : ''
      }
    </div>
    <div class="flex gap-8 font-heading text-2xl text-gray-700">
      ${data.dayCount ? `<div><span class="font-semibold">${data.dayCount}</span> Days</div>` : ''}
      ${data.activityCount ? `<div><span class="font-semibold">${data.activityCount}</span> Activities</div>` : ''}
    </div>
    <div class="text-xl text-gray-500 font-body">
      stashport.com
    </div>
  </div>
</div>
    `
  }

  if (style === 'bold') {
    return `
<div style="width: ${width}px; height: ${height}px; position: relative;">
  ${
    data.coverPhotoUrl
      ? `<img src="${data.coverPhotoUrl}" alt="Cover" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;" />`
      : '<div style="position: absolute; inset: 0; background: linear-gradient(to bottom right, #f86f4d, #14b8a6);"></div>'
  }
  <div style="position: absolute; inset: 0; background: rgba(0, 0, 0, 0.4);"></div>
  <div class="absolute inset-0 p-16 flex flex-col justify-between text-white">
    <div>
      <h1 class="text-7xl font-bold font-display mb-4" style="text-shadow: 2px 2px 8px rgba(0,0,0,0.3);">
        ${data.title || 'Untitled Trip'}
      </h1>
      ${
        data.destination
          ? `<p class="text-4xl font-body" style="text-shadow: 2px 2px 6px rgba(0,0,0,0.3);">${data.destination}</p>`
          : ''
      }
    </div>
    <div class="flex gap-8 font-heading text-3xl">
      ${data.dayCount ? `<div><span class="font-semibold">${data.dayCount}</span> Days</div>` : ''}
      ${data.activityCount ? `<div><span class="font-semibold">${data.activityCount}</span> Activities</div>` : ''}
    </div>
    <div class="text-2xl font-body" style="text-shadow: 2px 2px 6px rgba(0,0,0,0.3);">
      stashport.com
    </div>
  </div>
</div>
    `
  }

  if (style === 'minimal') {
    return `
<div style="width: ${width}px; height: ${height}px;" class="bg-white">
  <div class="absolute inset-0 p-16 flex flex-col justify-center items-center text-center border-8 border-gray-200">
    <h1 class="text-6xl font-bold font-display text-gray-900 mb-6">
      ${data.title || 'Untitled Trip'}
    </h1>
    ${
      data.destination
        ? `<p class="text-4xl text-gray-600 font-body mb-12">${data.destination}</p>`
        : ''
    }
    ${
      data.dayCount || data.activityCount
        ? `
    <div class="flex gap-12 font-heading text-2xl text-gray-700 mb-12">
      ${
        data.dayCount
          ? `
      <div>
        <span class="font-semibold text-4xl block mb-2">${data.dayCount}</span>
        Days
      </div>
      `
          : ''
      }
      ${
        data.activityCount
          ? `
      <div>
        <span class="font-semibold text-4xl block mb-2">${data.activityCount}</span>
        Activities
      </div>
      `
          : ''
      }
    </div>
    `
        : ''
    }
    <div class="text-xl text-gray-400 font-body" style="margin-top: auto;">
      stashport.com
    </div>
  </div>
</div>
    `
  }

  return ''
}
