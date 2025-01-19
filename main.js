
modalContainer = document.getElementById("modal-container");
window.onload = (event) => {
    modalContainer.classList.add('show-modal');
  };
  
/*=============== CLOSE MODAL ===============*/
const closeBtn = document.querySelectorAll('.close-modal');

function closeModal(){
    const modalContainer = document.getElementById('modal-container')
    modalContainer.classList.remove('show-modal')
}
closeBtn.forEach(c => c.addEventListener('click', closeModal))


// Selecting DOM Elements
const arabicAyah = document.querySelector('.arabic-ayah')
const suraNumber = document.querySelector('sura-number')
const audio = document.querySelector('audio')
const btnPlay = document.querySelector('.btn-play')
const generateBtn = document.querySelector('.btn-generate')
const suraName = document.querySelector('.sura-name')
const ayahNum = document.querySelector('.ayah-number')
const suraInfo = document.querySelector('.sura-info')


// Random Number
function generateRandomNum(){
    return Math.floor(Math.random() * 6236)
}
const randomNum = generateRandomNum()


// Fetching API
const arabicApi = `https://api.alquran.cloud/v1/ayah/${randomNum}/ar.minshawi`

const arabic = fetch(arabicApi)
                .then(blob => blob.json())
                .then(data => {
                    arabicAyah.textContent = `${data.data.text}`
                    suraName.textContent = `${data.data.surah.name}`
                    ayahNum.textContent = `${data.data.numberInSurah}`
                    audio.src = data.data.audio
                })

// Event Listener
btnPlay.addEventListener('click', () =>{
    audio.play()
})
generateBtn.addEventListener('click',()=>{
    location.reload()
})




//Explore button 
let exploreBtn = document.querySelector('.title .btn'),
    HadithSection = document.querySelector('.hadith');
exploreBtn.addEventListener('click',()=>{
    HadithSection.scrollIntoView({
        behavior : "smooth"
    })
})
let fixedNav = document.querySelector('.header'),
     scrollBtn = document.querySelector('.scrollBtn');
window.addEventListener("scroll",()=>{
    window.scrollY > 100 ? fixedNav.classList.add('active') : fixedNav.classList.remove('active');
    window.scrollY > 500 ?  scrollBtn.classList.add('active') : scrollBtn.classList.remove('active') ;
})
scrollBtn.addEventListener('click',()=>{
    window.scrollTo({
        top : 0,
        behavior : "smooth"
    })
})



//Active SideBar
let bars = document.querySelector('.bars'),
    SideBar = document.querySelector('.header ul');
bars.addEventListener('click',()=>{
    SideBar.classList.toggle("active");
})

//hadith
let currentPage = 1;
let totalHadith = 300; // يمكنك تعديل هذه القيمة حسب العدد الكلي للأحاديث

async function fetchHadith(book, page) {
    const response = await fetch(`https://hadis-api-id.vercel.app/hadith/${book}?page=${page}&limit=1`);
    const data = await response.json();
    const hadithContainer = document.getElementById('hadith-container');
    hadithContainer.innerHTML = '';

    if (data.items && data.items.length > 0) {
        const hadith = data.items[0];
        const hadithElement = document.createElement('div');
        hadithElement.textContent = `${hadith.arab}`;
        hadithContainer.appendChild(hadithElement);

        // تحديث رقم الحديث
        document.getElementById('num').textContent = `${hadith.number} / ${totalHadith}`;
    } else {
        hadithContainer.textContent = 'لا توجد أحاديث.';
        document.getElementById('num').textContent = '0 / 300'; // أو أي قيمة حسب الحالة
    }
}

document.getElementById('next-btn').addEventListener('click', () => {
    currentPage++;
    const book = document.getElementById('book-select').value;
    fetchHadith(book, currentPage);
});

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        const book = document.getElementById('book-select').value;
        fetchHadith(book, currentPage);
    }
});

document.getElementById('book-select').addEventListener('change', () => {
    currentPage = 1; // إعادة تعيين الصفحة عند تغيير الكتاب
    const book = document.getElementById('book-select').value;
    fetchHadith(book, currentPage);
});

// جلب الأحاديث عند تحميل الصفحة
fetchHadith('muslim', currentPage);

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("الموقع الجغرافي غير مدعوم في هذا المتصفح.");
    }
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    getPrayerTimes(latitude, longitude);
}

function getPrayerTimes(latitude, longitude) {
    fetch(`http://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}`)
    .then(response => response.json())
    .then(data => {
        const times = data.data.timings;
        document.getElementById('fajr').textContent = convertTo12HourFormat(times.Fajr);
        document.getElementById('dhuhr').textContent =  convertTo12HourFormat(times.Dhuhr);
        document.getElementById('asr').textContent = convertTo12HourFormat(times.Asr);
        document.getElementById('maghrib').textContent = convertTo12HourFormat(times.Maghrib);
        document.getElementById('isha').textContent = convertTo12HourFormat(times.Isha);

        document.getElementById('prayerTimes').style.display = 'block';
    })
    .catch(error => console.error('Error:', error));
}

function convertTo12HourFormat(time) {
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    const ampm = hours >= 12 ? 'مساءً' : 'صباحا';
    hours = hours % 12 || 12; // تحويل إلى صيغة 12 ساعة
    return hours + ':' + minutes + ' ' + ampm;
}
getLocation()


let currentStationIndex = 0;
let stations = [];
let isPlaying = false;
const radioStream = new Audio();
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const statusText = document.getElementById('status');
const radioName = document.getElementById('radioName');
const radioImage = document.getElementById('radioImage');

// Fetch stations from API
fetch('https://data-rosy.vercel.app/radio.json')
  .then(response => response.json())
  .then(data => {
    stations = data.radios;
    loadStation(currentStationIndex); // Load the first station
  })
  .catch(error => console.error('Error fetching radio stations:', error));

// Load radio station details
function loadStation(index) {
  const station = stations[index];
  radioStream.src = station.url;
  radioName.innerHTML = station.name;
  radioImage.src = station.img;
  statusText.textContent = 'قيد التوقف';
  playBtn.innerHTML = '<i class="fas fa-play"></i>';
  isPlaying = false;
}

// Play/Pause functionality
playBtn.addEventListener('click', function() {
  if (isPlaying) {
    radioStream.pause();
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    statusText.textContent = 'قيد التوقف';
  } else {
    radioStream.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    statusText.textContent = 'قيد التشغيل';
  }
  isPlaying = !isPlaying;
});

// Navigate to the previous station
prevBtn.addEventListener('click', function() {
  if (currentStationIndex > 0) {
    currentStationIndex--;
    loadStation(currentStationIndex);
    if (isPlaying) {
      radioStream.play();
      statusText.textContent = 'قيد التشغيل';
    }
  }
});

// Navigate to the next station
nextBtn.addEventListener('click', function() {
  if (currentStationIndex < stations.length - 1) {
    currentStationIndex++;
    loadStation(currentStationIndex);
    if (isPlaying) {
      radioStream.play();
      statusText.textContent = 'قيد التشغيل';
    }
  }
});

// المحاضرات


let currentLecturePage = 1; // رقم الصفحة الحالية
const itemsPerPage = 25; // عدد العناصر في كل صفحة
const mainLectureListElement = document.getElementById("mainLectureList");
const subLectureListElement = document.getElementById("subLectureList");
const videoPlayerElement = document.getElementById("videoPlayer");
const videoDescriptionElement = document.getElementById("videoDescription");
const searchBox = document.getElementById("searchBox"); // صندوق البحث
const baseApiUrl = "https://api3.islamhouse.com/v3/paV29H2gm56kvLPy/main/videos/ar/ar/";

let totalPages = 36; // عدد الصفحات الإجمالي
let searchTerm = ''; // تخزين كلمة البحث

// جلب المحاضرات لصفحة معينة
function fetchLectures(page, query = '') {
    let apiUrl = `${baseApiUrl}${page}/${itemsPerPage}/json`;
    if (query) {
        apiUrl = `${baseApiUrl}search/${query}/${page}/${itemsPerPage}/json`; // تعديل الرابط للبحث
    }
    
    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => data.data || [])
        .catch(error => console.error('Error fetching lectures:', error));
}

// جلب جميع نتائج البحث من كل الصفحات
async function fetchAllSearchResults(query) {
    let allLectures = [];
    let page = 1;
    let lectures = [];
    
    // التكرار عبر الصفحات لجلب جميع النتائج
    do {
        lectures = await fetchLectures(page, query);
        allLectures = allLectures.concat(lectures); // دمج المحاضرات
        page++; // الانتقال إلى الصفحة التالية
    } while (lectures.length === itemsPerPage); // الاستمرار إذا كانت الصفحة ممتلئة
    
    return allLectures;
}

// عرض المحاضرات الرئيسية مع الاحتفاظ بالمحاضرات السابقة
function displayMainLectures(lectures, append = false) {
    if (!append) {
        mainLectureListElement.innerHTML = ''; // مسح قائمة المحاضرات السابقة
    }
    
    if (lectures.length === 0 && !append) {
        mainLectureListElement.innerHTML = '<li>لم يتم العثور على نتائج</li>'; // إذا لم يتم العثور على محاضرات
        return;
    }
    
    lectures.forEach(item => {
        const listItem = document.createElement("li");
        listItem.textContent = item.title;
        listItem.style.cursor = "pointer";

        listItem.onclick = function () {
            displaySubLectures(item.attachments);

            if (item.attachments && item.attachments.length > 0) {
                playSubLecture(item.attachments[0]);
            }

            if (window.innerWidth <= 380) {
                scrollToElement(videoPlayerElement);
            }
        };

        mainLectureListElement.appendChild(listItem);
    });

    // إظهار زر "إظهار المزيد" إذا كانت هناك صفحات إضافية
    if (currentLecturePage < totalPages) {
        document.getElementById('loadMoreButton').classList.remove('hidden');
    } else {
        document.getElementById('loadMoreButton').classList.add('hidden');
    }
}

// تشغيل المحاضرة الفرعية المحددة
function playSubLecture(subItem) {
    videoPlayerElement.src = subItem.url; // تشغيل الفيديو
    videoPlayerElement.autoplay = true;
    videoDescriptionElement.textContent = subItem.description;

    if (window.innerWidth <= 380) {
        scrollToElement(videoPlayerElement);
    }
}

// عرض المحاضرات الفرعية
function displaySubLectures(attachments) {
    subLectureListElement.innerHTML = ''; // مسح المحاضرات الفرعية السابقة
    attachments.forEach(subItem => {
        const subListItem = document.createElement("li");
        subListItem.textContent = subItem.description;
        subListItem.style.cursor = "pointer";
        subListItem.onclick = () => {
            playSubLecture(subItem);

            if (window.innerWidth <= 380) {
                scrollToElement(videoPlayerElement);
            }
        };
        subLectureListElement.appendChild(subListItem);
    });

    if (attachments.length === 0) {
        subLectureListElement.innerHTML = '<li>لا توجد محاضرات فرعية متاحة.</li>';
    }
}



// تحميل المحاضرات الافتراضية عند فتح الصفحة
function loadLectures(page, query = '') {
    currentLecturePage = page; // تحديث رقم الصفحة الحالية
    mainLectureListElement.innerHTML = '';
    fetchLectures(page, query).then(lectures => {
        displayMainLectures(lectures);
    });
}


// تحميل المحاضرات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadLectures(currentLecturePage);
});



function toggleSubLectureList() {
    const subLectureList = document.getElementById('subLectureList');
    const dropdownArrow = document.getElementById('dropdownArrow');
    
    subLectureList.classList.toggle('hidden');

    if (subLectureList.classList.contains('hidden')) {
        dropdownArrow.innerHTML = '&#9662;'; // سهم لأسفل
    } else {
        dropdownArrow.innerHTML = '&#9652;'; // سهم لأعلى
    }
}
