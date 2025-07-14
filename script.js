const input = document.getElementById('chordProInput');
const preview = document.getElementById('preview');
const songTitle = document.getElementById('songTitle');
const songIdNumber = document.getElementById('songIdNumber');

let parser = new ChordSheetJS.ChordProParser();
let formatter = new ChordSheetJS.HtmlDivFormatter();

const urlParams = new URLSearchParams(window.location.search);
window.songId = urlParams.get('songId');

async function getSongContent(songId) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/get_content?song_id=${songId}`);
        const data = await response.json();

        if (data.status) {
            console.log("Message:", data.message);
            return data.data;
        } else {
            console.error("Error:", data.message);
            return null;
        }
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}


function updatePreview(content) {
    try {
        const song = parser.parse(content);
        preview.innerHTML = formatter.format(song);
    } catch (e) {
        preview.innerHTML = `<span style="color: red;">Error parsing: ${e.message}</span>`;
    }
}

function validateInput() {
    if (!input || input.value.trim() === '') {
        alert('Song is empty');
        return false;
    }
    return true;
}

function checkSongTitle() {
    return songTitle.value.trim() !== '';
}


function downloadChordPro() {
    if (!validateInput()) return;
    if (!checkSongTitle) return;

    const blob = new Blob([input.value], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${songTitle.textContent}.chopro`;
    link.click();

    URL.revokeObjectURL(url);
}

function loadSample() {
    const sample = `[C]This is a [G]simple [Am]sample song\n[F]With chords and lyrics\n[C]Hope you [G]like it!`;
    input.value = sample;
    updatePreview(sample);
}

function saveChordPro() {
    if (!validateInput()) return;
    if (!checkSongTitle) return;


    fetch("http://127.0.0.1:8000/add_content", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: parseInt(songId),
            content: input.value,
        }),
    })
        .then(response => {
            if (!response.ok) {
                console.error("Error saving content");
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data.status) {
                console.log("Message:", data.message);
                alert(data.message);
            } else {
                console.log(data.status + data.message);
            }
        })
        .catch(error => {
            console.error("Error saving content");
        })
}

input.addEventListener('input', () => {
    const content = input.value;
    updatePreview(content);
});

function setSongTitle(title) {
    songTitle.textContent = title;
}

function setSongIdNumber(songId) {
    songIdNumber.textContent = songId;
}

async function initialize() {
    const data = await getSongContent(songId);
    if (data) {
        setSongIdNumber(data.id);
        input.value = data.content;
        updatePreview(input.value);
        setSongTitle(data.title);
    }
}

window.onload = () => {
    initialize();
};