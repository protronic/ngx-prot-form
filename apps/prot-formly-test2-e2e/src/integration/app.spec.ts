import { getGreeting } from '../support/app.po';

describe('prot-formly-test2', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to prot-formly-test2!');
  });
});
