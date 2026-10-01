# 🛡️ Cyber Inspector AI | المفتش السيبراني

**Check before you click.** A bilingual (Arabic / English) web platform that helps everyday users check suspicious links and QR codes before opening them, explains the risk in plain language, and tells them exactly what to do next.

> منصة ويب ثنائية اللغة تساعد المستخدم على فحص الروابط المشبوهة ورموز QR قبل فتحها، وتعرض نسبة الخطورة وأسبابها بلغة مبسطة، مع توصيات عملية وروابط مباشرة لجهات الإبلاغ الرسمية.

Submitted to **SAIF 2026 – Security & Technology Innovation Fair** (Cybersecurity & Defense Technologies track).

---

## The Problem

Phishing links and malicious QR codes are spreading through SMS, email, and social media. QR codes are especially risky because users cannot see the destination link before opening it. Most users lack the expertise to judge a link, and existing scanners are technical, English-only, and rarely tell users what to do next.

## Features

| Feature | Description |
|---|---|
| 🔗 **URL Scanning** | Links are analyzed through the VirusTotal API, which aggregates results from dozens of security engines. |
| 📷 **QR Code Scanning** | Upload a QR image; the hidden URL is decoded in the browser and scanned like any other link. |
| 📊 **Risk Score** | Engine results are converted into a 0–100 score and a clear level: Safe / Low / Suspicious / Dangerous. |
| 💡 **Explanations** | Each result lists the indicators behind the score (malicious engine count, community reputation, raw IP addresses, suspicious domain extensions, phishing keywords). |
| ✅ **Recommendations** | Actionable next steps based on the risk level. |
| 🏛️ **Response Center** | Direct links to official Saudi cybersecurity and fraud-reporting services. |
| 🕘 **Scan History** | Previous scans are saved locally in the user's browser. |
| 🌐 **Bilingual UI** | Full Arabic and English interface. |

## How It Works

```
Link / QR image  →  Extract URL  →  VirusTotal scan  →  Risk score  →  Explanation + Recommendations
```

1. The user pastes a link or uploads a QR code image.
2. QR codes are decoded client-side (`jsQR`) to extract the URL.
3. The API server submits the URL to VirusTotal and polls for the analysis result.
4. The score is calculated from the number of engines flagging the URL as malicious or suspicious, adjusted by community reputation.
5. The result page shows the risk level, the reasons behind it, and recommended actions.

If VirusTotal is unavailable (rate limit or timeout), the app falls back to a basic keyword-based check so the user still receives guidance.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Node.js, Express 5, TypeScript
- **Threat Intelligence:** VirusTotal API v3
- **Tooling:** pnpm workspaces, Zod, Orval (OpenAPI codegen)
- **Development:** Built on Replit with AI-assisted development tools, followed by manual modifications

## Running Locally

**Requirements:** Node.js 24+, pnpm, a free [VirusTotal API key](https://www.virustotal.com/gui/join-us)

```bash
pnpm install

# Set your API key as an environment variable (never commit it to the code)
export VIRUSTOTAL_API_KEY=your_key_here

# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the frontend (in a second terminal)
pnpm --filter @workspace/cyber-inspector run dev
```

On Replit, add `VIRUSTOTAL_API_KEY` under **Secrets** instead of exporting it.

## Current Limitations

- The free VirusTotal API tier has strict request limits, which can trigger the fallback mode.
- The fallback mode and the text/image analysis tabs are early prototypes based on simple keyword matching and are less reliable than the VirusTotal scan.

## Roadmap

- 🤖 **AI Security Assistant:** a specialized assistant that answers user questions about suspicious links and messages and guides them step by step.
- 🧩 **Browser Extension:** a real-time protection layer that warns about or blocks unsafe websites before they load.
- 🔍 **Multiple Threat-Intelligence Sources:** combine several sources for higher accuracy and resilience.
- ⚠️ **Clear fallback notice:** tell users when a result comes from the basic check instead of VirusTotal.

## Official Resources Used in the Response Center

- National Cybersecurity Authority (NCA): https://nca.gov.sa
- Haseen Link Verification: https://haseen.gov.sa/tahqaq/
- Unified National Platform – Fraud Reporting: https://my.gov.sa
- Google Safety Center: https://safety.google
