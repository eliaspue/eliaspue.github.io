document.addEventListener('DOMContentLoaded', function() {

    const cards = document.querySelectorAll('.card-inner');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            card.classList.toggle('flipped');
        });
    });

    // Initialiser les barres de compétences
    const skillLevels = document.querySelectorAll('.skill-level');
    skillLevels.forEach(skill => {
        const width = skill.style.width;
        skill.style.setProperty('--skill-width', width);
        skill.style.width = '0';
    });
});
