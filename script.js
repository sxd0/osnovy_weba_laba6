const BASE_URL = 'http://194.67.93.117:80';

const galleryContainer = document.getElementById('galleryContainer');
const loader = document.getElementById('loader');
const refreshButton = document.getElementById('refreshGallery');
const temperatureForm = document.getElementById('temperatureForm');
const submitButton = document.getElementById('submitTemp');
const toastContainer = document.getElementById('toastContainer');
const themeToggle = document.getElementById('themeToggle');

// Функция для переключения темы
function toggleTheme() {
    // Получаем текущую тему
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    // Переключаем на другую тему
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Устанавливаем новую тему
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Сохраняем выбор в localStorage
    localStorage.setItem('theme', newTheme);
}

// Обработчик для кнопки переключения темы
themeToggle.addEventListener('click', toggleTheme);

function showToast(message, type = 'success', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <div class="toast-message">${message}</div>
        <button class="toast-close" aria-label="Закрыть уведомление">✕</button>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    const closeButton = toast.querySelector('.toast-close');
    closeButton.addEventListener('click', () => {
        closeToast(toast);
    });
    
    if (duration > 0) {
        setTimeout(() => {
            closeToast(toast);
        }, duration);
    }
    
    return toast;
}

function closeToast(toast) {
    // анимация исчезновения
    toast.classList.remove('show');
    
    // удаляем из DOM после завершения анимации
    setTimeout(() => {
        toast.remove();
    }, 300); // время должно соответствовать transition в CSS
}

async function fetchImages(retries = 3, delay = 1000) {
    // показываем загрузчик
    galleryContainer.innerHTML = '';
    galleryContainer.appendChild(loader);
    
    try {
        // отправляем запрос на сервер
        const response = await fetch(`${BASE_URL}/images`);
        
        // проверяем статус ответа
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        // получаем данные в формате JSON
        const images = await response.json();
        
        // отображаем изображения или сообщение об их отсутствии
        displayImages(images);
    } catch (error) {
        console.error('Ошибка при загрузке изображений:', error);
        
        // если остались попытки, повторяем запрос после задержки
        if (retries > 0) {
            setTimeout(() => {
                fetchImages(retries - 1, delay);
            }, delay);
        } else {
            // если все попытки исчерпаны, показываем сообщение об ошибке
            galleryContainer.innerHTML = '';
            showToast('Не удалось загрузить изображения. Пожалуйста, попробуйте позже.', 'error');
        }
    }
}

function displayImages(images) {
    // удаляем загрузчик
    galleryContainer.innerHTML = '';
    
    // если массив пустой, показываем сообщение
    if (!images || images.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-gallery';
        emptyMessage.textContent = 'Изображения не найдены';
        galleryContainer.appendChild(emptyMessage);
        return;
    }
    
    // создаем контейнер-сетку для изображений
    const galleryGrid = document.createElement('div');
    galleryGrid.className = 'gallery-grid';
    
    // добавляем каждое изображение в сетку
    images.forEach(image => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        item.innerHTML = `
            <img src="${image.url}" alt="${image.title || 'Изображение галереи'}">
            <div class="caption">${image.title || 'Без названия'}</div>
        `;
        
        galleryGrid.appendChild(item);
    });
    
    // добавляем сетку в контейнер галереи
    galleryContainer.appendChild(galleryGrid);
}

async function sendTemperatureData(roomNumber, temperature) {
    submitButton.disabled = true;
    
    try {
        const data = {
            class: roomNumber,
            temp: parseFloat(temperature)
        };
        
        // отправляем POST-запрос
        const response = await fetch(`${BASE_URL}/temp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Ошибка при отправке данных');
        }
        
        showToast(result.message || 'Данные успешно отправлены', 'success');
        
        temperatureForm.reset();
    } catch (error) {
        console.error('Ошибка при отправке данных:', error);
        
        // показываем сообщение об ошибке
        showToast(error.message || 'Произошла ошибка при отправке данных', 'error');
    } finally {
        // разблокируем форму
        submitButton.disabled = false;
    }
}

// ======================= Обработчики событий =======================
// при загрузке страницы загружаем изображения
window.addEventListener('DOMContentLoaded', () => {
    // Загружаем изображения
    fetchImages();
    
    // Устанавливаем правильную тему на основе localStorage
    // (По факту это уже сделано в скрипте в head, но оставляем для полноты)
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
});

refreshButton.addEventListener('click', () => {
    fetchImages();
});

// обработчик отправки формы температуры
temperatureForm.addEventListener('submit', (event) => {
    // предотвращаем стандартное поведение формы
    event.preventDefault();
    
    // получаем значения из полей формы
    const roomNumber = document.getElementById('roomNumber').value;
    const temperature = document.getElementById('temperature').value;
    
    // отправляем данные
    sendTemperatureData(roomNumber, temperature);
});
