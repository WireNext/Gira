const tourData = [
    { id: 1, date: new Date(2026, 5, 27), city: "Castelló", venue: "Pabellón Ciutat de Castelló", cap: 5260, soldOut: true, time: "21:30", cancelled: false },
    { id: 2, date: new Date(2026, 6, 1), city: "Valéncia", venue: "Roig Arena", cap: 20000, soldOut: true, time: "21:30", cancelled: false },
    { id: 3, date: new Date(2026, 6, 2), city: "Valéncia", venue: "Roig Arena", cap: 20000, soldOut: false, time: "21:30", cancelled: false },
    { id: 4, date: new Date(2026, 6, 5), city: "Murcia", venue: "Palacio de Deportes", cap: 7454, soldOut: true, time: "21:30", cancelled: false },
    { id: 5, date: new Date(2026, 6, 9), city: "Málaga", venue: "Martín Carpena", cap: 10000, soldOut: false, time: "21:30", cancelled: false },
    { id: 6, date: new Date(2026, 6, 13), city: "Sevilla", venue: "San Pablo", cap: 10200, soldOut: false, time: "21:30", cancelled: false },
    { id: 7, date: new Date(2026, 6, 17), city: "Madrid", venue: "WiZink / Movistar Arena", cap: 17400, soldOut: true, time: "21:30", cancelled: false },
    { id: 8, date: new Date(2026, 6, 18), city: "Madrid", venue: "WiZink / Movistar Arena", cap: 17400, soldOut: true, time: "21:30", cancelled: false },
    { id: 9, date: new Date(2026, 6, 21), city: "Zaragoza", venue: "Príncipe Felipe", cap: 8400, soldOut: false, time: "21:30", cancelled: false },
    { id: 10, date: new Date(2026, 6, 25), city: "Bilbao", venue: "Bizkaia Arena (BEC)", cap: 26000, soldOut: false, time: "21:30", cancelled: false },
    { id: 11, date: new Date(2026, 6, 29), city: "Barcelona", venue: "Palau Sant Jordi", cap: 17960, soldOut: true, time: "21:30", cancelled: false },
    { id: 12, date: new Date(2026, 6, 30), city: "Barcelona", venue: "Palau Sant Jordi", cap: 17960, soldOut: false, time: "21:30", cancelled: false },
    { id: 13, date: new Date(2026, 7, 2), city: "Borriana", venue: "Arenal Sound 2026", cap: 40000, soldOut: false, time: "21:30", cancelled: false },
    { id: 13, date: new Date(2026, 7, 2), city: "Alacant", venue: "Pabellón Pedro Ferrándiz", cap: 5700, soldOut: true, time: "21:30", cancelled: false },
    { id: 14, date: new Date(2026, 7, 6), city: "Palma (Mallorca)", venue: "Velódromo Illes Balears", cap: 7000, soldOut: false, time: "21:30", cancelled: false },
    { id: 15, date: new Date(2026, 7, 10), city: "Las Palmas (GC)", venue: "Gran Canaria Arena", cap: 11500, soldOut: true, time: "21:30", cancelled: false }
];

let currentFilter = localStorage.getItem('tourFilter') || 'all';
let searchQuery = '';

function cleanText(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function calculateStats() {
    let totalCap = 0;
    let soldCap = 0;
    let soldOutCount = 0;

    tourData.forEach(show => {
        if (!show.cancelled) { // Las cancelaciones no suman aforo real operativo
            totalCap += show.cap;
            if (show.soldOut) {
                soldCap += show.cap;
                soldOutCount++;
            }
        }
    });

    const percentTickets = totalCap > 0 ? ((soldCap / totalCap) * 100).toFixed(1) : 0;

    document.getElementById('stat-total-cap').innerText = totalCap.toLocaleString('es-ES');
    document.getElementById('stat-sold-cap').innerText = soldCap.toLocaleString('es-ES');
    document.getElementById('stat-sold-perf').innerText = `Ocupación Asegurada (${percentTickets}%)`;
    document.getElementById('stat-soldout-count').innerText = `${soldOutCount} / ${tourData.filter(s => !s.cancelled).length}`;
}

function renderNextShowModule() {
    const banner = document.getElementById('next-show-banner');
    const today = new Date();
    today.setHours(0,0,0,0);

    // Buscar concierto activo (no cancelado) que sea de hoy o posterior
    const nextShow = tourData.find(show => {
        const d = new Date(show.date);
        d.setHours(0,0,0,0);
        return d >= today && !show.cancelled;
    }) || tourData.find(show => !show.cancelled);

    if (!nextShow) {
        banner.style.display = "none";
        return;
    }

    const sDate = new Date(nextShow.date);
    sDate.setHours(0,0,0,0);
    const diffDays = Math.ceil((sDate - today) / (1000 * 60 * 60 * 24));

    let countdownHTML = '';
    if (diffDays === 0) {
        countdownHTML = `<span class="countdown-timer today">⚡ ¡HOY A LAS ${nextShow.time}!</span>`;
    } else if (diffDays === 1) {
        countdownHTML = `<span class="countdown-timer">⏳ Mañana — ${nextShow.time}</span>`;
    } else {
        countdownHTML = `<span class="countdown-timer">Faltan ${diffDays} días</span>`;
    }

    banner.innerHTML = `
        <div>
            <div class="next-title">📍 Siguiente Objetivo Operativo</div>
            <div class="next-city">${nextShow.city}</div>
            <div class="next-venue">${nextShow.venue}</div>
        </div>
        <div class="countdown-box">
            ${countdownHTML}
        </div>
    `;
}

function renderTour() {
    const container = document.getElementById('tour-list');
    container.innerHTML = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthsEs = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const daysEs = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    let pastCount = 0;

    tourData.forEach(show => {
        const showDate = new Date(show.date);
        showDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((showDate - today) / (1000 * 60 * 60 * 24));

        let statusClass = "";
        let badgeHTML = "";
        let isPast = false;

        if (show.cancelled) {
            statusClass = "status-cancelled";
            badgeHTML = `<span class="badge badge-cancelled">Cancelado</span>`;
        } else if (diffDays < 0) {
            statusClass = "status-past";
            badgeHTML = `<span class="badge badge-past">Finalizado</span>`;
            pastCount++;
            isPast = true;
        } else if (diffDays === 0) {
            statusClass = "status-today";
            badgeHTML = `<span class="badge badge-today">¡HOY!</span>`;
            pastCount++; 
        } else {
            statusClass = "status-future";
            badgeHTML = `<span class="badge badge-future">Faltan ${diffDays} d</span>`;
        }

        const cleanCity = cleanText(show.city);
        const cleanVenue = cleanText(show.venue);

        if (!cleanCity.includes(searchQuery) && !cleanVenue.includes(searchQuery)) return;
        if (currentFilter === 'upcoming' && isPast && diffDays !== 0) return;
        if (currentFilter === 'soldout' && !show.soldOut) return;

        let soldOutBadge = (show.soldOut && !show.cancelled) ? `<span class="soldout-tag">🔥 SOLD OUT</span>` : '';
        const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(show.venue + ' ' + show.city)}`;

        const card = document.createElement('div');
        card.className = `show-card ${statusClass}`;
        card.innerHTML = `
            <div class="date-box">
                <span class="date-day">${show.date.getDate()}</span>
                <span class="date-month">${monthsEs[show.date.getMonth()]} / ${daysEs[show.date.getDay()]}</span>
            </div>
            <div class="info-box">
                <div class="city">${show.city}</div>
                <div class="venue"><a href="${show.cancelled ? '#' : mapsUrl}" target="${show.cancelled ? '_self' : '_blank'}">📍 ${show.venue}</a></div>
                <div class="meta-info">
                    <span class="capacity">👥 Aforo: ${show.cap.toLocaleString('es-ES')}</span>
                    <span class="time-tag">🕒 ${show.time} h</span>
                    ${soldOutBadge}
                </div>
            </div>
            ${badgeHTML}
        `;
        container.appendChild(card);
    });

    const activeShows = tourData.filter(s => !s.cancelled).length;
    const percentage = activeShows > 0 ? Math.round((pastCount / activeShows) * 100) : 0;
    document.getElementById('progress-bar').style.width = `${percentage}%`;
    document.getElementById('progress-percentage').innerText = `${percentage}%`;
    document.getElementById('progress-counts').innerText = `${pastCount}/${activeShows}`;
}

function filterTour(filter, btnElement) {
    currentFilter = filter;
    localStorage.setItem('tourFilter', filter);
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
    renderTour();
}

function handleSearch() {
    searchQuery = cleanText(document.getElementById('search-input').value);
    renderTour();
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-toggle').innerText = savedTheme === 'dark' ? '🌙' : '☀️';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    document.getElementById('theme-toggle').innerText = newTheme === 'dark' ? '🌙' : '☀️';
}

window.onload = () => {
    initTheme();
    calculateStats();
    renderNextShowModule();
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-${currentFilter}`);
    if (activeBtn) activeBtn.classList.add('active');
    renderTour();
};