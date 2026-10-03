if (new URLSearchParams(window.location.search).has("print-pdf")) {
  document.documentElement.classList.add("print-pdf-mode");
}

document.querySelectorAll(".fragment.hidden").forEach((el) => {
  el.classList.remove("fragment");
  el.removeAttribute("data-fragment-index");
});

Reveal.initialize({
  width: 1280,
  height: 720,
  margin: 0.07,
  hash: true,
  controls: true,
  progress: true,
  slideNumber: "c/t",
  transition: "slide",
  pdfSeparateFragments: false,
  pdfMaxPagesPerSlide: 1,
  plugins: [RevealMath.MathJax3],
  mathjax3: {
    tex: {
      inlineMath: [["$", "$"], ["\\(", "\\)"]],
      displayMath: [["$$", "$$"], ["\\[", "\\]"]],
      processEscapes: true,
      macros: {
        mA: "{\\boldsymbol A}",
        mB: "{\\boldsymbol B}",
        mC: "{\\boldsymbol C}",
        mE: "{\\boldsymbol E}",
        mF: "{\\boldsymbol F}",
        mD: "{\\boldsymbol D}",
        mL: "{\\boldsymbol L}",
        mId: "{\\boldsymbol I}",
        mH: "{\\boldsymbol H}",
        mK: "{\\boldsymbol K}",
        mP: "{\\boldsymbol P}",
        mQ: "{\\boldsymbol Q}",
        mR: "{\\boldsymbol R}",
        mS: "{\\boldsymbol S}",
        mExp: "{\\boldsymbol{\\mathcal{E}}}",
        mDelta: "{\\boldsymbol \\Delta}",
        mU: "{\\boldsymbol U}",
        mZ: "{\\boldsymbol Z}",
        R: "\\mathbb{R}",
        C: "\\mathbb{C}",
        N: "\\mathbb{N}",
        E: "\\mathbb{E}",
        P: "\\mathbb{P}",
        one: "\\mathbb{1}",
        diag: "\\operatorname{\\bf diag}",
        e: "\\mathrm{e}",
        d: "\\mathrm{d}",
        up: "\\uparrow",
        down: "\\downarrow",
        U: ["{{#1}\\uparrow{#2}}", 2],
        D: ["{{#1}\\downarrow{#2}}", 2],
        UD: ["{{#1}\\!\\underset{#3}{\\uparrow}\\!{#2}}", 3],
        DU: ["{{#1}\\!\\overset{#2}{\\downarrow}\\!{#3}}", 3],
        tU: "\\widetilde{U}",
        tmU: "\\widetilde{\\mU}",
        tZ: "\\widetilde{Z}",
        tmZ: "\\widetilde{\\mZ}",
        cK: "\\mathcal{K}",
        cR: "\\mathcal{R}",
        cS: "\\mathcal{S}",
        upord: "\\mathord{\\upharpoonright}",
        calD: "\\mathcal{D}",
        calL: "\\mathcal{L}",
        disteq: "\\stackrel{\\rm dist}{=}",
        veca: "\\boldsymbol{a}",
        vecp: "\\boldsymbol{p}",
        vecv: "\\boldsymbol{v}",
        vecz: "\\boldsymbol{z}",
        vecgamma: "\\boldsymbol{\\gamma}",
        Exp: "\\operatorname{Exp}",
        mred: ["{\\color{red}{#1}}", 1],
        mgreen: ["{\\color{green}{#1}}", 1]
      }
    },
    options: {
      skipHtmlTags: ["script", "noscript", "style", "textarea", "pre"]
    }
  }
});


const model = {
  Env_size: 3,
  Env_tr_prob: [
    [0, 0.7, 0.3],
    [0.5, 0, 0.5],
    [1, 0, 0]
  ],
  p_vec: [0.7, 0.5, 0.8],
  lambda_vec: [1.0, 2.0, 0.7],
  c_vec: [1.0, 1.5, 0.8]
};

const path = {
  type: "free",
  parameters: {
    start_value: 2.0,
    start_env: 0
  },
  noise: {
    seed: 12345
  }
};

sample_path_generator(model, path, 80);
const finalTime = path.sample_path[path.sample_path.length - 1][0];
const plot = document.getElementById("plot");
const svg_debug = document.getElementById("svg-debug");
const hideFutureTimes = document.getElementById("hide-future-times");
const playSimulation = document.getElementById("play-simulation");
const playbackSpeed = finalTime / 6; // process-time units per second

let currentUpToTime = finalTime / 2;
let isSimulationPlaying = false;
let animationFrame = null;
let lastFrameTime = null;

function render_simulated_path() {
  const svgString = graph(model, path.sample_path, {
    width: 1200,
    up_to_time: currentUpToTime,
    future_color: hideFutureTimes.checked ? "none" : "#d1d5db"
  });

  plot.innerHTML = svgString;
  // svg_debug.textContent = svgString;
}

function set_play_button_state(isPlaying) {
  isSimulationPlaying = isPlaying;
  playSimulation.classList.toggle("is-playing", isPlaying);
  playSimulation.setAttribute("aria-label", isPlaying ? "Pause simulation" : "Play simulation");
  playSimulation.setAttribute("title", isPlaying ? "Pause simulation" : "Play simulation");
}

function stop_simulation() {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  lastFrameTime = null;
  set_play_button_state(false);
}

function advance_simulation(timestamp) {
  if (!isSimulationPlaying) return;

  if (lastFrameTime === null) {
    lastFrameTime = timestamp;
  }

  const dt = (timestamp - lastFrameTime) / 1000;
  lastFrameTime = timestamp;
  currentUpToTime = Math.min(finalTime, currentUpToTime + playbackSpeed * dt);

  render_simulated_path();

  if (currentUpToTime >= finalTime) {
    stop_simulation();
    hideFutureTimes.checked = false;
    render_simulated_path();
    return;
  }

  animationFrame = requestAnimationFrame(advance_simulation);
}

hideFutureTimes.addEventListener("change", render_simulated_path);
playSimulation.addEventListener("click", () => {
  if (isSimulationPlaying) {
    stop_simulation();
    return;
  }

  if (currentUpToTime >= finalTime) {
    currentUpToTime = 0;
  }

  render_simulated_path();
  set_play_button_state(true);
  animationFrame = requestAnimationFrame(advance_simulation);
});

render_simulated_path();
