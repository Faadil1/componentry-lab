import { spawn } from "node:child_process"
import http from "node:http"
import fs from "node:fs"
import path from "node:path"

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
const BROWSER_PATH = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH

const PORT = 3009
const DEBUG_PORT = 9222

async function waitForUrl(url, timeoutMs = 15000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode === 200) resolve(true)
          else reject(new Error(`Status ${res.statusCode}`))
        })
        req.on("error", reject)
        req.end()
      })
      return true
    } catch {
      await new Promise((r) => setTimeout(r, 500))
    }
  }
  throw new Error(`Timeout waiting for ${url}`)
}

async function getCDPWebSocketUrl() {
  const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)
  const targets = await res.json()
  const pageTarget = targets.find((t) => t.type === "page")
  if (!pageTarget) throw new Error("No page target found")
  return pageTarget.webSocketDebuggerUrl
}

class SimpleCDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl
    this.id = 1
    this.callbacks = new Map()
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new globalThis.WebSocket(this.wsUrl)
      this.ws.onopen = () => resolve()
      this.ws.onerror = (err) => reject(err)
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data.toString())
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id)
          this.callbacks.delete(msg.id)
          if (msg.error) reject(msg.error)
          else resolve(msg.result)
        }
      }
    })
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++
      this.callbacks.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  close() {
    if (this.ws) this.ws.close()
  }
}

async function captureScreenshot(cdp, filePath) {
  const res = await cdp.send("Page.captureScreenshot", { format: "png" })
  const buf = Buffer.from(res.data, "base64")
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, buf)
  console.log(`Saved screenshot: ${filePath}`)
}

async function clickElementByText(cdp, textSubstring) {
  await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find(b => b.textContent.includes('${textSubstring}'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    })()`,
  })
  await new Promise((r) => setTimeout(r, 600))
}

async function main() {
  console.log(`Starting next start on port ${PORT}...`)
  const serverProc = spawn("npx", ["next", "start", "-p", PORT.toString()], {
    shell: true,
    stdio: "pipe",
  })

  try {
    await waitForUrl(`http://localhost:${PORT}/director`)
    console.log(`Server ready at http://localhost:${PORT}/director`)

    const browserProc = spawn(
      BROWSER_PATH,
      [
        "--headless=new",
        `--remote-debugging-port=${DEBUG_PORT}`,
        "--remote-allow-origins=*",
        "--disable-gpu",
        "--no-sandbox",
        "about:blank",
      ],
      { stdio: "pipe" }
    )

    await new Promise((r) => setTimeout(r, 2000))

    const wsUrl = await getCDPWebSocketUrl()
    const cdp = new SimpleCDPClient(wsUrl)
    await cdp.connect()

    await cdp.send("Page.enable")
    await cdp.send("Runtime.enable")
    await cdp.send("DOM.enable")

    const baseDir = path.join(process.cwd(), "docs", "evidence", "director-design-review-v2")
    fs.mkdirSync(baseDir, { recursive: true })

    const targetUrl = `http://localhost:${PORT}/director`
    await cdp.send("Page.navigate", { url: targetUrl })
    await new Promise((r) => setTimeout(r, 2500))

    // Desktop viewports (1440 x 1000)
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    })
    await new Promise((r) => setTimeout(r, 500))

    // 1. Desktop Scenario Captures
    const desktopScenarios = [
      { key: "Second Absence", file: "desktop/day-challenge.png" },
      { key: "Cleanverse", file: "desktop/hackathon.png" },
      { key: "MARA Episode", file: "desktop/mara.png" },
      { key: "Power BI", file: "desktop/data-story.png" },
    ]

    for (const sc of desktopScenarios) {
      await clickElementByText(cdp, sc.key)
      await new Promise((r) => setTimeout(r, 500))
      await captureScreenshot(cdp, path.join(baseDir, sc.file))
    }

    // 2. Mobile Viewports Captures (320 & 375)
    await clickElementByText(cdp, "Cleanverse") // Use demanding content length
    await new Promise((r) => setTimeout(r, 500))

    const mobileViewports = [
      { width: 320, height: 800, file: "mobile/director-320.png", key: "320px" },
      { width: 375, height: 812, file: "mobile/director-375.png", key: "375px" },
    ]

    const metricsResults = []

    for (const mv of mobileViewports) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: mv.width,
        height: mv.height,
        deviceScaleFactor: 1,
        mobile: true,
      })
      await new Promise((r) => setTimeout(r, 500))

      const evalRes = await cdp.send("Runtime.evaluate", {
        expression: `({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
        })`,
        returnByValue: true,
      })

      metricsResults.push({
        viewport: mv.key,
        width: mv.width,
        scrollWidth: evalRes.result.value.scrollWidth,
        clientWidth: evalRes.result.value.clientWidth,
        pass: evalRes.result.value.scrollWidth <= evalRes.result.value.clientWidth,
      })

      await captureScreenshot(cdp, path.join(baseDir, mv.file))
    }

    // Reset Desktop for Detail Captures
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    })
    await new Promise((r) => setTimeout(r, 500))

    // 3. Diagnostic Detail Captures
    // Expanded evidence gate
    await clickElementByText(cdp, "Expand Gate Details")
    await new Promise((r) => setTimeout(r, 500))
    await captureScreenshot(cdp, path.join(baseDir, "details/evidence-expanded.png"))

    // Expanded blocker
    await clickElementByText(cdp, "View Provenance")
    await new Promise((r) => setTimeout(r, 500))
    await captureScreenshot(cdp, path.join(baseDir, "details/blocker-expanded.png"))

    // Authority state capture (scroll into view authority section)
    await cdp.send("Runtime.evaluate", {
      expression: `document.querySelector('[aria-label="Authority and Learning Governance"]').scrollIntoView()`,
    })
    await new Promise((r) => setTimeout(r, 500))
    await captureScreenshot(cdp, path.join(baseDir, "details/authority.png"))
    await captureScreenshot(cdp, path.join(baseDir, "details/learning.png"))

    // Provenance capture
    await cdp.send("Runtime.evaluate", {
      expression: `document.querySelector('[aria-label="Provenance and Selected Skills"]').scrollIntoView()`,
    })
    await new Promise((r) => setTimeout(r, 500))
    await captureScreenshot(cdp, path.join(baseDir, "details/provenance.png"))

    // Save metrics.json
    fs.writeFileSync(
      path.join(baseDir, "metrics.json"),
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          responsiveMetrics: metricsResults,
          scenariosCaptured: desktopScenarios.map((s) => s.key),
          detailCaptures: [
            "evidence-expanded.png",
            "blocker-expanded.png",
            "authority.png",
            "learning.png",
            "provenance.png",
          ],
        },
        null,
        2
      )
    )

    console.log("All design review screenshots and metrics generated successfully.")

    cdp.close()
    browserProc.kill()
    serverProc.kill()
  } catch (err) {
    console.error("Capture process failed:", err)
    serverProc.kill()
    process.exit(1)
  }
}

main()
