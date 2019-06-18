import { getGreeting } from '../support/app.po';

describe('prot-formly-schema-editor', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to prot-formly-schema-editor!');
  });
});
