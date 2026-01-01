document.querySelectorAll('[data-page]').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(btn.dataset.page).classList.add('active');
    };
});
