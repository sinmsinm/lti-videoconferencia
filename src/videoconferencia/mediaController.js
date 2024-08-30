const mediaController = {
  iniciarWebcam: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      document.getElementById('video-local').srcObject = stream;
      return stream;
    } catch (error) {
      console.error('Error en iniciar la webcam:', error);
      throw error;
    }
  },

  iniciarAudio: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch (error) {
      console.error('Error en iniciar l\'àudio:', error);
      throw error;
    }
  }
};

module.exports = mediaController;
