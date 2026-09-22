// ОБЩАЯ БАЗА ДАННЫХ ДЛЯ ВСЕХ ТЕМ ПРИЛОЖЕНИЯ
const appThemes = [
    {
        id: "theme0",
        titleRU: "Неделя 0. Знакомство",
        titleUZ: "0-Hafta. Tanishuv",
        icon: "assets/theme0/privet.jpg", // Главная иконка темы на меню
        words: [
            { id: 0, word: "привет", image: "assets/theme0/privet.jpg", audio: "assets/theme0/privet.mp3" },
            { id: 1, word: "здравствуйте", image: "assets/theme0/zdravst.jpg", audio: "assets/theme0/zdravst.mp3" },
            { id: 2, word: "пока", image: "assets/theme0/poka.jpg", audio: "assets/theme0/poka.mp3" },
            { id: 3, word: "до свидания", image: "assets/theme0/dosvidaniya.jpg", audio: "assets/theme0/dosvidaniya.mp3" },
            { id: 4, word: "как тебя зовут", image: "assets/theme0/kaktebyazovut.jpg", audio: "assets/theme0/kaktebyazovut.mp3" },
            { id: 5, word: "меня зовут", image: "assets/theme0/menyazovut.jpg", audio: "assets/theme0/menyazovut.mp3" }
        ]
    }
    // Когда соберете Неделю 1 (Узбекистан), вы просто допишете её структуру ниже через запятую!
];

let activeTheme = null;
let currentIndex = 0;
let currentAudio = null;

// Элементы навигации
const catalogScreen = document.getElementById('catalog-screen');
const modeScreen = document.getElementById('mode-screen');
const screenDict = document.getElementById('screen-dictionary');
const screenQuiz = document.getElementById('screen-quiz');
const screenSpeak = document.getElementById('screen-speak');

// ЗАПУСК: Создание каталога плиток при загрузке страницы
function initCatalog() {
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = "";

    appThemes.forEach(theme => {
        const tile = document.createElement('div');
        tile.className = 'theme-tile';
        tile.innerHTML = `
            <img src="${theme.icon}" alt="${theme.titleRU}">
            <div class="tile-info">
                <h3>${theme.titleRU}</h3>
                <p>${theme.titleUZ}</p>
            </div>
        `;
        tile.onclick = () => {
            activeTheme = theme;
            catalogScreen.classList.add('hidden');
            modeScreen.classList.remove('hidden');
            document.getElementById('selected-theme-title').innerText = theme.titleRU;
        };
        grid.appendChild(tile);
    });
}

// Кнопки навигации внутри приложения (Работают автономно)
document.getElementById('mode-dictionary').onclick = () => startMode('dict');
document.getElementById('mode-quiz').onclick = () => startMode('quiz');
document.getElementById('mode-speak').onclick = () => startMode('speak');

document.querySelector('.btn-back-catalog').onclick = () => {
    modeScreen.classList.add('hidden');
    catalogScreen.classList.remove('hidden');
};

document.querySelectorAll('.btn-back-modes').forEach(btn => {
    btn.onclick = () => {
        if (currentAudio) currentAudio.pause();
        screenDict.classList.add('hidden');
        screenQuiz.classList.add('hidden');
        screenSpeak.classList.add('hidden');
        modeScreen.classList.remove('hidden');
    };
});

function startMode(mode) {
    modeScreen.classList.add('hidden');
    currentIndex = 0;
    if (mode === 'dict') { screenDict.classList.remove('hidden'); showDictWord(); }
    else if (mode === 'quiz') { screenQuiz.classList.remove('hidden'); showQuizRound(); }
    else if (mode === 'speak') { screenSpeak.classList.remove('hidden'); showSpeakWord(); }
}

// ================= РЕЖИМ 1: СЛОВАРЬ =================
function showDictWord() {
    const active = activeTheme.words[currentIndex];
    document.getElementById('dict-text').innerText = active.word;
    document.getElementById('dict-img').src = active.image;
    if (currentAudio) currentAudio.pause();
    currentAudio = new Audio(active.audio);
    currentAudio.play().catch(e => console.log("Звук не загружен"));
}
document.getElementById('dict-play').onclick = () => currentAudio.play();
document.getElementById('dict-next').onclick = () => {
    if (currentIndex < activeTheme.words.length - 1) { currentIndex++; showDictWord(); }
    else { alert("Вы прошли весь словарь!"); document.querySelector('.btn-back-modes').click(); }
};

// ================= РЕЖИМ 2: НАЙДИ КАРТИНКУ =================
function showQuizRound() {
    const targetWord = activeTheme.words[currentIndex];
    document.getElementById('quiz-feedback').innerText = "Послушай аудио и выбери картинку";
    document.getElementById('quiz-feedback').style.color = "#333";
    document.getElementById('quiz-next').classList.add('hidden');
    
    if (currentAudio) currentAudio.pause();
    currentAudio = new Audio(targetWord.audio);
    currentAudio.play().catch(e => console.log("Звук не загружен"));

    // Подготовка 4-х вариантов для сетки (1 верный + остальные из темы)
    let options = [targetWord];
    let pool = activeTheme.words.filter(w => w.id !== targetWord.id);
    pool.sort(() => 0.5 - Math.random());
    options.push(...pool.slice(0, 3));
    // Если в теме меньше 4 слов — добиваем дубликатами для теста
    while(options.length < 4) { options.push(targetWord); }
    options.sort(() => 0.5 - Math.random());

    options.forEach((opt, idx) => {
        const block = document.querySelector(`.quiz-option[data-index="${idx}"]`);
        block.querySelector('img').src = opt.image;
        block.className = "quiz-option";
        block.onclick = () => {
            if (!document.getElementById('quiz-next').classList.contains('hidden')) return;
            if (opt.id === targetWord.id) {
                block.classList.add('correct');
                document.getElementById('quiz-feedback').innerText = "🎉 Правильно! Топдинг!";
                document.getElementById('quiz-feedback').style.color = "#4caf50";
                document.getElementById('quiz-next').classList.remove('hidden');
            } else {
                block.classList.add('wrong');
                document.getElementById('quiz-feedback').innerText = "❌ Неверно. Попробуй еще раз!";
                document.getElementById('quiz-feedback').style.color = "#f44336";
            }
        };
    });
}
document.getElementById('quiz-repeat-audio').onclick = () => currentAudio.play();
document.getElementById('quiz-next').onclick = () => {
    if (currentIndex < activeTheme.words.length - 1) { currentIndex++; showQuizRound(); }
    else { alert("Отлично! Тест пройден!"); document.querySelector('.btn-back-modes').click(); }
};

// ================= РЕЖИМ 3: СКАЖИ =================
function showSpeakWord() {
    const active = activeTheme.words[currentIndex];
    document.getElementById('speak-img').src = active.image;
    document.getElementById('speak-text').innerText = active.word;
    document.getElementById('speak-text').classList.add('hidden');
    document.getElementById('speak-result-text').innerText = "Нажмите «Говорить» и произнесите слово.";
    document.getElementById('speak-result-text').style.color = "#333";
    document.getElementById('speak-next').classList.add('hidden');
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    document.getElementById('speak-mic').onclick = () => {
        document.getElementById('speak-result-text').innerText = "Слушаю... Говорите!";
        document.getElementById('speak-result-text').style.color = "#2481cc";
        recognition.start();
    };
    recognition.onresult = (event) => {
        const userSpoke = event.results.transcript.toLowerCase().trim();
        const correctWord = activeTheme.words[currentIndex].word.toLowerCase().trim();
        if (userSpoke.includes(correctWord) || correctWord.includes(userSpoke)) {
            document.getElementById('speak-result-text').innerText = `💥 Отлично! Вы сказали: "${userSpoke}".`;
            document.getElementById('speak-result-text').style.color = "#4caf50";
            document.getElementById('speak-text').classList.remove('hidden');
            document.getElementById('speak-next').classList.remove('hidden');
        } else {
            document.getElementById('speak-result-text').innerText = `Вы сказали: "${userSpoke}". Попробуйте еще раз!`;
            document.getElementById('speak-result-text').style.color = "#f44336";
        }
    };
} else {
    document.getElementById('speak-mic').style.display = "none";
}
document.getElementById('speak-next').onclick = () => {
    if (currentIndex < activeTheme.words.length - 1) { currentIndex++; showSpeakWord(); }
    else { alert("Вы отлично поговорили!"); document.querySelector('.btn-back-modes').click(); }
};

// Запуск при старте
initCatalog();
