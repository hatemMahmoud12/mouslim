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

// إعداد API الكتب
const apiBaseUrl = 'https://api3.islamhouse.com/v3/paV29H2gm56kvLPy/main/books/ar/ar/';
const itemsPerPage = 25;
const bookList = document.getElementById('book-list');
const loadingSpinner = document.getElementById('loading-spinner');
let totalPages = 194; // إجمالي عدد الصفحات
let currentSearchAbortController; // للتحكم في إلغاء عمليات البحث السابقة

// تحميل صفحة من الكتب مع استخدام AbortController للإلغاء
function fetchBooks(page, controller) {
    return fetch(`${apiBaseUrl}${page}/${itemsPerPage}/json`, { signal: controller.signal })
        .then(response => response.json())
        .then(data => data.data || [])
        .catch(error => {
            if (error.name === 'AbortError') {
                console.log('تم إلغاء البحث الحالي.');
            } else {
                console.error('Error fetching books:', error);
            }
        });
}

// عرض الكتب
function displayBooks(books) {
    books.forEach(book => {
        const bookDiv = document.createElement('div');
        bookDiv.classList.add('book');

        // إنشاء عنوان الكتاب
        const titleElement = document.createElement('h2');
        titleElement.textContent = book.title;
        adjustFontSize(titleElement); // ضبط حجم الخط

        // إضافة عناصر أخرى
        const authorElement = document.createElement('p');
        authorElement.textContent = book.prepared_by[0]?.title || 'غير معروف';

        const linkElement = document.createElement('a');
        linkElement.classList.add('btn');
        linkElement.href = book.attachments[0]?.url || '#';
        linkElement.target = '_blank';
        linkElement.textContent = 'قراءة الكتاب';

        bookDiv.appendChild(titleElement);
        bookDiv.appendChild(authorElement);
        bookDiv.appendChild(linkElement);
        bookList.appendChild(bookDiv);
    });
}

// ضبط حجم الخط بناءً على طول النص
function adjustFontSize(textElement) {
    const textLength = textElement.textContent.length;
    textElement.style.fontSize = textLength > 90 ? '14px' : '20px';
}

// البحث عن الكتب عبر جميع الصفحات
async function searchBooks(query = '') {
    // إلغاء البحث السابق إذا كان جاريًا
    if (currentSearchAbortController) {
        currentSearchAbortController.abort();
    }

    // إنشاء AbortController جديد للبحث الحالي
    currentSearchAbortController = new AbortController();

    showLoadingSpinner(true); // إظهار الـ spinner عند بدء البحث
    bookList.innerHTML = ''; // مسح المحتوى عند بداية البحث

    let foundBooks = []; // مصفوفة لتخزين الكتب التي تم العثور عليها

    for (let page = 1; page <= totalPages; page++) {
        const books = await fetchBooks(page, currentSearchAbortController);

        // تصفية الكتب حسب الكلمة المدخلة
        const filteredBooks = query ? books.filter(book => book.title.includes(query)) : books;

        // إذا تم العثور على كتب، تخزينها
        foundBooks = foundBooks.concat(filteredBooks); // إضافة الكتب الموجودة إلى المصفوفة

        // إذا تم العثور على كتب، عرضها
        if (filteredBooks.length > 0) {
            displayBooks(filteredBooks); // عرض النتائج أثناء التحميل
        }
    }

    // إذا انتهى البحث ولم يتم العثور على أي كتب
    if (foundBooks.length === 0) {
        bookList.innerHTML = '<p>لم يتم العثور على نتائج.</p>';
    }

    showLoadingSpinner(false); // إخفاء الـ spinner بعد انتهاء البحث
}

// إظهار أو إخفاء علامة التحميل
function showLoadingSpinner(isLoading) {
    loadingSpinner.style.display = isLoading ? 'flex' : 'none';
}

// تحميل الصفحة الأولى عند فتح الصفحة لعرض جميع الكتب
document.addEventListener('DOMContentLoaded', () => {
    searchBooks(); // عرض جميع الكتب بدون بحث عند التحميل
});

// البحث عند الضغط على زر البحث
document.getElementById('searchButton').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value.trim(); // حذف الفراغات من البداية والنهاية
    searchBooks(query); // البحث بالكلمة المدخلة
});
