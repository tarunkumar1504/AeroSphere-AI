# RESTful API Documentation — AeroSphere AI

All API routes are served under the `/api` prefix and enforce strict Zod validation, rate limiting, and standard HTTP response status codes.

---

## 1. Real-Time Air Quality & Inversion
### `GET /api/air-quality`
Retrieves real-time atmospheric conditions, multi-pollutant levels, and 24-hour winter inversion forecasts.

* **Query Parameters:**
  * `cityId` *(optional, string)*: Unique identifier of city hotspot (e.g. `delhi-anand-vihar`, `lahore-gulberg`, `salt-lake-city-downtown`). If omitted, returns list of all available city profiles.
* **Response `200 OK` (Specific City):**
```json
{
  "city": {
    "id": "delhi-anand-vihar",
    "name": "Delhi - Anand Vihar",
    "country": "India",
    "currentAirQuality": {
      "aqi": 382,
      "pm25": 236.4,
      "pm10": 388.1,
      "no2": 84.2,
      "temperature": 14.5,
      "humidity": 78,
      "inversionRisk": "CRITICAL",
      "category": "HAZARDOUS",
      "dominantPollutant": "PM2.5"
    },
    "hourlyForecast": [ ... ]
  },
  "safeVentilationHour": "Windows must remain sealed; rely strictly on HEPA/Corsi-Rosenthal recirculated air",
  "vulnerableShieldAdvice": "URGENT: Asthmatics, seniors, and children must stay indoors..."
}
```

---

## 2. GenAI Low-Emission Routine Planner
### `POST /api/routine`
Synthesizes a personalized daily routine adapted to inversion risk curves and lifestyle profiles.

* **Rate Limit:** 30 requests / minute per IP.
* **Request Body:**
```json
{
  "cityId": "delhi-anand-vihar",
  "lifestyle": "COMMUTER",
  "familyMembers": [
    {
      "name": "Aria",
      "relation": "CHILD",
      "age": 6,
      "vulnerabilities": ["ASTHMA"],
      "dailyRoutineType": "STUDENT",
      "n95Recommended": true,
      "maxSafeOutdoorAqi": 80
    }
  ],
  "userPreferences": {
    "hasAirPurifier": true,
    "canWorkFromHome": false,
    "commuteMode": "METRO"
  }
}
```
* **Response `200 OK`:**
```json
{
  "id": "plan-173243...",
  "targetDate": "2026-11-24",
  "cityName": "Delhi - Anand Vihar",
  "lifestyle": "COMMUTER",
  "overallRiskLevel": "CRITICAL",
  "summary": "Tailored low-emission routine...",
  "slots": [
    {
      "timeWindow": "06:00 - 08:30",
      "activity": "Morning exercise / early commute",
      "isSafeOutdoor": false,
      "recommendedAlternative": "STRICTLY INDOORS: Reschedule outdoor jogging...",
      "lowEmissionAction": "Switch from solo car to electric transit...",
      "inversionFactor": "Critical ground-level radiation inversion...",
      "hourlyAqi": 395
    }
  ],
  "impact": {
    "pm25InhaledAvoidedMicrograms": 810.0,
    "cigarettesEquivalentAvoided": 7.5,
    "co2EmissionsSavedKg": 4.1,
    "noxEmissionsSavedGrams": 8.4,
    "respiratoryRiskReductionPercent": 32,
    "cleanAirHoursGained": 14
  }
}
```

---

## 3. Indoor Air Quality (IAQ) Diagnostics
### `POST /api/iaq`
Evaluates room volume, building envelope infiltration, required CADR, and DIY Corsi-Rosenthal blueprints.

* **Request Body:**
```json
{
  "roomType": "BEDROOM",
  "roomAreaSqFt": 240,
  "outdoorAqi": 280,
  "hasPurifier": true,
  "purifierCadr": 320,
  "windowStatus": "WEATHERSTRIPPED",
  "cookingType": "ELECTRIC_INDUCTION"
}
```
* **Response `200 OK`:** Returns estimated indoor $PM_{2.5}$, purifier speed recommendation, required CADR (m³/h), and DIY build guides.

---

## 4. Choice Impact Simulator
### `POST /api/impact`
Quantifies the personal respiratory health and community emissions impact of user decisions.

* **Request Body:**
```json
{
  "outdoorAqi": 300,
  "hoursSpentIndoorsWithFilter": 14,
  "commuteModeShifted": "CAR_TO_METRO",
  "cookingFumeExhaustUsed": true,
  "woodBurningAvoided": true
}
```
* **Response `200 OK`:** Returns detailed metrics on $\mu\text{g}$ $PM_{2.5}$ avoided, equivalent cigarettes, $CO_2$ ($kg$), $NO_x$ ($g$), and asthma risk reduction.

---

## 5. Community Smog Watch & Action Hub
### `GET /api/community`
Lists active community alerts, clean air shelters, and carpool offers.

### `POST /api/community`
Submits a crowdsourced community alert or pledge.
* **Rate Limit:** 15 requests / minute per IP.
* **Request Body:**
```json
{
  "authorName": "Maya Lin",
  "neighborhood": "Sector 14",
  "type": "OPEN_BURNING_REPORT",
  "title": "Illegal trash burning near park boundary",
  "description": "Smoke drifting toward residential blocks. Municipal team notified.",
  "severity": "WARNING"
}
```
* **Response `201 Created`:** Returns created alert object with initial upvote count.

### `POST /api/community/upvote`
Upvotes an existing alert. Reaching 10 upvotes transitions the alert to `VERIFIED`.

---

## 6. Vayu AI Conversational Clean-Air Companion
### `POST /api/voice`
Provides conversational answers and spoken guidance for citizens.
* **Rate Limit:** 20 requests / minute per IP.
* **Request Body:**
```json
{
  "queryText": "Is it safe for my child with asthma to play outdoors today?",
  "locationCity": "Delhi - Anand Vihar",
  "currentAqi": 380,
  "vulnerableMemberTypes": ["ASTHMA"]
}
```
* **Response `200 OK`:**
```json
{
  "replyText": "The air in Delhi - Anand Vihar is currently hazardous with an AQI of 380. Please keep your child strictly indoors...",
  "recommendedActions": [
    "Keep home windows sealed with foam weatherstripping.",
    "Run HEPA air purifier on turbo mode."
  ],
  "urgencyLevel": "EMERGENCY",
  "impactSummary": "Following these precautions prevents up to 180 µg of toxic particulate inhalation..."
}
```

---

## 7. Security Audit Trail
### `GET /api/audit`
Returns the immutable security audit log of system events, routine generations, and alert publications.
