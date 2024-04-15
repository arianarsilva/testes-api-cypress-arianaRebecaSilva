import { faker } from '@faker-js/faker';

describe('Teste da API Raro - USERS', function () {
  const usuario = criarUsuario();
  const senha = usuario.password;
  const email = usuario.email;
  let usuarioCriado;
  let accessToken;
  it('Deve criar um usuário', function () {
    cy.request('POST', 'https://raromdb-3c39614e42d4.herokuapp.com/api/users', usuario)
      .then(function (response) {
        expect(response.status).to.equal(201);
        expect(response.body).property('name').to.equal(usuario.name);
        expect(response.body).to.have.property('id');
        usuarioCriado = response.body;
      });
  });
  it('Deve autenticar o login', function () {
    cy.request('POST', 'https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login', {
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
      method: 'GET', url: `https://raromdb-3c39614e42d4.herokuapp.com/api/users/${usuarioCriado.id}`,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(function (response) {
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal(usuarioCriado);
      })
  });

  it('Retorna Bad Request(400) ao tentar criar usuário com senha inválida', () => {
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users',
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
  it('Retorna Conflict(409) ao tentar criar usuário existente', () => {
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users',
      body: usuario,
      failOnStatusCode: false,
    });
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users',
      body: usuario,
      failOnStatusCode: false,
    })
      .then((response) => {
        expect(response.status).to.equal(409);
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