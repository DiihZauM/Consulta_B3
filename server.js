import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import yahooFinance from 'yahoo-finance2'; // Certifique-se de que está instalado: npm install yahoo-finance2

const app = express();
const port = 3000;

// Middleware para habilitar CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Middleware para analisar requisições JSON
app.use(express.json());

// Servir arquivos estáticos do diretório 'frontend'
app.use(express.static('frontend'));

// Conectar ao MongoDB
// Certifique-se de que o MongoDB esteja rodando (ex: docker run -p 27017:27017 --name mongo_carteira -d mongo)
mongoose.connect('mongodb://localhost:27017/carteira', {
    useNewUrlParser: true,      // Opção para usar o novo parser de URL
    useUnifiedTopology: true,   // Opção para usar o novo motor de descoberta e monitoramento de servidor
})
.then(() => console.log('Conectado ao MongoDB!'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Definição do Schema para a coleção 'Carteira'
const CarteiraSchema = new mongoose.Schema({
    ticker: { type: String, required: true, unique: true, uppercase: true },
    quantidade: { type: Number, required: true, default: 0, min: 0 },
    precoMedio: { type: Number, required: true, default: 0, min: 0 },
    // NOVO CAMPO: Tipo do ativo, com enum para garantir consistência
    type: {
        type: String,
        required: true, // Torna o campo obrigatório ao adicionar
        enum: ['AÇÃO', 'FII', 'ETF', 'BDR', 'CRIPTO', 'OUTRO'], // Tipos permitidos
        default: 'AÇÃO' // Valor padrão se não for fornecido (embora requerido no frontend)
    }
});

// Criação do Modelo 'Carteira' a partir do Schema
const Carteira = mongoose.model('Carteira', CarteiraSchema);

// --- ROTAS DA API ---

// Rota 1: Buscar todos os ativos da carteira
// Agora também retorna o campo 'type'
app.get('/api/carteira', async (req, res) => {
    try {
        const ativos = await Carteira.find({}, '-_id ticker quantidade precoMedio type'); // Incluído 'type'
        res.json(ativos);
    } catch (err) {
        console.error('Erro ao buscar carteira:', err);
        res.status(500).json({ erro: 'Erro interno do servidor ao buscar carteira.' });
    }
});

// Rota 2: Adicionar um novo ativo à carteira
// Agora aceita e salva o campo 'type'
app.post('/api/carteira', async (req, res) => {
    const { ticker, quantidade, precoMedio, type } = req.body; // 'type' adicionado aqui

    // Log para depuração
    console.log('Dados recebidos no POST /api/carteira:', req.body);

    // Validação básica dos dados recebidos
    if (!ticker || quantidade == null || precoMedio == null || !type) {
        return res.status(400).json({ erro: 'Ticker, quantidade, preço médio e tipo são obrigatórios.' });
    }
    if (isNaN(quantidade) || quantidade <= 0 || isNaN(precoMedio) || precoMedio <= 0) {
        return res.status(400).json({ erro: 'Quantidade e preço médio devem ser números positivos.' });
    }
    // Validação para o campo 'type' com base no enum do Schema
    const allowedTypes = CarteiraSchema.path('type').enumValues;
    if (!allowedTypes.includes(type.toUpperCase())) {
        return res.status(400).json({ erro: `Tipo de ativo inválido. Tipos permitidos: ${allowedTypes.join(', ')}.` });
    }

    try {
        const novoAtivo = new Carteira({
            ticker: ticker.toUpperCase(),
            quantidade: parseFloat(quantidade),
            precoMedio: parseFloat(precoMedio),
            type: type.toUpperCase() // Salva o tipo em maiúsculas
        });
        await novoAtivo.save();
        res.status(201).json({ sucesso: true, mensagem: 'Ativo adicionado com sucesso!' }); // 201 Created
    } catch (err) {
        // Erro de duplicidade (código 11000 do MongoDB)
        if (err.code === 11000) {
            return res.status(409).json({ erro: `Ativo com ticker '${ticker.toUpperCase()}' já existe na carteira.` }); // 409 Conflict
        }
        console.error('Erro ao adicionar ativo:', err);
        res.status(500).json({ erro: 'Erro interno do servidor ao adicionar ativo.' });
    }
});

// Rota 3: Atualizar um ativo existente na carteira
// Permite atualizar quantidade e precoMedio
app.put('/api/carteira/:ticker', async (req, res) => {
    const ticker = req.params.ticker.toUpperCase();
    const { quantidade, precoMedio } = req.body;

    // Validação básica
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
            { new: true } // Retorna o documento atualizado
        );
        if (!ativo) {
            return res.status(404).json({ erro: `Ativo com ticker '${ticker}' não encontrado.` });
        }
        res.json({ sucesso: true, mensagem: 'Ativo atualizado com sucesso!', ativo });
    } catch (err) {
        console.error('Erro ao atualizar ativo:', err);
        res.status(500).json({ erro: 'Erro interno do servidor ao atualizar ativo.' });
    }
});

// Rota 4: Remover um ativo da carteira
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
        console.error('Erro ao remover ativo:', err);
        res.status(500).json({ erro: 'Erro interno do servidor ao remover ativo.' });
    }
});

// Rota 5: Buscar cotação e informações adicionais de um ticker usando yahoo-finance2
app.get('/cotacao/:ticker', async (req, res) => {
    const rawTicker = req.params.ticker.toUpperCase();
    // Adiciona o sufixo '.SA' para ações da bolsa brasileira.
    // Adapte esta lógica se você for buscar outros tipos de ativos ou ações de outras bolsas.
    const tickerComSufixo = `${rawTicker}.SA`; 

    try {
        // Query com módulos para pegar informações de preço, detalhes, perfil e tipo de cotação
        const quote = await yahooFinance.quote(tickerComSufixo, {
            modules: ['price', 'summaryDetail', 'assetProfile', 'quoteType']
        });

        // Extrai os dados da cotação
        const preco = quote.regularMarketPrice;
        const marketTime = quote.regularMarketTime;
        const maxDia = quote.regularMarketDayHigh || quote.summaryDetail?.dayHigh || quote.price?.dayHigh || null;
        const minDia = quote.regularMarketDayLow || quote.summaryDetail?.dayLow || quote.price?.dayLow || null;

        // Extrai informações adicionais (setor, indústria, tipo de cotação do Yahoo)
        const sector = quote.assetProfile?.sector || quote.sector || null;
        const industry = quote.assetProfile?.industry || quote.industry || null;
        const yahooAssetType = quote.quoteType?.quoteType || null; // Tipo do Yahoo, diferente do nosso DB 'type'

        // Validação se os dados essenciais foram encontrados
        if (!preco || !marketTime) {
            console.warn(`Dados de preço ou tempo de mercado incompletos para ${tickerComSufixo}:`, quote);
            return res.status(500).json({ erro: `Dados incompletos para o ticker ${rawTicker}.` });
        }

        // Formata a data e hora para exibição
        const dataFormatada = new Date(marketTime).toLocaleString('pt-BR');

        // Retorna todos os dados relevantes
        res.json({
            ticker: rawTicker,
            valor: preco,
            data: dataFormatada,
            precoMaximo: maxDia !== null ? maxDia : "N/A",
            precoMinimo: minDia !== null ? minDia : "N/A",
            // Informações adicionais do Yahoo Finance (podem ser usadas para referência)
            yahooSector: sector,
            yahooIndustry: industry,
            yahooAssetType: yahooAssetType 
        });
    } catch (error) {
        console.error(`Erro ao buscar cotação para ${tickerComSufixo}:`, error);
        
        // Trata erros comuns da API do Yahoo Finance
        if (error.result?.error?.code === 'Not Found' || (error.name === 'HTTPError' && error.response?.status === 404)) {
            return res.status(404).json({ erro: `Ticker '${rawTicker}' não encontrado ou dados indisponíveis na Yahoo Finance.` });
        }
        res.status(500).json({ erro: 'Falha interna do servidor ao buscar cotação.' });
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});