const mongoose = require('mongoose');

const caseStudySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  founder: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['소프트웨어', '이커머스', '서비스', '콘텐츠', '기타']
  },
  revenue: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'KRW'
    },
    period: {
      type: String,
      enum: ['월', '년', '일회성'],
      default: '월'
    }
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  tags: [String],
  imageUrl: String,
  isNew: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CaseStudy', caseStudySchema);