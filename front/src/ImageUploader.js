import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader = ({ onFormSubmit }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    console.log('Selected Image:', file);
    setSelectedImage(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('imgData', selectedImage);

    console.log('Form Data:', formData);

    try {
      const response = await axios.post('http://localhost:3003/classify', formData);
      onFormSubmit(response.data);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.error('Bad Request:', error.response.data);
      } else {
        console.error('Error:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleImageUpload} />
      <button type="submit">Enviar</button>
    </form>
  );
};

export default ImageUploader;
