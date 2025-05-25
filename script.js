document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const snap = document.getElementById('snap');
    const photo = document.getElementById('photo');
    const gallery = document.getElementById('gallery');
    const toggleCamera = document.getElementById('toggleCamera');
    const cameraIcon = document.getElementById('cameraIcon');
    const clearGalleryBtn = document.getElementById('clearGallery');
    
    let cameraStream = null;
    let facingMode = 'user'; // 'user' para frontal, 'environment' para trasera
    let isCameraOn = false;
    
    // Iniciar la cámara
    function startCamera() {
        stopCamera(); // Asegurarse de que no hay otra cámara activa
        
        const constraints = {
            video: { 
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                cameraStream = stream;
                video.srcObject = stream;
                isCameraOn = true;
                updateCameraIcon();
                
                // Mostrar el video cuando esté listo
                video.onloadedmetadata = () => {
                    video.play();
                    showToast('Cámara activada', 'success');
                };
            })
            .catch(error => {
                console.error('Error al acceder a la cámara:', error);
                showToast('Error al acceder a la cámara', 'error');
            });
    }
    
    // Detener la cámara
    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            cameraStream = null;
            isCameraOn = false;
            updateCameraIcon();
        }
    }
    
    // Cambiar entre cámaras frontal/trasera
    function switchCamera() {
        facingMode = facingMode === 'user' ? 'environment' : 'user';
        startCamera();
    }
    
    // Actualizar el ícono de la cámara
    function updateCameraIcon() {
        if (isCameraOn) {
            cameraIcon.classList.remove('fa-video-slash');
            cameraIcon.classList.add('fa-video');
            toggleCamera.title = 'Apagar cámara';
        } else {
            cameraIcon.classList.remove('fa-video');
            cameraIcon.classList.add('fa-video-slash');
            toggleCamera.title = 'Encender cámara';
        }
    }
    
    // Tomar foto
    function capturePhoto() {
        if (!isCameraOn) {
            showToast('La cámara está apagada', 'warning');
            return;
        }
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataURL = canvas.toDataURL('image/jpeg', 0.9);
        photo.src = dataURL;
        photo.style.display = 'block';
        
        // Efecto de flash
        document.body.classList.add('flash-effect');
        setTimeout(() => {
            document.body.classList.remove('flash-effect');
        }, 200);
        
        savePhoto(dataURL);
        showToast('Foto capturada!', 'success');
    }
    
    // Guardar foto en localStorage
    function savePhoto(dataURL) {
        let photos = JSON.parse(localStorage.getItem('photos')) || [];
        photos.unshift(dataURL); // Agregar al inicio para mostrar primero las más recientes
        localStorage.setItem('photos', JSON.stringify(photos));
        displayPhotos();
    }
    
    // Mostrar fotos en la galería
    function displayPhotos() {
        const photos = JSON.parse(localStorage.getItem('photos')) || [];
        gallery.innerHTML = '';
        
        if (photos.length === 0) {
            gallery.innerHTML = '<p class="empty-gallery">No hay fotos en la galería</p>';
            return;
        }
        
        photos.forEach((photoURL, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item fade-in';
            
            const img = document.createElement('img');
            img.src = photoURL;
            img.className = 'gallery-photo';
            img.loading = 'lazy'; // Lazy loading para mejor performance
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deletePhoto(index);
            };
            
            galleryItem.appendChild(img);
            galleryItem.appendChild(deleteBtn);
            galleryItem.onclick = () => viewPhoto(photoURL);
            
            gallery.appendChild(galleryItem);
        });
    }
    
    // Eliminar foto
    function deletePhoto(index) {
        const photos = JSON.parse(localStorage.getItem('photos')) || [];
        photos.splice(index, 1);
        localStorage.setItem('photos', JSON.stringify(photos));
        displayPhotos();
        showToast('Foto eliminada', 'info');
    }
    
    // Limpiar toda la galería
    function clearGallery() {
        if (confirm('¿Estás seguro de que quieres borrar todas las fotos?')) {
            localStorage.removeItem('photos');
            displayPhotos();
            showToast('Galería limpiada', 'info');
        }
    }
    
    // Ver foto en grande (podrías implementar un modal aquí)
    function viewPhoto(photoURL) {
        // En una implementación completa, esto abriría un modal con la foto
        console.log('Ver foto:', photoURL);
    }
    
    // Mostrar notificaciones
    function showToast(message, type) {
        // En una implementación completa, esto mostraría un toast bonito
        console.log(`${type}: ${message}`);
    }
    
    // Event listeners
    snap.addEventListener('click', capturePhoto);
    toggleCamera.addEventListener('click', () => {
        if (isCameraOn) {
            stopCamera();
        } else {
            startCamera();
        }
    });
    
    // Doble clic en el botón de cámara para cambiar entre frontal/trasera
    toggleCamera.addEventListener('dblclick', switchCamera);
    
    clearGalleryBtn.addEventListener('click', clearGallery);
    
    // Iniciar la cámara al cargar
    startCamera();
    displayPhotos();
    
    // Efecto de flash para CSS
    const style = document.createElement('style');
    style.textContent = `
        .flash-effect::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: white;
            opacity: 0;
            animation: flash 0.2s ease-out;
            pointer-events: none;
            z-index: 1000;
        }
        
        @keyframes flash {
            0% { opacity: 0.8; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});