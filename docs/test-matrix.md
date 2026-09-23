# RoamRight Test Matrix & Verification Plan

**Document Owner:** John Asher Manit (`@99lash`)
**Scope:** Test Cases for Sign Recognition, Rule Integrity, Spoken Guidance, and Unknown Input Handling
**Target:** RoamRight MVP Gates 2 & 3 Verification
**Last Updated:** 2026-09-24

---

## 1. Overview & Purpose

This test matrix defines the canonical verification criteria for RoamRight's rule-grounded guidance subsystem. Its purpose is to guarantee that:
1. Every recognized candidate sign correctly maps to a verified, source-reviewed rule record in `shared/rules/rules.json`.
2. Spoken alerts match approved text without truncation, hallucination, or distortion.
3. Unsupported, ambiguous, or non-traffic images strictly resolve to `status: "unknown"` with zero invented advice.

---

## 2. Test Execution Matrix

| Test ID | Input Image / Scenario | Target Country | Expected Sign ID | Expected Status | Expected Short Alert | Verification Target |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-JP-01** | `jp-stop.svg` (Clear daylight, frontal) | `JP` | `jp-stop` | `recognized` | *"Full stop before the white line. Check both directions before moving."* | Rule record lookup, speech alert, UI card |
| **TC-JP-02** | `jp-stop` (Angled 30°, lower lighting) | `JP` | `jp-stop` | `recognized` | *"Full stop before the white line. Check both directions before moving."* | Gemini OCR robustness on Kanji (`止まれ`) |
| **TC-JP-03** | `jp-railway.svg` (Yellow diamond, frontal) | `JP` | `jp-railway` | `recognized` | *"Mandatory full stop before train tracks, even if gates are open."* | Railway crossing Article 33 enforcement |
| **TC-PH-01** | `ph-no-right-turn.svg` (Red slash circle) | `PH` | `ph-no-right-turn` | `recognized` | *"No right turn on red signal. Wait for the green light."* | Philippine LTO / MMDA turn restriction |
| **TC-NEG-01** | Speed Limit 50 Sign (Circular Japanese sign) | `JP` | `null` | `unknown` | *No spoken audio; UI shows "Unrecognized sign"* | Strict whitelist check (unsupported sign) |
| **TC-NEG-02** | Pedestrian Walking / Non-Traffic Object | `JP` / `PH` | `null` | `unknown` | *No spoken audio; UI shows "No sign detected"* | Zero hallucination safety rule |
| **TC-CROSS-01** | `ph-no-right-turn.svg` while driving in Japan | `JP` | `null` | `unknown` | *No spoken audio* | Country boundary enforcement (foreign sign mismatch) |

---

## 3. Protocol for Live Stationary Demonstration (Pitch Day)

During the AppCon 2026 judging demonstration, the team will execute the live test sequence using stationary camera input:

```
[ Step 1: Baseline ] ➔ [ Step 2: Positive Recognition ] ➔ [ Step 3: Rule Retrieval ] ➔ [ Step 4: Spoken Alert ] ➔ [ Step 5: Negative Handling ]
```

1. **Step 1: System Baseline:** Start RoamRight session, select `Origin: Philippines`, `Destination: Japan`. Destination map renders Japan driving context.
2. **Step 2: Stationary Target Presentation:** Present `jp-stop.svg` to the laptop webcam / phone camera at a distance of 30–50 cm.
3. **Step 3: Server Recognition:** Backend validates image via Gemini, matches sign ID `jp-stop`, and loads verified record from `shared/rules/rules.json`.
4. **Step 4: User Output:**
   * UI displays: `Stop (止まれ)`.
   * Web Speech / Audio plays: *"Full stop before the white line. Check both directions before moving."*
   * Parked mode card expands to show legal reference: *Japan Road Traffic Act Article 43* and JAF source link.
5. **Step 5: Negative Control Proof:** Present an unsupported sign (e.g. Speed Limit 50 or blank surface). Verify that RoamRight safely reports `unknown` and emits no advice.

---

## 4. Defect Severity & Pass/Fail Criteria

* **Blocker (P0):** Any test case where an unknown sign yields invented traffic guidance (hallucination violation of `AGENTS.md`).
* **Critical (P1):** A valid candidate sign fails to match its `rules.json` record or emits speech text differing from `shortAlert`.
* **Major (P2):** Camera frame sampling causes noticeable audio stutter or unreleased video stream memory leaks.
* **Minor (P3):** Styling imperfections on sign badge display in secondary device previews.
