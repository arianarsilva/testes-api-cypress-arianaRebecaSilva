import { faker } from '@faker-js/faker';
describe('Auth API', () => {
  let user;
  beforeEach(() => {
    user = createUserForAuth();
    cy.request({
      method: "POST",
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users',
      body: user,
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json"
      }
    });
  });

  it('Retorna Success(200) ao autenticar um usuário com sucesso', () => {
    cy.request('POST', 'https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login', {
      email: user.email,
      password: user.password,
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).property('accessToken').is.not.empty
    });
  });
  it('Retorna Unauthorized(401) ao tentar autenticar um usuário com email errado', () => {
    cy.request({
      method: 'POST', url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login', body: {
        email: 'email@123.com',
        password: user.password,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(401);
      expect(response.body.message).to.be.equal("Invalid username or password.");
      expect(response.body.error).to.be.equal("Unauthorized");
      expect(response.body.statusCode).to.be.equal(401);
    });
  });
  it('Retorna Unauthorized(401) ao tentar autenticar um usuário com senha diferente da cadastrada', () => {
    cy.request({
      method: 'POST', url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login', body: {
        email: user.email,
        password: faker.internet.password({ length: 12 }),
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(401);
      expect(response.body.message).to.be.equal("Invalid username or password.");
      expect(response.body.error).to.be.equal("Unauthorized");
      expect(response.body.statusCode).to.be.equal(401);
    });
  });
  it('Retorna Bad Request(400) ao tentar autenticar utilizando um valor inválido para email', () => {
    cy.request({
      method: 'POST', url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login', body: {
        email: 'emailemail',
        password: '1234',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.equal("Bad Request");
      expect(response.body.statusCode).to.be.equal(400);
    });
  });
})


function createUserForAuth() {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
  };
}
