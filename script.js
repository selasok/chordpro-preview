const input = document.getElementById('chordProInput');
const preview = document.getElementById('preview');
const liveToggle = document.getElementById('liveToggle');
const autoSaveToggle = document.getElementById('autoSave');
const recentSaved = document.getElementById('recent-saved')

const parser = new ChordSheetJS.ChordProParser();
const formatter = new ChordSheetJS.HtmlDivFormatter();



function updatePreview(content) {
    try {
        const song = parser.parse(content);
        preview.innerHTML = formatter.format(song);
    } catch (e) {
        preview.innerHTML = `<span style="color: red;">Error parsing: ${e.message}</span>`;
    }
}

function updateRecentSaved() {
    const items = loadLocalStorage()
    recentSaved.innerHTML = '';

    for (let i = 0; i < items.length; i++) {
        const data = items[i];

        const option = document.createElement('option');
        option.value = data.content;
        option.textContent = `Saved at: ${new Date(data.timestamp).toLocaleString()}`;

        recentSaved.appendChild(option);
    }
}

function loadLocalStorage(type) {
    const data = JSON.parse(localStorage.getItem(type)) || [];

    if (!data) {
        return;
    }

    if (type == 'chordProContent') {
        items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    return data;
}

function saveChordProContent(content) {
    const timestamp = new Date().toISOString();
    const newData = {
        timestamp: timestamp,
        content: content,
    };

    let oldData = loadLocalStorage()

    oldData.push(newData);

    if (oldData.length > 10) {
        oldData = oldData.slice(-10);
    }

    localStorage.setItem('chordProContent', JSON.stringify(oldData));
    updateRecentSaved();
}

function loadPreferences() {
    const preferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
    liveToggle.checked = !!preferences.livePreview;
    autoSaveToggle.checked = !!preferences.autoSave;
}

function loadChordProContent() {
    const items = loadLocalStorage();

    if (items.length > 0) {
        const latest = items[0];
        input.value = latest.content;

        if (liveToggle.checked) {
            updatePreview(latest.content);
        }
    }
}

function validateInput() {
    if (!input || input.value.trim() === '') {
        alert('Song is empty');
        return false
    }
    return true;
}

function inputFileName() {
    const fileName = prompt("Enter the file name:", "song");
    if (!fileName) {
        alert("Please input file name")
        return false;
    }
    return fileName;
}

function getFileName() {
    const fileName = prompt("Enter the file name:", "song");
    if (!fileName || fileName.trim() === '') {
        alert("Please input a valid file name.");
        return null;
    }
    return fileName.trim();
}

function downloadChordPro() {
    if (!validateInput()) {
        return;
    }

    const fileName = getFileName();
    if (!fileName) {
        return;
    }

    const blob = new Blob([input.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith(".chopro") ? fileName : fileName + ".chopro"
    link.click();
    URL.revokeObjectURL(url);
}

function loadSample() {
    const sample = `[C]This is a [G]simple [Am]sample song\n[F]With chords and lyrics\n[C]Hope you [G]like it!`;
    input.value = sample;
    updatePreview(sample);
}

[liveToggle, autoSaveToggle].forEach(toggle =>
    toggle.addEventListener('change', () => {
        data = {
            livePreview: liveToggle.checked,
            autoSave: autoSaveToggle.checked
        };

        localStorage.setItem('userPreferences', JSON.stringify(data))
    }

    ));

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

const debouncedSave = debounce(saveChordProContent, 5000);

input.addEventListener('input', () => {
    const content = input.value;

    if (liveToggle.checked) {
        updatePreview(content);
    }

    if (autoSaveToggle.checked) {
        debouncedSave(content);
    }

});

recentSaved.addEventListener('change', () => {
    input.value = recentSaved.value;
    updatePreview(input.value)
});

window.onload = () => {
    loadPreferences();
    loadChordProContent();
    updateRecentSaved();
};