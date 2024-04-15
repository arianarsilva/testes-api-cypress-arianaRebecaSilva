describe('Movies API', () => {
  it('Retorna Success(200) e uma lista de filmes', () => {
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

  it('Retorna Success(200) e o filme com o id pesquisado', () => {
    cy.request({
      method: 'GET',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/movies/1',
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.id).to.equal(1);
      expect(response.body.title).to.equal("arbustum synagoga tendo autus qui");
      expect(response.body.description).to.equal("Crur apostolus color concido subnecto vigor temporibus cras clibanus.");
      expect(response.body.genre).to.equal("adaugeo ustilo apto adfero audeo");
      expect(response.body.reviews).to.deep.equal([]);
      expect(response.body.durationInMinutes).to.equal(58);
      expect(response.body.releaseYear).to.equal(2023);
      expect(response.body.criticScore).to.equal(0);
      expect(response.body.audienceScore).to.equal(0);
    });
  });

  it('Retorna Success(200) com body vazio se não houver filme com o id pesquisado', () => {
    cy.request({
      method: 'GET',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/movies/10000000000000000',
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.id).is.undefined;
    });
  });
})

