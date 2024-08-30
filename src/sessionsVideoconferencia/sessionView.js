const { createSSRApp } = require('vue');
const { renderToString } = require('@vue/server-renderer');
const sessionController = require('./sessionController');


const sessionView = {
  sessions: [],
  renderSessionList: async (userInfo, contextId, toolConsumerId) => {
    
    
    // Obtenim les sessions utilitzant el servei
    const sessionService = require('./sessionService');
    try {
      sessions = await sessionService.obtenirSessionsPerContext(contextId, toolConsumerId);
      
      if (!Array.isArray(sessions)) {
        console.error('Error obtenint les sessions:', sessions);
        return '<p>Error carregant les sessions</p>';
      }
    } catch (error) {
      console.error('Error obtenint les sessions:', error);
      return '<p>Error carregant les sessions</p>';
    }


    const app = createSSRApp({
      template: `
        <div>
          <h2>Sessions de Videoconferència</h2>
          <p>Context: ${contextId}</p>
          <p>Tool Consumer ID: ${toolConsumerId}</p>
          <ul>
            ${sessions.map(s => `
              <li>
                ${s.nom}
                <a href="/sessions/${s.id}">Obrir</a>
                ${userInfo.isInstructor ? `
                  <button onclick="eliminarSessio('${s.id}')">Eliminar</button>
                ` : ''}
              </li>
            `).join('')}
          </ul>
          ${userInfo.isInstructor ? `
            <form onsubmit="crearSessio(event)">
              <input type="text" id="nomSessio" required>
              <button type="submit">Crear Nova Sessió</button>
            </form>
          ` : ''}
        </div>
      `,
      data() {
        return {
          sessions: sessions
        }
      }
    });

    const html = await renderToString(app);

    return `
      <div id="app">${html}</div>
      <script>
        window.userInfo = ${JSON.stringify(userInfo)};
        window.contextId = "${contextId}";

        async function crearSessio(event) {
          event.preventDefault();
          const nom = document.getElementById('nomSessio').value;
          const response = await fetch('/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom })
          });
          if (response.ok) {
            location.reload();
          } else {
            alert('Error creant la sessió');
          }
        }

        async function eliminarSessio(sessionId) {
          if (confirm('Estàs segur que vols eliminar aquesta sessió?')) {
            const response = await fetch(\`/sessions/\${sessionId}\`, { method: 'DELETE' });
            if (response.ok) {
              location.reload();
            } else {
              alert('Error eliminant la sessió');
            }
          }
        }
      </script>
    `;
  }
};

module.exports = sessionView;
