import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import yahooFinance from 'yahoo-finance2';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

// Conectar MongoDB
mongoose.connect('mongodb://localhost:27017/carteira', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
});

// Modelo Carteira
const CarteiraSchema = new mongoose.Schema({
  ticker: { type: String, required: true, unique: true, uppercase: true },
  quantidade: { type: Number, required: true, default: 0 },
  precoMedio: { type: Number, required: true, default: 0 },
});
const Carteira = mongoose.model('Carteira', CarteiraSchema);

// Rotas API

// 1. Buscar carteira
app.get('/api/carteira', async (req, res) => {
  try {
    const ativos = await Carteira.find({}, '-_id ticker quantidade precoMedio');
    res.json(ativos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar carteira' });
  }
});

// 2. Adicionar ativo
app.post('/api/carteira', async (req, res) => {
  const { ticker, quantidade, precoMedio } = req.body;
  if (!ticker || quantidade == null || precoMedio == null) {
    return res.status(400).json({ erro: 'Ticker, quantidade e preço médio são obrigatórios' });
  }
  try {
    const novoAtivo = new Carteira({
      ticker: ticker.toUpperCase(),
      quantidade,
      precoMedio,
    });
    await novoAtivo.save();
    res.json({ sucesso: true });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ erro: 'Ativo já existe na carteira' });
    } else {
      res.status(500).json({ erro: 'Erro ao adicionar ativo' });
    }
  }
});

// 3. Atualizar ativo
app.put('/api/carteira/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const { quantidade, precoMedio } = req.body;

  if (quantidade == null || precoMedio == null) {
    return res.status(400).json({ erro: 'Quantidade e preço médio são obrigatórios' });
  }

  try {
    const ativo = await Carteira.findOneAndUpdate(
      { ticker },
      { quantidade, precoMedio },
      { new: true }
    );
    if (!ativo) {
      return res.status(404).json({ erro: 'Ativo não encontrado' });
    }
    res.json({ sucesso: true, ativo });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar ativo' });
  }
});

// 4. Remover ativo
app.delete('/api/carteira/:ticker', async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const del = await Carteira.findOneAndDelete({ ticker });
    if (del) {
      res.json({ sucesso: true });
    } else {
      res.status(404).json({ erro: 'Ativo não encontrado' });
    }
  } catch {
    res.status(500).json({ erro: 'Erro ao remover ativo' });
  }
});

// 5. Buscar cotação de um ticker (reaproveitando seu endpoint)
app.get('/cotacao/:ticker', async (req, res) => {
  const rawTicker = req.params.ticker.toUpperCase();
  const ticker = `${rawTicker}.SA`;

  try {
    const quote = await yahooFinance.quote(ticker);

    const preco = quote.regularMarketPrice;
    const marketTime = quote.regularMarketTime;
    const maxDia = quote.regularMarketDayHigh || quote.summaryDetail?.dayHigh || quote.price?.dayHigh || null;
    const minDia = quote.regularMarketDayLow || quote.summaryDetail?.dayLow || quote.price?.dayLow || null;

    if (!preco || !marketTime) {
      return res.status(500).json({ erro: 'Dados incompletos para esse ticker.' });
    }

    const data = new Date(marketTime).toLocaleString('pt-BR');

    res.json({
      ticker: rawTicker,
      valor: preco,
      data: data,
      precoMaximo: maxDia !== null ? maxDia : "N/A",
      precoMinimo: minDia !== null ? minDia : "N/A"
    });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).json({ erro: 'Falha ao buscar cotação' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
