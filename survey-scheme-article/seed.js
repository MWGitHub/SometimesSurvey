const faker = require('faker');
const _ = require('lodash');
const moment = require('moment');

const LINES = 4;
const PARAGRAPHS = 4;

function generateText(paragraphs, lines) {
  const text = [];
  for (let i = 0; i < paragraphs; ++i) {
    let line = '';
    for (let j = 0; j < lines; ++j) {
      line += _.capitalize(faker.hacker.phrase());
    }
    text.push(line);
  }
  return text;
}

module.exports = {
  deploy: moment().subtract(10, 'days'),

  articles: {
    always: {
      title: 'Always seen (Show)',
      image: faker.image.image(),
      text: generateText(PARAGRAPHS, LINES),
      date: moment().subtract(5, 'days').toDate(),
      reads: 25000,
      readsPerHour: 1000,
    },
    publishedBefore: {
      title: 'Published before deploy',
      image: faker.image.image(),
      text: generateText(PARAGRAPHS, LINES),
      date: moment().subtract(10, 'years').toDate(),
      reads: 25000,
      readsPerHour: 1000,
    },
    old: {
      title: 'Too old to be seen',
      image: faker.image.image(),
      text: generateText(PARAGRAPHS, LINES),
      date: moment().subtract(8, 'days').toDate(),
      reads: 25000,
      readsPerHour: 1000,
    },
    unpopular: {
      title: 'Too unpopular',
      image: faker.image.image(),
      text: generateText(PARAGRAPHS, LINES),
      date: moment().subtract(5, 'days').toDate(),
      reads: 1000,
      readsPerHour: 1000,
    },
    unpopularHot: {
      title: 'Too unpopular and hot',
      image: faker.image.image(),
      text: generateText(PARAGRAPHS, LINES),
      date: moment().subtract(5, 'days').toDate(),
      reads: 40000,
      readsPerHour: 5000,
    },
    catdilocks: {
      title: 'Just the right popularity (sometimes shown)',
      image: faker.image.image(),
      text: generateText(PARAGRAPHS, LINES),
      date: moment().subtract(5, 'days').toDate(),
      reads: 50000,
      readsPerHour: 5000,
    },
    full: {
      title: 'Sample size is good enough',
      image: faker.image.image(),
      text: generateText(PARAGRAPHS, LINES),
      date: moment().subtract(5, 'days').toDate(),
      reads: 1000001,
      readsPerHour: 5000,
    },
  },
};
