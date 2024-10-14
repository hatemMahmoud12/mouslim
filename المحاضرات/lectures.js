// الثوابت للعناصر الثابتة
let fixedNav = document.querySelector('.header'),
    scrollBtn = document.querySelector('.scrollBtn');

// إضافة أحداث التمرير للتنقل بين الأجزاء
window.addEventListener("scroll", () => {
    fixedNav.classList.toggle('active', window.scrollY > 100);
    scrollBtn.classList.toggle('active', window.scrollY > 500);
});

// ربط الأقسام بالرابط
let sections = document.querySelectorAll("section"),
    links = document.querySelectorAll('.header ul li');

links.forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.header ul li.active').classList.remove('active');
        link.classList.add('active');
        let target = link.dataset.filter;

        sections.forEach(section => {
            if (section.classList.contains(target)) {
                section.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    });
});


//Active SideBar
let bars = document.querySelector('.bars'),
    SideBar = document.querySelector('.header ul');
bars.addEventListener('click',()=>{
    SideBar.classList.toggle("active");
})






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

// جلب المحاضرات للصفحة التالية
function loadMoreLectures() {
    if (currentLecturePage < totalPages) {
        currentLecturePage++;
        fetchLectures(currentLecturePage, searchTerm).then(lectures => {
            displayMainLectures(lectures, true); // إضافة المحاضرات الجديدة بدون مسح القديمة
        });
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

// تفعيل البحث مع التأخير لتجنب عمليات البحث المتكررة
searchBox.addEventListener('input', async () => {
    const query = searchBox.value.trim();
    searchTerm = query; // تخزين الكلمة المفتاحية
    if (searchTerm !== '') {
        const allResults = await fetchAllSearchResults(query); // جلب نتائج البحث من جميع الصفحات
        displayMainLectures(allResults); // عرض جميع نتائج البحث
    } else {
        loadLectures(1); // إعادة تحميل المحاضرات الافتراضية إذا لم يكن هناك بحث
    }
});

// تحميل المحاضرات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadLectures(currentLecturePage);
});

// مراقبة التمرير للأسفل
mainLectureListElement.addEventListener('scroll', () => {
    if (mainLectureListElement.scrollTop + mainLectureListElement.clientHeight >= mainLectureListElement.scrollHeight) {
        document.getElementById('loadMoreButton').classList.remove('hidden');
    }
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
