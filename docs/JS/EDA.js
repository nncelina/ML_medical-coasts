document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".eda-tab");
    const cards = document.querySelectorAll(".eda-card");

    function activateTab(tab) {
        // Désactiver tous les onglets
        tabs.forEach(t => t.classList.remove("active"));

        // Cacher toutes les cartes
        cards.forEach(card => card.classList.remove("active"));

        // Activer l’onglet cliqué
        tab.classList.add("active");

        // Afficher la carte correspondante
        const targetId = tab.getAttribute("href");
        if (targetId.startsWith("#")) {
            const targetCard = document.querySelector(targetId);
            if (targetCard) {
                targetCard.classList.add("active");
            }
        }
    }

    // Click sur un onglet
    tabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            // On ignore le profiling report (lien externe)
            if (tab.classList.contains("report")) return;

            e.preventDefault();
            activateTab(tab);
        });
    });

    // ACTIVER PAR DÉFAUT LE PREMIER ONGLET
    activateTab(tabs[0]);
});

