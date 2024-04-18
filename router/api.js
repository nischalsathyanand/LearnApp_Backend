const express = require('express');
const router = express.Router();
const EveryDayObject = require('../models/EveryDayObject');
router.get('/getObjectDetails', async (req, res) => {
    try {
        const { object } = req.query;
        if (!object || !['boy', 'girl', 'men', 'woman'].includes(object)) {
            return res.status(400).send('Invalid object parameter');
        }

        const objectData = await EveryDayObject.findOne({ [`everyDayObjects.${object}`]: { $exists: true } });
        if (!objectData) {
            return res.status(404).send(`${object} data not found`);
        }

        const objectObject = objectData.everyDayObjects.get(object);
        if (!objectObject) {
            return res.status(404).send(`${object} data not found`);
        }

        const { audioFileName, imageFileNames } = objectObject;
        const randomImageUrl = imageFileNames[Math.floor(Math.random() * imageFileNames.length)];

        res.json({ audioUrl: `/files/${audioFileName}`, randomImageUrl: `/files/${randomImageUrl}` });

    } catch (error) {
        console.error(`Error fetching ${req.query.object} data:`, error);
        res.status(500).send('Internal Server Error');
    }
});



router.get('/generateQuestion', async (req, res) => {
  try {
    const everyDayObjects = await EveryDayObject.find({});
    
    // Convert Map to Array and select a random object for the question
    const keys = Array.from(everyDayObjects[0].everyDayObjects.keys());
    const selectedKey = req.query.key;
    const randomKey = selectedKey && keys.includes(selectedKey) ? selectedKey : keys[Math.floor(Math.random() * keys.length)];
    const randomObject = everyDayObjects[0].everyDayObjects.get(randomKey);

    // Generate a question
    const question = `What is this?`;

    // Select a random image from the imageFileNames array
    const images = randomObject.imageFileNames;
    const randomImage = images[Math.floor(Math.random() * images.length)];

    const audio = randomObject.audioFileName;

    // Generate answer options
    const shuffledKeys = keys.sort(() => 0.5 - Math.random());
    let options = shuffledKeys.slice(0, 4);
    if (!options.includes(randomKey)) {
      options[3] = randomKey;
      options.sort(() => 0.5 - Math.random());
    }

    // Convert options to images and include the key
    let optionsImages = options.map(optionKey => {
      let imageFileNames = everyDayObjects[0].everyDayObjects.get(optionKey).imageFileNames;
      let randomImageFileName = imageFileNames[Math.floor(Math.random() * imageFileNames.length)];
      return {
        key: optionKey,
        image: randomImageFileName
      };
    });
    

    // Include the correct answer in the response
    const correctAnswer = randomKey;

    res.json({ question, randomImage, audio, optionsImages, correctAnswer });
  } catch (err) {
    res.status(500).send({ error: 'Error fetching data' });
  }
});

module.exports = router;