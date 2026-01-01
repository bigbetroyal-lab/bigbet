document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
        const page = card.dataset.page;
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(page).classList.add('active');

        if(page === 'slot-mario') iniciarSlotMario(); // inicializa o slot
    });
});

