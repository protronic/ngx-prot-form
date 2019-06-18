module.exports = {
  name: 'prot-formly-schema-editor',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/prot-formly-schema-editor',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
