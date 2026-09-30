---
editor_options: 
  markdown: 
    wrap: 200
---

# jspsych-map-shared-listening: Complete Publication Guide

**Version:** 1.0.0\
**Last Updated:** 18-06-2026\
**For:** jsPsych v6 with JATOS Integration

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Quick Navigation

-   [Getting Started](#getting-started)
-   [File Setup](#file-setup)
-   [Understanding the Code](#understanding-the-code)
-   [Customization Guide](#customization-guide)
-   [Testing](#testing)
-   [Publication Checklist](#publication-checklist)
-   [Data Interpretation](#data-interpretation)

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

This guide is intended to provide a general and easy overview for including the plugin in your experiments. The structure and examples will follow the one of the short demo provided with the plugin.
This could be a starting point for understanding the architecture of a jsPsych online experiment, and for trying to adapt this, step-by-step, to your experimental needs. We also provide some general
ideas about information provided by the collected data, and some practical hints.

## Getting Started {#getting-started}

### What You Have

1.  **jspsych-map-shared-listening.js** — The main plugin (here you have both a dark and a light version)
2.  **experiment.html** — Your experiment template (here you have **experiment_demo.html**, the same used in the demo you can try)
3.  The jsPsych folder for creating a study (the one used for realizing the demo)
4.  **Audio files** — Your music stimulus files
5.  **This guide** — Step-by-step instructions

### What This Does (experiment Demo)

Your experiment will: 1. Present fullscreen mode request 2. Play calibration audio (volume test) 3. Run the main listening task with interactive map 4. Collect continuous slider responses 5. Ask
overall ratings questions 6. Ask for eventual comments 7. Save all data to JATOS

**Total duration:** \~8-12 minutes (depending on audio length)

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## File Setup {#file-setup}

### Directory Structure

```         
your-experiment/
├── experiment.html              ← Your main file (provided)
├── jspsych-map-shared-listening.js   ← Plugin file
├── jspsych/                     ← jsPsych installation
│   ├── jspsych.js
│   ├── css/jspsych.css
│   └── plugins/
│       ├── jspsych-fullscreen.js
│       ├── jspsych-audio-button-response.js
│       ├── jspsych-multiple-slider.js
│       └── ... other plugins
├── media/
│   ├── 1883.mp3                 ← Calibration audio
│   ├── 1394.mp3                 ← Main stimulus audio
│   └── img/
│       ├── brainote.png
│       └── casque.png (headphones icon)
└── jatos.js                     ← JATOS library (from JATOS)
```

### Step 1: Copy Files to Your JATOS Study Component

In JATOS: 1. Create new Study 2. Add new HTML/JS component 3. Copy `experiment.html` content into the component's HTML editor 4. Copy `jspsych-map-shared-listening.js` into the component directory 5.
Upload audio files to component directory

### Step 2: Update File Paths

If your audio files are in a different location, update these lines in experiment.html:

**Current:**

``` javascript
stimulus: 'media/1883.mp3',   // Volume calibration audio
// ...
audio: 'media/1394.mp3',     // Main listening task audio
```

**Change to match your file structure:**

``` javascript
stimulus: 'your-path/calibration.mp3',
// ...
audio: 'your-path/stimulus.mp3',
```

### Step 3: Update Plugin Path

Ensure the plugin is correctly referenced. In the HTML head:

``` html
<!-- Should be in same directory as experiment.html -->
<script src="jspsych-map-shared-listening.js"></script>
```

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Understanding the Code {#understanding-the-code}

### Timeline Structure

Your experiment follows this flow:

```         
┌─────────────────────────────────────────────────────┐
│ 1. FULLSCREEN MODE                                  │
│    - Request fullscreen entry                       │
│    - Duration: ~5 seconds                           │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 2. VOLUME CALIBRATION                               │
│    - Play audio for headphone check                 │
│    - Participant adjusts volume                     │
│    - Duration: 30-60 seconds                        │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 3. MAIN LISTENING TASK (map-shared-listening)       │
│    - Social sync phase (if enabled)                 │
│    - Countdown phase                                │
│    - Play audio + collect slider responses          │
│    - Duration: length of audio + 10 seconds         │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 4. OVERALL RATINGS                                  │
│    - Pleasure, Valence, Arousal, Familiarity       │
│    - Duration: ~2-3 minutes                         │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 5. DATA SUBMISSION & FINISH                         │
│    - Save all data to JATOS                         │
│    - Thank you screen                               │
│    - Duration: ~5 seconds                           │
└─────────────────────────────────────────────────────┘
```

### Code Sections Explained

#### Section 1: Fullscreen Mode

``` javascript
timeline.push({
  type: "fullscreen",
  fullscreen_mode: true,  // Enter fullscreen
  message: "...",         // Instructions shown to participant
  button_label: "Enter Fullscreen"
});
```

**Why:** Fullscreen prevents distractions and ensures consistent experience

**Customization:**

``` javascript
message: "<p>Please enter fullscreen mode and ensure audio is working.</p>"
```

#### Section 2: Volume Calibration

``` javascript
timeline.push({
  type: 'audio-button-response',
  stimulus: 'media/1883.mp3',      // Audio file to play
  prompt: '...',                    // Instructions
  choices: ['Volume is good!'],     // Button text
  on_load: function() {
    // Auto-play audio (with fallback)
  }
});
```

**Why:** Ensures participant has proper audio setup before main task

**Customize the prompt:**

``` javascript
prompt: '<p>Adjust your headphone volume and click when ready.</p>',
```

#### Section 3: Main Listening Task

``` javascript
timeline.push({
  type: 'map-shared-listening',
  audio: 'media/1394.mp3',           // Your stimulus
  slider_labels: ['No pleasure', 'A lot of pleasure'],
  pre_synchro_phase: 'yes',          // Show sync phase
  num_people_connected: 6,           // Number of markers on map
  country: 'italy',                  // Which map to show
  audio_delay: 1000,                 // 1 sec before audio starts
  trial_ends_after_audio: true       // End when audio finishes
});
```

**This is where the plugin does its work:** - Shows map with 6 participant markers - Displays "searching for listeners" then "all connected" animations - Counts down 3-2-1-Go! - Plays audio while
collecting slider responses - Records timestamps and values

#### Section 4: Overall Ratings

``` javascript
var overall_ratings = {
  type: "multiple-slider",
  questions: [
    {
      prompt: "<p>Did you feel <b>pleasure</b>?</p>",
      name: "Overall_Pleasure",
      min: 0,
      max: 100,
      slider_start: 50
    },
    // ... more questions
  ]
};
timeline.push(overall_ratings);
```

**Questions included:** 1. Overall pleasure (liking) 2. Valence (sad ↔ joyful) 3. Arousal (calm ↔ energetic) 4. Familiarity (new ↔ well-known)

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Customization Guide {#customization-guide}

### How to Modify Your Experiment

#### Change the Audio File

Replace the stimulus path:

``` javascript
// CURRENT
audio: 'media/1394.mp3',

// CHANGE TO
audio: 'media/my-song.mp3',
```

#### Change the Number of Virtual Participants

``` javascript
// Show 6 other listeners
num_people_connected: 6,

// Change to show 10
num_people_connected: 10,

// Or 0 for solo listening (no social aspect)
num_people_connected: 0,
```

#### Change the Map Country

``` javascript
// Current: Italy
country: 'italy',

// Options: 'france', 'germany', 'spain', 'uk', 'usa', 
//          'netherlands', 'belgium', 'switzerland', 'portugal', 'europe'

country: 'france',
```

#### Change Slider Labels

``` javascript
// Current
slider_labels: ['No pleasure at all', 'A lot of pleasure'],

// Change to
slider_labels: ['Dislike', 'Like very much'],

// Or for different dimension
slider_labels: ['Sad', 'Happy'],
```

#### Change the Prompt Text

``` javascript
prompt: 'Listen carefully and move the slider to reflect your moment-to-moment pleasure with the music.',

// Change to
prompt: 'Rate how much you enjoy this music as you listen.',
```

#### Disable the Social Sync Phase

Remove or set to 'no':

``` javascript
// Current
pre_synchro_phase: 'yes',

// Change to
pre_synchro_phase: 'no',
```

This will skip the "searching for listeners" animation and go straight to the main trial.

#### Add Multiple Trials

To test multiple pieces of music:

``` javascript
// Trial 1
timeline.push({
  type: 'map-shared-listening',
  audio: 'media/song1.mp3',
  num_people_connected: 6,
  country: 'italy',
  slider_labels: ['No pleasure', 'A lot of pleasure'],
  pre_synchro_phase: 'yes'
});

// Trial 2
timeline.push({
  type: 'map-shared-listening',
  audio: 'media/song2.mp3',
  num_people_connected: 6,
  country: 'france',  // Different country for each
  slider_labels: ['No pleasure', 'A lot of pleasure'],
  pre_synchro_phase: 'yes'
});

// Trial 3
timeline.push({
  type: 'map-shared-listening',
  audio: 'media/song3.mp3',
  num_people_connected: 6,
  country: 'germany',
  slider_labels: ['No pleasure', 'A lot of pleasure'],
  pre_synchro_phase: 'yes'
});
```

Or you can create a list of songs, remember to RANDOMIZE the order of presentation, and include as a stimulus in one trial that will repeat for all songs. This will save space in the code, and if you
have a complex code structure in your experiment it might help.

#### Customize Overall Ratings Questions

Add your own questions:

``` javascript
questions: [
  {
    prompt: "<p>How much did you enjoy this music?</p>",
    name: "Enjoyment",
    labels: ["Not at all", "Very much"],
    min: 0,
    max: 100,
    slider_start: 50
  },
  {
    prompt: "<p>How energetic was this music?</p>",
    name: "Energy",
    labels: ["Very calm", "Very energetic"],
    min: 0,
    max: 100,
    slider_start: 50
  }
]
```

#### Change Slider Scale

``` javascript
// Current: 0-100 scale
slider_min: 0,
slider_max: 100,

// Change to: 1-7 scale
slider_min: 1,
slider_max: 7,

// Change to: -50 to +50
slider_min: -50,
slider_max: 50,
```

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Testing {#testing}

### Before Deploying to Participants

#### 1. Local Testing

``` bash
# If using a local server
python -m http.server 8000
# Then visit http://localhost:8000/experiment.html
```

#### 2. Test Checklist

-   [ ] Audio files play correctly
-   [ ] Map displays without errors
-   [ ] Slider responds to mouse/touch input
-   [ ] Data appears in browser console
-   [ ] Fullscreen works on your device
-   [ ] Responsive on mobile (if applicable)
-   [ ] All text is readable
-   [ ] No JavaScript errors (F12 → Console)

#### 3. Test on Multiple Browsers

| Browser | Desktop | Mobile | Status               |
|---------|---------|--------|----------------------|
| Chrome  | ✓ Test  | ✓ Test | Primary              |
| Firefox | ✓ Test  | ✓ Test | Secondary            |
| Safari  | ✓ Test  | ✓ Test | Note autoplay limits |
| Edge    | ✓ Test  | \-     | Optional             |

#### 4. Simulate JATOS Locally

If testing without JATOS, comment out JATOS code:

``` javascript
// Comment out for local testing
// jatos.onLoad(function () {
//   ...
// });

// Replace with
window.onload = function() {
  // ... rest of code
};
```

#### 5. Check Console for Errors

Press F12 or Cmd+Option+I to open developer tools: - Check **Console** tab for red errors - Check **Network** tab to confirm audio files load - Check **Application** → **Local Storage** for data

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Publication Checklist {#publication-checklist}

### Before Publishing Your Study

#### Code & Setup

-   [ ] All audio files uploaded and paths correct
-   [ ] Plugin file in correct location
-   [ ] JATOS integration enabled (use_jatos: true if applicable)
-   [ ] No console errors (F12)
-   [ ] Test completed on 2+ browsers
-   [ ] Test completed on mobile device (eventually)

#### Documentation

-   [ ] Study description written clearly
-   [ ] Instructions to participants are clear
-   [ ] Audio file metadata documented (artist, duration, BPM, etc.)
-   [ ] Consent form includes data collection details
-   [ ] License information included if applicable

#### Data Management

-   [ ] JATOS result storage configured
-   [ ] Data backup plan established
-   [ ] Analysis script prepared
-   [ ] Data dictionary created

#### Ethics & Compliance

-   [ ] IRB/Ethics approval obtained
-   [ ] Informed consent covers data collection
-   [ ] Participants know about map visualization
-   [ ] Participants understand data will be shared (if applicable)
-   [ ] GDPR compliance checked (if applicable)

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Data Interpretation {#data-interpretation}

### What Data You'll Get

Your experiment produces data in two main categories:

#### 1. Continuous Response Data (from map-shared-listening trial)

``` json
{
  "time": [0, 100, 200, 300, ...],
  "slider_values": [50, 52, 55, 53, ...]
}
```

**Interpretation:** - `time`: Milliseconds elapsed since audio started (1000 = 1 second) - `slider_values`: Slider position at each time point (0-100 or your scale)

**Example analysis:** - Calculate mean response: `mean(slider_values)` - Find peaks: Maximum and minimum values - Calculate stability: Standard deviation of values - Identify patterns: Response shape
over time

#### 2. Discrete Rating Data (from multiple-slider trial)

``` json
{
  "Overall_Pleasure": 78,
  "Overall_Valence": 62,
  "Overall_Arousal": 71,
  "Overall_Familiarity": 25
}
```

**Interpretation:** - **Pleasure**: How much participant enjoyed (hedonistic value) - **Valence**: Emotional tone (-sad/+joyful regardless of preference) - **Arousal**: Intensity level
(-calm/+energetic) - **Familiarity**: Recognition/prior exposure

### Typical Data Patterns

#### Pattern 1: Rising Pleasure

```         
Timeline: ────────────────────────
Slider:   50→55→60→68→72→75→78
```

**Meaning:** Participant found piece increasingly pleasurable over time

#### Pattern 2: Stable Preference

```         
Timeline: ────────────────────────
Slider:   68→67→69→68→70→69→68
```

**Meaning:** Consistent enjoyment throughout (low variability)

#### Pattern 3: Fluctuating Response

```         
Timeline: ────────────────────────
Slider:   45→60→35→70→40→65→50
```

**Meaning:** Response changes with music dynamics (probably high engagement)

### Statistical Analysis Possibilities (just to give some descriptives and ideas)

#### Descriptive Statistics

``` javascript
// Calculate key statistics
function analyzeSliderData(slider_values) {
  var mean = slider_values.reduce((a,b) => a+b) / slider_values.length;
  var max = Math.max(...slider_values);
  var min = Math.min(...slider_values);
  var range = max - min;
  
  var variance = slider_values.reduce((sum, val) => 
    sum + Math.pow(val - mean, 2), 0) / slider_values.length;
  var stdDev = Math.sqrt(variance);
  
  return {
    mean: mean,
    max: max,
    min: min,
    range: range,
    stdDev: stdDev
  };
}
```

#### Temporal Analysis

``` javascript
// Find when maximum pleasure occurred
function findPeakTime(times, slider_values) {
  var maxIndex = slider_values.indexOf(Math.max(...slider_values));
  return times[maxIndex];
}

// Calculate response trajectory (early vs late)
function earlyVsLate(slider_values) {
  var mid = Math.floor(slider_values.length / 2);
  var early = slider_values.slice(0, mid);
  var late = slider_values.slice(mid);
  
  var earlyMean = early.reduce((a,b) => a+b) / early.length;
  var lateMean = late.reduce((a,b) => a+b) / late.length;
  
  return {
    earlyMean: earlyMean,
    lateMean: lateMean,
    trajectory: lateMean - earlyMean  // Positive = increasing pleasure
  };
}
```

#### Correlation Analysis

``` javascript
// Correlate continuous and discrete data
// E.g., is mean pleasure (continuous) correlated with overall rating?

function correlate(x, y) {
  var n = x.length;
  var meanX = x.reduce((a,b) => a+b) / n;
  var meanY = y.reduce((a,b) => a+b) / n;
  
  var numerator = 0;
  var denomX = 0;
  var denomY = 0;
  
  for (var i = 0; i < n; i++) {
    var dx = x[i] - meanX;
    var dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  
  return numerator / Math.sqrt(denomX * denomY);
}
```

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Common Customizations

There could be a thousand customization possibilities. Here some of the easiest, reported in the easiest way. Remember that you can also potentially customize the plugin itself!

### Example 1: Different Music excerpts

``` javascript
// Example 
timeline.push({
  type: 'map-shared-listening',
  audio: 'media/sad-piece.mp3',
  slider_labels: ['Not sad', 'Very sad'],
  num_people_connected: 8,
  country: 'italy'
});

timeline.push({
  type: 'map-shared-listening',
  audio: 'media/happy-piece.mp3',
  slider_labels: ['Not happy', 'Very happy'],
  num_people_connected: 8,
  country: 'france'
});

timeline.push({
  type: 'map-shared-listening',
  audio: 'media/angry-piece.mp3',
  slider_labels: ['Not angry', 'Very angry'],
  num_people_connected: 8,
  country: 'germany'
});
```

It is easier to organize if you create lists of songs within one variable (e.g., you have a playlist for one condition).

### Example 2: Solo vs Social Listening

``` javascript
// Solo condition
timeline.push({
  type: 'map-shared-listening',
  audio: 'media/music.mp3',
  num_people_connected: 0,      // No other listeners
  pre_synchro_phase: 'no'        // No sync phase
});

// Social condition
timeline.push({
  type: 'map-shared-listening',
  audio: 'media/music.mp3',
  num_people_connected: 10,      // Many listeners
  pre_synchro_phase: 'yes'       // Full sync experience
});
```

You can have potentially many different group sizes. You can also play with randomizing numbers, ...

### Example 3: Quick Mobile-Optimized Version

``` javascript
timeline.push({
  type: 'map-shared-listening',
  audio: 'media/short-30sec.mp3',  // Shorter audio
  num_people_connected: 3,          // Fewer markers (less clutter)
  pre_synchro_phase: 'no',          // Skip sync (faster)
  slider_step: 5,                   // Discrete steps (easier on mobile)
  intervalSaveData: 500             // Less frequent sampling
});
```

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

The mobile version should be properly checked and the compatibility may depend also on other trials and plugin specifics.

## Troubleshooting

### "Audio won't play"

**Solution:** 1. Check file path is correct (case-sensitive on servers): `media/1394.mp3` not `Media/1394.MP3` 2. Try different format (MP3 → WAV → OGG) 3. Check file is valid: Play in browser tab
directly 4. Check CORS headers if on different domain

### "Map is blank"

**Solution:** 1. Ensure Leaflet CSS is loaded in HTML head 2. Ensure Leaflet JS is loaded 3. Check browser console (F12) for errors 4. Clear browser cache (Ctrl+Shift+Del)

### "Slider data not recording"

**Solution:** 1. Check interval: `intervalSaveData: 500` is reasonable 2. Check slider element exists in DOM 3. Open F12 → Console and check for JavaScript errors 4. Test with console.log:
`javascript    on_finish: function(data) {      console.log('Slider values:', data.slider_values);    }`

### "JATOS not saving data"

**Solution:** 1. Ensure in JATOS study component (not preview) 2. Check `jatos.submitResultData()` is called 3. Verify JATOS library loaded: Check F12 → Console for jatos object 4. Check JATOS server
logs

### "Fullscreen not working"

**Solution:** 1. Fullscreen requires HTTPS (or localhost for testing) 2. User must click button to enable (browser security) 3. Try different browser 4. Check browser fullscreen settings

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Publication & Citation

### How to Reference This Plugin

``` bibtex
@software{FedericoCurzel_2026_jspsych_shared-map-listening,
  author = {Federico Curzel},
  title = {jspsych-map-shared-listening: A jsPsych Plugin for Simulated Online Shared Listening Experiences},
  year = {2026},
  version = {1.0.0},
  url = {the DOI of this book chapter}
}
```

## Getting Help

### Resources

-   **jsPsych Official:** <https://www.jspsych.org/6.3/>
-   **Leaflet.js Docs:** <https://leafletjs.com/>
-   **JATOS Manual:** <https://www.jatos.org/>
-   **Plugin Repository:** currently OSF

### Report Issues

If you encounter problems: 1. Check browser console (F12 → Console) 2. Note error message exactly 3. Document steps to reproduce 4. Include: Browser, OS, plugin version

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Change Log

### v1.0.0 (2025)

-   Initial release
-   Full social synchronization
-   Real-time slider data collection
-   JATOS integration
-   Responsive design for all devices

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Ready to deploy!** 🎵

For questions or support, contact: federico.curzel\@unipv.it
