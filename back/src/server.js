const express = require('express');
const { validationResult } = require('express-validator');
const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

function preprocessImage(imgBuffer) {
  try {
    const tfImg = tf.node.decodeImage(imgBuffer, 3);
    const resizedImg = tf.image.resizeBilinear(tfImg, [150, 150]);
    const expandedImg = resizedImg.expandDims(0);
    const preprocessedImg = expandedImg.toFloat().div(255);
    return preprocessedImg;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    throw new Error('Failed to preprocess image');
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de tamanho do arquivo (5MB)
  },
});

app.get('/', async (req, res) => {
  res.send('Servidor em funcionamento');
});

app.post('/upload-and-classify', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imgBuffer = file.buffer;
    const preprocessedImg = preprocessImage(imgBuffer);
    const prediction = model.predict(preprocessedImg);
    const classIdx = prediction.argMax(1).dataSync()[0];
    const classes = ['Azul', 'Baleia', 'Branco', 'Lixa', 'Martelo', 'Tigre', 'Touro'];
    const className = classes[classIdx];

    res.json({ className });
  } catch (error) {
    console.error('Error uploading and classifying image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
