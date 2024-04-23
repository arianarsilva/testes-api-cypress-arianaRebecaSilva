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

Cypress.Commands.add('deletarFilme', (id) => {
    cy.request({
        method: 'DELETE',
        url: '/movies/' + id,
        headers: {
            Authorization: `Bearer ${Cypress.env('accessToken')}`
        }
    });
});

Cypress.Commands.add('criarFilme', () => {
    cy.fixture('/filme.json').then((filme) => {
        cy.request({
            method: 'POST',
            url: '/movies',
            body: filme,
            headers: {
                Authorization: `Bearer ${Cypress.env('accessToken')}`
            }
        })
    }).then((response) => response.body);
});

Cypress.Commands.add('criarReview', (id) => {
    cy.request({
        method: 'POST',
        url: '/users/review',
        body: {
            movieId: id,
            score: 5,
            reviewText: "Aqui está a descrição do filme",
        },
        headers: {
            Authorization: `Bearer ${Cypress.env('accessToken')}`
        }
    })
});