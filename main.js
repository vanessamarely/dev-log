 /**
         * Lógica de Dev-Log
         * Sigue principios de modularidad y ES6+
         */
        
        document.addEventListener('DOMContentLoaded', () => {
            const logInput = document.getElementById('logInput');
            const saveBtn = document.getElementById('saveBtn');
            const feedGrid = document.getElementById('feedGrid');
            const logCounter = document.getElementById('logCounter');

            let entriesCount = 0;

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
                const content = logInput.value.trim();

                if (!content) {
                    logInput.style.borderColor = '#ef4444';
                    setTimeout(() => logInput.style.borderColor = '', 2000);
                    return;
                }

                const newCard = createCardElement(content);
                
                // Insertar al inicio (UX: flujo de noticias/feed)
                feedGrid.insertBefore(newCard, feedGrid.firstChild);
                
                // Reset UI
                logInput.value = '';
                updateCounter();
                logInput.focus();
            };

            /**
             * Inicializa la aplicación con un ejemplo
             */
            const init = () => {
                const welcomeText = "¡Bienvenido a Dev-Log! \n\nEste es tu espacio para documentar tu viaje como desarrollador. El registro constante de lo aprendido acelera tu crecimiento profesional.";
                const welcomeCard = createCardElement(welcomeText);
                feedGrid.appendChild(welcomeCard);
                updateCounter();
            };

            // Event Listeners
            saveBtn.addEventListener('click', handleSave);

            // Permitir guardar con Ctrl + Enter para mejorar la UX de desarrolladores
            logInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    handleSave();
                }
            });

            // Ejecutar inicialización
            init();
        });