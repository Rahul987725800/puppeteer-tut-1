const { Schema, model } = require('mongoose');
const SubCategorySchema = new Schema({
  name: String,
  questions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Question',
    },
  ],
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },
});
module.exports = model('SubCategory', SubCategorySchema);
