/**
 * catalogue.cy.js — the Home/Landing page requirement: list of site objects,
 * navigation, and course detail access.
 */
describe('Catalogue (Home / Landing page)', () => {
  it('greets visitors with the site name and shows every published course', () => {
    cy.visit('/');
    cy.contains(/EduNova/i).should('be.visible');
    cy.get('article').should('have.length.at.least', 3);
    cy.contains('WEB-101').should('be.visible');
    cy.contains('DAT-201').should('be.visible');
    cy.contains('DES-110').should('be.visible');
  });

  it('narrows the list with the search box', () => {
    cy.visit('/');
    cy.get('input[type="search"], input[placeholder*="Search" i]').first().type('python');
    cy.get('article').should('have.length', 1);
    cy.contains(/Data Analysis Foundations/i).should('be.visible');
  });

  it('opens a course detail page from the catalogue card', () => {
    cy.visit('/');
    cy.contains('article a', /Modern Web/i).first().click();
    cy.url().should('match', /\/courses\//);
    cy.contains(/lessons/i).should('be.visible');
  });

  it('shows an empty state when nothing matches the filter', () => {
    cy.visit('/');
    cy.get('input[type="search"], input[placeholder*="Search" i]').first().type('zzzznope');
    cy.contains(/no courses|nothing|empty/i).should('be.visible');
  });
});
