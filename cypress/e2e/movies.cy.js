import { faker } from '@faker-js/faker';

describe('Teste da rota /Movies', () => {
  let filmeId;
  const user = createUserForMovies();

  before(() => {
    cy.criarUsuario(user);
    cy.login(user.email, user.password);
    cy.promoveAdmin();
  });

  it('Retorna Success(201) para criação de filmes', () => {
    cy.fixture('/filme.json').then((filme) => {
      cy.request({
        method: 'POST',
        url: '/movies',
        body: filme,
        headers: {
          Authorization: `Bearer ${Cypress.env('accessToken')}`
        }
      })
        .then((response) => {
          expect(response.status).to.equal(201)
          filmeId = response.body.id
          cy.log(filmeId)
        })
    })
  });
  it('Retorna Bad Request(400) para criação de filmes', () => {
    cy.fixture('/filme.json').then((filme) => {
      cy.request({
        method: 'POST',
        url: '/movies',
        body: {},
        headers: {
          Authorization: `Bearer ${Cypress.env('accessToken')}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });
  });
  it('Retorna Success (204) ao atualizar um filme', () => {
    cy.fixture('/filmeAtualizado.json').then((filmeAtualizado) => {
      cy.request({
        method: 'PUT',
        url: `/movies/${filmeId}`,
        body: filmeAtualizado,
        headers: {
          Authorization: `Bearer ${Cypress.env('accessToken')}`
        }
      }).then((response) => {
        expect(response.status).to.equal(204)
      })
    })
  });

  it('Retorna Movie not found(404) com um filmeId inválido para atualizar', () => {
  
    cy.fixture('/filmeDelete.json').then((filmeDelete) => {
      cy.request({
        method: 'POST',
        url: '/movies',
        body: filmeDelete,
        headers: {
          Authorization: `Bearer ${Cypress.env('accessToken')}`
        },
      })
        .then((response) => {
          expect(response.status).to.equal(201);
          cy.wrap(response.body.id).as("filmeIdDelete")
          cy.deletarFilme(response.body.id)
        })
      cy.get("@filmeIdDelete").then((filmeIdDelete) => {
        cy.request({
          method: 'PUT',
          url: `/movies/${filmeIdDelete}`,
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
    });
  });
  it('Retorna Success(200) para consulta de Movies e uma lista de filmes', () => {
    cy.request('GET', '/movies').then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).not.empty;
      expect(response.body[0]).has.property('id');
      expect(response.body[0]).has.property('title');
      expect(response.body[0]).has.property('genre');
      expect(response.body[0]).has.property('description');
      expect(response.body[0]).has.property('totalRating');
      expect(response.body[0]).has.property('durationInMinutes');
      expect(response.body[0]).has.property('releaseYear')
    });
  });

  it('Retorna Success(200) e uma lista de filmes que correspondem ao valor do titulo pesquisado ', () => {
    cy.request({
      method: 'GET',
      url: '/movies/search',
      qs: { title: 'a' }
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).not.empty;
    });
  });

  it('Retorna Success(200) e uma lista vazia caso não haja filmes que correspondem ao valor pesquisado', () => {
    cy.request({
      method: 'GET',
      url: '/movies/search',
      qs: { title: 'a123asdasd3151asda' }
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).empty;
    });
  });

  it('Retorna Success(200) e body do filme com o id pesquisado', () => {
    cy.request({
      method: 'GET',
      url: `/movies/${filmeId}`,
    }).then((response) => {
      expect(response.status).to.equal(200);
    })
  });

  it('Retorna Success(200) com body vazio se não houver filme com o id pesquisado', () => {
    cy.request({
      method: 'GET',
      url: '/movies/10000000000000000',
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.id).undefined;
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