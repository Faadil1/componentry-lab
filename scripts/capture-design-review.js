import { spawn } from "node:child_process"
import http from "node:http"
import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
const BROWSER_PATH = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH

const PORT = 3017
const DEBUG_PORT = 9222

async function waitForUrl(url, timeoutMs = 20000) {
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
  const hash = crypto.createHash("sha256").update(buf).digest("hex")
  console.log(`Saved screenshot: ${filePath} (sha256: ${hash.substring(0, 8)})`)
  return hash
}

async function clickElementByText(cdp, textSubstring) {
  const res = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      // First try desktop switcher buttons
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find(b => b.textContent.includes('${textSubstring}'));
      if (target && window.getComputedStyle(target).display !== 'none') {
        target.click();
        return "clicked-button";
      }
      // If hidden, try select dropdown option
      const selectEl = document.getElementById('mobile-scenario-select');
      if (selectEl && window.getComputedStyle(selectEl).display !== 'none') {
        const option = Array.from(selectEl.options).find(o => o.text.includes('${textSubstring}'));
        if (option) {
          selectEl.value = option.value;
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          return "selected-dropdown";
        }
      }
      return "none";
    })()`,
    returnByValue: true
  })
  await new Promise((r) => setTimeout(r, 800))
  return res.result.value
}

async function assertPageText(cdp, mustInclude, mustExclude = [], querySelector = "body") {
  const res = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const el = document.querySelector('${querySelector}');
      return el ? el.innerText : "";
    })()`,
    returnByValue: true
  })
  const text = res.result.value

  for (const match of mustInclude) {
    if (!text.includes(match)) {
      throw new Error(`Assertion failed: Element "${querySelector}" expected to contain "${match}", but not found.`)
    }
  }
  for (const match of mustExclude) {
    if (text.includes(match)) {
      throw new Error(`Assertion failed: Element "${querySelector}" expected to exclude "${match}", but it was found.`)
    }
  }
}

async function main() {
  const baseDir = path.join(process.cwd(), "docs", "evidence", "director-design-review-v4")
  fs.mkdirSync(baseDir, { recursive: true })

  console.log(`Starting next start on port ${PORT}...`)
  const serverProc = spawn("npx", ["next", "start", "-p", PORT.toString()], {
    shell: true,
    stdio: "pipe",
    env: { ...process.env, NEXT_FONT_GOOGLE_MOCKED: "1" }
  })

  let browserProc = null
  let cdp = null

  try {
    await waitForUrl(`http://localhost:${PORT}/director`)
    console.log(`Server ready at http://localhost:${PORT}/director`)

    browserProc = spawn(
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
    cdp = new SimpleCDPClient(wsUrl)
    await cdp.connect()

    await cdp.send("Page.enable")
    await cdp.send("Runtime.enable")
    await cdp.send("DOM.enable")

    const targetUrl = `http://localhost:${PORT}/director`
    await cdp.send("Page.navigate", { url: targetUrl })
    await new Promise((r) => setTimeout(r, 2500))

    // Assert correct tagline
    const taglineRes = await cdp.send("Runtime.evaluate", {
      expression: `document.getElementById("director-tagline")?.innerText || ""`,
      returnByValue: true
    })
    if (!taglineRes.result.value.includes("One project. One clear next move. Backed by evidence.")) {
      throw new Error(`Tagline assertion failed: Tagline is "${taglineRes.result.value}"`)
    }

    // 1. Desktop Scenario Captures (1440 x 1000)
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    })
    await new Promise((r) => setTimeout(r, 500))

    const desktopScenarios = [
      {
        key: "Second Absence",
        file: "desktop/day-challenge.png",
        pageIncludes: ["The Second Absence"],
        decisionIncludes: ["Validate accountability reveal proof", "NEXT AUTHORIZED ACTION", "accountability", "Alex", "£149"],
        decisionExcludes: ["Eight-Bar Hole", "Cleanverse", "verification", "audit", "receipt", "musicology", "Power BI", "NPS", "abandoned calls"]
      },
      {
        key: "Cleanverse",
        file: "desktop/hackathon.png",
        pageIncludes: ["Cleanverse Build Round 2"],
        decisionIncludes: ["Resolve hackathon audit receipt blocker", "NEXT AUTHORIZED ACTION", "Cleanverse", "verification", "audit", "receipt"],
        decisionExcludes: ["Eight-Bar Hole", "The Second Absence", "Alex", "£149", "accountability", "musicology", "Power BI", "abandoned calls", "NPS"]
      },
      {
        key: "MARA Episode",
        file: "desktop/mara.png",
        pageIncludes: ["MARA Episode"],
        decisionIncludes: ["Validate episode continuity proof", "NEXT AUTHORIZED ACTION", "Mara", "continuity", "wardrobe"],
        decisionExcludes: ["Eight-Bar Hole", "Cleanverse", "verification", "audit", "receipt", "£149", "Alex", "Power BI", "abandoned calls", "NPS", "musicology"]
      },
      {
        key: "Power BI",
        file: "desktop/data-story.png",
        pageIncludes: ["Power BI Service Performance"],
        decisionIncludes: ["Validate Power BI metric evidence", "NEXT AUTHORIZED ACTION", "calls", "abandoned", "answered", "satisfaction"],
        decisionExcludes: ["Eight-Bar Hole", "Cleanverse", "verification", "receipt", "£149", "Alex", "Mara", "episode", "wardrobe", "musicology"]
      },
    ]

    const desktopMetrics = {}

    for (const sc of desktopScenarios) {
      const modeClickResult = await clickElementByText(cdp, sc.key)
      console.log(`Switched to scenario ${sc.key} (Method: ${modeClickResult})`)
      
      // Verify page text (like project title)
      await assertPageText(cdp, sc.pageIncludes, [], "body")
      // Verify Decision block text
      await assertPageText(cdp, sc.decisionIncludes, sc.decisionExcludes, '#active-workspace-content')

      // Measure action bounding box
      const rectRes = await cdp.send("Runtime.evaluate", {
        expression: `(() => {
          const el = document.getElementById("next-authorized-action-container");
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
        })()`,
        returnByValue: true
      })
      const actionRect = rectRes.result.value
      const isVisibleInFirstViewport = actionRect && actionRect.top < 1000

      desktopMetrics[sc.key] = {
        actionRect,
        isVisibleInFirstViewport,
      }

      if (!isVisibleInFirstViewport) {
        throw new Error(`Visibility assertion failed for ${sc.key}: Next Authorized Action is not in the first viewport (top: ${actionRect?.top}px)`)
      }

      const hash = await captureScreenshot(cdp, path.join(baseDir, sc.file))
      desktopMetrics[sc.key].hash = hash
    }

    // 2. Mobile Viewports Captures (320 & 375)
    // Use MARA/Cleanverse for demanding length
    await clickElementByText(cdp, "MARA Episode")
    await new Promise((r) => setTimeout(r, 500))

    const mobileViewports = [
      { width: 320, height: 800, file: "mobile/director-320.png", key: "320px" },
      { width: 375, height: 812, file: "mobile/director-375.png", key: "375px" },
    ]

    const mobileMetrics = []

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
        returnByValue: true
      })

      // Validate selector visibility
      const visibilityRes = await cdp.send("Runtime.evaluate", {
        expression: `(() => {
          const mob = document.getElementById("mobile-selector-container");
          const desk = document.getElementById("desktop-selector-container");
          return {
            mobileVisible: mob ? window.getComputedStyle(mob).display !== "none" : false,
            desktopVisible: desk ? window.getComputedStyle(desk).display !== "none" : false,
            desktopButtonsCount: desk ? desk.querySelectorAll('button').length : 0
          };
        })()`,
        returnByValue: true
      })

      const vis = visibilityRes.result.value
      if (!vis.mobileVisible || vis.desktopVisible) {
        throw new Error(`Mobile Selector validation failed at ${mv.key}: Mobile container visible = ${vis.mobileVisible}, Desktop container visible = ${vis.desktopVisible}`)
      }

      // Mobile semantic assertions for MARA Episode
      await assertPageText(cdp, ["MARA Episode"], [], "body")
      await assertPageText(
        cdp, 
        ["Validate episode continuity proof", "continuity", "Mara"], 
        ["Eight-Bar Hole", "1987-F", "Horn in F", "Cleanverse", "Power BI", "abandoned calls"], 
        "#active-workspace-content"
      )

      const hash = await captureScreenshot(cdp, path.join(baseDir, mv.file))

      mobileMetrics.push({
        viewport: mv.key,
        width: mv.width,
        scrollWidth: evalRes.result.value.scrollWidth,
        clientWidth: evalRes.result.value.clientWidth,
        pass: evalRes.result.value.scrollWidth <= evalRes.result.value.clientWidth,
        mobileSelectorVisible: vis.mobileVisible,
        desktopSelectorVisible: vis.desktopVisible,
        visibleDesktopCards: vis.desktopVisible ? vis.desktopButtonsCount : 0,
        hash
      })
    }

    // Reset Desktop for Detail Captures
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    })
    await new Promise((r) => setTimeout(r, 500))
    await clickElementByText(cdp, "Second Absence")
    await new Promise((r) => setTimeout(r, 500))

    // Expand details and capture
    await clickElementByText(cdp, "View Details") // first gate details
    await new Promise((r) => setTimeout(r, 500))
    const detailsHash1 = await captureScreenshot(cdp, path.join(baseDir, "details/evidence-expanded.png"))

    await clickElementByText(cdp, "View Trace") // blocker details
    await new Promise((r) => setTimeout(r, 500))
    const detailsHash2 = await captureScreenshot(cdp, path.join(baseDir, "details/blocker-expanded.png"))

    // Scroll and capture authority
    await cdp.send("Runtime.evaluate", {
      expression: `document.querySelector('[aria-label="Authority and Learning Governance"]').scrollIntoView()`,
    })
    await new Promise((r) => setTimeout(r, 500))
    const detailsHash3 = await captureScreenshot(cdp, path.join(baseDir, "details/authority.png"))
    const detailsHash4 = await captureScreenshot(cdp, path.join(baseDir, "details/learning.png"))

    // Scroll and capture provenance
    await cdp.send("Runtime.evaluate", {
      expression: `document.querySelector('[aria-label="Source and Capabilities"]').scrollIntoView()`,
    })
    await new Promise((r) => setTimeout(r, 500))
    const detailsHash5 = await captureScreenshot(cdp, path.join(baseDir, "details/provenance.png"))

    // Save V4 metrics.json
    fs.writeFileSync(
      path.join(baseDir, "metrics.json"),
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          portUsed: PORT,
          desktopMetrics,
          responsiveMetrics: mobileMetrics,
          detailsMetrics: {
            "evidence-expanded.png": { hash: detailsHash1 },
            "blocker-expanded.png": { hash: detailsHash2 },
            "authority.png": { hash: detailsHash3 },
            "learning.png": { hash: detailsHash4 },
            "provenance.png": { hash: detailsHash5 }
          }
        },
        null,
        2
      )
    )

    console.log("V4 design review screenshots, metrics and assertions completed successfully.")

    cdp.close()
    browserProc.kill()
    serverProc.kill()
  } catch (err) {
    console.error("Capture process failed:", err)
    try {
      const textRes = await cdp.send("Runtime.evaluate", {
        expression: `document.getElementById("active-workspace-content")?.innerText || "NOT FOUND"`,
        returnByValue: true
      })
      console.log("Active Workspace Content innerText:\n", textRes.result.value)
    } catch (e) {
      console.error("Failed to log debug text:", e)
    }
    serverProc.kill()
    process.exit(1)
  }
}

main()
