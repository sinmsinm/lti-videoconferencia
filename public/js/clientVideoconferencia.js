let streamLocal = null;
let connexionsRTC = new Map();
let websocket;
let usuariId;
let usuarisConnectats = new Set();

document.addEventListener('DOMContentLoaded', () => {
  const sessionId = new URLSearchParams(window.location.search).get('sessionId');
  usuariId = generarUsuariId();
  iniciarWebSocket(sessionId);

  const botoWebcam = document.getElementById('iniciar-webcam');
  const botoAudio = document.getElementById('iniciar-audio');

  botoWebcam.addEventListener('click', iniciarWebcam);
  botoAudio.addEventListener('click', iniciarAudio);
});

function iniciarWebSocket(sessionId) {
  websocket = new WebSocket(`ws://${window.location.host}/ws/${sessionId}`);

  websocket.onopen = () => {
    console.log('Connexió WebSocket establerta');
    enviarMissatgeWebSocket({
      tipus: 'nou-usuari',
      usuariId: usuariId
    });
  };

  websocket.onmessage = async (event) => {
    try {
      let dades;
      if (event.data instanceof Blob) {
        dades = await event.data.text();
      } else {
        dades = event.data;
      }
      const missatge = JSON.parse(dades);
      gestionarMissatgeEntrant(missatge);
    } catch (error) {
      console.error('Error en analitzar el missatge:', error);
    }
  };

  websocket.onerror = (error) => {
    console.error('Error de WebSocket:', error);
  };

  websocket.onclose = () => {
    console.log('Connexió WebSocket tancada');
  };
}

async function iniciarWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    afegirTrackAStreamLocal(stream.getVideoTracks()[0]);
    document.getElementById('video-local').srcObject = streamLocal;
    console.log('Webcam iniciada amb èxit');
    crearOfertesPerATots();
  } catch (error) {
    console.error('Error en iniciar la webcam:', error);
    alert('No s\'ha pogut accedir a la webcam.');
  }
}

async function iniciarAudio() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    afegirTrackAStreamLocal(stream.getAudioTracks()[0]);
    console.log('Àudio iniciat amb èxit');
    crearOfertesPerATots();
  } catch (error) {
    console.error('Error en iniciar l\'àudio:', error);
    alert('No s\'ha pogut accedir al micròfon.');
  }
}

function afegirTrackAStreamLocal(track) {
  if (!streamLocal) {
    streamLocal = new MediaStream();
  }
  streamLocal.addTrack(track);
}

async function crearOfertesPerATots() {
  for (const usuariRemotId of usuarisConnectats) {
    if (usuariRemotId !== usuariId) {
      await crearIEnviarOferta(usuariRemotId);
    }
  }
}

async function crearIEnviarOferta(usuariRemotId) {
  let connexio = connexionsRTC.get(usuariRemotId);
  if (!connexio) {
    connexio = crearNovaConnexioRTC(usuariRemotId);
  }

  try {
    const oferta = await connexio.createOffer();
    await connexio.setLocalDescription(oferta);
    enviarMissatgeWebSocket({
      tipus: 'oferta',
      oferta: oferta,
      usuariId: usuariId,
      destinatari: usuariRemotId
    });
  } catch (error) {
    console.error('Error en crear oferta:', error);
  }
}

function crearNovaConnexioRTC(usuariRemotId) {
  const connexio = new RTCPeerConnection(configuracioRTC);
  connexionsRTC.set(usuariRemotId, connexio);

  connexio.onicecandidate = (event) => {
    if (event.candidate) {
      enviarMissatgeWebSocket({
        tipus: 'candidat',
        candidat: event.candidate,
        usuariId: usuariId,
        destinatari: usuariRemotId
      });
    }
  };

  connexio.ontrack = (event) => {
    const videoRemot = document.createElement('video');
    videoRemot.srcObject = event.streams[0];
    videoRemot.autoplay = true;
    videoRemot.playsInline = true;
    videoRemot.setAttribute('data-usuari-id', usuariRemotId);
    document.getElementById('videos-remots').appendChild(videoRemot);
  };

  if (streamLocal) {
    streamLocal.getTracks().forEach(track => {
      connexio.addTrack(track, streamLocal);
    });
  }

  return connexio;
}

function gestionarMissatgeEntrant(missatge) {
  switch (missatge.tipus) {
    case 'usuaris-connectats':
      gestionarUsuarisConnectats(missatge.usuaris);
      break;
    case 'nou-usuari':
      if (missatge.usuariId !== usuariId) {
        usuarisConnectats.add(missatge.usuariId);
        if (streamLocal) {
          crearIEnviarOferta(missatge.usuariId);
        }
      }
      break;
    case 'usuari-desconnectat':
      gestionarUsuariDesconnectat(missatge.usuariId);
      break;
    case 'oferta':
      gestionarOfertaEntrant(missatge);
      break;
    case 'resposta':
      gestionarRespostaEntrant(missatge);
      break;
    case 'candidat':
      gestionarCandidatEntrant(missatge);
      break;
  }
}

function gestionarUsuarisConnectats(usuaris) {
  usuaris.forEach(usuariId => {
    if (!usuarisConnectats.has(usuariId)) {
      usuarisConnectats.add(usuariId);
      if (streamLocal) {
        crearIEnviarOferta(usuariId);
      }
    }
  });
}

function gestionarUsuariDesconnectat(usuariId) {
  usuarisConnectats.delete(usuariId);
  const connexio = connexionsRTC.get(usuariId);
  if (connexio) {
    connexio.close();
    connexionsRTC.delete(usuariId);
  }
  // Eliminar el vídeo remot si existeix
  const videoRemot = document.querySelector(`video[data-usuari-id="${usuariId}"]`);
  if (videoRemot) {
    videoRemot.remove();
  }
}

async function gestionarOfertaEntrant(missatge) {
  if (missatge.usuariId === usuariId) return;

  let connexio = connexionsRTC.get(missatge.usuariId);
  if (!connexio) {
    connexio = crearNovaConnexioRTC(missatge.usuariId);
  }

  await connexio.setRemoteDescription(new RTCSessionDescription(missatge.oferta));
  
  const resposta = await connexio.createAnswer();
  await connexio.setLocalDescription(resposta);

  enviarMissatgeWebSocket({
    tipus: 'resposta',
    resposta: resposta,
    usuariId: usuariId,
    destinatari: missatge.usuariId
  });
}

async function gestionarRespostaEntrant(missatge) {
  if (missatge.destinatari !== usuariId) return;

  const connexio = connexionsRTC.get(missatge.usuariId);
  if (connexio) {
    await connexio.setRemoteDescription(new RTCSessionDescription(missatge.resposta));
  }
}

async function gestionarCandidatEntrant(missatge) {
  if (missatge.destinatari !== usuariId) return;

  const connexio = connexionsRTC.get(missatge.usuariId);
  if (connexio) {
    await connexio.addIceCandidate(new RTCIceCandidate(missatge.candidat));
  }
}

function enviarMissatgeWebSocket(missatge) {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify(missatge));
  } else {
    console.error('WebSocket no està connectat');
  }
}

function generarUsuariId() {
  return 'usuari-' + Math.random().toString(36).substr(2, 9);
}

const configuracioRTC = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};
