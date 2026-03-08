document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const titleIn = document.getElementById('game-title');
    const seriesIn = document.getElementById('series-title');
    const diffIn = document.getElementById('difficulty');
    const ageIn = document.getElementById('param-age');
    const timeIn = document.getElementById('param-time');
    const depthIn = document.getElementById('box-depth');
    const solutionIn = document.getElementById('solution-url');
    const fImageIn = document.getElementById('front-image');
    const bImageIn = document.getElementById('back-image');
    const fThumb = document.getElementById('front-thumb');
    const bThumb = document.getElementById('back-thumb');
    const printBtn = document.getElementById('print-btn');
    const showDieline = document.getElementById('show-dieline');
    
    // Outputs
    const titleOutList = document.querySelectorAll('#game-title-display, .game-title-spine');
    const seriesOutList = document.querySelectorAll('#series-title-display, .series-title-spine');
    const ageOutList = document.querySelectorAll('.out-age');
    const timeOutList = document.querySelectorAll('.out-time');
    const qrTextDisplay = document.getElementById('solution-url-display');
    const qrContainer = document.getElementById('qr-code');
    const locksFront = document.getElementById('locks-container');
    const locksSpineR = document.getElementById('spine-locks-right');
    const locksSpineL = document.getElementById('spine-locks-left');
    
    // Geometry outputs
    const bgFront = document.getElementById('bg-front');
    const bgBack = document.getElementById('bg-back');
    const printWrapper = document.getElementById('print-wrapper');
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
        let htmlFront = '';
        let htmlSpine = '';
        
        for(let i=0; i<3; i++) {
            const isActive = i < d;
            
            // Front locks (left-to-right logic: active is white, inactive is green)
            const colorFront = isActive ? '#fff' : '#1b8a5d'; 
            htmlFront += `<span style="color:${colorFront}">${lockSVG}</span>`;
        }

        // Spine locks (bottom-to-top logic matching rotation: [lock1, lock2, lock3])
        // Rendered top-to-bottom in flex-col = index 2, 1, 0. If difficulty = 1, bottommost (index 0) is red.
        const spineIndexes = [2, 1, 0];
        spineIndexes.forEach(index => {
            const isActive = index < d;
            const colorSpine = isActive ? '#e63946' : '#fff'; // Active is red, inactive is white
            htmlSpine += `<span style="color:${colorSpine}">${lockSpineSVG}</span>`;
        });

        locksFront.innerHTML = htmlFront;
        if(locksSpineR) locksSpineR.innerHTML = htmlSpine;
        if(locksSpineL) locksSpineL.innerHTML = htmlSpine;
    }

    function updateTitle() {
        titleOutList.forEach(el => el.textContent = titleIn.value.toUpperCase());
    }

    function updateSeries() {
        seriesOutList.forEach(el => el.textContent = seriesIn.value.toUpperCase());
    }

    function updateAge() {
        ageOutList.forEach(el => el.textContent = ageIn.value + '+');
    }

    function updateTime() {
        timeOutList.forEach(el => el.textContent = timeIn.value + "'");
    }

    function updateQRCode() {
        if (!qrContainer || !solutionIn) return;
        const url = solutionIn.value;
        
        try {
            const parsed = new URL(url);
            qrTextDisplay.textContent = parsed.hostname.replace('www.', '');
        } catch(e) {
            qrTextDisplay.textContent = url.substring(0, 30);
        }

        if (!qrcodeInstance) {
            qrcodeInstance = new QRCode(qrContainer, {
                text: url,
                width: 128,
                height: 128,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.L
            });
        } else {
            qrcodeInstance.clear();
            qrcodeInstance.makeCode(url);
        }
    }

    function handleImageUpload(inputEl, imgOut, thumbOut) {
        const file = inputEl.files[0];
        if(!file) return;
        const url = URL.createObjectURL(file);
        imgOut.src = url;
        thumbOut.src = url;
        thumbOut.style.display = 'block';
    }

    function updateDieline() {
        let D = parseFloat(depthIn.value);
        if(isNaN(D) || D < 5) D = 10.4;
        
        rootStyle.setProperty('--depth-mm', D + 'mm');
    }

    // Bindings
    titleIn.addEventListener('input', updateTitle);
    seriesIn.addEventListener('input', updateSeries);
    ageIn.addEventListener('input', updateAge);
    timeIn.addEventListener('input', updateTime);
    solutionIn.addEventListener('input', updateQRCode);
    diffIn.addEventListener('change', updateLocks);
    depthIn.addEventListener('input', updateDieline);
    fImageIn.addEventListener('change', () => handleImageUpload(fImageIn, bgFront, fThumb));
    bImageIn.addEventListener('change', () => handleImageUpload(bImageIn, bgBack, bThumb));
    
    showDieline.addEventListener('change', (e) => {
        if(e.target.checked) {
            printWrapper.classList.remove('dieline-hidden');
        } else {
            printWrapper.classList.add('dieline-hidden');
        }
    });

    printBtn.addEventListener('click', () => {
        const originalTitle = document.title;
        document.title = `Unlock! ${titleIn.value.trim()}. Box`;
        window.print();
        document.title = originalTitle;
    });

    // Init
    updateTitle();
    updateSeries();
    updateAge();
    updateTime();
    updateQRCode();
    updateLocks();
    updateDieline();
});
