// Inicializamos componentes Materialize
M.AutoInit();

// Self Invoked Function (contexto privado)
(function () {
  // Expresión regular que comprueba una URL válida
  const urlRegExp = new RegExp(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm);

  const SERVER_URL = "http://localhost:3001";

  const $actionBtn = document.querySelector("#action-btn");
  const $creationArea = document.querySelector("#creation-area");
  const $closeCreationArea = document.querySelector("#close-creation-area");
  const $createWesiteForm = document.querySelector("#create-website-form");
  const $websitesGrid = document.querySelector("#websites-grid");
  const $urlWebsite = document.querySelector("#url-website");
  const $submitWebsiteBtn = document.querySelector("#submit-website-btn");

  let isSendingWebsite = false;


  ////////////////////////////////////
  //// Helper functions
  ////

  // Card para pintar
  const getCard = ({ title, url, description, image }) => `<div class="col s12 m6 l4">
  <div class="card">
      <div class="card-image">
        <img src="${SERVER_URL}/${image}">
        </div>
      <div class="card-content">
        <span class="card-title black-text">${title}</span>
        <p>${description}</p>
      </div>
      <div class="card-action">
        <a href="${url}" class="blue-text" target="blank">Visitar website</a>
      </div>
    </div>
  </div>`;

  function clearCreationArea() {
    $urlWebsite.value = "";

    isSendingWebsite = false;

    $closeCreationArea.classList.remove("loading");
    $submitWebsiteBtn.classList.remove("disabled");
    $urlWebsite.classList.add("validate");
    $urlWebsite.removeAttribute("disabled");

    $creationArea.classList.remove("open");
  }

  function websiteCreationSuccess(data) {
    // Limpiamos y cerramos el área de creación
    clearCreationArea();

    $websitesGrid.innerHTML += getCard(data);
  }

  function websiteCreationFail() {
    // Limpiamos y cerramos el área de creación
    clearCreationArea();

    M.toast({
      html: "Algo ha ido mal en tu petición",
      classes: "red-text text-lighten-3"
    });
  }

  async function getInitialCards() {
    const req = await fetch(`${SERVER_URL}/website/list`).catch(err => websiteCreationFail());
    const data = await req.json();

    data.list && data.list.forEach(item => $websitesGrid.innerHTML += getCard(item));
  }


  ////////////////////////////////////
  //// Handlers
  ////

  // Click para abrir zona de creación
  $actionBtn.addEventListener("click", e => {
    $creationArea.classList.add("open");
  });

  // Click para cerrar zona de creación
  $closeCreationArea.addEventListener("click", e => {
    if (!isSendingWebsite) {
      $creationArea.classList.remove("open");
      clearCreationArea();
    }
  });

  // Control del submit del formulario de creación
  $createWesiteForm.addEventListener("submit", async e => {
    e.preventDefault();

    // 1. Validar el texto como url válida
    if (!urlRegExp.test($urlWebsite.value)) {
      return;
    }

    // Marco el estado como enviando
    isSendingWebsite = true;

    // Establezco estado para componentes en estado de envío
    $closeCreationArea.classList.add("loading");
    $submitWebsiteBtn.classList.add("disabled");
    $urlWebsite.classList.remove("validate");
    $urlWebsite.setAttribute("disabled", "disabled");

    // Preparo cabeceras y petición de envío
    const reqOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      mode: "cors",
      body: JSON.stringify({ url: $urlWebsite.value })
    };

    // Envío + catch
    const req = await fetch(`${SERVER_URL}/website/create`, reqOptions).catch(err => websiteCreationFail());

    // Si la respuesta no es creación, genera error
    if (req.status.toString() !== "201") {
      return websiteCreationFail();
    }

    // En caso de que todo vaya OK, sacamos el obj de respuesta
    const resp = await req.json();

    // Generamos la card con los datos recibidos
    websiteCreationSuccess(resp);
  });


  ///////////////////////////////////
  //// Scripts de inicio
  ////

  getInitialCards();
})();
