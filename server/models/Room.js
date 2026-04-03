const mongoose=require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  code: { type: String, default: '// Start coding...' }
}, { timestamps: true });

module.exports = mongoose.model('Room',roomSchema)