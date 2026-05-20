document.addEventListener("DOMContentLoaded", () => {
  //  const CDN_URL = "https://cdn.jsdelivr.net/gh/gamepage-web/unssets@main/";
  const CDN_URL = "https://raw.githubusercontent.com/gamepage-web/unssets/main/";
  let gamesData = null;
  let descriptionsData = null;
  let logosData = null;
  let boxesData = null;

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
  const fThumbCont = document.getElementById("front-thumb-container");
  const bThumbCont = document.getElementById("back-thumb-container");
  const flapsThumbCont = document.getElementById("flaps-thumb-container");
  const printBtn = document.getElementById("print-btn");
  const showDieline = document.getElementById("show-dieline");
  const bgColIn = document.getElementById("box-bg-color");
  const foldColIn = document.getElementById("fold-color");
  const autoColorBtn = document.getElementById("auto-color-btn");
  const fScaleIn = document.getElementById("front-scale");
  const bScaleIn = document.getElementById("back-scale");

  // Config
  const configNameIn = document.getElementById("config-name");
  const saveConfigBtn = document.getElementById("save-config-btn");
  const loadConfigSelect = document.getElementById("load-config-select");
  const loadConfigBtn = document.getElementById("load-config-btn");
  const deleteConfigBtn = document.getElementById("delete-config-btn");

  const gameSelector = document.getElementById("game-selector");
  const langSelector = document.getElementById("lang-selector");

  // Gallery
  const galleryModal = document.getElementById("gallery-modal");
  const galleryGrid = document.getElementById("gallery-grid");
  const closeGalleryBtn = document.getElementById("close-gallery");
  const openFrontGalleryBtn = document.getElementById("open-front-gallery");
  const openBackGalleryBtn = document.getElementById("open-back-gallery");
  let currentGalleryTarget = null;
  let defaultFrontUrl = null;
  let defaultBackUrl = null;

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

  bgFront.crossOrigin = "anonymous";
  bgBack.crossOrigin = "anonymous";
  topFlapImg.crossOrigin = "anonymous";
  botFlapImg.crossOrigin = "anonymous";

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
        colorLight: "transparent",
        correctLevel: QRCode.CorrectLevel.L,
      });
    } else {
      qrcodeInstance.clear();
      qrcodeInstance.makeCode(url);
    }
  }

  function handleImageUpload(inputEl, imgOut, thumbOut, containerOut, scaleIn) {
    const file = inputEl.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    imgOut.src = url;
    thumbOut.src = url;
    if (containerOut) containerOut.style.display = "block";
    else thumbOut.style.display = "block";
    // Reset position & scale
    imgOut.style.setProperty("--obj-pos-x", "0px");
    imgOut.style.setProperty("--obj-pos-y", "0px");
    imgOut.style.setProperty("--obj-scale", "1.1");
    if (scaleIn) scaleIn.value = "1.1";
  }

  function handleFlapsImageUpload() {
    const file = flapsImageIn.files[0];
    if (!file) {
      topFlapImg.style.display = "none";
      botFlapImg.style.display = "none";
      topFlapImg.src = "";
      botFlapImg.src = "";
      flapsThumbCont.style.display = "none";
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
    flapsThumbCont.style.display = "block";

    topFlapText.style.display = "none";
    botFlapText.style.display = "none";
  }

  // --- IMAGE DRAGGING ---
  function initImageDragging(imgEl) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startPosX = 0;
    let startPosY = 0;

    const onStart = (e) => {
      if (!imgEl.src || imgEl.src === window.location.href) return;
      isDragging = true;
      startX = e.clientX || (e.touches && e.touches[0].clientX);
      startY = e.clientY || (e.touches && e.touches[0].clientY);

      const currentPosX = getComputedStyle(imgEl).getPropertyValue("--obj-pos-x");
      const currentPosY = getComputedStyle(imgEl).getPropertyValue("--obj-pos-y");

      startPosX = currentPosX ? parseFloat(currentPosX) : 0;
      startPosY = currentPosY ? parseFloat(currentPosY) : 0;

      imgEl.style.cursor = "grabbing";
      if (e.type === "mousedown") e.preventDefault();
    };

    const onMove = (e) => {
      if (!isDragging) return;
      const currentX = e.clientX || (e.touches && e.touches[0].clientX);
      const currentY = e.clientY || (e.touches && e.touches[0].clientY);

      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      imgEl.style.setProperty("--obj-pos-x", (startPosX + deltaX) + "px");
      imgEl.style.setProperty("--obj-pos-y", (startPosY + deltaY) + "px");
    };

    const onEnd = () => {
      if (isDragging) {
        isDragging = false;
        imgEl.style.cursor = "move";
      }
    };

    imgEl.addEventListener("mousedown", onStart);
    imgEl.addEventListener("touchstart", onStart, { passive: false });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onEnd);
  }

  initImageDragging(bgFront);
  initImageDragging(bgBack);

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

      const maxLength = 32;
      opt.textContent = name.length > maxLength
        ? name.substring(0, maxLength - 3) + "..."
        : name;
      opt.title = name;

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
      foldColor: foldColIn.value,
      showDieline: showDieline.checked,
      posFrontX: bgFront.style.getPropertyValue("--obj-pos-x"),
      posFrontY: bgFront.style.getPropertyValue("--obj-pos-y"),
      scaleFront: bgFront.style.getPropertyValue("--obj-scale"),
      posBackX: bgBack.style.getPropertyValue("--obj-pos-x"),
      posBackY: bgBack.style.getPropertyValue("--obj-pos-y"),
      scaleBack: bgBack.style.getPropertyValue("--obj-scale"),
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
    if (config.foldColor !== undefined) {
      foldColIn.value = config.foldColor;
      document.documentElement.style.setProperty("--fold-color", config.foldColor);
    }
    if (config.showDieline !== undefined) {
      showDieline.checked = config.showDieline;
      if (config.showDieline) {
        printWrapper.classList.remove("dieline-hidden");
      } else {
        printWrapper.classList.add("dieline-hidden");
      }
    }

    if (config.posFrontX) bgFront.style.setProperty("--obj-pos-x", config.posFrontX);
    if (config.posFrontY) bgFront.style.setProperty("--obj-pos-y", config.posFrontY);
    if (config.scaleFront) {
      bgFront.style.setProperty("--obj-scale", config.scaleFront);
      fScaleIn.value = config.scaleFront;
    }

    if (config.posBackX) bgBack.style.setProperty("--obj-pos-x", config.posBackX);
    if (config.posBackY) bgBack.style.setProperty("--obj-pos-y", config.posBackY);
    if (config.scaleBack) {
      bgBack.style.setProperty("--obj-scale", config.scaleBack);
      bScaleIn.value = config.scaleBack;
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
    if (config.spineFont !== undefined) {
      loadGoogleFont(config.spineFont);
    }
    updateAutoColorButtonState();
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

  // --- GOOGLE FONTS LOADER ---
  function loadGoogleFont(fontString) {
    if (!fontString) return;
    let fontName = fontString.split(',')[0].trim();
    fontName = fontName.replace(/['"]/g, ''); // strip quotes
    
    const systemFonts = ["arial", "helvetica", "georgia", "times new roman", "courier new", "impact", "comic sans ms", "trebuchet ms", "verdana", "sans-serif", "serif", "cursive", "monospace"];
    if (systemFonts.includes(fontName.toLowerCase())) return;
    
    const fontLinkId = "gfont-" + fontName.toLowerCase().replace(/\s+/g, "-");
    if (document.getElementById(fontLinkId)) return;
    
    const link = document.createElement("link");
    link.id = fontLinkId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
    document.head.appendChild(link);
    
    if (document.fonts) {
      document.fonts.ready.then(adjustSeriesLetterSpacing);
    }
  }

  // --- DRAG AND DROP UPLOADER ---
  function setupDragAndDrop(dropZoneEl, inputEl) {
    if (!dropZoneEl || !inputEl) return;
    
    dropZoneEl.addEventListener("dragenter", (e) => {
      e.preventDefault();
      dropZoneEl.classList.add("drag-hover");
    });
    
    dropZoneEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZoneEl.classList.add("drag-hover");
    });
    
    dropZoneEl.addEventListener("dragleave", () => {
      dropZoneEl.classList.remove("drag-hover");
    });
    
    dropZoneEl.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZoneEl.classList.remove("drag-hover");
      
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith("image/")) {
          const dt = new DataTransfer();
          dt.items.add(file);
          inputEl.files = dt.files;
          inputEl.dispatchEvent(new Event("change"));
        }
      }
    });
  }

  // --- COLOR CONVERSION & EXTRACTION HELPERS ---
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  }

  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    
    const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  }

  function updateAutoColorButtonState() {
    if (!autoColorBtn) return;
    const hasFront = bgFront.src && bgFront.src !== window.location.href && !bgFront.src.startsWith("data:");
    const hasBack = bgBack.src && bgBack.src !== window.location.href && !bgBack.src.startsWith("data:");
    autoColorBtn.disabled = !(hasFront || hasBack);
  }

  function extractHarmoniousColors(imgEl) {
    if (!imgEl || !imgEl.src || imgEl.src === window.location.href || imgEl.src.startsWith("data:")) return;
    
    const tempImg = new Image();
    tempImg.crossOrigin = "anonymous";
    
    // Add cache buster only to remote HTTP/HTTPS images to prevent browser using non-CORS cached items.
    if (imgEl.src.startsWith("http://") || imgEl.src.startsWith("https://")) {
      const separator = imgEl.src.includes("?") ? "&" : "?";
      tempImg.src = imgEl.src + separator + "t=" + new Date().getTime();
    } else {
      tempImg.src = imgEl.src;
    }
    
    tempImg.onerror = (err) => {
      console.error("Failed to load image for color extraction with CORS:", imgEl.src, err);
    };
    
    tempImg.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 32;
        canvas.height = 32;
        ctx.drawImage(tempImg, 0, 0, 32, 32);
        
        const imgData = ctx.getImageData(0, 0, 32, 32).data;
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        
        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i+1];
          const b = imgData[i+2];
          const a = imgData[i+3];
          
          if (a > 128) {
            rSum += r;
            gSum += g;
            bSum += b;
            count++;
          }
        }
        
        if (count === 0) return;
        
        const avgR = Math.round(rSum / count);
        const avgG = Math.round(gSum / count);
        const avgB = Math.round(bSum / count);
        
        const [h, s, l] = rgbToHsl(avgR, avgG, avgB);
        
        // Harmonious Light Background (Hue = original, Saturation = 10-16%, Lightness = 96%)
        const bgS = Math.max(10, Math.min(s, 16));
        const bgL = 96;
        const bgColorHex = hslToHex(h, bgS, bgL);
        
        // Harmonious Fold Lines Color (Hue = original, Saturation = 14-25%, Lightness = 80%)
        const foldS = Math.max(14, Math.min(s + 8, 25));
        const foldL = 80;
        const foldColorHex = hslToHex(h, foldS, foldL);
        
        bgColIn.value = bgColorHex;
        foldColIn.value = foldColorHex;
        
        document.documentElement.style.setProperty("--box-bg", bgColorHex);
        document.documentElement.style.setProperty("--fold-color", foldColorHex);
        
        // Success micro-feedback
        const origText = autoColorBtn.textContent;
        autoColorBtn.textContent = "🪄✓";
        setTimeout(() => {
          autoColorBtn.textContent = origText;
        }, 1000);
        
      } catch (err) {
        console.error("Failed to analyze image colors:", err);
      }
    };
  }

  // Bindings
  titleIn.addEventListener("input", updateTitle);
  spineFontIn.addEventListener("input", (e) => {
    document.documentElement.style.setProperty("--spine-font", e.target.value);
    loadGoogleFont(e.target.value);
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

  fScaleIn.addEventListener("input", (e) => {
    bgFront.style.setProperty("--obj-scale", e.target.value);
  });
  bScaleIn.addEventListener("input", (e) => {
    bgBack.style.setProperty("--obj-scale", e.target.value);
  });

  fImageIn.addEventListener("change", () => {
    handleImageUpload(fImageIn, bgFront, fThumb, fThumbCont, fScaleIn);
    updateAutoColorButtonState();
  });
  bImageIn.addEventListener("change", () => {
    handleImageUpload(bImageIn, bgBack, bThumb, bThumbCont, bScaleIn);
    updateAutoColorButtonState();
  });
  flapsImageIn.addEventListener("change", handleFlapsImageUpload);

  document.querySelectorAll(".remove-img").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const target = e.target.dataset.target;
      if (target === "front") {
        bgFront.src = "";
        fThumb.src = "";
        fThumbCont.style.display = "none";
        fImageIn.value = "";
      } else if (target === "back") {
        bgBack.src = "";
        bThumb.src = "";
        bThumbCont.style.display = "none";
        bImageIn.value = "";
      } else if (target === "flaps") {
        topFlapImg.src = "";
        botFlapImg.src = "";
        topFlapImg.style.display = "none";
        botFlapImg.style.display = "none";
        flapsThumb.src = "";
        flapsThumbCont.style.display = "none";
        flapsImageIn.value = "";
        topFlapText.style.display = "block";
        botFlapText.style.display = "block";
      }
      updateAutoColorButtonState();
    });
  });

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
  foldColIn.addEventListener("input", (e) => {
    document.documentElement.style.setProperty("--fold-color", e.target.value);
  });

  // Gallery Events
  openFrontGalleryBtn.addEventListener("click", () => openGallery("front"));
  openBackGalleryBtn.addEventListener("click", () => openGallery("back"));
  closeGalleryBtn.addEventListener("click", closeGallery);
  window.addEventListener("click", (e) => {
    if (e.target === galleryModal) closeGallery();
  });

  function openGallery(target) {
    currentGalleryTarget = target;
    galleryModal.classList.add("active");
    document.getElementById("gallery-title").textContent =
      target === "front" ? "Select Front Image" : "Select Back Image";
    populateGallery();
  }

  function closeGallery() {
    galleryModal.classList.remove("active");
  }

  function populateGallery() {
    galleryGrid.innerHTML = "";
    if (!gameSelector.value) return;

    const selectedOpt = gameSelector.options[gameSelector.selectedIndex];
    const boxId = selectedOpt.dataset.boxId;
    const gameId = gameSelector.value;

    const images = [];

    // 1. Default Game Assets (Front and Back)
    if (defaultFrontUrl) {
      images.push({
        url: defaultFrontUrl,
        label: "Game Front"
      });
    }
    if (defaultBackUrl) {
      images.push({
        url: defaultBackUrl,
        label: "Game Back"
      });
    }

    // 2. Box Templates (Filtered by boxId)
    if (boxesData && boxesData[boxId]) {
      const box = boxesData[boxId];
      const boxBaseUrl = `${CDN_URL}images/boxes/`;
      if (box.front) {
        images.push({
          url: `${boxBaseUrl}${box.front}`,
          label: `${boxId} Template Front`
        });
      }
      if (box.back) {
        images.push({
          url: `${boxBaseUrl}${box.back}`,
          label: `${boxId} Template Back`
        });
      }
      if (box.iso) {
        images.push({
          url: `${boxBaseUrl}${box.iso}`,
          label: `${boxId} Template Isometric`
        });
      }
    }

    // Remove duplicates
    const uniqueImages = [];
    const seenUrls = new Set();
    images.forEach(img => {
      if (img.url && !seenUrls.has(img.url)) {
        uniqueImages.push(img);
        seenUrls.add(img.url);
      }
    });

    uniqueImages.forEach(img => {
      const item = document.createElement("div");
      item.className = "gallery-item";
      item.innerHTML = `
        <img src="${img.url}" alt="${img.label}" loading="lazy">
        <span class="label">${img.label}</span>
      `;
      item.onclick = () => selectGalleryImage(img.url);
      galleryGrid.appendChild(item);
    });
  }

  function selectGalleryImage(url) {
    if (currentGalleryTarget === "front") {
      bgFront.src = url;
      fThumb.src = url;
      fThumbCont.style.display = "block";
      fImageIn.value = "";
    } else {
      bgBack.src = url;
      bThumb.src = url;
      bThumbCont.style.display = "block";
      bImageIn.value = "";
    }
    closeGallery();
    updateAutoColorButtonState();
  }

  printBtn.addEventListener("click", () => {
    const originalTitle = document.title;
    const versionEl = document.getElementById("app-version");
    const appVersion = versionEl ? ` ${versionEl.textContent}` : "";
    document.title = `Unlock! ${titleIn.value.trim()}. Box${appVersion}`;
    window.print();
    document.title = originalTitle;
  });

  if (saveConfigBtn) saveConfigBtn.addEventListener("click", handleSaveConfig);
  if (loadConfigBtn) loadConfigBtn.addEventListener("click", handleLoadConfig);
  if (deleteConfigBtn) deleteConfigBtn.addEventListener("click", handleDeleteConfig);

  // --- GAME DATA FETCHING ---
  async function initGameData() {
    try {
      const [unlockRes, descRes, logosRes, boxesRes] = await Promise.all([
        fetch(`${CDN_URL}GameData/Unlock.json`),
        fetch(`${CDN_URL}GameData/descriptions.json`),
        fetch(`${CDN_URL}GameData/logos.json`),
        fetch(`${CDN_URL}GameData/boxes.json`)
      ]);
      gamesData = await unlockRes.json();
      descriptionsData = await descRes.json();
      logosData = await logosRes.json();
      boxesData = await boxesRes.json();
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

        // Truncate long names to fit the sidebar width
        const maxLength = 32;
        opt.textContent = displayName.length > maxLength
          ? displayName.substring(0, maxLength - 3) + "..."
          : displayName;

        // Add full name as title attribute
        opt.title = displayName;

        opt.dataset.boxId = box.ID;
        group.appendChild(opt);
      });

      gameSelector.appendChild(group);
    });
  }

  async function handleGameChange(e) {
    const isLangChange = e && e.target === langSelector;
    const gameId = gameSelector.value;
    const lang = langSelector.value;

    // Enable/Disable gallery buttons
    if (gameId) {
      openFrontGalleryBtn.disabled = false;
      openBackGalleryBtn.disabled = false;
    } else {
      openFrontGalleryBtn.disabled = true;
      openBackGalleryBtn.disabled = true;
    }

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

      const newFrontUrl = `${CDN_URL}images/icons/${gameId}.png`;
      const newBackUrl = `${CDN_URL}Skins/${manifest.skinName || gameId}_fond.jpg`;

      // Only update images if it's a new game OR if current images are the defaults
      const shouldUpdateFront = !isLangChange || (bgFront.src === defaultFrontUrl || !bgFront.src || bgFront.src === window.location.href);
      const shouldUpdateBack = !isLangChange || (bgBack.src === defaultBackUrl || !bgBack.src || bgBack.src === window.location.href);

      defaultFrontUrl = newFrontUrl;
      defaultBackUrl = newBackUrl;

      if (shouldUpdateFront) {
        bgFront.src = defaultFrontUrl;
        fThumb.src = defaultFrontUrl;
        fThumbCont.style.display = "block";
        
        // Reset position & scale ONLY on game change
        if (!isLangChange) {
          bgFront.style.setProperty("--obj-pos-x", "0px");
          bgFront.style.setProperty("--obj-pos-y", "0px");
          bgFront.style.setProperty("--obj-scale", "1.1");
          fScaleIn.value = "1.1";
        }
      }

      if (shouldUpdateBack) {
        bgBack.src = defaultBackUrl;
        bThumb.src = defaultBackUrl;
        bThumbCont.style.display = "block";

        if (!isLangChange) {
          bgBack.style.setProperty("--obj-pos-x", "0px");
          bgBack.style.setProperty("--obj-pos-y", "0px");
          bgBack.style.setProperty("--obj-scale", "1.1");
          bScaleIn.value = "1.1";
        }
      }

      // Update Flaps if logo exists
      if (logosData && logosData[gameId]) {
        const logoUrl = `${CDN_URL}images/logos/${logosData[gameId]}`;
        topFlapImg.src = logoUrl;
        botFlapImg.src = logoUrl;
        topFlapImg.style.display = "block";
        botFlapImg.style.display = "block";
        flapsThumb.src = logoUrl;
        flapsThumbCont.style.display = "block";

        topFlapText.style.display = "none";
        botFlapText.style.display = "none";
      } else {
        topFlapImg.style.display = "none";
        botFlapImg.style.display = "none";
        topFlapImg.src = "";
        botFlapImg.src = "";
        flapsThumbCont.style.display = "none";
        topFlapText.style.display = "block";
        botFlapText.style.display = "block";
      }

      // Trigger updates
      updateTitle();
      updateDesc();
      updateSeries();
      updateLocks();
      updateTime();
      updateDieline();
      updateQRCode();
      updateAutoColorButtonState();

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

  // Load initial Google Font if any
  loadGoogleFont(spineFontIn.value);

  // Setup Drag and Drop
  setupDragAndDrop(document.getElementById("panel-front"), fImageIn);
  setupDragAndDrop(document.getElementById("panel-back"), bImageIn);
  setupDragAndDrop(document.getElementById("top-roof"), flapsImageIn);
  setupDragAndDrop(document.getElementById("bot-flap"), flapsImageIn);

  // Auto color extraction click handler
  if (autoColorBtn) {
    autoColorBtn.addEventListener("click", () => {
      const hasFront = bgFront.src && bgFront.src !== window.location.href && !bgFront.src.startsWith("data:");
      const targetImg = hasFront ? bgFront : bgBack;
      extractHarmoniousColors(targetImg);
    });
  }
  updateAutoColorButtonState();

  // Adjust letter spacing after custom fonts are loaded
  if (document.fonts) {
    document.fonts.ready.then(adjustSeriesLetterSpacing);
  } else {
    window.addEventListener("load", adjustSeriesLetterSpacing);
  }
});
