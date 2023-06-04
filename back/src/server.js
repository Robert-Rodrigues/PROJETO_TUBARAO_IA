const express = require('express');
const { body, validationResult } = require('express-validator');
const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());

// Carrega o modelo convertido
const MODEL_PATH = path.join(__dirname, 'modelo', 'model.json');
let model;

async function loadModel() {
  try {
    model = await tf.loadLayersModel(`file://${MODEL_PATH}`);
    console.log('Model loaded');
  } catch (error) {
    console.error('Error loading model:', error);
  }
}

loadModel();


// Função para preprocessar a imagem
function preprocessImage(imgData) {
  try {
    const tfImg = tf.node.decodeImage(imgData, 3);
    const resizedImg = tf.image.resizeBilinear(tfImg, [150, 150]);
    const expandedImg = resizedImg.expandDims(0);
    const preprocessedImg = expandedImg.toFloat().div(255);
    return preprocessedImg;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    throw new Error('Failed to preprocess image');
  }
}

// Rota de teste
app.get('/', async (req, res) => {
  res.send('Servidor em funcionamento');
});

// Rota para a classificação de imagem
app.post(
  '/classify',
  [
    body('imageData')
      .notEmpty()
      .withMessage('Image data is required')
      .isBase64()
      .withMessage('Invalid image data format')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const imgData = req.body.imgData;
      const preprocessedImg = preprocessImage(Buffer.from(imgData, 'base64'));
      const prediction = model.predict(preprocessedImg);
      const classIdx = prediction.argMax(1).dataSync()[0];
      const classes = ['Azul', 'Baleia', 'Branco', 'Lixa', 'Martelo', 'Tigre', 'Touro'];
      const className = classes[classIdx];

      res.json({ className });
    } catch (error) {
      console.error('Error classifying image:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

//Rota teste
app.get('/', async (req, res) => {
  res.send('Servidor em funcionamento');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
