document.addEventListener("DOMContentLoaded", () => {
  //  const CDN_URL = "https://cdn.jsdelivr.net/gh/gamepage-web/unssets@main/";
  const CDN_URL = "https://raw.githubusercontent.com/gamepage-web/unssets/main/";
  let gamesData = null;
  let descriptionsData = null;

  // Inputs
  const titleIn = document.getElementById("game-title");
  const spineFontIn = document.getElementById("spine-font");
  const spineFontSizeIn = document.getElementById("spine-font-size");
  const descIn = document.getElementById("game-desc");
  const seriesIn = document.getElementById("series-title");
  const diffIn = document.getElementById("difficulty");
  const ageIn = document.getElementById("param-age");
  const timeIn = document.getElementById("param-time");
  const depthIn = document.getElementById("box-depth");
  const solutionIn = document.getElementById("solution-url");
  const fImageIn = document.getElementById("front-image");
  const bImageIn = document.getElementById("back-image");
  const flapsImageIn = document.getElementById("flaps-image");
  const fThumb = document.getElementById("front-thumb");
  const bThumb = document.getElementById("back-thumb");
  const flapsThumb = document.getElementById("flaps-thumb");
  const printBtn = document.getElementById("print-btn");
  const showDieline = document.getElementById("show-dieline");
  const bgColIn = document.getElementById("box-bg-color");

  // Config
  const configNameIn = document.getElementById("config-name");
  const saveConfigBtn = document.getElementById("save-config-btn");
  const loadConfigSelect = document.getElementById("load-config-select");
  const loadConfigBtn = document.getElementById("load-config-btn");
  const deleteConfigBtn = document.getElementById("delete-config-btn");

  const gameSelector = document.getElementById("game-selector");
  const langSelector = document.getElementById("lang-selector");

  // Outputs
  const titleOutList = document.querySelectorAll(
    "#game-title-display, .game-title-spine",
  );
  const descOut = document.getElementById("back-desc-display");
  const seriesOutList = document.querySelectorAll(
    "#series-title-display, .series-title-spine",
  );
  const ageOutList = document.querySelectorAll(".out-age");
  const timeOutList = document.querySelectorAll(".out-time");
  const qrTextDisplay = document.getElementById("solution-url-display");
  const qrContainer = document.getElementById("qr-code");
  const locksFront = document.getElementById("locks-container");
  const locksSpineR = document.getElementById("spine-locks-right");
  const locksSpineL = document.getElementById("spine-locks-left");

  // Geometry outputs
  const bgFront = document.getElementById("bg-front");
  const bgBack = document.getElementById("bg-back");
  const topFlapImg = document.getElementById("top-flap-img");
  const botFlapImg = document.getElementById("bot-flap-img");
  const topFlapText = document.getElementById("top-flap-text");
  const botFlapText = document.getElementById("bot-flap-text");
  const printWrapper = document.getElementById("print-wrapper");
  const rootStyle = document.documentElement.style;

  let qrcodeInstance = null;

  const lockSVG = `<svg viewBox="0 0 24 24" width="3.5mm" height="3.5mm" fill="currentColor" style="margin-right:0.5mm">
      <path d="M12 2C9.2 2 7 4.2 7 7v3H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V7c0-2.8-2.2-5-5-5zm-3 5c0-1.7 1.3-3 3-3s3 1.3 3 3v3H9V7zm3 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    </svg>`;

  const lockSpineSVG = `<svg viewBox="0 0 24 24" width="7mm" height="7mm" fill="currentColor" style="transform: rotate(-90deg);">
      <path d="M12 2C9.2 2 7 4.2 7 7v3H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V7c0-2.8-2.2-5-5-5zm-3 5c0-1.7 1.3-3 3-3s3 1.3 3 3v3H9V7zm3 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    </svg>`;

  function updateLocks() {
    const d = parseInt(diffIn.value) || 1;
    let htmlFront = "";
    let htmlSpine = "";

    for (let i = 0; i < 3; i++) {
      const isActive = i < d;

      // Front locks (left-to-right logic: active is white, inactive is green)
      const colorFront = isActive ? "#fff" : "#1b8a5d";
      htmlFront += `<span style="color:${colorFront}">${lockSVG}</span>`;
    }

    // Spine locks (bottom-to-top logic matching rotation: [lock1, lock2, lock3])
    // Rendered top-to-bottom in flex-col = index 2, 1, 0.
    const activeColor = d === 1 ? "#4caf50" : d === 2 ? "#ff9800" : "#e63946";
    const spineIndexes = [2, 1, 0];
    spineIndexes.forEach((index) => {
      const isActive = index < d;
      const colorSpine = isActive ? activeColor : "#fff"; // Active color varies, inactive is white
      const shadowColor =
        isActive && d === 3 ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 1)";
      const filterStyle = `filter: drop-shadow(0 0 1px ${shadowColor});`;

      htmlSpine += `<span style="color:${colorSpine}; ${filterStyle}">${lockSpineSVG}</span>`;
    });

    if (locksFront) locksFront.innerHTML = htmlFront;
    if (locksSpineR) locksSpineR.innerHTML = htmlSpine;
    if (locksSpineL) locksSpineL.innerHTML = htmlSpine;
  }

  function updateTitle() {
    titleOutList.forEach(
      (el) => (el.textContent = titleIn.value.toUpperCase()),
    );
  }

  function updateDesc() {
    if (descOut) descOut.textContent = descIn.value;
  }

  function updateSeries() {
    seriesOutList.forEach(
      (el) => (el.textContent = seriesIn.value.toUpperCase()),
    );
    // Use setTimeout to ensure DOM updates before measuring
    setTimeout(adjustSeriesLetterSpacing, 0);
  }

  function adjustSeriesLetterSpacing() {
    const pairs = [
      {
        logo: document.querySelector(".logo-box h1"),
        series: document.getElementById("series-title-display"),
      },
      {
        logo: document.querySelector(".spine-bottom-brand .sb-title"),
        series: document.querySelector(".spine-bottom-brand .sb-sub"),
      },
      {
        logo: document.querySelector(".spine-bottom-brand-white .sbw-title"),
        series: document.querySelector(".spine-bottom-brand-white .sbw-sub"),
      },
    ];

    pairs.forEach((pair) => {
      if (!pair.logo || !pair.series) return;

      const text = pair.series.textContent.trim();
      if (text.length <= 1) {
        pair.series.style.letterSpacing = "0px";
        pair.series.style.marginRight = "0px";
        return;
      }

      // Reset spacing to measure natural width
      pair.series.style.letterSpacing = "0px";
      pair.series.style.marginRight = "0px";

      // Force layout recalculation
      void pair.series.offsetWidth;

      const targetWidth = pair.logo.offsetWidth;
      const currentWidth = pair.series.offsetWidth;

      const diff = targetWidth - currentWidth;
      let spacing = diff / (text.length - 1);

      if (spacing < -0.7) {
        spacing = -0.7;
      }

      pair.series.style.letterSpacing = spacing + "px";
      // Offset the extra space on the right of the last character to perfectly center visually
      pair.series.style.marginRight = "-" + spacing + "px";
    });
  }

  function updateAge() {
    ageOutList.forEach((el) => (el.textContent = ageIn.value + "+"));
  }

  function updateTime() {
    timeOutList.forEach((el) => (el.textContent = timeIn.value + "'"));
  }

  function updateQRCode() {
    if (!qrContainer || !solutionIn) return;
    const url = solutionIn.value;

    // try {
    //   const parsed = new URL(url);
    //   qrTextDisplay.textContent = parsed.hostname.replace("www.", "");
    // } catch (e) {
    //   qrTextDisplay.textContent = url.substring(0, 30);
    // }

    if (!qrcodeInstance) {
      qrcodeInstance = new QRCode(qrContainer, {
        text: url,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.L,
      });
    } else {
      qrcodeInstance.clear();
      qrcodeInstance.makeCode(url);
    }
  }

  function handleImageUpload(inputEl, imgOut, thumbOut) {
    const file = inputEl.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    imgOut.src = url;
    thumbOut.src = url;
    thumbOut.style.display = "block";
  }

  function handleFlapsImageUpload() {
    const file = flapsImageIn.files[0];
    if (!file) {
      topFlapImg.style.display = "none";
      botFlapImg.style.display = "none";
      topFlapImg.src = "";
      botFlapImg.src = "";
      flapsThumb.style.display = "none";
      topFlapText.style.display = "block";
      botFlapText.style.display = "block";
      return;
    }
    const url = URL.createObjectURL(file);
    topFlapImg.src = url;
    botFlapImg.src = url;
    topFlapImg.style.display = "block";
    botFlapImg.style.display = "block";
    flapsThumb.src = url;
    flapsThumb.style.display = "block";

    topFlapText.style.display = "none";
    botFlapText.style.display = "none";
  }

  function updateDieline() {
    let D = parseFloat(depthIn.value);
    if (isNaN(D) || D < 5) D = 10.4;

    rootStyle.setProperty("--depth-mm", D + "mm");

    // glue block max width 13mm
    let glueWidth = Math.min(D, 13);
    rootStyle.setProperty("--w-glue", glueWidth + "mm");
  }

  // --- CONFIG MANAGEMENT ---
  const CONFIG_KEY = "unlock_box_configs";

  function getConfigs() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveConfigs(configs) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(configs));
  }

  function updateConfigDropdown() {
    if (!loadConfigSelect) return;
    const configs = getConfigs();
    loadConfigSelect.innerHTML = '<option value="">-- Load Config --</option>';
    Object.keys(configs).forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      loadConfigSelect.appendChild(opt);
    });
  }

  function handleSaveConfig() {
    const name = configNameIn.value.trim();
    if (!name) {
      alert("Please enter a name for the configuration.");
      return;
    }

    const configs = getConfigs();
    configs[name] = {
      title: titleIn.value,
      spineFont: spineFontIn.value,
      spineFontSize: spineFontSizeIn.value,
      desc: descIn.value,
      series: seriesIn.value,
      difficulty: diffIn.value,
      age: ageIn.value,
      time: timeIn.value,
      depth: depthIn.value,
      solutionUrl: solutionIn.value,
      bgColor: bgColIn.value,
      showDieline: showDieline.checked,
    };

    saveConfigs(configs);
    updateConfigDropdown();
    loadConfigSelect.value = name;

    const origText = saveConfigBtn.textContent;
    saveConfigBtn.textContent = "Saved!";
    setTimeout(() => {
      saveConfigBtn.textContent = origText;
    }, 1500);
  }

  function handleLoadConfig() {
    const name = loadConfigSelect.value;
    if (!name) return;

    const configs = getConfigs();
    const config = configs[name];
    if (!config) return;

    if (config.title !== undefined) titleIn.value = config.title;
    if (config.spineFont !== undefined) {
      spineFontIn.value = config.spineFont;
      document.documentElement.style.setProperty("--spine-font", config.spineFont);
    }
    if (config.spineFontSize !== undefined) {
      spineFontSizeIn.value = config.spineFontSize;
      document.documentElement.style.setProperty(
        "--spine-font-size",
        config.spineFontSize + "mm"
      );
    }
    if (config.desc !== undefined) descIn.value = config.desc;
    if (config.series !== undefined) seriesIn.value = config.series;
    if (config.difficulty !== undefined) diffIn.value = config.difficulty;
    if (config.age !== undefined) ageIn.value = config.age;
    if (config.time !== undefined) timeIn.value = config.time;
    if (config.depth !== undefined) depthIn.value = config.depth;
    if (config.solutionUrl !== undefined) solutionIn.value = config.solutionUrl;
    if (config.bgColor !== undefined) {
      bgColIn.value = config.bgColor;
      document.documentElement.style.setProperty("--box-bg", config.bgColor);
    }
    if (config.showDieline !== undefined) {
      showDieline.checked = config.showDieline;
      if (config.showDieline) {
        printWrapper.classList.remove("dieline-hidden");
      } else {
        printWrapper.classList.add("dieline-hidden");
      }
    }

    configNameIn.value = name;

    updateTitle();
    updateDesc();
    updateSeries();
    updateAge();
    updateTime();
    updateQRCode();
    updateLocks();
    updateDieline();
  }

  function handleDeleteConfig() {
    const name = loadConfigSelect.value;
    if (!name) return;

    if (!confirm(`Delete configuration "${name}"?`)) return;

    const configs = getConfigs();
    delete configs[name];
    saveConfigs(configs);

    updateConfigDropdown();
    configNameIn.value = "";
  }

  // Bindings
  titleIn.addEventListener("input", updateTitle);
  spineFontIn.addEventListener("input", (e) => {
    document.documentElement.style.setProperty("--spine-font", e.target.value);
  });
  spineFontSizeIn.addEventListener("input", (e) => {
    document.documentElement.style.setProperty(
      "--spine-font-size",
      e.target.value + "mm"
    );
  });
  descIn.addEventListener("input", updateDesc);
  seriesIn.addEventListener("input", updateSeries);
  ageIn.addEventListener("input", updateAge);
  timeIn.addEventListener("input", updateTime);
  solutionIn.addEventListener("input", updateQRCode);
  diffIn.addEventListener("change", updateLocks);
  depthIn.addEventListener("input", updateDieline);
  fImageIn.addEventListener("change", () =>
    handleImageUpload(fImageIn, bgFront, fThumb),
  );
  bImageIn.addEventListener("change", () =>
    handleImageUpload(bImageIn, bgBack, bThumb),
  );
  flapsImageIn.addEventListener("change", handleFlapsImageUpload);

  showDieline.addEventListener("change", (e) => {
    if (e.target.checked) {
      printWrapper.classList.remove("dieline-hidden");
    } else {
      printWrapper.classList.add("dieline-hidden");
    }
  });

  bgColIn.addEventListener("input", (e) => {
    document.documentElement.style.setProperty("--box-bg", e.target.value);
  });

  printBtn.addEventListener("click", () => {
    const originalTitle = document.title;
    document.title = `Unlock! ${titleIn.value.trim()}. Box`;
    window.print();
    document.title = originalTitle;
  });

  if (saveConfigBtn) saveConfigBtn.addEventListener("click", handleSaveConfig);
  if (loadConfigBtn) loadConfigBtn.addEventListener("click", handleLoadConfig);
  if (deleteConfigBtn) deleteConfigBtn.addEventListener("click", handleDeleteConfig);

  // --- GAME DATA FETCHING ---
  async function initGameData() {
    try {
      const [unlockRes, descRes] = await Promise.all([
        fetch(`${CDN_URL}GameData/Unlock.json`),
        fetch(`${CDN_URL}GameData/descriptions.json`)
      ]);
      gamesData = await unlockRes.json();
      descriptionsData = await descRes.json();
      populateGameSelector();
    } catch (e) {
      console.error("Failed to fetch game data:", e);
    }
  }

  function populateGameSelector() {
    if (!gamesData || !gameSelector) return;

    // Clear and add default option
    gameSelector.innerHTML = '<option value="">-- Choose a Game --</option>';

    gamesData.boxes.forEach(box => {
      if (box.visible === "False") return;

      const group = document.createElement("optgroup");
      group.label = box.displayName || box.ID;

      box.adventures.forEach(advId => {
        const opt = document.createElement("option");
        opt.value = advId;
        // Use nameEn from descriptions.json if available, otherwise fallback to advId
        const displayName = (descriptionsData[advId] && descriptionsData[advId].nameEn)
          ? descriptionsData[advId].nameEn
          : advId;
        opt.textContent = displayName;
        opt.dataset.boxId = box.ID;
        group.appendChild(opt);
      });

      gameSelector.appendChild(group);
    });
  }

  async function handleGameChange() {
    const gameId = gameSelector.value;
    const lang = langSelector.value;
    if (!gameId) return;

    try {
      // 1. Fetch Game Manifest for difficulty and skin
      const manifestRes = await fetch(`${CDN_URL}GameData/${gameId}/${gameId}.json`);
      const manifest = await manifestRes.json();

      // 2. Fetch Locale for title
      let title = gameId;
      try {
        const langMap = { "en": "English", "fr": "French", "uk": "Ukrainian", "ru": "Russian" };
        const fullLang = langMap[lang] || "English";
        const localeRes = await fetch(`${CDN_URL}GameData/${gameId}/Locale/${fullLang}/locale.json`);
        const locale = await localeRes.json();
        title = locale.localizations.title || gameId;
      } catch (e) {
        console.warn(`Locale not found for ${gameId} in ${lang}`);
        if (manifest.displayName) title = manifest.displayName;
      }

      // 3. Get Description
      const desc = (descriptionsData[gameId] && descriptionsData[gameId][lang])
        ? descriptionsData[gameId][lang]
        : (descriptionsData[gameId] && descriptionsData[gameId]["en"]) || "";

      // 4. Update Form
      titleIn.value = title;
      descIn.value = desc;
      if (manifest.difficulty) diffIn.value = manifest.difficulty;
      if (manifest.maxTime) {
        timeIn.value = Math.round(parseInt(manifest.maxTime) / 60);
      }

      // Box ID determines series title
      const selectedOpt = gameSelector.options[gameSelector.selectedIndex];
      const boxId = selectedOpt.dataset.boxId;

      // Set Box Depth based on box type
      if (boxId === "Short" || boxId === "Demos") {
        depthIn.value = 10;
      } else {
        depthIn.value = 13;
      }

      const box = gamesData.boxes.find(b => b.ID === boxId);
      seriesIn.value = (box.displayName || box.ID).toUpperCase();

      // Update Images from CDN
      const frontUrl = `${CDN_URL}images/icons/${gameId}.png`;
      const backUrl = `${CDN_URL}Skins/${manifest.skinName || gameId}_fond.jpg`;

      bgFront.src = frontUrl;
      bgBack.src = backUrl;

      // Update thumbnails
      fThumb.src = frontUrl;
      fThumb.style.display = "block";
      bThumb.src = backUrl;
      bThumb.style.display = "block";

      // Trigger updates
      updateTitle();
      updateDesc();
      updateSeries();
      updateLocks();
      updateTime();
      updateDieline();
      updateQRCode();

    } catch (e) {
      console.error("Error loading game data:", e);
    }
  }

  gameSelector.addEventListener("change", handleGameChange);
  langSelector.addEventListener("change", handleGameChange);

  // Init
  initGameData();
  updateTitle();
  updateDesc();
  updateSeries();
  updateAge();
  updateTime();
  updateQRCode();
  updateLocks();
  updateDieline();
  updateConfigDropdown();

  // Adjust letter spacing after custom fonts are loaded
  if (document.fonts) {
    document.fonts.ready.then(adjustSeriesLetterSpacing);
  } else {
    window.addEventListener("load", adjustSeriesLetterSpacing);
  }
});
