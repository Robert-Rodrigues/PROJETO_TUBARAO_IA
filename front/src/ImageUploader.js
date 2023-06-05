import React, { useState } from 'react';
import axios from 'axios';
import './styles.css';

const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [classificationResult, setClassificationResult] = useState('');
  const [filename, setFilename] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!validImageExtensions.includes(fileExtension)) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('O tamanho máximo do arquivo é de 5 MB.');
      return;
    }
    
    console.log('Selected Image:', file);
    setSelectedImage(file);
    setFilename(file.name);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedImage) {
      alert('Selecione um arquivo de imagem!');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedImage);

    console.log('Form Data:', formData);

    try {
      const response = await axios.post('http://localhost:3003/upload-and-classify', formData);
      const { className } = response.data;
      setClassificationResult(className);
      setShowResult(true);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.error('Bad Request:', error.response.data);
        alert('Erro na requisição. Verifique o arquivo selecionado.');
      } else {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="container">
      <h1>Classificação de tubarões</h1>
      <form onSubmit={handleSubmit}>
        <div className="file-input-container">
          <label htmlFor="file-input" className="file-input-label">
            <input id="file-input" type="file" accept="image/*" onChange={handleImageUpload} className="file-input" hidden />
          </label>
          <button type="button" className="file-input-button" onClick={() => document.getElementById('file-input').click()}>
            Selecionar arquivo
          </button>
        </div>
        <p>{filename}</p>
        <button type="submit" className="submit-button">Enviar</button>
      </form>

      {showResult && (
        <div>
          <h3>Resultado da Classificação:</h3>
          <p>Tubarão {classificationResult}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
