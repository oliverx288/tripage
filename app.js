fetch("casos.json") //va a buscar y abrir la "libreria"
    .then(respuesta => respuesta.json()) //cuando veamos la respuesta la abrimos
    .then(casos => { //y despues la guardamos en la variable casos (ya convertida a js)

        //mapa de niveles Manchester
        const niveles = {
            1: { romano: "I", titulo: "Nivel I", subtitulo: "Riesgo vital inmediato" },
            2: { romano: "II", titulo: "Nivel II", subtitulo: "Muy urgente" },
            3: { romano: "III", titulo: "Nivel III", subtitulo: "Urgente" },
            4: { romano: "IV", titulo: "Nivel IV", subtitulo: "Estándar" },
            5: { romano: "V", titulo: "Nivel V", subtitulo: "No urgente" }
        }

        const tarjetas = document.querySelectorAll(".caso") //document es mi html traducido a JS. Coge todos los divs class="caso"

        //recorre todas las tarjetas, a cada una le dice "si te clican, me dices tu num"
        tarjetas.forEach(tarjeta => {
            tarjeta.addEventListener("click", () => { //"escucha si alguien te hace clica"
                const id = tarjeta.dataset.id
                const casoSeleccionado = casos.find(caso => caso.id === Number(id))
                console.log(casoSeleccionado)

                //Ocultar pantalla 1
                document.getElementById("pantalla-1").classList.add("oculto")

                //mostrar la pantalla 2
                document.getElementById("pantalla-2").classList.remove("oculto")

                //buscar siempre dentro de pantalla 2 para no confundir con los elementos de pantalla 1
                const pantalla2 = document.getElementById("pantalla-2")

                //busca el span en HTML y cambia su número por el caso que hemos clickado
                pantalla2.querySelector(".caso-numero").textContent = "Caso " + casoSeleccionado.id

                //rellena el título del paciente
                pantalla2.querySelector(".caso-clinico h2").textContent = casoSeleccionado.titulo

                //vacía la lista de sintomas y la rellena con los del caso seleccionado
                const lista = pantalla2.querySelector(".caso-clinico ul")
                lista.innerHTML = "" //vaciamos primero para que no se acumulen
                casoSeleccionado.sintomas.forEach(sintoma => {
                    const li = document.createElement("li") //crea un <li> nuevo
                    li.textContent = sintoma //le pone el texto del síntoma
                    lista.appendChild(li) //lo añade a la lista
                })

                //rellena las constantes vitales en orden: temperatura, FC, TA, SatO2
                const valores = pantalla2.querySelectorAll(".constante-valor")
                valores[0].textContent = casoSeleccionado.constantes.temperatura
                valores[1].textContent = casoSeleccionado.constantes.fc
                valores[2].textContent = casoSeleccionado.constantes.ta
                valores[3].textContent = casoSeleccionado.constantes.sato2

                //función para iniciar o reiniciar el temporizador
                function iniciarTemporizador() {
                    let tiempoRestante = 180
                    const barraProgreso = pantalla2.querySelector(".barra-progreso")
                    const tiempoTexto = pantalla2.querySelector(".tiempo-texto")

                    //limpia el temporizador anterior si existe
                    if (window.temporizador) clearInterval(window.temporizador)

                    //resetea la barra al 100%
                    barraProgreso.style.width = "100%"
                    tiempoTexto.textContent = "⏱ 3:00 restantes"

                    window.temporizador = setInterval(() => {
                        tiempoRestante--

                        //calcula el porcentaje restante y actualiza la barra
                        const porcentaje = (tiempoRestante / 180) * 100
                        barraProgreso.style.width = porcentaje + "%"

                        //actualiza el texto del tiempo
                        const minutos = Math.floor(tiempoRestante / 60)
                        const segundos = tiempoRestante % 60
                        tiempoTexto.textContent = "⏱ " + minutos + ":" + (segundos < 10 ? "0" : "") + segundos + " restantes"

                        //si se acaba el tiempo muestra el modal con mensaje de tiempo agotado
                        if (tiempoRestante <= 0) {
                            clearInterval(window.temporizador)
                            const modal = document.getElementById("modal-error")
                            const caja = modal.querySelector(".modal-caja")
                            modal.querySelector(".modal-titulo").textContent = "⏱ Se acabó el tiempo"
                            modal.classList.remove("oculto")
                            caja.classList.remove("vibrar")
                            void caja.offsetWidth
                            caja.classList.add("vibrar")
                        }
                    }, 1000)
                }

                //iniciamos el temporizador al entrar al caso
                iniciarTemporizador()

                //escuchar los botones de Manchester y comparar con la respuesta correcta
                const botones = pantalla2.querySelectorAll(".manchester-btn")
                botones.forEach((boton, indice) => {
                    boton.addEventListener("click", () => {
                        const respuestaUsuario = indice + 1 //el indice empieza en 0, los niveles en 1

                        if (respuestaUsuario === casoSeleccionado.respuesta_correcta) {
                            //parar temporizador
                            clearInterval(window.temporizador)

                            //rellenar pantalla 3 con los datos del caso
                            const pantalla3 = document.getElementById("pantalla-3")
                            const nivel = niveles[casoSeleccionado.respuesta_correcta]

                            pantalla3.querySelector(".caso-numero").textContent = "Caso " + casoSeleccionado.id
                            pantalla3.querySelector(".nivel-romano").textContent = nivel.romano
                            pantalla3.querySelector(".resultado-nivel-titulo").textContent = nivel.titulo
                            pantalla3.querySelector(".resultado-nivel-subtitulo").textContent = nivel.subtitulo
                            pantalla3.querySelector(".resultado-porque-texto").textContent = casoSeleccionado.explicacion
                            pantalla3.querySelector(".sabias-texto").textContent = casoSeleccionado.sabias_que

                            //cambiar el color del badge según el nivel
                            const badge = pantalla3.querySelector(".nivel-badge")
                            badge.className = "nivel-badge nivel-" + casoSeleccionado.respuesta_correcta

                            //ocultar pantalla 2 y mostrar pantalla 3
                            document.getElementById("pantalla-2").classList.add("oculto")
                            document.getElementById("pantalla-3").classList.remove("oculto")

                        } else {
                            //si es incorrecto: parar temporizador y mostrar modal con vibración
                            clearInterval(window.temporizador)
                            const modal = document.getElementById("modal-error")
                            const caja = modal.querySelector(".modal-caja")
                            modal.querySelector(".modal-titulo").textContent = "Incorrecto"
                            modal.classList.remove("oculto")
                            caja.classList.remove("vibrar")
                            void caja.offsetWidth //fuerza el reflow para reiniciar la animación
                            caja.classList.add("vibrar")
                        }
                    })
                })

                //guardamos iniciarTemporizador en window para usarla desde el botón reintentar
                window.iniciarTemporizador = iniciarTemporizador

            })
        })

        //boton reintentar : cierra el modal y reinicia el temporizador
        document.getElementById("btn-reintentar").addEventListener("click", () => {
            document.getElementById("modal-error").classList.add("oculto")
            if (window.iniciarTemporizador) window.iniciarTemporizador()
        })

        //boton menu: para el temporizador, cierra el modal y vuelve a pantalla 1
        document.getElementById("btn-menu").addEventListener("click", () => {
            clearInterval(window.temporizador)
            document.getElementById("modal-error").classList.add("oculto")
            document.getElementById("pantalla-2").classList.add("oculto")
            document.getElementById("pantalla-1").classList.remove("oculto")
        })

        //boton sigue practicando : vuelve a pantalla 1
        document.getElementById("btn-siguiente").addEventListener("click", () => {
            document.getElementById("pantalla-3").classList.add("oculto")
            document.getElementById("pantalla-1").classList.remove("oculto")
        })

        //botón menu pantalla 2 : para el temporizador y vuelve a pantalla 1
        document.getElementById("btn-menu-p2").addEventListener("click", () => {
            clearInterval(window.temporizador)
            document.getElementById("pantalla-2").classList.add("oculto")
            document.getElementById("pantalla-1").classList.remove("oculto")
        })

    })