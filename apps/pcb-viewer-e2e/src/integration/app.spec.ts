import { getGreeting } from '../support/app.po';

describe('pcb-viewer', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to pcb-viewer!');
  });
});
