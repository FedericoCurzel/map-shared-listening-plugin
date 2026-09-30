/**
 * jspsych-map-shared-listening
 * 
 * A jsPsych plugin for creating a simulated online shared listening experience.
 * Features:
 *  - Interactive map with participant location markers
 *  - Social synchronization phase (finding other listeners)
 *  - Countdown synchronization before playback
 *  - Real-time slider data collection
 *  - Web Audio API + HTML5 Audio fallback
 *  - JATOS integration support
 *  - Fully responsive dark theme design
 * 
 * @author [Federico Curzel/University of Pavia]
 * @version 1.0.0 - light
 * 
 * DEPENDENCIES:
 *   - Leaflet.js v1.0+ (for map rendering)
 *   - Leaflet CSS
 *   - jsPsych v6.0+
 *   - Modern browser with Web Audio API support
 * 
 * USAGE EXAMPLE:
 *   jsPsych.init({
 *     timeline: [{
 *       type: 'map-shared-listening',
 *       country: 'italy',
 *       audio: 'audio/sample.mp3',
 *       num_people_connected: 5,
 *       pre_synchro_phase: 'yes',
 *       slider_labels: ['Not at all', 'Extremely']
 *     }]
 *   });
 */

jsPsych.plugins['map-shared-listening'] = (function() {

  var plugin = {};
  jsPsych.pluginAPI.registerPreload('map-shared-listening', 'audio', 'audio');

  // ─────────────────────────────────────────────────────────────────────────
  // COUNTRY DATA: Accurate city coordinates WITHIN country boundaries
  // ─────────────────────────────────────────────────────────────────────────
  var COUNTRY_DATA = {
    'italy': {
      center: [41.8719, 12.5674], zoom: 5,
      cities: [
        {lat:41.9028, lon:12.4964},   // Rome
        {lat:45.4642, lon:9.1900},    // Milan
        {lat:40.8518, lon:14.2681},   // Naples
        {lat:45.0703, lon:7.6869},    // Turin
        {lat:38.1157, lon:13.3615},   // Palermo
        {lat:44.4056, lon:8.9463},    // Genoa
        {lat:44.4949, lon:11.3426},   // Bologna
        {lat:43.7696, lon:11.2558},   // Florence
        {lat:41.1171, lon:16.8719},   // Bari
        {lat:37.5079, lon:15.0830},   // Catania
        {lat:45.4408, lon:12.3155},   // Venice
        {lat:45.4384, lon:10.9916},   // Verona
        {lat:39.2181, lon:9.1670},    // Cagliari
        {lat:43.1122, lon:12.3889},   // Perugia
        {lat:42.3515, lon:13.3959}    // L'Aquila
      ]
    },
    'france': {
      center: [46.2276, 2.2137], zoom: 5,
      cities: [
        {lat:48.8566, lon:2.3522},    // Paris
        {lat:43.2965, lon:5.3698},    // Marseille
        {lat:45.7640, lon:4.8357},    // Lyon
        {lat:43.6047, lon:1.4442},    // Toulouse
        {lat:43.7102, lon:7.2620},    // Nice
        {lat:47.2184, lon:-1.5536},   // Nantes
        {lat:48.5734, lon:7.7561},    // Strasbourg
        {lat:43.6108, lon:3.8767},    // Montpellier
        {lat:44.8378, lon:-0.5792},   // Bordeaux
        {lat:50.6292, lon:3.0573},    // Lille
        {lat:48.1173, lon:-1.6778},   // Rennes
        {lat:49.2583, lon:4.0347},    // Reims
        {lat:42.6977, lon:2.8960},    // Perpignan
        {lat:43.1309, lon:-2.9263},   // Bayonne
        {lat:45.5017, lon:2.6361}     // Clermont-Ferrand
      ]
    },
    'germany': {
      center: [51.1657, 10.4515], zoom: 5,
      cities: [
        {lat:52.5200, lon:13.4050},   // Berlin
        {lat:53.5511, lon:9.9937},    // Hamburg
        {lat:48.1351, lon:11.5820},   // Munich
        {lat:50.9365, lon:6.9589},    // Cologne
        {lat:50.1109, lon:8.6821},    // Frankfurt
        {lat:48.7758, lon:9.1829},    // Stuttgart
        {lat:51.4556, lon:7.0116},    // Düsseldorf
        {lat:51.4556, lon:7.0116},    // Essen
        {lat:51.1657, lon:10.4515},   // Erfurt
        {lat:49.4521, lon:11.0767},   // Nuremberg
        {lat:54.3161, lon:10.1348},   // Kiel
        {lat:51.0504, lon:13.7373},   // Dresden
        {lat:48.3705, lon:10.8978},   // Augsburg
        {lat:51.2277, lon:6.7735},    // Düsseldorf-Mettmann
        {lat:50.8250, lon:6.5113}     // Aachen
      ]
    },
    'spain': {
      center: [40.4637, -3.7492], zoom: 5,
      cities: [
        {lat:40.4168, lon:-3.7038},   // Madrid
        {lat:41.3851, lon:2.1734},    // Barcelona
        {lat:39.4699, lon:-0.3763},   // Valencia
        {lat:37.3891, lon:-5.9845},   // Seville
        {lat:39.6741, lon:-0.6271},   // Alicante
        {lat:36.7213, lon:-4.4215},   // Málaga
        {lat:37.9922, lon:-1.1307},   // Murcia
        {lat:43.2627, lon:-2.9253},   // Bilbao
        {lat:42.0582, lon:-8.7261},   // Santiago de Compostela
        {lat:41.6488, lon:-0.8891},   // Zaragoza
        {lat:39.4699, lon:-0.3763},   // Valencia
        {lat:37.1885, lon:-3.6313},   // Granada
        {lat:37.7794, lon:-3.1855},   // Jaén
        {lat:41.3821, lon:-0.1228},   // Lleida
        {lat:39.0469, lon:-2.7458}    // Cuenca
      ]
    },
    'uk': {
      center: [55.3781, -3.4360], zoom: 5,
      cities: [
        {lat:51.5074, lon:-0.1278},   // London
        {lat:52.4862, lon:-1.8904},   // Birmingham
        {lat:53.8008, lon:-1.5491},   // Leeds
        {lat:55.8642, lon:-4.2518},   // Glasgow
        {lat:52.2394, lon:-0.8811},   // Leicester
        {lat:52.0391, lon:-0.7592},   // Nottingham
        {lat:51.7520, lon:-1.2577},   // Oxford
        {lat:53.4808, lon:-2.2426},   // Manchester
        {lat:53.4129, lon:-1.4829},   // Sheffield
        {lat:51.4545, lon:-3.2066},   // Cardiff
        {lat:54.5973, lon:-1.6242},   // Durham
        {lat:53.3498, lon:-1.1743},   // York
        {lat:50.9222, lon:-1.4105},   // Southampton
        {lat:50.7184, lon:-1.8738},   // Portsmouth
        {lat:51.6033, lon:-0.0076}    // Waltham Forest
      ]
    },
    'usa': {
      center: [37.0902, -95.7129], zoom: 4,
      cities: [
        {lat:40.7128, lon:-74.0060},  // New York
        {lat:34.0522, lon:-118.2437}, // Los Angeles
        {lat:41.8781, lon:-87.6298},  // Chicago
        {lat:29.7604, lon:-95.3698},  // Houston
        {lat:33.4484, lon:-112.0742}, // Phoenix
        {lat:39.9526, lon:-75.1652},  // Philadelphia
        {lat:33.7490, lon:-84.3880},  // Atlanta
        {lat:34.5199, lon:-92.4623},  // Little Rock
        {lat:47.6062, lon:-122.3321}, // Seattle
        {lat:39.7392, lon:-104.9903}, // Denver
        {lat:41.2524, lon:-95.9979},  // Omaha
        {lat:44.9778, lon:-93.2650},  // Minneapolis
        {lat:39.1582, lon:-119.7674}, // Reno
        {lat:35.0895, lon:-106.6055}, // Albuquerque
        {lat:32.7157, lon:-117.1611}  // San Diego
      ]
    },
    'netherlands': {
      center: [52.1326, 5.2913], zoom: 7,
      cities: [
        {lat:52.3676, lon:4.9041},    // Amsterdam
        {lat:51.9225, lon:4.4792},    // Rotterdam
        {lat:52.0116, lon:5.8652},    // Utrecht
        {lat:52.1326, lon:5.2913},    // Apeldoorn
        {lat:51.5429, lon:4.8116},    // Breda
        {lat:51.6134, lon:5.2858},    // Eindhoven
        {lat:53.2181, lon:6.5622},    // Groningen
        {lat:51.4401, lon:5.4737}     // 's-Hertogenbosch
      ]
    },
    'belgium': {
      center: [50.5039, 4.4699], zoom: 7,
      cities: [
        {lat:50.8503, lon:4.3517},    // Brussels
        {lat:51.2194, lon:4.4025},    // Antwerp
        {lat:50.6292, lon:5.5849},    // Liège
        {lat:50.4501, lon:3.8196},    // Mons
        {lat:51.1912, lon:3.2239}     // Bruges
      ]
    },
    'switzerland': {
      center: [46.8182, 8.2275], zoom: 7,
      cities: [
        {lat:47.3769, lon:8.5472},    // Zurich
        {lat:46.9479, lon:7.4474},    // Bern
        {lat:46.2044, lon:6.1432},    // Geneva
        {lat:45.1896, lon:5.7245},    // Grenoble
        {lat:46.4481, lon:10.2066}    // Lugano
      ]
    },
    'portugal': {
      center: [39.3999, -8.2245], zoom: 5,
      cities: [
        {lat:38.7223, lon:-9.1393},   // Lisbon
        {lat:41.1579, lon:-8.6291},   // Porto
        {lat:40.2046, lon:-8.4291},   // Covilhã
        {lat:38.5320, lon:-7.2660},   // Évora
        {lat:37.0142, lon:-7.9365}    // Faro
      ]
    },
    'europe': {
      center: [54.5973, 15.2551], zoom: 4,
      cities: [
        {lat:51.5074, lon:-0.1278},   // London, UK
        {lat:48.8566, lon:2.3522},    // Paris, France
        {lat:52.5200, lon:13.4050},   // Berlin, Germany
        {lat:41.9028, lon:12.4964},   // Rome, Italy
        {lat:40.4168, lon:-3.7038},   // Madrid, Spain
        {lat:47.3769, lon:8.5472},    // Zurich, Switzerland
        {lat:50.8503, lon:4.3517},    // Brussels, Belgium
        {lat:52.3676, lon:4.9041},    // Amsterdam, Netherlands
        {lat:55.7558, lon:37.6173},   // Moscow, Russia
        {lat:45.8150, lon:15.9819},   // Zagreb, Croatia
        {lat:59.3293, lon:18.0686},   // Stockholm, Sweden
        {lat:52.2297, lon:21.0122},   // Warsaw, Poland
        {lat:47.4979, lon:19.0402},   // Budapest, Hungary
        {lat:48.2082, lon:16.3738},   // Vienna, Austria
        {lat:50.0875, lon:14.4190}    // Prague, Czech Republic
      ]
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PLUGIN METADATA (jsPsych v6 standard)
  // ─────────────────────────────────────────────────────────────────────────
  plugin.info = {
    name: 'map-shared-listening',
    description: 'Display an interactive map with shared listening experience, social sync phase, and synchronized audio playback',
    parameters: {
      prompt: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Prompt',
        default: '',
        description: 'HTML to display above the map'
      },
      audio: {
        type: jsPsych.plugins.parameterType.AUDIO,
        pretty_name: 'Audio',
        default: undefined,
        description: 'Audio file to play during trial'
      },
      audio_delay: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Audio delay',
        default: 0,
        description: 'Delay before audio playback (ms)'
      },
      slider_min: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Slider minimum',
        default: 0,
        description: 'Minimum slider value'
      },
      slider_max: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Slider maximum',
        default: 100,
        description: 'Maximum slider value'
      },
      slider_start: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Slider starting value',
        default: 50,
        description: 'Initial slider position'
      },
      slider_step: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Slider step',
        default: 1,
        description: 'Slider increment value'
      },
      slider_labels: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Slider labels',
        default: [],
        array: true,
        description: 'Labels for left and right ends of slider'
      },
      slider_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Slider width',
        default: null,
        description: 'Custom slider width in pixels'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'Maximum trial duration (ms), null for no limit'
      },
      trial_ends_after_audio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Trial ends after audio',
        default: true,
        description: 'If true, trial ends when audio finishes'
      },
      intervalSaveData: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Data save interval',
        default: 500,
        description: 'Interval for recording slider values (ms)'
      },
      pre_synchro_phase: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Social sync phase',
        default: 'no',
        description: "Show social synchronization phase ('yes' or 'no')"
      },
      num_people_connected: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Number of people connected',
        default: 0,
        description: 'Number of simulated listeners to display'
      },
      country: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Country',
        default: 'italy',
        description: 'Country to display on map'
      },
      use_jatos: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Use JATOS',
        default: false,
        description: 'Save data to JATOS if available'
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // GLOBAL STYLES (responsive dark theme with animations)
  // ─────────────────────────────────────────────────────────────────────────
  var STYLE_ID = 'map-shared-listening-styles';
  function injectGlobalStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

      :root {
        --bg:      #f8fafc;
        --surface: #ffffff;
        --card:    #ffffff;
        --border:  rgba(0,0,0,0.08);
        --accent:  #6366f1; /* Indigo-500 */
        --accent2: #8b5cf6;
        --text:    #1e293b;
        --muted:   #64748b;
        --w:       min(620px, calc(100vw - 20px));
        --mh:      min(380px, calc(var(--w) * 0.61));
      }

      @media (max-width: 900px) {
        :root { --w: min(100vw - 16px, 600px); --mh: min(360px, calc(var(--w) * 0.60)); }
      }

      @media (max-width: 650px) {
        :root { --w: calc(100vw - 12px); --mh: min(280px, calc((100vw - 12px) * 0.48)); }
      }

      html, body {
        margin: 0; padding: 0;
        background: var(--bg);
        min-height: 100vh;
      }

      #jspsych-target, .jspsych-display-element {
        background: var(--bg) !important;
        font-family: 'DM Sans', sans-serif !important;
        color: var(--text) !important;
      }

      .msl-card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      }

      @keyframes msl-fadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes msl-pulse {
        0%,100% { transform: scale(1);    opacity: 1; }
        50%     { transform: scale(1.15); opacity: 0.7; }
      }
      @keyframes msl-ripple {
        0%   { transform: scale(0.8); opacity: 0.5; }
        100% { transform: scale(2.4); opacity: 0; }
      }
      @keyframes msl-countPop {
        0%   { transform: scale(0.65); opacity: 0; }
        65%  { transform: scale(1.08); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes msl-glow {
        0%,100% { box-shadow: 0 0 14px var(--accent); }
        50%     { box-shadow: 0 0 32px var(--accent), 0 0 56px rgba(192,132,252,0.3); }
      }
      @keyframes msl-waveBar {
        0%,100% { height: 5px; }
        50%     { height: 22px; }
      }

      .msl-eq {
        display: inline-flex;
        align-items: flex-end;
        gap: 3px;
        height: 28px;
      }
      .msl-eq span {
        display: block;
        width: 4px;
        border-radius: 2px;
        background: linear-gradient(to top, var(--accent2), var(--accent));
        animation: msl-waveBar 0.8s ease-in-out infinite;
      }
      .msl-eq span:nth-child(2) { animation-delay: 0.15s; }
      .msl-eq span:nth-child(3) { animation-delay: 0.30s; }
      .msl-eq span:nth-child(4) { animation-delay: 0.10s; }
      .msl-eq span:nth-child(5) { animation-delay: 0.25s; }

      .msl-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.2);
        color: var(--accent);
        border-radius: 999px;
        padding: clamp(6px, 2vw, 8px) clamp(14px, 3vw, 18px);
        font-size: clamp(14px, 2.8vw, 16px);
        letter-spacing: 0.03em;
      }
      .msl-pill-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--accent);
        animation: msl-pulse 1.2s infinite;
      }

      #msl-map {
        width: var(--w) !important;
        height: var(--mh) !important;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid var(--border);
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        margin-bottom: 24px;
      }
      #msl-map .leaflet-tile { filter: none ! important; }

      .msl-slider-card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: clamp(20px, 4vw, 28px) clamp(26px, 5vw, 36px);
        width: var(--w);
        box-sizing: border-box;
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      }

      .msl-range {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 8px;
        border-radius: 999px;
        background: linear-gradient(to right,
          var(--accent) 0%, var(--accent) var(--val, 50%),
          #e2e8f0 var(--val, 50%), #e2e8f0 100%);
        outline: none;
        cursor: pointer;
      }
      .msl-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, #e9d5ff, var(--accent));
        border: 2px solid rgba(255,255,255,0.25);
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .msl-range:hover::-webkit-slider-thumb,
      .msl-range:active::-webkit-slider-thumb {
        transform: scale(1.3);
        box-shadow: 0 0 22px rgba(192,132,252,1);
      }
      .msl-range::-moz-range-track {
        background: transparent;
        border: none;
      }
      .msl-range::-moz-range-thumb {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, #e9d5ff, var(--accent));
        border: 2px solid rgba(255,255,255,0.25);
        box-shadow: 0 0 14px rgba(192,132,252,0.8);
        cursor: pointer;
      }

      @media (max-width: 650px) {
        .msl-card { padding: clamp(32px, 6vw, 48px) clamp(20px, 6vw, 36px) !important; }
        .msl-pill { font-size: clamp(12px, 2.5vw, 14px); padding: 5px 12px; }
        #msl-map { margin-bottom: 14px; }
        .msl-slider-card { padding: clamp(16px, 3vw, 22px) clamp(18px, 4vw, 28px); }
        .msl-range { height: 10px; }
        .msl-range::-webkit-slider-thumb { width: 32px; height: 32px; }
        .msl-range::-moz-range-thumb { width: 32px; height: 32px; }
      }
    `;
    document.head.appendChild(s);
  }

  /**
   * Wrapper for centering content both horizontally and vertically
   */
  function centerWrap(inner) {
    return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                        min-height:100vh;padding:clamp(16px, 3vw, 40px);width:100%;box-sizing:border-box;">
              ${inner}
            </div>`;
  }

  /**
   * Save data to JATOS if available
   */
  function saveDataToJATOS(data) {
    if (typeof jatos !== 'undefined' && jatos.submitResultData) {
      jatos.submitResultData(data, function() {
        console.log('Data saved to JATOS');
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RANDOM INTERVALS (for distributing listener count increments)
  // ─────────────────────────────────────────────────────────────────────────
  function randomIntervals(n, total) {
    if (n <= 0) return [];
    if (n === 1) return [total];
    var cuts = [];
    for (var i = 0; i < n - 1; i++) cuts.push(Math.random() * total);
    cuts.sort(function(a, b) { return a - b; });
    var intervals = [];
    var prev = 0;
    for (var i = 0; i < cuts.length; i++) {
      intervals.push(cuts[i] - prev);
      prev = cuts[i];
    }
    intervals.push(total - prev);
    return intervals;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SOCIAL SYNCHRONIZATION PHASE
  // ─────────────────────────────────────────────────────────────────────────
  function runSocialSync(display_element, trial, callback) {
    var target = trial.num_people_connected;
    var TOTAL_MS = 6000;
    var CONNECTED_DISPLAY_MS = 3000;

    if (target === 0) {
      display_element.innerHTML = centerWrap(`
        <div class="msl-card" style="padding:clamp(32px, 7vw, 52px) clamp(28px, 8vw, 56px);text-align:center;max-width:min(500px, 95vw);animation:msl-fadeUp 0.7s both;">
          <div style="position:relative;display:inline-block;margin-bottom:clamp(24px, 5vw, 36px);">
            <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--accent2),var(--accent));display:flex;align-items:center;justify-content:center;animation:msl-glow 2s infinite;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <div style="position:absolute;inset:clamp(-12px, -3vw, -18px);border-radius:50%;border:2px solid var(--accent);opacity:0.45;animation:msl-ripple 1.9s ease-out infinite;"></div>
          </div>
          <h2 style="font-family:'DM Serif Display',serif;font-size:clamp(20px, 5.5vw, 28px);font-weight:400;margin:0 0 8px;color:var(--text);">Searching for listeners</h2>
          <p style="color:var(--muted);font-size:clamp(13px, 3.2vw, 16px);margin:0 0 clamp(20px, 4vw, 32px);line-height:1.6;">Looking for available participants…</p>
          <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:14px;padding:clamp(14px, 3vw, 20px) clamp(20px, 5vw, 32px);display:inline-block;min-width:160px;margin-bottom:clamp(18px, 4vw, 24px);">
            <div id="msl-user-count" style="font-size:clamp(44px, 11vw, 64px);font-weight:600;line-height:1;background:linear-gradient(135deg,var(--accent2),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:msl-pulse 1.5s infinite;">0</div>
            <div style="font-size:clamp(10px, 2.2vw, 12px);color:var(--muted);margin-top:6px;letter-spacing:0.06em;text-transform:uppercase;">listeners found</div>
          </div>
          <div><div class="msl-eq"><span></span><span></span><span></span><span></span><span></span></div></div>
        </div>
      `);

      setTimeout(function() {
        var card = display_element.querySelector('.msl-card');
        if (card) { card.style.transition='opacity 0.4s'; card.style.opacity=0; }

        setTimeout(function() {
          display_element.innerHTML = centerWrap(`
            <div class="msl-card" style="padding:clamp(28px, 5vw, 44px) clamp(28px, 8vw, 56px);text-align:center;max-width:min(540px, 95vw);animation:msl-fadeUp 0.5s both;">
              <div style="font-size:clamp(40px, 10vw, 56px);margin-bottom:clamp(14px, 3vw, 20px);">⏸️</div>
              <h3 style="font-family:'DM Serif Display',serif;font-size:clamp(18px, 4.5vw, 26px);font-weight:400;margin:0 0 12px;color:var(--text);">No other listeners available</h3>
              <p style="color:var(--muted);font-size:clamp(13px, 3vw, 16px);line-height:1.7;margin:0;">Unfortunately, we could not find any other participant connected at this time. You will proceed with the listening experience on your own.</p>
            </div>
          `);
        }, 500);

        setTimeout(callback, CONNECTED_DISPLAY_MS + 800);
      }, 2500);
      return;
    }

    // ── NORMAL CASE: 1+ USERS ──────────────────────────────────
    display_element.innerHTML = centerWrap(`
      <div class="msl-card" style="padding:clamp(32px, 7vw, 52px) clamp(28px, 8vw, 56px);text-align:center;max-width:min(500px, 95vw);animation:msl-fadeUp 0.7s both;">
        <div style="position:relative;display:inline-block;margin-bottom:clamp(24px, 5vw, 36px);">
          <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--accent2),var(--accent));display:flex;align-items:center;justify-content:center;animation:msl-glow 2s infinite;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <div style="position:absolute;inset:clamp(-12px, -3vw, -18px);border-radius:50%;border:2px solid var(--accent);opacity:0.45;animation:msl-ripple 1.9s ease-out infinite;"></div>
        </div>
        <h2 style="font-family:'DM Serif Display',serif;font-size:clamp(20px, 5.5vw, 28px);font-weight:400;margin:0 0 8px;color:var(--text);">Searching for listeners</h2>
        <p style="color:var(--muted);font-size:clamp(13px, 3.2vw, 16px);margin:0 0 clamp(20px, 4vw, 32px);line-height:1.6;">Finding available participants…</p>
        <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:14px;padding:clamp(14px, 3vw, 20px) clamp(20px, 5vw, 32px);display:inline-block;min-width:160px;margin-bottom:clamp(18px, 4vw, 24px);">
          <div id="msl-user-count" style="font-size:clamp(44px, 11vw, 64px);font-weight:600;line-height:1;background:linear-gradient(135deg,var(--accent2),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:msl-pulse 1.5s infinite;">1</div>
          <div style="font-size:clamp(10px, 2.2vw, 12px);color:var(--muted);margin-top:6px;letter-spacing:0.06em;text-transform:uppercase;">listeners found</div>
        </div>
        <div><div class="msl-eq"><span></span><span></span><span></span><span></span><span></span></div></div>
      </div>
    `);

    // ── Distribute increments ──
    if (target >= 2) {
      var steps = target - 1;
      var budget = 5500;
      var intervals = randomIntervals(steps, budget);
      var accumulated = 0;

      for (var i = 0; i < steps; i++) {
        accumulated += intervals[i];
        (function(cnt, delay) {
          setTimeout(function() {
            var el = display_element.querySelector('#msl-user-count');
            if (el) el.textContent = cnt;
          }, delay);
        })(i + 2, accumulated);
      }
    }

    // ── After 6s: show "all connected" ──
    setTimeout(function() {
      var card = display_element.querySelector('.msl-card');
      if (card) { card.style.transition='opacity 0.4s'; card.style.opacity=0; }

      setTimeout(function() {
        display_element.innerHTML = centerWrap(`
          <div class="msl-card" style="padding:clamp(28px, 5vw, 40px) clamp(28px, 6vw, 56px);text-align:center;animation:msl-fadeUp 0.5s both;">
            <div style="font-size:clamp(32px, 8vw, 48px);margin-bottom:clamp(12px, 2vw, 18px);">🎶</div>
            <div class="msl-pill">
              <div class="msl-pill-dot"></div>
              All ${target} listeners connected
            </div>
          </div>
        `);
      }, 500);

      setTimeout(callback, CONNECTED_DISPLAY_MS + 800);
    }, TOTAL_MS);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COUNTDOWN PHASE
  // ─────────────────────────────────────────────────────────────────────────
  function runCountdown(display_element, callback) {
    var n = 3;

    function show(val) {
      var isGo = (val === 'Go!');
      display_element.innerHTML = centerWrap(`
        <div style="text-align:center;animation:msl-fadeUp 0.3s both;">
          <div style="font-size:clamp(12px, 2.8vw, 16px);letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);margin-bottom:clamp(16px, 3vw, 28px);">Synchronising playback</div>
          <div style="font-family:'DM Serif Display',serif;font-size:clamp(72px, 20vw, 110px);line-height:0.85;background:linear-gradient(135deg,var(--accent2),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:msl-countPop 0.38s cubic-bezier(.34,1.56,.64,1) both;">${val}</div>
          ${!isGo ? `<div class="msl-eq" style="margin-top:clamp(16px, 3vw, 32px);"><span></span><span></span><span></span><span></span><span></span></div>` : ''}
        </div>
      `);
    }

    show(n);
    var interval = setInterval(function() {
      n--;
      if (n > 0) show(n);
      else if (n === 0) show('Go!');
      else { clearInterval(interval); setTimeout(callback, 320); }
    }, 1000);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN TRIAL
  // ─────────────────────────────────────────────────────────────────────────
  function startMainTrial(display_element, trial) {

    // ── Audio setup (Web Audio API + HTML5 fallback) ──
    var context = jsPsych.pluginAPI.audioContext();
    var source, audio;
    var audioStarted = false;
    
    // Try Web Audio API first
    if (context !== null && trial.audio) {
      try {
        source = context.createBufferSource();
        source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.audio);
        source.connect(context.destination);
      } catch(e) {
        console.warn('Web Audio setup failed:', e);
        source = null;
      }
    }
    
    // Prepare HTML5 Audio as fallback
    if (trial.audio) {
      audio = new Audio();
      audio.crossOrigin = "anonymous";
      
      if (trial.audio.includes('.mp3')) {
        audio.src = trial.audio;
      } else if (trial.audio.includes('.wav')) {
        audio.src = trial.audio;
      } else if (trial.audio.includes('.ogg')) {
        audio.src = trial.audio;
      } else {
        audio.src = trial.audio + '.mp3';
      }
      
      audio.preload = "auto";
      audio.volume = 1.0;
    }

    var leftLabel = (trial.slider_labels && trial.slider_labels[0]) || '';
    var rightLabel = (trial.slider_labels && trial.slider_labels[1]) || '';

    var mapWidth = Math.min(620, window.innerWidth - 20);
    var mapHeight = Math.min(380, Math.round(mapWidth * 0.61));

    display_element.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:clamp(10px, 2vw, 18px) clamp(6px, 1vw, 10px) clamp(20px, 3vw, 30px);animation:msl-fadeUp 0.5s both;width:100%;box-sizing:border-box;min-height:100vh;overflow-y:auto;">

      ${trial.prompt ? `<div style="max-width:var(--w);text-align:center;margin-bottom:clamp(10px, 1.8vw, 14px);font-size:clamp(14px, 2.8vw, 16px);color:var(--muted);line-height:1.6;">${trial.prompt}</div>` : ''}

      ${trial.pre_synchro_phase === 'yes' && trial.num_people_connected > 0 ? `
      <div class="msl-pill" style="margin-bottom:clamp(10px, 1.8vw, 14px);">
        <div class="msl-pill-dot"></div>
        <span>${trial.num_people_connected} people listening now</span>
      </div>` : ''}

      <!-- MAP -->
      <div id="msl-map" style="flex-shrink: 0;"></div>

      <!-- SLIDER CARD -->
      <div class="msl-slider-card" style="flex-shrink: 0;">
        <div style="font-size:clamp(11px, 2.2vw, 13px);letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);text-align:center;margin-bottom:clamp(10px, 1.8vw, 14px);">Rate your pleasure</div>
        <input type="range" class="msl-range" id="msl-slider"
               min="${trial.slider_min}" max="${trial.slider_max}"
               value="${trial.slider_start}" step="${trial.slider_step}"
               style="width:100%;box-sizing:border-box;">
        <div style="display:flex;justify-content:space-between;margin-top:clamp(6px, 1.5vw, 10px);font-size:clamp(12px, 2vw, 13px);color:var(--muted);">
          <span>${leftLabel}</span>
          <span>${rightLabel}</span>
        </div>
      </div>
    </div>
    `;

    // ── Slider gradient fill ──
    var sliderEl = display_element.querySelector('#msl-slider');
    function updateFill() {
      var pct = ((sliderEl.value - trial.slider_min) / (trial.slider_max - trial.slider_min)) * 100;
      sliderEl.style.setProperty('--val', pct + '%');
    }
    updateFill();
    sliderEl.addEventListener('input', updateFill);

    // ── Leaflet map ──
    var countryInfo = COUNTRY_DATA[trial.country] || COUNTRY_DATA['italy'];
    var mapEl = display_element.querySelector('#msl-map');
    mapEl.style.width = mapWidth + 'px';
    mapEl.style.height = mapHeight + 'px';

    var map = L.map('msl-map', {
      zoomControl: false, dragging: false, scrollWheelZoom: false,
      doubleClickZoom: false, boxZoom: false, keyboard: false,
      tap: false, touchZoom: false, attributionControl: false
    }).setView(countryInfo.center, countryInfo.zoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 19
    }).addTo(map);

    setTimeout(function() { map.invalidateSize(); }, 100);

    // ── Music markers ──
    var pinColors = ['#c084fc', '#818cf8', '#34d399', '#fbbf24', '#f472b6'];

    function musicNoteIcon(idx) {
      var col = pinColors[idx % pinColors.length];
      var svg = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">',
        '<defs><filter id="g"><feGaussianBlur stdDeviation="1.8" result="b"/>',
        '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>',
        '<path d="M18 2C9.7 2 3 8.7 3 17c0 10.5 15 27 15 27s15-16.5 15-27C33 8.7 26.3 2 18 2z" fill="' + col + '" filter="url(#g)" opacity="0.92"/>',
        '<g transform="translate(10.5,7.5)" fill="white" opacity="0.95">',
        '<rect x="8" y="0.5" width="2.4" height="10.5" rx="1.2"/>',
        '<rect x="8" y="0.5" width="7.5" height="2.2" rx="1.1"/>',
        '<ellipse cx="5" cy="11" rx="4" ry="2.7"/>',
        '</g></svg>'
      ].join('');
      return L.icon({
        iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg),
        iconSize: [36, 46],
        iconAnchor: [18, 46]
      });
    }

    function getRandomCoords() {
      var c = countryInfo.cities[Math.floor(Math.random() * countryInfo.cities.length)];
      return [
        c.lat + (Math.random() - 0.5) * 0.24,
        c.lon + (Math.random() - 0.5) * 0.24
      ];
    }

    // ── Add markers ──
    for (var i = 0; i < trial.num_people_connected; i++) {
      (function(idx) {
        setTimeout(function() {
          L.marker(getRandomCoords(), { icon: musicNoteIcon(idx) }).addTo(map);
        }, idx * 200);
      })(i);
    }

    // ── Data logging ──
    var trialData = { time: [], slider_values: [] };
    var startTime = performance.now();
    var intervalId = setInterval(function() {
      trialData.time.push(performance.now() - startTime);
      var s = display_element.querySelector('#msl-slider');
      if (s) trialData.slider_values.push(parseInt(s.value));
    }, trial.intervalSaveData);

    function end_trial() {
      clearInterval(intervalId);
      if (map) map.remove();
      display_element.innerHTML = '';
      
      if (trial.use_jatos) {
        saveDataToJATOS(trialData);
      }
      
      jsPsych.finishTrial(trialData);
    }

    // ── Audio playback ──
    jsPsych.pluginAPI.setTimeout(function() {
      console.log('Starting audio playback...');
      
      // Try Web Audio first
      if (context !== null && source && !audioStarted) {
        try {
          console.log('Using Web Audio API');
          source.start(0);
          source.onended = end_trial;
          audioStarted = true;
          return;
        } catch(e) {
          console.warn('Web Audio start failed:', e);
        }
      }
      
      // Fallback to HTML5 Audio
      if (audio && !audioStarted) {
        console.log('Using HTML5 Audio element');
        
        audio.volume = 1.0;
        var playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(function() {
              console.log('✓ Audio playing');
              audioStarted = true;
            })
            .catch(function(err) {
              console.warn('Audio autoplay blocked (browser policy):', err.message);
              console.log('Continuing experiment - audio may require user interaction');
              
              // Show subtle click-to-play hint
              var hint = document.createElement('div');
              hint.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(192,132,252,0.2); border: 1px solid rgba(192,132,252,0.5); padding: 12px 20px; border-radius: 8px; color: #c084fc; font-family: DM Sans; font-size: 12px; z-index: 9999; text-align: center;';
              hint.innerHTML = '🔊 Click to enable audio';
              document.body.appendChild(hint);
              
              // Click anywhere to enable audio
              var enable_audio = function() {
                audio.play().catch(function(err2) {
                  console.log('Audio still blocked');
                });
                hint.remove();
                document.removeEventListener('click', enable_audio);
              };
              
              document.addEventListener('click', enable_audio);
              audio.onended = end_trial;
              audioStarted = true;
            });
        } else {
          // Older browsers
          audio.play();
          audioStarted = true;
          console.log('Audio started (older browser)');
        }
        
        audio.onended = end_trial;
      }
      
      if (!audioStarted) {
        console.warn('⚠ Audio could not be started, but continuing with trial...');
      }
    }, trial.audio_delay);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PLUGIN ENTRY POINT
  // ─────────────────────────────────────────────────────────────────────────
  plugin.trial = function(display_element, trial) {
    injectGlobalStyles();
    
    // Start experiment with optional pre-synchronization phase
    if (trial.pre_synchro_phase === 'yes') {
      runSocialSync(display_element, trial, function() {
        runCountdown(display_element, function() {
          startMainTrial(display_element, trial);
        });
      });
    } else {
      startMainTrial(display_element, trial);
    }
  };

  return plugin;
})();
