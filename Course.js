const { Schema, model } = require('mongoose');
const CourseSchema = new Schema({
  name: String,
  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
  ],
});
module.exports = model('Course', CourseSchema);
