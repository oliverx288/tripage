fetch("casos.json")
    .then(respuesta => respuesta.json())
    .then(casos => {

        let idioma = "es"
        let casoActual = null
        let casosCompletados = 0
        let estadisticas = {
            total: 0,
            correctos: 0,
            fallos: 0,
            subTriaje: 0,
            sobreTriaje: 0,
            porNivel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            casosRepaso: [],
            casosCompletadosIds: []
        }

        //cargar estadísticas guardadas si existen
        const guardadas = localStorage.getItem("tripage-estadisticas")
        if (guardadas) {
            estadisticas = JSON.parse(guardadas)
            if (!estadisticas.casosCompletadosIds) estadisticas.casosCompletadosIds = []
            if (!estadisticas.subTriaje) estadisticas.subTriaje = 0
            if (!estadisticas.sobreTriaje) estadisticas.sobreTriaje = 0
            casosCompletados = estadisticas.correctos
            document.getElementById("contador-progreso").textContent = casosCompletados + " / 50"
        }

        const niveles = {
            es: {
                1: { romano: "I", titulo: "Nivel I", subtitulo: "Riesgo vital inmediato" },
                2: { romano: "II", titulo: "Nivel II", subtitulo: "Muy urgente" },
                3: { romano: "III", titulo: "Nivel III", subtitulo: "Urgente" },
                4: { romano: "IV", titulo: "Nivel IV", subtitulo: "Estándar" },
                5: { romano: "V", titulo: "Nivel V", subtitulo: "No urgente" }
            },
            en: {
                1: { romano: "I", titulo: "Level I", subtitulo: "Immediate life threat" },
                2: { romano: "II", titulo: "Level II", subtitulo: "Very urgent" },
                3: { romano: "III", titulo: "Level III", subtitulo: "Urgent" },
                4: { romano: "IV", titulo: "Level IV", subtitulo: "Standard" },
                5: { romano: "V", titulo: "Level V", subtitulo: "Non-urgent" }
            }
        }

        const textos = {
            es: {
                elegir: "Elige un caso para clasificar",
                filtros: ["Todos", "Básico", "Intermedio", "Difícil", "Avanzado"],
                presentacion: "Presentación clínica",
                constantes: "Constantes vitales",
                selecciona: "Selecciona el nivel de triaje Manchester:",
                manchester: ["Inmediato", "Muy urgente", "Urgente", "Estándar", "No urgente"],
                restantes: "restantes",
                tiempoAcabado: "Se acabó el tiempo",
                incorrecto: "Incorrecto",
                porqueNivel: "¿Por qué este nivel?",
                sabias: "¿Sabías que?",
                correcto: "Correcto",
                caso: "Caso",
                menu: "Menú",
                siguePracticando: "Sigue practicando →",
                reintentar: "Intentar de nuevo",
                volverMenu: "Volver al menú",
                dashboard: "Mi progreso",
                casosRealizados: "Casos realizados",
                dashCorrectos: "Correctos",
                precision: "Precisión",
                dashFallos: "Fallos",
                dashSubTriaje: "Sub-triaje",
                dashSobreTriaje: "Sobre-triaje",
                aciertosNivel: "Aciertos por nivel Manchester",
                volver: "← Volver",
                nivelI: "Nivel I",
                nivelII: "Nivel II",
                nivelIII: "Nivel III",
                nivelIV: "Nivel IV",
                nivelV: "Nivel V"
            },
            en: {
                elegir: "Choose a case to classify",
                filtros: ["All", "Basic", "Intermediate", "Difficult", "Advanced"],
                presentacion: "Clinical presentation",
                constantes: "Vital signs",
                selecciona: "Select the Manchester triage level:",
                manchester: ["Immediate", "Very urgent", "Urgent", "Standard", "Non-urgent"],
                restantes: "remaining",
                tiempoAcabado: "Time's up",
                incorrecto: "Incorrect",
                porqueNivel: "Why this level?",
                sabias: "Did you know?",
                correcto: "Correct",
                caso: "Case",
                menu: "Menu",
                siguePracticando: "Keep practising →",
                reintentar: "Try again",
                volverMenu: "Back to menu",
                dashboard: "My progress",
                casosRealizados: "Cases completed",
                dashCorrectos: "Correct",
                precision: "Accuracy",
                dashFallos: "Incorrect",
                dashSubTriaje: "Under-triage",
                dashSobreTriaje: "Over-triage",
                aciertosNivel: "Correct answers by Manchester level",
                volver: "← Back",
                nivelI: "Level I",
                nivelII: "Level II",
                nivelIII: "Level III",
                nivelIV: "Level IV",
                nivelV: "Level V"
            }
        }

        const pantalla2 = document.getElementById("pantalla-2")

        function marcarCasoCompletado(id) {
            const tarjeta = document.querySelector(`.caso[data-id="${id}"]`)
            if (tarjeta && !tarjeta.querySelector(".tick-completado")) {
                const tick = document.createElement("span")
                tick.className = "tick-completado"
                tick.textContent = "✓"
                tarjeta.appendChild(tick)
            }
        }

        function actualizarTextosDashboard() {
            document.querySelector("#pantalla-dashboard .caso-numero").textContent = textos[idioma].dashboard
            document.getElementById("btn-cerrar-dashboard").textContent = textos[idioma].volver
            document.querySelectorAll(".dashboard-label")[0].textContent = textos[idioma].casosRealizados
            document.querySelectorAll(".dashboard-label")[1].textContent = textos[idioma].dashCorrectos
            document.querySelectorAll(".dashboard-label")[2].textContent = textos[idioma].precision
            document.querySelectorAll(".dashboard-label")[3].textContent = textos[idioma].dashFallos
            document.querySelectorAll(".dashboard-label")[4].textContent = textos[idioma].dashSubTriaje
            document.querySelectorAll(".dashboard-label")[5].textContent = textos[idioma].dashSobreTriaje
            document.querySelector(".dashboard-titulo-seccion").textContent = textos[idioma].aciertosNivel
            document.querySelectorAll(".dashboard-nivel-label")[0].textContent = textos[idioma].nivelI
            document.querySelectorAll(".dashboard-nivel-label")[1].textContent = textos[idioma].nivelII
            document.querySelectorAll(".dashboard-nivel-label")[2].textContent = textos[idioma].nivelIII
            document.querySelectorAll(".dashboard-nivel-label")[3].textContent = textos[idioma].nivelIV
            document.querySelectorAll(".dashboard-nivel-label")[4].textContent = textos[idioma].nivelV
        }

        const grid = document.getElementById("grid-casos")
        casos.forEach(caso => {
            const div = document.createElement("div")
            div.className = "caso"
            div.dataset.dificultad = caso.dificultad[idioma]
            div.dataset.id = caso.id
            div.innerHTML = `
                <span>${textos[idioma].caso} ${caso.id}</span>
                <h2>${caso.titulo[idioma]}</h2>
                <ul>
                    ${caso.sintomas[idioma].slice(0, 3).map(s => `<li>${s}</li>`).join("")}
                </ul>
                <span class="caso-dificultad">${caso.dificultad[idioma]}</span>
            `
            grid.appendChild(div)
        })

        estadisticas.casosCompletadosIds.forEach(id => marcarCasoCompletado(id))

        const tarjetas = document.querySelectorAll(".caso")

        const filtros = document.querySelectorAll(".filtro")
        filtros.forEach(filtro => {
            filtro.addEventListener("click", () => {
                filtros.forEach(f => f.classList.remove("activo"))
                filtro.classList.add("activo")
                const dificultad = filtro.textContent
                tarjetas.forEach(tarjeta => {
                    if (dificultad === "Todos" || dificultad === "All") {
                        tarjeta.classList.remove("oculto")
                    } else if (tarjeta.dataset.dificultad === dificultad) {
                        tarjeta.classList.remove("oculto")
                    } else {
                        tarjeta.classList.add("oculto")
                    }
                })
            })
        })

        document.querySelector(".idioma-activo").addEventListener("click", () => {
            idioma = idioma === "es" ? "en" : "es"
            document.querySelector(".idioma-activo").textContent = idioma.toUpperCase()
            document.querySelector("#pantalla-1 > p").textContent = textos[idioma].elegir
            document.querySelector(".manchester > p").textContent = textos[idioma].selecciona
            document.querySelectorAll(".caso-seccion-titulo")[0].textContent = textos[idioma].presentacion
            document.querySelectorAll(".caso-seccion-titulo")[1].textContent = textos[idioma].constantes
            document.querySelector(".resultado-porque-titulo").textContent = textos[idioma].porqueNivel
            document.querySelector(".sabias-titulo").textContent = textos[idioma].sabias
            document.querySelector(".resultado-correcto").textContent = textos[idioma].correcto
            document.getElementById("btn-siguiente").textContent = textos[idioma].siguePracticando
            document.getElementById("btn-menu-p2").textContent = textos[idioma].menu
            document.getElementById("btn-reintentar").textContent = textos[idioma].reintentar
            document.getElementById("btn-menu").textContent = textos[idioma].volverMenu
            document.getElementById("contador-progreso").textContent = casosCompletados + " / 50"

            document.querySelectorAll(".filtro").forEach((filtro, i) => {
                filtro.textContent = textos[idioma].filtros[i]
            })

            document.querySelectorAll(".nivel-nombre").forEach((nombre, i) => {
                nombre.textContent = textos[idioma].manchester[i]
            })

            actualizarTextosDashboard()

            tarjetas.forEach(tarjeta => {
                const id = tarjeta.dataset.id
                const caso = casos.find(c => c.id === Number(id))
                tarjeta.querySelector("h2").textContent = caso.titulo[idioma]
                tarjeta.querySelector(".caso-dificultad").textContent = caso.dificultad[idioma]
                tarjeta.dataset.dificultad = caso.dificultad[idioma]
                tarjeta.querySelector("span:first-child").textContent = textos[idioma].caso + " " + id

                const lista = tarjeta.querySelector("ul")
                lista.innerHTML = ""
                caso.sintomas[idioma].slice(0, 3).forEach(sintoma => {
                    const li = document.createElement("li")
                    li.textContent = sintoma
                    lista.appendChild(li)
                })
            })

            if (casoActual && !pantalla2.classList.contains("oculto")) {
                pantalla2.querySelector(".caso-numero").textContent = textos[idioma].caso + " " + casoActual.id
                pantalla2.querySelector(".caso-clinico h2").textContent = casoActual.titulo[idioma]
                const listaPantalla2 = pantalla2.querySelector(".caso-clinico ul")
                listaPantalla2.innerHTML = ""
                casoActual.sintomas[idioma].forEach(sintoma => {
                    const li = document.createElement("li")
                    li.textContent = sintoma
                    listaPantalla2.appendChild(li)
                })
            }
        })

        tarjetas.forEach(tarjeta => {
            tarjeta.addEventListener("click", () => {
                const id = tarjeta.dataset.id
                casoActual = casos.find(caso => caso.id === Number(id))

                document.getElementById("pantalla-1").classList.add("oculto")
                pantalla2.classList.remove("oculto")

                pantalla2.querySelector(".caso-numero").textContent = textos[idioma].caso + " " + casoActual.id
                pantalla2.querySelector(".caso-clinico h2").textContent = casoActual.titulo[idioma]

                const lista = pantalla2.querySelector(".caso-clinico ul")
                lista.innerHTML = ""
                casoActual.sintomas[idioma].forEach(sintoma => {
                    const li = document.createElement("li")
                    li.textContent = sintoma
                    lista.appendChild(li)
                })

                const valores = pantalla2.querySelectorAll(".constante-valor")
                valores[0].textContent = casoActual.constantes.temperatura
                valores[1].textContent = casoActual.constantes.fc
                valores[2].textContent = casoActual.constantes.ta
                valores[3].textContent = casoActual.constantes.sato2

                function iniciarTemporizador() {
                    let tiempoRestante = 180
                    const barraProgreso = pantalla2.querySelector(".barra-progreso")
                    const tiempoTexto = pantalla2.querySelector(".tiempo-texto")

                    if (window.temporizador) clearInterval(window.temporizador)

                    barraProgreso.style.width = "100%"
                    tiempoTexto.textContent = "3:00 " + textos[idioma].restantes

                    window.temporizador = setInterval(() => {
                        tiempoRestante--

                        const porcentaje = (tiempoRestante / 180) * 100
                        barraProgreso.style.width = porcentaje + "%"

                        const minutos = Math.floor(tiempoRestante / 60)
                        const segundos = tiempoRestante % 60
                        tiempoTexto.textContent = " " + minutos + ":" + (segundos < 10 ? "0" : "") + segundos + " " + textos[idioma].restantes

                        if (tiempoRestante <= 0) {
                            clearInterval(window.temporizador)
                            const modal = document.getElementById("modal-error")
                            const caja = modal.querySelector(".modal-caja")
                            modal.querySelector(".modal-titulo").textContent = textos[idioma].tiempoAcabado
                            modal.classList.remove("oculto")
                            caja.classList.remove("vibrar")
                            void caja.offsetWidth
                            caja.classList.add("vibrar")
                        }
                    }, 1000)
                }

                iniciarTemporizador()

                const botones = pantalla2.querySelectorAll(".manchester-btn")
                botones.forEach(boton => {
                    const nuevo = boton.cloneNode(true)
                    boton.parentNode.replaceChild(nuevo, boton)
                })

                const botonesLimpios = pantalla2.querySelectorAll(".manchester-btn")
                botonesLimpios.forEach((boton, indice) => {
                    boton.addEventListener("click", () => {
                        const respuestaUsuario = indice + 1

                        if (respuestaUsuario === casoActual.respuesta_correcta) {
                            casosCompletados++
                            estadisticas.total++
                            estadisticas.correctos++
                            estadisticas.porNivel[casoActual.respuesta_correcta]++
                            if (!estadisticas.casosCompletadosIds.includes(casoActual.id)) {
                                estadisticas.casosCompletadosIds.push(casoActual.id)
                            }
                            document.getElementById("contador-progreso").textContent = casosCompletados + " / 50"
                            localStorage.setItem("tripage-estadisticas", JSON.stringify(estadisticas))
                            marcarCasoCompletado(casoActual.id)
                            clearInterval(window.temporizador)

                            const pantalla3 = document.getElementById("pantalla-3")
                            const nivel = niveles[idioma][casoActual.respuesta_correcta]

                            pantalla3.querySelector(".caso-numero").textContent = textos[idioma].caso + " " + casoActual.id
                            pantalla3.querySelector(".nivel-romano").textContent = nivel.romano
                            pantalla3.querySelector(".resultado-nivel-titulo").textContent = nivel.titulo
                            pantalla3.querySelector(".resultado-nivel-subtitulo").textContent = nivel.subtitulo
                            pantalla3.querySelector(".resultado-porque-texto").textContent = casoActual.explicacion[idioma]
                            pantalla3.querySelector(".sabias-texto").textContent = casoActual.sabias_que[idioma]

                            const badge = pantalla3.querySelector(".nivel-badge")
                            badge.className = "nivel-badge nivel-" + casoActual.respuesta_correcta

                            pantalla2.classList.add("oculto")
                            document.getElementById("pantalla-3").classList.remove("oculto")

                        } else {
                            estadisticas.total++
                            estadisticas.fallos++

                            // sub-triaje: eligió nivel MÁS ALTO (menos urgente)
                            if (respuestaUsuario > casoActual.respuesta_correcta) {
                                estadisticas.subTriaje++
                            }
                            // sobre-triaje: eligió nivel MÁS BAJO (más urgente)
                            if (respuestaUsuario < casoActual.respuesta_correcta) {
                                estadisticas.sobreTriaje++
                            }

                            if (!estadisticas.casosRepaso.includes(casoActual.id)) {
                                estadisticas.casosRepaso.push(casoActual.id)
                            }
                            localStorage.setItem("tripage-estadisticas", JSON.stringify(estadisticas))
                            clearInterval(window.temporizador)

                            const modal = document.getElementById("modal-error")
                            const caja = modal.querySelector(".modal-caja")
                            modal.querySelector(".modal-titulo").textContent = textos[idioma].incorrecto
                            modal.classList.remove("oculto")
                            caja.classList.remove("vibrar")
                            void caja.offsetWidth
                            caja.classList.add("vibrar")
                        }
                    })
                })

                window.iniciarTemporizador = iniciarTemporizador
            })
        })

        document.getElementById("btn-reintentar").addEventListener("click", () => {
            document.getElementById("modal-error").classList.add("oculto")
            if (window.iniciarTemporizador) window.iniciarTemporizador()
        })

        document.getElementById("btn-menu").addEventListener("click", () => {
            clearInterval(window.temporizador)
            document.getElementById("modal-error").classList.add("oculto")
            pantalla2.classList.add("oculto")
            document.getElementById("pantalla-1").classList.remove("oculto")
        })

        document.getElementById("btn-siguiente").addEventListener("click", () => {
            document.getElementById("pantalla-3").classList.add("oculto")
            document.getElementById("pantalla-1").classList.remove("oculto")
        })

        document.getElementById("btn-menu-p2").addEventListener("click", () => {
            clearInterval(window.temporizador)
            pantalla2.classList.add("oculto")
            document.getElementById("pantalla-1").classList.remove("oculto")
        })

        const menuHamburguesa = document.getElementById("menu-hamburguesa")
        const menuDesplegable = document.getElementById("menu-desplegable")

        menuHamburguesa.addEventListener("click", () => {
            menuDesplegable.classList.toggle("oculto")
        })

        document.addEventListener("click", (e) => {
            if (!menuHamburguesa.contains(e.target) && !menuDesplegable.contains(e.target)) {
                menuDesplegable.classList.add("oculto")
            }
        })

        document.getElementById("modo-practica").addEventListener("click", () => {
            document.getElementById("menu-desplegable").classList.add("oculto")
            document.getElementById("pantalla-2").classList.add("oculto")
            document.getElementById("pantalla-3").classList.add("oculto")
            document.getElementById("pantalla-dashboard").classList.add("oculto")
            document.getElementById("pantalla-1").classList.remove("oculto")
            clearInterval(window.temporizador)
        })

        document.getElementById("btn-dashboard").addEventListener("click", () => {
            document.getElementById("menu-desplegable").classList.add("oculto")
            document.getElementById("pantalla-1").classList.add("oculto")
            document.getElementById("pantalla-2").classList.add("oculto")
            document.getElementById("pantalla-3").classList.add("oculto")
            clearInterval(window.temporizador)

            document.getElementById("dash-total").textContent = estadisticas.total
            document.getElementById("dash-correctos").textContent = estadisticas.correctos
            document.getElementById("dash-fallos").textContent = estadisticas.fallos
            document.getElementById("dash-subtriaje").textContent = estadisticas.subTriaje
            document.getElementById("dash-sobretriaje").textContent = estadisticas.sobreTriaje

            const precision = estadisticas.total > 0 ? Math.round((estadisticas.correctos / estadisticas.total) * 100) : 0
            document.getElementById("dash-precision").textContent = precision + "%"

            const maxNivel = Math.max(...Object.values(estadisticas.porNivel), 1)
            for (let i = 1; i <= 5; i++) {
                const valor = estadisticas.porNivel[i]
                const porcentaje = (valor / maxNivel) * 100
                document.getElementById("barra-nivel-" + i).style.width = porcentaje + "%"
                document.getElementById("texto-nivel-" + i).textContent = valor
            }

            actualizarTextosDashboard()
            document.getElementById("pantalla-dashboard").classList.remove("oculto")
        })

        document.getElementById("btn-cerrar-dashboard").addEventListener("click", () => {
            document.getElementById("pantalla-dashboard").classList.add("oculto")
            document.getElementById("pantalla-1").classList.remove("oculto")
        })

    })