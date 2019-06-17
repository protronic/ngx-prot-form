module.exports = {
  name: 'prot-formly-test2',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/prot-formly-test2',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
