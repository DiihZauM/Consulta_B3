import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import yahooFinance from 'yahoo-finance2';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

app.get('/', (req, res) => {
    res.redirect('/carteira.html');
});

mongoose.connect('mongodb://localhost:27017/carteira', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado ao MongoDB!'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

const CarteiraSchema = new mongoose.Schema({
    ticker: { type: String, required: true, unique: true, uppercase: true },
    quantidade: { type: Number, required: true, default: 0, min: 0 },
    precoMedio: { type: Number, required: true, default: 0, min: 0 },
    type: {
        type: String,
        required: true,
        enum: ['AÇÃO', 'FII', 'ETF', 'BDR', 'CRIPTO', 'OUTRO'],
        default: 'AÇÃO'
    }
});

const Carteira = mongoose.model('Carteira', CarteiraSchema);

// --- ROTAS DA API (sem alterações) ---
app.get('/api/carteira', async (req, res) => {
    try {
        const ativos = await Carteira.find({}, '-_id ticker quantidade precoMedio type');
        res.json(ativos);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno do servidor ao buscar carteira.' });
    }
});

app.post('/api/carteira', async (req, res) => {
    const { ticker, quantidade, precoMedio, type } = req.body;
    if (!ticker || quantidade == null || precoMedio == null || !type) {
        return res.status(400).json({ erro: 'Ticker, quantidade, preço médio e tipo são obrigatórios.' });
    }
    if (isNaN(quantidade) || quantidade <= 0 || isNaN(precoMedio) || precoMedio <= 0) {
        return res.status(400).json({ erro: 'Quantidade e preço médio devem ser números positivos.' });
    }
    const allowedTypes = CarteiraSchema.path('type').enumValues;
    if (!allowedTypes.includes(type.toUpperCase())) {
        return res.status(400).json({ erro: `Tipo de ativo inválido.` });
    }
    try {
        const novoAtivo = new Carteira({
            ticker: ticker.toUpperCase(),
            quantidade: parseFloat(quantidade),
            precoMedio: parseFloat(precoMedio),
            type: type.toUpperCase()
        });
        await novoAtivo.save();
        res.status(201).json({ sucesso: true, mensagem: 'Ativo adicionado com sucesso!' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ erro: `Ativo com ticker '${ticker.toUpperCase()}' já existe.` });
        }
        res.status(500).json({ erro: 'Erro interno do servidor ao adicionar ativo.' });
    }
});

app.put('/api/carteira/:ticker', async (req, res) => {
    const ticker = req.params.ticker.toUpperCase();
    const { quantidade, precoMedio } = req.body;
    if (quantidade == null || precoMedio == null) {
        return res.status(400).json({ erro: 'Quantidade e preço médio são obrigatórios.' });
    }
    if (isNaN(quantidade) || quantidade < 0 || isNaN(precoMedio) || precoMedio < 0) {
        return res.status(400).json({ erro: 'Quantidade e preço médio devem ser números não negativos.' });
    }
    try {
        const ativo = await Carteira.findOneAndUpdate(
            { ticker },
            { quantidade: parseFloat(quantidade), precoMedio: parseFloat(precoMedio) },
            { new: true }
        );
        if (!ativo) {
            return res.status(404).json({ erro: `Ativo com ticker '${ticker}' não encontrado.` });
        }
        res.json({ sucesso: true, mensagem: 'Ativo atualizado com sucesso!', ativo });
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno do servidor ao atualizar ativo.' });
    }
});

app.delete('/api/carteira/:ticker', async (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase();
        const del = await Carteira.findOneAndDelete({ ticker });
        if (del) {
            res.json({ sucesso: true, mensagem: `Ativo '${ticker}' removido com sucesso.` });
        } else {
            res.status(404).json({ erro: `Ativo com ticker '${ticker}' não encontrado.` });
        }
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno do servidor ao remover ativo.' });
    }
});

// --- ROTA DE COTAÇÃO (COM O CÁLCULO CORRIGIDO) ---
app.get('/cotacao/:ticker', async (req, res) => {
    const rawTicker = req.params.ticker.toUpperCase();
    // Adapte o sufixo conforme necessário para diferentes bolsas
    const tickerComSufixo = `${rawTicker}.SA`; 

    try {
        const quote = await yahooFinance.quote(tickerComSufixo, {
            modules: ['price', 'summaryDetail', 'assetProfile', 'quoteType']
        });

        const preco = quote.regularMarketPrice;
        const marketTime = quote.regularMarketTime;
        const maxDia = quote.regularMarketDayHigh || null;
        const minDia = quote.regularMarketDayLow || null;
        
        // --- LÓGICA DE CÁLCULO DA VARIAÇÃO DO DIA ---
        const openPrice = quote.regularMarketOpen; // Preço de abertura do dia
        let changePercent = null; // Inicia como nulo

        // Calcula a variação apenas se tivermos os dados necessários e válidos
        if (typeof preco === 'number' && typeof openPrice === 'number' && openPrice > 0) {
            changePercent = (preco - openPrice) / openPrice;
        } else {
            // Se não for possível calcular, usa o valor que a API fornece (baseado no fechamento anterior)
            changePercent = quote.regularMarketChangePercent;
        }
        // --- FIM DA LÓGICA DE CÁLCULO ---

        if (!preco || !marketTime) {
            return res.status(500).json({ erro: `Dados incompletos para o ticker ${rawTicker}.` });
        }

        const dataFormatada = new Date(marketTime).toLocaleString('pt-BR');

        res.json({
            ticker: rawTicker,
            valor: preco,
            data: dataFormatada,
            precoMaximo: maxDia,
            precoMinimo: minDia,
            // Envia a variação percentual calculada
            changePercent: (changePercent !== null && typeof changePercent === 'number') ? changePercent : "N/A",
            yahooSector: quote.assetProfile?.sector || null,
            yahooIndustry: quote.assetProfile?.industry || null,
            yahooAssetType: quote.quoteType?.quoteType || null
        });
    } catch (error) {
        console.error(`Erro ao buscar cotação para ${tickerComSufixo}:`, error.message);
        if (error.result?.error?.code === 'Not Found' || error.response?.status === 404) {
            return res.status(404).json({ erro: `Ticker '${rawTicker}' não encontrado ou dados indisponíveis.` });
        }
        res.status(500).json({ erro: 'Falha interna do servidor ao buscar cotação.' });
    }
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});