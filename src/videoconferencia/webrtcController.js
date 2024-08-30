const webrtcController = {
  iniciarConnexio: async (usuariRemot, streamLocal) => {
    const connexio = new RTCPeerConnection();

    streamLocal.getTracks().forEach(track => {
      connexio.addTrack(track, streamLocal);
    });

    connexio.onicecandidate = (event) => {
      if (event.candidate) {
        // Enviar el candidat a l'usuari remot via WebSocket
      }
    };

    connexio.ontrack = (event) => {
      // Afegir el stream remot a l'element de vídeo corresponent
      const videoRemot = document.createElement('video');
      videoRemot.srcObject = event.streams[0];
      document.getElementById('videos-remots').appendChild(videoRemot);
    };

    const oferta = await connexio.createOffer();
    await connexio.setLocalDescription(oferta);

    // Enviar l'oferta a l'usuari remot via WebSocket

    return connexio;
  },

  gestionarOferta: async (oferta, streamLocal) => {
    const connexio = new RTCPeerConnection();

    streamLocal.getTracks().forEach(track => {
      connexio.addTrack(track, streamLocal);
    });

    connexio.onicecandidate = (event) => {
      if (event.candidate) {
        // Enviar el candidat a l'usuari remot via WebSocket
      }
    };

    connexio.ontrack = (event) => {
      // Afegir el stream remot a l'element de vídeo corresponent
      const videoRemot = document.createElement('video');
      videoRemot.srcObject = event.streams[0];
      document.getElementById('videos-remots').appendChild(videoRemot);
    };

    await connexio.setRemoteDescription(oferta);
    const resposta = await connexio.createAnswer();
    await connexio.setLocalDescription(resposta);

    // Enviar la resposta a l'usuari remot via WebSocket

    return connexio;
  }
};

module.exports = webrtcController;
