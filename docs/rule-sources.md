# Official Rule Sources & Evidence Dossier

**Document Owner:** John Asher Manit (`@99lash`)
**Scope:** Official Legal Citations, Rule Delta Analysis, and Sign Asset Provenance
**Last Reviewed:** 2026-09-24
**Target:** RoamRight MVP Shared Rules Subsystem (`shared/rules/rules.json`)

---

## 1. Overview & Verification Standard

In accordance with RoamRight governance and `AGENTS.md`:
* **Gemini output is NOT a legal authority.** AI models are used strictly for computer vision identification and language formatting.
* All driving advice, alerts, and explanations served to travelers must originate from source-reviewed legal statutes and official automotive federation documentation.
* Unsupported or unverified signs must resolve to `status: "unknown"` with zero invented advice.

---

## 2. Japan Legal Authorities & Verified Rules

### A. Japan Stop Sign (`止まれ` - Tomare)
* **Identifier:** `jp-stop`
* **Governing Statute:** Japan Road Traffic Act (*道路交通法*, Law No. 105 of 1960), **Article 43** (Stopping at Stop Signs).
* **Official Source:** Japan Automobile Federation (JAF) — *Rules of the Road: Traffic Signs and Markings*
  URL: `https://english.jaf.or.jp/driving-in-japan/traffic-rules`
* **Statutory Requirement:**
  > *"At an intersection or other location where a stop sign is posted, a vehicle must come to a temporary complete stop immediately before the stop line (or immediately before the intersection if no stop line exists) and must not obstruct the progress of other vehicles traveling on the intersecting road."*
* **The Rule Delta (Cultural Vulnerability):**
  * In the Philippines, the United States, and European nations under the Vienna Convention, standard Stop signs are octagonal red signs, while inverted triangles signify **Yield / Give Way** (permitting drivers to roll through if the road is clear).
  * In Japan, the Stop sign is an **inverted red triangle** bearing the Kanji `止まれ` (and English `STOP` on modern signs). Non-Japanese drivers frequently confuse this with a Yield sign and slow down without stopping, resulting in severe police citations and T-bone collisions.
* **Approved Short Alert:** `"Full stop before the white line. Check both directions before moving."`

---

### B. Japan Railway Crossing Ahead (`踏切あり` - Fumikiri)
* **Identifier:** `jp-railway`
* **Official Code:** Japan Road Sign No. 207-A (Steam locomotive) / No. 207-B (Train) — 踏切あり
* **Governing Statute:** Japan Road Traffic Act (*道路交通法*, Law No. 105 of 1960), **Article 33**, Paragraph 1 (Railway Level Crossings).
* **Official Sources:**
  - Japan Automobile Federation (JAF) — *Rules of the Road: Railway Crossings* (`https://english.jaf.or.jp/driving-in-japan/traffic-rules`)
  - Wikimedia Commons Standard Catalog: *Road signs in Japan* (`https://commons.wikimedia.org/wiki/Road_signs_in_Japan`)
* **Statutory Requirement:**
  > *"When a vehicle is about to pass through a railway level crossing, the driver must come to a complete stop immediately before the crossing (or immediately before the stop line if one exists), and must confirm that it is safe to proceed left and right before moving across."*
* **The Rule Delta (Cultural Vulnerability):**
  * In the Philippines and North America, motorists only stop at railway crossings when red signals are flashing, bells are chiming, or gates are descending. If barriers are up, drivers maintain momentum.
  * In Japan, coming to a **100% dead stop (0 km/h) before the white line is mandatory at every crossing**, regardless of whether barriers are up. Rolling through is an immediate moving violation.
* **Approved Short Alert:** `"Mandatory full stop before train tracks, even if gates are open."`

---

## 3. Philippines Legal Authorities & Verified Rules

### A. Philippines No Right Turn on Red
* **Identifier:** `ph-no-right-turn`
* **Official Code:** Philippine Regulatory Sign R3-13 (No Right Turn) / S2-6 (No Right Turn on Red Signal)
* **Governing Statute:** Republic Act No. 4136 (Land Transportation and Traffic Code), Chapter IV, Article I (Traffic Rules), complemented by Metro Manila Development Authority (MMDA) Regulation No. 96-005.
* **Official Sources:**
  - Land Transportation Office (LTO) — *Official Philippine Driver's Manual* (`https://lto.gov.ph`)
  - Wikipedia Standard Catalog: *Road signs in the Philippines* (`https://en.wikipedia.org/wiki/Road_signs_in_the_Philippines`)
* **Statutory Requirement:**
  > *"Vehicles facing a steady red signal must come to a complete stop before entering the crosswalk or intersection. Where a 'No Right Turn on Red' sign is erected, right turns on a red signal are strictly prohibited, and vehicles must wait until a green signal or green arrow is illuminated."*
* **The Rule Delta (Cultural Vulnerability):**
  * In many parts of the Philippines (and North America), drivers are accustomed to making a right turn on red after a temporary stop unless explicitly signed otherwise.
  * Where this regulatory prohibition sign is posted, drivers committing an illegal right turn face automated camera tickets (No Contact Apprehension) or traffic enforcer apprehension.
* **Approved Short Alert:** `"No right turn on red signal. Wait for the green light."`

---

## 4. Sign Asset Provenance & Licensing

All vector graphics in `frontend/public/signs/` represent official, standardized government road signs and are in the public domain under copyright laws governing standard legislative/regulatory symbols:

| Filename | Official Sign Code | Source Provenance & Catalog Reference | License / Public Domain Status |
| :--- | :--- | :--- | :--- |
| `jp-stop.svg` | Japan Sign No. 330-A / 330-B (一時停止) | [Wikimedia Commons: Road signs in Japan](https://commons.wikimedia.org/wiki/Road_signs_in_Japan) (File: `Japan_road_sign_330-B.svg`) | Public Domain (Official Government Symbol) |
| `jp-railway.svg` | Japan Sign No. 207-B (踏切あり) | [Wikimedia Commons: Road signs in Japan](https://commons.wikimedia.org/wiki/Road_signs_in_Japan) (File: `Japan_road_sign_207-B.svg`) | Public Domain (Official Government Symbol) |
| `ph-no-right-turn.svg` | Philippine Sign R3-13 / S2-6 (No Right Turn) | [Wikipedia: Road signs in the Philippines](https://en.wikipedia.org/wiki/Road_signs_in_the_Philippines) (File: `Philippines_road_sign_R3-13.svg`) | Public Domain (Official Government Symbol) |

---

## 5. Review & Audit Signoff

* **Reviewer:** John Asher Manit (`@99lash`)
* **Review Date:** 2026-09-24
* **Integrity Check:** All JSON definitions in `shared/rules/rules.json` precisely match the citations in this dossier.
