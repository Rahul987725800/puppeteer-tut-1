const { Schema, model } = require('mongoose');
const CategorySchema = new Schema({
  name: String,
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
  },
  subCategories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'SubCategory',
    },
  ],
});

module.exports = model('Category', CategorySchema);
