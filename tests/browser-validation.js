import { spawn, execSync } from "node:child_process"
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
        const msg = JSON.parse(event.data)
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

async function runBrowserAudit() {
  console.log("Building Next.js app for production server test...")
  execSync("npm run build", { stdio: "inherit" })

  console.log(`Starting next start on port ${PORT}...`)
  const serverProc = spawn("npx", ["next", "start", "-p", PORT.toString()], {
    shell: true,
    stdio: "pipe",
  })

  let serverOutput = ""
  serverProc.stdout.on("data", (d) => (serverOutput += d.toString()))
  serverProc.stderr.on("data", (d) => (serverOutput += d.toString()))

  try {
    await waitForUrl(`http://localhost:${PORT}/director`)
    console.log(`Server ready at http://localhost:${PORT}/director`)

    console.log("Launching headless browser...")
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

    console.log("Connected to browser via CDP.")

    // Enable Page, Runtime, DOM
    await cdp.send("Page.enable")
    await cdp.send("Runtime.enable")
    await cdp.send("DOM.enable")

    const consoleLogs = []
    const hydrationErrors = []

    // Listen to console log events via CDP
    cdp.ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data.toString())
      if (msg.method === "Runtime.consoleAPICalled") {
        const text = msg.params.args.map((a) => a.value || a.description || "").join(" ")
        consoleLogs.push(text)
        if (text.includes("Hydration") || text.includes("did not match")) {
          hydrationErrors.push(text)
        }
      }
    })

    const targetUrl = `http://localhost:${PORT}/director`
    await cdp.send("Page.navigate", { url: targetUrl })
    await new Promise((r) => setTimeout(r, 3000))

    const viewports = [
      { name: "320px", width: 320, height: 800 },
      { name: "375px", width: 375, height: 812 },
      { name: "768px", width: 768, height: 1024 },
      { name: "1280px", width: 1280, height: 900 },
    ]

    const viewportResults = []

    for (const vp of viewports) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768,
      })
      await new Promise((r) => setTimeout(r, 500))

      const evalRes = await cdp.send("Runtime.evaluate", {
        expression: `(() => {
          const docScroll = document.documentElement.scrollWidth;
          const docClient = document.documentElement.clientWidth;
          const overflowingElements = [];
          document.querySelectorAll('*').forEach(el => {
            if (el.scrollWidth > docClient) {
              overflowingElements.push({
                tagName: el.tagName,
                className: el.className,
                id: el.id,
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth,
                textContent: el.textContent.substring(0, 60)
              });
            }
          });
          return {
            scrollWidth: docScroll,
            clientWidth: docClient,
            hasOverflow: docScroll > docClient,
            overflowingElements: overflowingElements.slice(0, 10)
          };
        })()`,
        returnByValue: true,
      })

      const metrics = evalRes.result.value
      viewportResults.push({
        viewport: vp.name,
        width: vp.width,
        scrollWidth: metrics.scrollWidth,
        clientWidth: metrics.clientWidth,
        pass: metrics.scrollWidth <= metrics.clientWidth,
      })

      console.log(`Viewport ${vp.name}: scrollWidth=${metrics.scrollWidth}, clientWidth=${metrics.clientWidth} -> ${metrics.scrollWidth <= metrics.clientWidth ? "PASS" : "FAIL"}`)
      if (metrics.hasOverflow) {
        console.log("Overflowing Elements:", metrics.overflowingElements)
      }
    }

    // Evaluate Scenario Actions
    const scenarioEval = await cdp.send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const scenarioButtons = buttons.filter(b => b.textContent.includes('Second Absence') || b.textContent.includes('Cleanverse') || b.textContent.includes('MARA') || b.textContent.includes('Power BI'));
        return scenarioButtons.map(b => b.textContent.trim());
      })()`,
      returnByValue: true,
    })

    console.log("Found Scenario Buttons:", scenarioEval.result.value)

    cdp.close()
    browserProc.kill()
    serverProc.kill()

    const summaryReport = {
      timestamp: new Date().toISOString(),
      viewportResults,
      consoleErrorCount: consoleLogs.length,
      hydrationErrorCount: hydrationErrors.length,
      overallPass: viewportResults.every((v) => v.pass) && hydrationErrors.length === 0,
    }

    fs.mkdirSync(path.join(process.cwd(), "docs", "evidence"), { recursive: true })
    fs.writeFileSync(
      path.join(process.cwd(), "docs", "evidence", "browser-audit.json"),
      JSON.stringify(summaryReport, null, 2)
    )

    console.log("\n--- BROWSER AUDIT SUMMARY ---")
    console.log(JSON.stringify(summaryReport, null, 2))

    if (!summaryReport.overallPass) {
      process.exit(1)
    }
  } catch (err) {
    console.error("Browser audit failed:", err)
    serverProc.kill()
    process.exit(1)
  }
}

runBrowserAudit()
