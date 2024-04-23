import { faker } from '@faker-js/faker';

let filmeId;
describe('Teste da rota /Movies', () => {
  let accessToken;

  //describe('Deve receber Sucess(200) na criação de filmes', () => { // CRIAR CONTA
  let usuarioCriado;
  const user = createUserForMovies();
  const nameUser = user.name;
  const emailUser = user.email
  const passwordUser = user.password;

  before(() => {
    cy.request({ // cadastrar
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users',
      body: {
        name: nameUser,
        email: emailUser,
        password: passwordUser
      }
    });
    cy.request({ //fazer login
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login',
      body: {
        email: emailUser,
        password: passwordUser
      }
    }).then((response) => {
      console.log('Response body ' + response.body.accessToken);
      accessToken = response.body.accessToken;
    });
  });

  it('Retorna Sucess(200) para criação de filmes', () => { // CRIAR FILME
    cy.request({ //fazer login
      method: 'PATCH',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/admin',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((response) => {
      console.log('Response body ' + response.body.accessToken);
      accessToken = response.body.accessToken;
    });
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/movies/',
      body: {
        title: "De volta para o Futuro",
        genre: "Ficção Científica",
        description: "Descrição do filme aqui",
        durationInMinutes: 116,
        releaseYear: 1985
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then((response) => {
        expect(response.status).to.equal(201)
        filmeId = response.body.id
        cy.log(filmeId)
      })
  })
  it('Retorna Success(200) para consulta de Movies e uma lista de filmes', () => {
    cy.request('GET', 'https://raromdb-3c39614e42d4.herokuapp.com/api/movies').then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).not.empty;
      expect(response.body[0]).has.property('id');
      expect(response.body[0]).has.property('title');
      expect(response.body[0]).has.property('genre');
      expect(response.body[0]).has.property('description');
      expect(response.body[0]).has.property('totalRating');
      expect(response.body[0]).has.property('durationInMinutes');
      expect(response.body[0]).has.property('releaseYear');
    });
  });

  it('Retorna Success(200) e uma lista de filmes que correspondem ao valor do titulo pesquisado ', () => {
    cy.request({
      method: 'GET',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/movies/search',
      qs: { title: 'a' }
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).not.empty;
    });
  });

  it('Retorna Success(200) e uma lista vazia caso não haja filmes que correspondem ao valor pesquisado', () => {
    cy.request({
      method: 'GET',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/movies/search',
      qs: { title: 'a123asdasd3151asda' }
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).empty;
    });
  });

  it('Retorna Success(200) e body do filme com o id pesquisado', () => {
    cy.request({
      method: 'GET',
      url: `https://raromdb-3c39614e42d4.herokuapp.com/api/movies/${filmeId}`,
    }).then((response) => {
      expect(response.status).to.equal(200);
    });

    it('Retorna Success(200) com body vazio se não houver filme com o id pesquisado', () => {
      cy.request({
        method: 'GET',
        url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/movies/10000000000000000',
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.id).undefined;
      });
    });
  });
});

function createUserForMovies() {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
  };
};

