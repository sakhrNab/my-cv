// Event listeners and initialization
window.addEventListener('scroll', () => {
    document.querySelector('.nav').classList.toggle('scrolled', window.scrollY > 100);
});

document.getElementById('mobileMenuBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector('.nav-links')?.classList.toggle('active');
});

// Profile image handling
const profileImg = new Image();
profileImg.src = './assets/profilepic.jpg';
profileImg.onload = function() {
    const pi = document.getElementById('profileImage');
    if (pi) pi.innerHTML = `<img src="${this.src}" alt="Sakhr">`;
};

document.getElementById('fileInput')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            document.getElementById('profileImage').innerHTML = `<img src="${ev.target.result}" alt="Profile">`;
        };
        reader.readAsDataURL(file);
    }
});

