document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Merci pour votre message !');
        // Vous pouvez ajouter ici du code pour envoyer les données du formulaire au serveur
        contactForm.reset();
    });

    const cards = document.querySelectorAll('.card-inner');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            card.classList.toggle('flipped');
        });
    });
});
