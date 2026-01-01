// ==== CONTROLE DE TELAS ====
document.querySelectorAll('.sidebar-menu button').forEach(btn => {
    btn.addEventListener('click', () => {
        const page = btn.dataset.page;

        // Oculta todas
        document.querySelectorAll('.page').forEach(sec => {
            sec.classList.remove('active');
        });

        // Mostra a selecionada
        const target = document.getElementById(page);
        if (target) {
            target.classList.add('active');
        }

        // Atualiza título ou lógica adicional
        console.log("Página mostrada:", page);
    });
});
