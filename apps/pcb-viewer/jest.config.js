module.exports = {
  name: 'pcb-viewer',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/pcb-viewer',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
