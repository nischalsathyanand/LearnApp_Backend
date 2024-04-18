const mongoose = require('mongoose');

const EveryDayObjectSchema = new mongoose.Schema({
  everyDayObjects: {
    type: Map,
    of: {
      imageFileNames: [{
        type: String,
        required: true
      }],
      audioFileName: {
        type: String,
        required: true
      }
    }
  }
});

module.exports = mongoose.model('EveryDayObject', EveryDayObjectSchema);