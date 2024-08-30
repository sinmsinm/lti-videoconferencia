const videoconferenciaView = {
  renderSala: (sessionId, usuariActual) => {
    return `
      <!DOCTYPE html>
      <html lang="ca">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sala de Videoconferència</title>
        <script src="/js/clientVideoconferencia.js"></script>
      </head>
      <body>
        <div class="videoconferencia-container">
          <nav class="barra-navegacio">
            <h1>Videoconferència LTI</h1>
            <button id="iniciar-webcam">Iniciar webcam</button>
            <button id="iniciar-audio">Iniciar àudio</button>
          </nav>
          <div class="contingut-principal">
            <aside class="panell-usuaris">
              <h2>Usuaris connectats</h2>
              <ul id="llista-usuaris"></ul>
            </aside>
            <main class="area-videos">
              <div id="videos-remots"></div>
              <video id="video-local" autoplay muted></video>
            </main>
            <aside class="panell-xat">
              <h2>Xat</h2>
              <div id="missatges-xat"></div>
              <input type="text" id="input-xat" placeholder="Escriu un missatge...">
              <button id="enviar-missatge">Enviar</button>
            </aside>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};

module.exports = videoconferenciaView;
