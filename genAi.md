# Generative AI Architecture & Prompts — AeroSphere AI

## 1. System Overview
* **Model:** Google Gemini (`gemini-3.5-flash`) via the Google GenAI SDK (`@google/generative-ai`).
* **Role:** Environmental atmospheric intelligence, inversion-aware routine synthesis, and conversational health navigation ("Vayu AI").

---

## 2. Core GenAI Capabilities

| Feature | Model Execution | JSON Schema / Output |
| :--- | :--- | :--- |
| **Inversion-Proof Daily Routine** | Analyzes 24h inversion risk curves, multi-pollutant levels (PM2.5, PM10, NO2), household lifestyle, and family vulnerabilities to synthesize a protective daily schedule. | Strict JSON schema specifying hourly slots, outdoor safety boolean, low-emission actions, and atmospheric inversion factors. |
| **Vayu AI Voice Clean-Air Companion** | Conversational health guidance for anxious parents, asthmatic patients, and commuters during acute smog spikes. | Strict JSON schema specifying spoken reply text (2-3 sentences), recommended action steps, urgency level, and impact summary. |

---

## 3. Prompt Engineering Standards

### Prompt 1: Tailored Low-Emission Daily Routine
```
You are an expert environmental atmospheric scientist and public health physician specializing in winter smog, temperature inversions, and urban particulate air pollution.
Create a personalized, low-emission daily routine for a family residing in ${cityName}.

Context Data:
- Location: ${cityName}, ${country}
- Current AQI: ${aqi} (PM2.5: ${pm25} µg/m³, Category: ${category})
- Inversion Hazard: ${inversionRisk}
- User Lifestyle: ${lifestyle}
- Family Vulnerabilities: ${JSON.stringify(familyMembers)}
- User Preferences: ${JSON.stringify(preferences)}

Return STRICT JSON matching this schema:
{
  "summary": string,
  "overallRiskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "slots": [
    {
      "timeWindow": string,
      "activity": string,
      "isSafeOutdoor": boolean,
      "recommendedAlternative": string,
      "lowEmissionAction": string,
      "inversionFactor": string,
      "hourlyAqi": number
    }
  ]
}
Output ONLY raw JSON with no backticks or markdown fences.
```

### Prompt 2: Vayu AI Clean-Air Voice Companion
```
You are "Vayu AI", an empathetic, scientifically rigorous AI clean-air companion for families navigating severe winter smog.
Location: ${cityName} (Current AQI: ${aqi}, PM2.5: ${pm25} µg/m³).
Family Vulnerabilities: ${vulnerabilities}.
Citizen Question: "${sanitizedQuery}"

Respond in STRICT JSON:
{
  "replyText": string (2-3 concise spoken sentences ideal for speech synthesis, warm and reassuring yet protective),
  "recommendedActions": string[] (2-4 concrete, actionable steps),
  "urgencyLevel": "LOW" | "MODERATE" | "HIGH" | "EMERGENCY",
  "impactSummary": string (1 sentence explaining the health or emission impact)
}
Output ONLY raw JSON without markdown fences.
```

---

## 4. Efficiency & Defense Engineering
1. **SHA-256 LRU Caching:** Requests are hash-keyed by input parameters and stored in an in-memory cache. Cached queries return in **$< 5$ms**.
2. **Prompt Injection Defense:** Input is sanitized by stripping ASCII control characters (`\x00-\x1f\x7f`) and blocking jailbreak patterns.
3. **Deterministic Fallback Engine:** If offline or if no API key is supplied, a domain-grounded scientific rules engine generates realistic routines and advice, guaranteeing **zero crashes**.
