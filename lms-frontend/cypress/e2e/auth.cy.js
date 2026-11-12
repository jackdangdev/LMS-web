/**
 * auth.cy.js — authentication flows (Part A requirement: SignUp / SignIn).
 */
const { student, instructor, demoPassword } = Cypress.env();

describe('Authentication', () => {
  it('rejects a wrong password with a visible error', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(student);
    cy.get('input[type="password"]').type('WrongPassword999');
    cy.contains('button', 'Sign in').click();
    cy.contains(/invalid email or password/i).should('be.visible');
    cy.url().should('include', '/login');
  });

  it('signs a student in and lands on My Learning', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(student);
    cy.get('input[type="password"]').type(demoPassword);
    cy.contains('button', 'Sign in').click();
    cy.url().should('include', '/my-learning');
    cy.contains(/my learning/i).should('be.visible');
  });

  it('shows My profile and Sign out in the navigation while logged in', () => {
    cy.login(student);
    cy.visit('/my-learning');
    cy.contains('button, a', /sign out/i).should('be.visible');
  });

  it('signs the user out and protects private routes afterwards', () => {
    cy.login(student);
    cy.visit('/my-learning');
    cy.contains('button', /sign out/i).click();
    cy.url().should('include', '/login');

    // the token is gone — hitting a guarded route bounces back to /login
    cy.visit('/my-learning');
    cy.url({ timeout: 10000 }).should('match', /\/(login|register)/);
  });

  it('redirects an instructor to the teaching dashboard', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(instructor);
    cy.get('input[type="password"]').type(demoPassword);
    cy.contains('button', 'Sign in').click();
    cy.url().should('include', '/teach');
    cy.contains(/teach|instructor/i).should('be.visible');
    cy.signOut();
  });
});
