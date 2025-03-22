const serverUrl = 'http://194.67.93.117:80';

const galleryContainer = document.getElementById('galleryContainer');
const loader = document.getElementById('loader');
const refreshButton = document.getElementById('refreshGallery');
const tempForm = document.getElementById('temperatureForm');
const submitButton = document.getElementById('submitTemp');
const toastContainer = document.getElementById('toastContainer');
const themeToggle = document.getElementById('themeToggle');

function changeTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

themeToggle.addEventListener('click', changeTheme);

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <div>${message}</div>
        <button class="toast-close">✕</button>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    const closeButton = toast.querySelector('.toast-close');
    closeButton.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

async function loadImages(retries = 3) {
    galleryContainer.innerHTML = '';
    galleryContainer.appendChild(loader);
    
    try {
        const response = await fetch(`${serverUrl}/images`);
        
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }
        
        const images = await response.json();
        showImages(images);
    } catch (error) {
        console.error('Ошибка при загрузке:', error);
        
        if (retries > 0) {
            setTimeout(() => {
                loadImages(retries - 1);
            }, 1000);
        } else {
            galleryContainer.innerHTML = '';
            showToast('Не удалось загрузить изображения', 'error');
        }
    }
}

function showImages(images) {
    galleryContainer.innerHTML = '';
    
    if (!images || images.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-gallery';
        emptyMessage.textContent = 'Изображения не найдены';
        galleryContainer.appendChild(emptyMessage);
        return;
    }
    
    const grid = document.createElement('div');
    grid.className = 'gallery-grid';
    
    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = image.url;
        img.alt = image.title || 'Изображение';
        
        const caption = document.createElement('div');
        caption.className = 'caption';
        caption.textContent = image.title || 'Без названия';
        
        item.appendChild(img);
        item.appendChild(caption);
        grid.appendChild(item);
    }
    
    galleryContainer.appendChild(grid);
}

async function sendTemperature(roomNumber, temperature) {
    submitButton.disabled = true;
    
    try {
        const data = {
            class: roomNumber,
            temp: parseFloat(temperature)
        };
        
        const response = await fetch(`${serverUrl}/temp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Ошибка при отправке');
        }
        
        showToast(result.message || 'Данные успешно отправлены');
        tempForm.reset();
    } catch (error) {
        console.error('Ошибка:', error);
        showToast(error.message || 'Ошибка при отправке данных', 'error');
    } finally {
        submitButton.disabled = false;
    }
}

window.addEventListener('load', () => {
    loadImages();
});

refreshButton.addEventListener('click', () => {
    loadImages();
});

tempForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const roomNumber = document.getElementById('roomNumber').value;
    const temperature = document.getElementById('temperature').value;
    
    sendTemperature(roomNumber, temperature);
});