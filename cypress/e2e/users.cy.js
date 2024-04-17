import { faker } from '@faker-js/faker';

describe('Teste da API Raro - USERS', function () {
  const usuario = criarUsuario();
  const senha = usuario.password;
  const email = usuario.email;
  let usuarioCriado;
  let accessToken;
  const baseUrl = 'https://raromdb-3c39614e42d4.herokuapp.com/api';

  it('Deve criar um usuário', function () {
    cy.request('POST', baseUrl + '/users', usuario)
      .then(function (response) {
        expect(response.status).to.equal(201);
        expect(response.body).property('name').to.equal(usuario.name);
        expect(response.body).to.have.property('id');
        usuarioCriado = response.body;
      });
  });

  it('Deve autenticar o login', function () {
    cy.request('POST', baseUrl + '/auth/login', {
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
      method: 'GET', url: baseUrl + `/users/${usuarioCriado.id}`,
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
      url: baseUrl + '/users/admin',
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
      url: baseUrl + '/users',
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
      url: baseUrl + '/users',
      body: {
        name: usuario.name,
        email: email,
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
      url: baseUrl + '/users',
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
      url: baseUrl + '/users',
      body: usuario,
      failOnStatusCode: false,
    });
    cy.request({
      method: 'POST',
      url: baseUrl + '/users',
      body: usuario,
      failOnStatusCode: false,
    })
      .then((response) => {
        expect(response.status).to.equal(409);
        expect(response.body.message).to.equal("Email already in use")
      });
  });
});

function criarUsuario() {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
  };
}