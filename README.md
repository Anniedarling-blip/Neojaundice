# NeoJaundice — Neonatal Jaundice Screening Web App

NeoJaundice is a clinical‑style neonatal jaundice screening prototype designed for early detection workflows in newborn care. The system simulates camera‑based jaundice assessment, structured neonatal data capture, risk scoring, and screening history tracking in a mobile‑first healthcare interface.

---

# Overview

Neonatal jaundice is one of the most common conditions in newborns. Early identification of risk is critical to prevent complications such as kernicterus and neurological damage. NeoJaundice demonstrates a digital screening workflow that can assist frontline health workers in low‑resource or community settings.

The application provides:

* Structured neonatal clinical data entry
* Camera‑assisted jaundice image capture simulation
* Clinical risk scoring model
* Visual risk classification
* Screening history tracking
* Clinical guidance and referral help

---

# Key Features

## Clinical Data Capture

* Baby demographics
* Birth details
* Feeding type
* Clinical observations
* Risk factors
* Auto age calculation from DOB + time
* Yes/No medical toggles

## Camera Screening Interface

* Camera preview layout
* Animated scan line
* Capture button pulse ring
* Lighting/framing guides

## Processing Simulation Pipeline

4‑step analysis animation:

1. Image normalization
2. Skin region detection
3. Color analysis
4. Risk estimation

Includes:

* Progress bar
* Step transitions
* Clinical processing UX

## Risk Assessment Engine

Weighted clinical scoring from:

* Skin yellowing
* Sclera involvement
* Preterm status
* Birth weight
* Phototherapy history

Risk bands:

* **Low Risk** (Green)
* **Moderate Risk** (Amber)
* **High Risk** (Red)

## Screening History

* Preloaded sample records
* Risk filters
* Chronological list
* Patient summary chips
* Detail drill‑down view

## Clinical Help System

Guidelines included:

* Image capture method
* Lighting requirements
* When to refer
* Screening protocol

---

# Screens

1. Home Dashboard
2. Neonatal Details Form
3. Image Capture
4. Processing
5. Result
6. Screening History
7. Record Detail
8. Help & Guidelines

All screens implemented and functional.

---

# Tech Stack

Frontend:

* HTML5
* CSS3 (clinical design system + animations)
* Vanilla JavaScript

Architecture:

* Single‑page app structure
* Screen containers in DOM
* In‑memory state store
* Navigation controller

---

# Project Structure

```
neojaundice/
│
├── index.html    # App shell and screen containers
├── index.css     # Clinical UI system and animations
├── app.js        # Navigation, form logic, risk scoring, history
└── assets/       # (optional future images/icons)
```

Project location (local):

```
C:\Users\SRM MADURAI\.gemini\antigravity\scratch\neojaundice\
```

---

# Screening Workflow

1. Start new screening
2. Enter neonatal details
3. Capture image
4. Processing animation
5. Risk classification
6. Save record
7. View history / detail

---

# Risk Scoring Logic (Conceptual)

Example weighting model:

```
risk_score =
  yellowing_level * 3 +
  sclera_involved * 3 +
  preterm * 2 +
  low_birth_weight * 2 +
  phototherapy_history * 1
```

Risk thresholds:

* 0–3 → Low
* 4–6 → Moderate
* 7+ → High

---

# UX / Design System

Clinical design principles:

* Healthcare color palette
* Risk‑consistent components
* High contrast readability
* Medical card layout
* Mobile‑first spacing

Risk colors used consistently:

* Green → Low
* Amber → Moderate
* Red → High

---

# Demo Data

The app includes 6 mock screening records with varied:

* Gestational status
* Yellowing levels
* Birth weight
* Risk outcomes

This supports testing of:

* Filters
* Detail view
* History UX

---

# Use Cases

NeoJaundice can demonstrate:

* Digital neonatal screening workflow
* AI‑assisted clinical decision UX
* Community health screening concept
* Pediatric triage interface
* Preventive healthcare app design

---

# Future Enhancements

Planned evolution path:

## Phase 1 — Functional Prototype

* Real camera API
* Image capture storage
* Persistent records (local storage)

## Phase 2 — AI Screening

* Skin color extraction model
* Jaundice classification model
* Edge/mobile inference

## Phase 3 — Clinical Platform

* Patient database (Firebase)
* Health worker login
* Screening analytics
* Referral integration

## Phase 4 — Deployment

* PWA offline support
* Field device optimization
* Clinical validation dataset

---

# Clinical Disclaimer

NeoJaundice is a prototype screening interface and not a diagnostic medical device. Clinical decisions must be made by qualified healthcare professionals using validated medical tools and bilirubin measurement.

---

# Author / Project Context

NeoJaundice was developed as a healthcare UX + AI screening concept demonstrating neonatal jaundice early detection workflow using a camera‑assisted interface.

---

# License

Prototype / academic / research demonstration use.

---

**NeoJaundice — Early Jaundice Risk Screening Interface for Newborn Care**
