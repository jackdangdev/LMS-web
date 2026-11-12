/**
 * support/e2e.js — shared helpers for the EduNova Cypress suite.
 */

Cypress.Commands.add('login', (email, password = Cypress.env('demoPassword')) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.contains('button', 'Sign in').click();
    cy.url({ timeout: 15000 }).should('not.include', '/login');
  });
});

Cypress.Commands.add('signOut', () => {
  cy.contains('button', /sign out/i).click();
  cy.url({ timeout: 10000 }).should('include', '/login');
});
