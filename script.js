document.addEventListener('DOMContentLoaded', () => {
 const video = document.getElementById("video");
 const canvas = document.getElementById("canvas");
 const context = canvas.getContext("2d");
 const snap = document.getElementById("snap")
 const photo = document.getElementById("photo")
 const gallery = document.getElementById("gallery")
 const toggleCamera = document.getElementById("toggleCamera");
 const cameraIcon = document.getElementById("cameraIcon");

 let cameraStream;
 //Solicitar acceso a la cámara
navigator.mediaDevices.getUserMedia({video: true})

.then(stream => {
    cameraStream = stream
    video.srcObject = stream;
    cameraIcon.classList.remove("fa-video-slash");
    cameraIcon.classList.add("fa-video");
})
.catch(error => {
    console.log("Error al acceder a la Cámara", error)
});

//tomar foto
snap.addEventListener("click", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

//Convertir el contenido del canvas a una URL de la imagen
const dataURL = canvas.toDataURL("image/png")
photo.setAttribute("src", dataURL);
photo.style.display = "block"

//Guardar la fonto en el localStorage
savePhoto(dataURL)
displayPhotos();
})

















    








    // Guardar la foto en localStorage
    function savePhoto(dataURL) {
        let photos = JSON.parse(localStorage.getItem('photos')) || [];
        photos.push(dataURL);
        localStorage.setItem('photos', JSON.stringify(photos));
    }

    // Mostrar las fotos almacenadas en la galería
    function displayPhotos() {
        let photos = JSON.parse(localStorage.getItem('photos')) || [];
        gallery.innerHTML = '';
        photos.forEach((photoURL, index) => {
            let imgContainer = document.createElement('div');
            imgContainer.classList.add('gallery-item');

            let img = document.createElement('img');
            img.src = photoURL;
            img.classList.add('gallery-photo');
            imgContainer.appendChild(img);

            let deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', () => {
                deletePhoto(index);
            });
            imgContainer.appendChild(deleteButton);

            gallery.appendChild(imgContainer);
        });
    }

    // Eliminar foto de localStorage
    function deletePhoto(index) {
        let photos = JSON.parse(localStorage.getItem('photos')) || [];
        photos.splice(index, 1);
        localStorage.setItem('photos', JSON.stringify(photos));
        displayPhotos();
    }

    // Mostrar las fotos almacenadas al cargar la página
    displayPhotos();

    // Toggle camera on/off
    toggleCamera.addEventListener('click', () => {
        if (cameraStream) {
            let tracks = cameraStream.getTracks();
            tracks.forEach(track => track.stop());
            video.srcObject = null;
            cameraStream = null;
            cameraIcon.classList.remove('fa-video');
            cameraIcon.classList.add('fa-video-slash');
        } else {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    cameraStream = stream;
                    video.srcObject = stream;
                    cameraIcon.classList.remove('fa-video-slash');
                    cameraIcon.classList.add('fa-video');
                })
                .catch(error => {
                    console.error('Error al acceder a la cámara: ', error);
                });
        }
    });
});


