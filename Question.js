const { Schema, model } = require('mongoose');
const QuestionSchema = new Schema({
  name: String,
  url: String,
  result: [
    {
      head: String,
      content: String,
    },
  ],
  subCategory: {
    type: Schema.Types.ObjectId,
    ref: 'SubCategory',
  },
});
module.exports = model('Question', QuestionSchema);
