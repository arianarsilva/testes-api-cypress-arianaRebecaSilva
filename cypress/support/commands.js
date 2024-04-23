// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('criarUsuario', (user) => {
    cy.request({
        method: 'POST',
        url: '/users',
        body: user
    })
})

Cypress.Commands.add('login', (email, password) => {
    cy.request({
        method: 'POST',
        url: '/auth/login',
        body: {
            email: email,
            password: password
        }
    }).then((response) => {
        const accessToken = response.body.accessToken
        console.log(accessToken);
        Cypress.env('accessToken', accessToken)
    })
})

Cypress.Commands.add('promoveAdmin', () => {
    cy.request({
        method: 'PATCH',
        url: '/users/admin',
        headers: {
            Authorization: `Bearer ${Cypress.env('accessToken')}`
        }
    })
})