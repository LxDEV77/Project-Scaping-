import express from 'express';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import cors from 'cors'; // Importa o pacote CORS

const app = express();
const port = 3000;

// Habilita o CORS para permitir requisições do frontend
app.use(cors());

app.get('/api/scrape', async (req, res) => {
  try {
    // URL do site de demonstração para raspagem
    const url = 'http://books.toscrape.com/'; // <-- Nova URL!

    // Requisição com headers básicos
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    // Parse do HTML com JSDOM
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Extrai os livros
    const books: any[] = [];
    // Seletor para cada "bloco" de livro na página
    const items = document.querySelectorAll('li.col-xs-6.col-sm-4.col-md-3.col-lg-3');

    for (let item of items) {
      // Título do livro (está no atributo 'title' do link dentro do h3)
      const titleElement = item.querySelector('h3 a');
      const title = titleElement ? titleElement.getAttribute('title')?.trim() : 'Título Não Encontrado';
      
      // Preço do livro (classe 'price_color')
      const priceElement = item.querySelector('.price_color');
      const price = priceElement ? priceElement.textContent?.trim() : 'Preço Não Disponível';

      // Avaliação (estrela) - a classe indica o número de estrelas (e.g., 'star-rating Three')
      const ratingElement = item.querySelector('.star-rating');
      let rating = 'N/A';
      if (ratingElement) {
        const ratingClass = ratingElement.className;
        if (ratingClass.includes('One')) rating = '1 estrela';
        else if (ratingClass.includes('Two')) rating = '2 estrelas';
        else if (ratingClass.includes('Three')) rating = '3 estrelas';
        else if (ratingClass.includes('Four')) rating = '4 estrelas';
        else if (ratingClass.includes('Five')) rating = '5 estrelas';
      }

      // URL da imagem da capa
      const imageElement = item.querySelector('.thumbnail');
      // A URL da imagem é relativa, então precisamos completá-la
      const imageRelativeUrl = imageElement ? imageElement.getAttribute('src') : null;
      let imageUrl = 'https://placehold.co/150x200/cccccc/ffffff?text=Sem+Imagem'; // Placeholder padrão
      if (imageRelativeUrl) {
        // Constrói a URL completa da imagem
        imageUrl = `http://books.toscrape.com/${imageRelativeUrl.replace('../', '')}`;
      }

      books.push({
        title,
        price,
        rating,
        image: imageUrl,
      });
    }

    res.json(books);
  } catch (error) {
    console.error('Erro no backend ao raspar dados:', error);
    res.status(500).json({ error: 'Erro ao realizar a raspagem de books.toscrape.com. Verifique o console do servidor.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log('Para testar o backend diretamente, acesse: http://localhost:3000/api/scrape no navegador.');
});
