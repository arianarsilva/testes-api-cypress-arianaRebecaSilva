import { faker } from '@faker-js/faker';

describe('Teste da API Raro - USERS', function () {
  const usuario = criarUsuario();
  let usuarioCriado;
  let accessToken;

  it('Deve criar um usuário', function () {
    cy.request('POST', '/users', usuario)
      .then(function (response) {
        expect(response.status).to.equal(201);
        expect(response.body).property('name').to.equal(usuario.name);
        expect(response.body).to.have.property('id');
        usuarioCriado = response.body;
      });
  });

  it('Deve autenticar o login', function () {
    cy.request('POST', '/auth/login', {
      email: usuario.email,
      password: usuario.password,
    })
      .then(function (response) {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('accessToken');
        accessToken = response.body.accessToken;
      });
  });

  it('Deve consultar usuário criado', function () {
    cy.request({
      method: 'GET', url: `/users/${usuarioCriado.id}`,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(function (response) {
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal(usuarioCriado);
      })
  });

  it('Deve promover o usuário a admin', function () {
    cy.request({
      method: 'PATCH',
      url: '/users/admin',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(function (response) {
        expect(response.status).to.equal(204);
      })
  });

  it('Deve listar todos os usuários', function () {
    cy.request({
      method: 'GET',
      url: '/users',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(function (response) {
        expect(response.status).to.equal(200);
        expect(response.body).is.not.empty;
      })
  });

  it('Retorna Bad Request(400) ao tentar criar usuário com senha inválida', () => {
    cy.request({
      method: 'POST',
      url: '/users',
      body: {
        name: usuario.name,
        email: usuario.email,
        password: '1234',
      },
      failOnStatusCode: false,
    })
      .then((response) => {
        expect(response.status).to.equal(400);
      });
  });

  it('Retorna Bad Request(400) ao tentar criar usuário com email inválido', () => {
    cy.request({
      method: 'POST',
      url: '/users',
      body: {
        name: usuario.name,
        email: '.',
        password: usuario.password,
      },
      failOnStatusCode: false,
    })
      .then((response) => {
        expect(response.status).to.equal(400);
      });
  });

  it('Retorna Conflict(409) ao tentar criar usuário existente', () => {
    cy.request({
      method: 'POST',
      url: '/users',
      body: usuario,
      failOnStatusCode: false,
    });
    cy.request({
      method: 'POST',
      url: '/users',
      body: usuario,
      failOnStatusCode: false,
    })
      .then((response) => {
        expect(response.status).to.equal(409);
        expect(response.body.message).to.equal("Email already in use")
      });
  });

  it('Retorna Created(201) ao criar uma review', () => {
    cy.login(usuario.email, usuario.password);
    cy.promoveAdmin();
    cy.criarFilme().then((response) => cy.wrap(response.id).as('filmeId'));
    cy.get('@filmeId').then((filmeId) => {
      cy.request({
        method: 'POST',
        url: '/users/review',
        body: {
          movieId: filmeId,
          score: 5,
          reviewText: "Aqui está a descrição do filme",
        },
        headers: {
          Authorization: `Bearer ${Cypress.env('accessToken')}`
        }
      })
        .then((response) => {
          expect(response.status).to.equal(201)
        })
    });
  });
  it('Retornar Success (200) ao consultar a lista de reviews', () => {
    cy.request({
      method: 'GET',
      url: '/users/review/all',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((response) => {
      expect(response.status).to.equal(200)
    })
  })
  it('Retorna Bad Request(400) ao tentar avaliar um filme com id inválido', () => {
    cy.request({
      method: 'POST',
      url: '/users/review',
      body: {
        movieId: "Nome do filme",
        score: 5,
        reviewText: "Aqui está a descrição do filme",
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(400)
    })
  })

  it('Retorna Unauthorized(401) com o acesso inválido para avaliar um filme', () => {
    cy.fixture('/filme.json').then((filme) => {
      cy.request({
        method: 'POST',
        url: '/users/review',
        body: filme,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401)
      })
    })
  })

  it('Retorna Movie not found(404) ao tentar avaliar um filme que nao existe', () => {
    cy.login(usuario.email, usuario.password);
    cy.promoveAdmin();
    cy.criarFilme().then((response) => cy.wrap(response.id).as('filmeIdDelete'));
    cy.get("@filmeIdDelete").then((filmeIdDelete) => cy.deletarFilme(filmeIdDelete))
    cy.get("@filmeIdDelete").then((filmeIdDelete) => {
      cy.request({
        method: 'POST',
        url: '/users/review',
        body: {
          movieId: filmeIdDelete,
          score: 5,
          reviewText: "Aqui está a descrição do filme",
        },
        headers: {
          Authorization: `Bearer ${Cypress.env('accessToken')}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(404)
      })
    })
  })
});

function criarUsuario() {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
  };
}