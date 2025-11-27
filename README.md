# Lynchian Weather Dreams

A surreal, generative atmospheric experience that transforms real-time weather data into an immersive audiovisual narrative using Google's Gemini models.

## Overview

This application allows users to select any location on Earth (or use "Auto Drift" mode) to generate a unique, mood-based report. The app fetches real-time weather telemetry and uses generative AI to create a stylistic monologue, a synthesized voice, and a generated scene image matching the location's current atmosphere.

## Features

-   **Multi-Thematic Engine**: Switch between three distinct directing styles:
    -   **The Dreamer (Lynch)**: Surreal, industrial, subconscious, eerie.
    -   **The Auteur (Wes)**: Symmetrical, pastel, dry wit, whimsical.
    -   **The Runner (Blade)**: Cyberpunk, neon, rain-slicked, dystopian.
-   **Interactive World Map**:
    -   Real-time Day/Night cycle visualization using solar terminator math.
    -   Live temperature tracking for major global cities.
    -   Local time calculation for city markers.
-   **Generative Pipeline**:
    -   **Narrative**: `gemini-2.5-flash` writes style-specific monologues.
    -   **Audio**: `gemini-2.5-flash-preview-tts` generates character voices (Fenrir, Puck, Charon).
    -   **Visuals**: `gemini-2.5-flash-image` creates atmospheric scenery.
-   **Performance**: Audio and Image generation run in parallel for near-instant playback.

## Tech Stack

-   **Frontend**: React 19, TypeScript
-   **Styling**: Tailwind CSS
-   **AI SDK**: `@google/genai`
-   **Weather Data**: Open-Meteo API (Free, non-commercial use)

## Architecture

### Services
-   `weatherService.ts`: Handles fetching local weather and batch fetching global city temperatures.
-   `geminiService.ts`: Manages interaction with Google GenAI. Handles prompts, system instructions, and decoding of binary media data.
-   `utils.ts`: Low-level AudioContext and Base64 decoding utilities.

### Components
-   `WorldMap.tsx`: Handles coordinate systems, solar position calculation, and map interactions.
-   `LynchPlayer.tsx`: A media player that visualizes audio frequencies and displays the generated atmospheric imagery.

## Configuration

The application requires a valid Google GenAI API Key available in the environment as `process.env.API_KEY`.

## Usage

1.  **Select a Theme**: Use the buttons in the header to switch aesthetics.
2.  **Explore**: Click anywhere on the map to trigger a generation for that specific coordinate.
3.  **Auto Drift**: Toggle "Auto Drift" to let the system randomly "teleport" to new locations every minute.

## Credits

-   Weather data provided by [Open-Meteo.com](https://open-meteo.com/).
-   Maps via Wikimedia Commons (Public Domain).
-   Generative Models by Google DeepMind.
