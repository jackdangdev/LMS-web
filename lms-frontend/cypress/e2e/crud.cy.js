/**
 * crud.cy.js — full Create / Read / Update / Delete on the course object,
 * driven through the instructor UI (Part A requirement).
 */
const { instructor } = Cypress.env();

const STAMP = Date.now().toString().slice(-6);
const TITLE = `E2E Crash Course ${STAMP}`;
// the API enforces codes like "CSE-101" — 2-4 letters (no digits) + 3 digits
const CODE = `TST-${STAMP.slice(-3)}`;

describe('Course CRUD (instructor)', () => {
  it('creates, edits and deletes a course end-to-end', () => {
    cy.login(instructor);
    cy.visit('/teach');

    /* ---------------------------------------------------------- CREATE */
    cy.contains('button', '+ New course').click();
    cy.get('[role="dialog"]').within(() => {
      cy.get('input[placeholder="Modern React Patterns"]').type(TITLE);
      cy.get('input[placeholder="WEB-210"]').type(CODE);
      cy.get('textarea').type('Written by the Cypress E2E suite to prove the CRUD loop.');
    });
    cy.get('[role="dialog"]').contains('button', 'Create course').click();

    // the dashboard hands us straight to the editor of the fresh course
    cy.url({ timeout: 15000 }).should('match', /\/teach\/courses\//);
    cy.contains('h1', TITLE).should('be.visible');

    /* ------------------------------------------------------------ READ */
    cy.visit('/teach');
    cy.contains('td', TITLE).should('be.visible');
    cy.contains('td', TITLE).contains('a').click();
    cy.url().should('match', /\/courses\//);
    cy.contains('h1', TITLE).should('be.visible');

    /* ---------------------------------------------------------- UPDATE */
    cy.visit('/teach');
    cy.contains('td', TITLE)
      .parents('tr')
      .contains('button', 'Manage')
      .click();
    cy.get('input.field').first().clear().type(`${TITLE} (v2)`);
    cy.contains('button', 'Save changes').click();
    cy.contains(/Course settings saved/i).should('be.visible');

    /* ---------------------------------------------------------- DELETE */
    cy.visit('/teach');
    cy.contains('td', `${TITLE} (v2)`)
      .parents('tr')
      .contains('button', 'Delete')
      .click();
    cy.get('[role="dialog"]').contains('button', 'Delete course').click();
    cy.contains('td', TITLE).should('not.exist');
  });
});
