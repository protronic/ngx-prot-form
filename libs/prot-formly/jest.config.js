module.exports = {
  name: 'formly-prot-formly',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/formly/prot-formly',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
