document.getElementById('scrape').addEventListener('click', async () => {
  const keyword = document.getElementById('keyword').value.trim();
  if (!keyword) {
    alert('Digite uma palavra-chave!');
    return;
  }

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '<p>Carregando...</p>';

  try {
    const response = await fetch(`http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      throw new Error('Erro na requisição');
    }
    const products = await response.json();

    resultsDiv.innerHTML = '';
    products.forEach(product => {
      const productDiv = document.createElement('div');
      productDiv.className = 'product';
      productDiv.innerHTML = `
        <img src="${product.image}" alt="${product.title}">
        <h3>${product.title}</h3>
        <p>Avaliação: ${product.rating} estrelas (${product.numRatings} avaliações)</p>
      `;
      resultsDiv.appendChild(productDiv);
    });
  } catch (error) {
    resultsDiv.innerHTML = '<p>Erro ao carregar dados: ' + error.message + '</p>';
  }
});