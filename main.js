/**
        * Lógica de Dev-Log Dashboard
        * Sigue principios de modularidad y ES6+
        */

// ===== STORAGE MANAGEMENT =====
const STORAGE_KEY = 'dev-log-entries';
const COUNTER_KEY = 'dev-log-counter';

/**
 * Valida el contenido de una entrada
 * @param {string} text - Texto a validar
 * @returns {Object} { valid: boolean, error?: string }
 */
const validateContent = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return { valid: false, error: 'El campo no puede estar vacío' };
    if (trimmed.length < 5) return { valid: false, error: 'Mínimo 5 caracteres requeridos' };
    if (trimmed.length > 5000) return { valid: false, error: 'Máximo 5000 caracteres permitidos' };
    return { valid: true };
};

/**
 * Guarda las entradas en localStorage
 * @param {Array} entries - Array de objetos con entries
 */
const saveToStorage = (entries) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
    }
};

/**
 * Carga las entradas desde localStorage
 * @returns {Array} Array de entradas guardadas
 */
const loadFromStorage = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error al cargar desde localStorage:', error);
        return [];
    }
};

/**
 * Guarda el contador en localStorage
 * @param {number} count - Número de entradas
 */
const saveCounterToStorage = (count) => {
    try {
        localStorage.setItem(COUNTER_KEY, count.toString());
    } catch (error) {
        console.error('Error al guardar contador:', error);
    }
};

/**
 * Carga el contador desde localStorage
 * @returns {number} Contador guardado
 */
const loadCounterFromStorage = () => {
    try {
        const stored = localStorage.getItem(COUNTER_KEY);
        return stored ? parseInt(stored, 10) : 0;
    } catch (error) {
        console.error('Error al cargar contador:', error);
        return 0;
    }
};

/**
 * Muestra una notificación visual
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - 'error' o 'success'
 */
const showNotification = (message, type = 'error') => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 600;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                background: ${type === 'error' ? '#ef4444' : '#10b981'};
                color: white;
            `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
};

document.addEventListener('DOMContentLoaded', () => {
    // ===== SIDEBAR MANAGEMENT =====
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mainContent = document.getElementById('mainContent');
    const navItems = document.querySelectorAll('.nav-item');

    // Toggle sidebar en mobile
    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });

    // ===== LOG ENTRY MANAGEMENT =====
    const logInput = document.getElementById('logInput');
    const saveBtn = document.getElementById('saveBtn');
    const feedGrid = document.getElementById('feedGrid');
    const logCounter = document.getElementById('logCounter');

    let entriesCount = loadCounterFromStorage();
    logCounter.textContent = entriesCount;

    /**
     * Formatea la fecha actual de forma amigable
     * @returns {string} Fecha formateada
     */
    const getFormattedDate = () => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('es-ES', options);
    };

    /**
     * Actualiza el contador visual de entradas
     */
    const updateCounter = () => {
        entriesCount++;
        logCounter.textContent = entriesCount;
        saveCounterToStorage(entriesCount);
    };

    /**
     * Crea el elemento HTML de una nueva card
     * @param {string} text - Contenido de la entrada
     * @returns {HTMLElement} Elemento de la card
     */
    const createCardElement = (text) => {
        const card = document.createElement('article');
        card.className = 'log-card pop-in';

        // Limpiar clase de animación al terminar para no interferir en otros renders
        card.addEventListener('animationend', () => {
            card.classList.remove('pop-in');
        }, { once: true });

        card.innerHTML = `
                    <div class="card-meta">
                        <span class="badge">Aprendizaje</span>
                        <span class="date">${getFormattedDate()}</span>
                    </div>
                    <div class="content">${text}</div>
                `;

        return card;
    };

    /**
     * Maneja la acción de guardar una nueva entrada
     */
    const handleSave = () => {
        try {
            const validation = validateContent(logInput.value);

            if (!validation.valid) {
                showNotification(validation.error, 'error');
                logInput.focus();
                return;
            }

            const content = logInput.value.trim();
            const newCard = createCardElement(content);

            // Insertar al inicio (UX: flujo de noticias/feed)
            feedGrid.insertBefore(newCard, feedGrid.firstChild);

            // Guardar en storage
            const entries = Array.from(feedGrid.querySelectorAll('.log-card:not(.welcome)')).map(card => ({
                text: card.querySelector('.content').textContent,
                date: card.querySelector('.date').textContent
            }));
            saveToStorage(entries);

            // Reset UI
            logInput.value = '';
            updateCounter();
            logInput.focus();
            showNotification('Entrada guardada correctamente ✓', 'success');
        } catch (error) {
            console.error('Error al guardar entrada:', error);
            showNotification('Error al guardar la entrada', 'error');
        }
    };

    /**
     * Inicializa la aplicación
     */
    const init = () => {
        // Cargar entradas guardadas
        const savedEntries = loadFromStorage();

        if (savedEntries.length === 0) {
            // Mostrar mensaje de bienvenida si no hay entradas
            const welcomeText = "¡Bienvenido al nuevo Dev-Log Dashboard! 🎉\n\nEste es tu espacio personal para documentar tu viaje como desarrollador. Registra tus eureka moments, desafíos superados y progresos diarios.\n\n¡Comienza escribiendo tu primera entrada!";
            const welcomeCard = createCardElement(welcomeText);
            welcomeCard.classList.add('welcome');
            feedGrid.appendChild(welcomeCard);
        } else {
            // Restaurar entradas guardadas
            savedEntries.forEach(entry => {
                const card = createCardElement(entry.text);
                feedGrid.appendChild(card);
            });
        }
    };

    // Event Listeners
    saveBtn.addEventListener('click', handleSave);

    // Permitir guardar con Ctrl + Enter para mejorar la UX de desarrolladores
    logInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSave();
        }
    });

    // ===== SECTION MANAGEMENT =====
    /**
     * Cambia de sección en el dashboard
     * @param {string} sectionName - Nombre de la sección a mostrar
     */
    const switchSection = (sectionName) => {
        // Ocultar todas las secciones de contenido
        document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));

        // Mostrar la sección correcta usando el ID (evita colisión con data-section del nav)
        const target = document.getElementById(sectionName);
        if (target) target.classList.add('active');

        // Actualizar estado activo del nav
        navItems.forEach(i => {
            i.classList.remove('active');
            i.removeAttribute('aria-current');
        });
        const activeNav = document.querySelector(`.nav-item[data-section="${sectionName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
            activeNav.setAttribute('aria-current', 'page');
        }

        // Cerrar sidebar en mobile
        if (window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
            mainContent.classList.remove('expanded');
        }

        // Ejecutar lógica específica por sección
        if (sectionName === 'entradas') renderAllEntries();
        if (sectionName === 'estadisticas') updateStatistics();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Un solo listener por nav item
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            switchSection(this.getAttribute('data-section'));
        });
    });

    // ===== MIS ENTRADAS FUNCTIONALITY =====
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const allEntriesGrid = document.getElementById('allEntriesGrid');
    const emptyEntries = document.getElementById('emptyEntries');

    /**
     * Renderiza todas las entradas con búsqueda y ordenamiento
     */
    const renderAllEntries = () => {
        const entries = loadFromStorage();
        const searchTerm = searchInput?.value.toLowerCase() || '';
        const sortBy = sortSelect?.value || 'reciente';

        let filtered = entries.filter(entry =>
            entry.text.toLowerCase().includes(searchTerm)
        );

        // Ordenar según criterio
        switch (sortBy) {
            case 'antiguo':
                filtered = filtered.reverse();
                break;
            case 'alfabetico':
                filtered.sort((a, b) => a.text.localeCompare(b.text));
                break;
            case 'reciente':
            default:
                // Ya está en orden reciente por defecto
                break;
        }

        if (allEntriesGrid) {
            allEntriesGrid.innerHTML = '';

            if (filtered.length === 0) {
                if (emptyEntries) emptyEntries.style.display = 'block';
                return;
            }

            if (emptyEntries) emptyEntries.style.display = 'none';

            filtered.forEach(entry => {
                const card = createCardElement(entry.text);
                allEntriesGrid.appendChild(card);
            });
        }
    };

    // Event listeners para búsqueda y ordenamiento
    if (searchInput) {
        searchInput.addEventListener('input', renderAllEntries);
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', renderAllEntries);
    }

    // ===== STATISTICS FUNCTIONALITY =====
    /**
     * Calcula y actualiza todas las estadísticas
     */
    const updateStatistics = () => {
        const entries = loadFromStorage();
        const totalEntries = entries.length;
        const statTotalEntries = document.getElementById('statTotalEntries');
        const statStreak = document.getElementById('statStreak');
        const statActiveDays = document.getElementById('statActiveDays');
        const statAvgLength = document.getElementById('statAvgLength');

        // Total de entradas
        if (statTotalEntries) {
            statTotalEntries.textContent = totalEntries;
        }

        // Promedio de caracteres
        if (statAvgLength && totalEntries > 0) {
            const totalChars = entries.reduce((sum, entry) => sum + entry.text.length, 0);
            const avgChars = Math.round(totalChars / totalEntries);
            statAvgLength.textContent = avgChars + ' caracteres';
        }

        // Días activos (aproximado por número de entradas únicas)
        if (statActiveDays) {
            statActiveDays.textContent = Math.min(totalEntries, 365);
        }

        // Racha (simplificado)
        if (statStreak) {
            statStreak.textContent = totalEntries > 0 ? Math.ceil(totalEntries / 5) + ' días' : '0 días';
        }

        // Análisis por tema
        generateThemeAnalysis(entries);
        generateActivityLog(entries);
    };

    /**
     * Genera análisis de temas por palabras clave
     */
    const generateThemeAnalysis = (entries) => {
        const themes = {
            'JavaScript': 0,
            'React': 0,
            'CSS': 0,
            'HTML': 0,
            'Git': 0,
            'API': 0,
            'Database': 0,
            'Debugging': 0
        };

        entries.forEach(entry => {
            Object.keys(themes).forEach(theme => {
                if (entry.text.toLowerCase().includes(theme.toLowerCase())) {
                    themes[theme]++;
                }
            });
        });

        const themeAnalysis = document.getElementById('themeAnalysis');
        if (themeAnalysis) {
            themeAnalysis.innerHTML = '';
            Object.entries(themes).forEach(([theme, count]) => {
                if (count > 0) {
                    const percentage = Math.round((count / entries.length) * 100);
                    const bar = document.createElement('div');
                    bar.className = 'theme-item';
                    bar.innerHTML = `
                                <div class="theme-header">
                                    <span class="theme-name">${theme}</span>
                                    <span class="theme-count">${count}</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${percentage}%"></div>
                                </div>
                                <span class="theme-percentage">${percentage}%</span>
                            `;
                    themeAnalysis.appendChild(bar);
                }
            });
        }
    };

    /**
     * Genera log de actividad reciente
     */
    const generateActivityLog = (entries) => {
        const recentActivity = document.getElementById('recentActivity');
        if (recentActivity) {
            recentActivity.innerHTML = '';

            const recent = entries.slice(-5).reverse();

            if (recent.length === 0) {
                recentActivity.innerHTML = '<p class="no-activity">📭 Sin actividad reciente</p>';
                return;
            }

            recent.forEach(entry => {
                const activity = document.createElement('div');
                activity.className = 'activity-item';
                const preview = entry.text.substring(0, 80) + (entry.text.length > 80 ? '...' : '');
                activity.innerHTML = `
                            <span class="activity-date">${entry.date}</span>
                            <span class="activity-preview">${preview}</span>
                        `;
                recentActivity.appendChild(activity);
            });
        }
    };

    // Ejecutar inicialización
    init();
});
