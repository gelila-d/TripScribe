const mongoose = require('mongoose');
const { Schema } = mongoose;

const travelStorySchema = new Schema({
  title: { type: String, required: true },
  story: { type: String, required: true },
  visitedLocations: { type: [String], default: [] },
  isFavourite: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  createdOn: { type: Date, default: Date.now },
  imageUrl: { type: String, required: true },
  visitedDate: { type: Date, required: true, index: true }
});

// Text index for better search performance
travelStorySchema.index({ title: 'text', story: 'text', visitedLocations: 'text' });

module.exports = mongoose.model('TravelStory', travelStorySchema);
