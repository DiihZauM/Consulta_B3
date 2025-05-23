import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import yahooFinance from 'yahoo-finance2';
import fetch from 'node-fetch'; // Adicionado para chamadas à API FMP

// #########################################################################
// # COLOQUE SUA CHAVE DA API DA FINANCIALMODELINGPREP (FMP) AQUI          #
// # Você pode obter uma em https://financialmodelingprep.com/developer/docs/ #
const FMP_API_KEY = 'dl3Iso9CckN5df4l1w1ebWG1VLNBSNo0';
// #########################################################################

const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

// Redireciona a rota raiz '/' para 'carteira.html'
app.get('/', (req, res) => {
    res.redirect('/carteira.html');
});

// Conexão com o MongoDB
mongoose.connect('mongodb://localhost:27017/carteira', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado ao MongoDB!'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Schema e Modelo da Carteira
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

// --- ROTAS DA API PARA CARTEIRA ---
app.get('/api/carteira', async (req, res) => {
    try {
        const ativos = await Carteira.find({}, '-_id ticker quantidade precoMedio type');
        res.json(ativos);
    } catch (err) {
        console.error('Erro ao buscar carteira:', err);
        res.status(500).json({ erro: 'Erro interno do servidor ao buscar carteira.' });
    }
});

app.post('/api/carteira', async (req, res) => {
    const { ticker, quantidade, precoMedio, type } = req.body;
    if (!ticker || quantidade == null || precoMedio == null || !type) {
        return res.status(400).json({ erro: 'Ticker, quantidade, preço médio e tipo são obrigatórios.' });
    }
    if (isNaN(parseFloat(quantidade)) || parseFloat(quantidade) <= 0 || 
        isNaN(parseFloat(precoMedio)) || parseFloat(precoMedio) <= 0) {
        return res.status(400).json({ erro: 'Quantidade e preço médio devem ser números positivos.' });
    }
    const allowedTypes = CarteiraSchema.path('type').enumValues;
    if (!allowedTypes.includes(type.toUpperCase())) {
        return res.status(400).json({ erro: `Tipo de ativo inválido. Permitidos: ${allowedTypes.join(', ')}` });
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
            return res.status(409).json({ erro: `Ativo com ticker '${ticker.toUpperCase()}' já existe na carteira.` });
        }
        console.error('Erro ao adicionar ativo:', err);
        res.status(500).json({ erro: 'Erro interno do servidor ao adicionar ativo.' });
    }
});

app.put('/api/carteira/:ticker', async (req, res) => {
    const tickerParams = req.params.ticker.toUpperCase();
    const { quantidade, precoMedio } = req.body;
    if (quantidade == null || precoMedio == null) {
        return res.status(400).json({ erro: 'Quantidade e preço médio são obrigatórios.' });
    }
    if (isNaN(parseFloat(quantidade)) || parseFloat(quantidade) < 0 || 
        isNaN(parseFloat(precoMedio)) || parseFloat(precoMedio) < 0) {
        return res.status(400).json({ erro: 'Quantidade e preço médio devem ser números não negativos.' });
    }
    try {
        const ativo = await Carteira.findOneAndUpdate(
            { ticker: tickerParams },
            { quantidade: parseFloat(quantidade), precoMedio: parseFloat(precoMedio) },
            { new: true }
        );
        if (!ativo) {
            return res.status(404).json({ erro: `Ativo com ticker '${tickerParams}' não encontrado.` });
        }
        res.json({ sucesso: true, mensagem: 'Ativo atualizado com sucesso!', ativo });
    } catch (err) {
        console.error(`Erro ao atualizar ativo ${tickerParams}:`, err);
        res.status(500).json({ erro: 'Erro interno do servidor ao atualizar ativo.' });
    }
});

app.delete('/api/carteira/:ticker', async (req, res) => {
    const tickerParams = req.params.ticker.toUpperCase();
    try {
        const del = await Carteira.findOneAndDelete({ ticker: tickerParams });
        if (del) {
            res.json({ sucesso: true, mensagem: `Ativo '${tickerParams}' removido com sucesso.` });
        } else {
            res.status(404).json({ erro: `Ativo com ticker '${tickerParams}' não encontrado.` });
        }
    } catch (err) {
        console.error(`Erro ao remover ativo ${tickerParams}:`, err);
        res.status(500).json({ erro: 'Erro interno do servidor ao remover ativo.' });
    }
});

// --- ROTA PARA COTAÇÕES (Yahoo Finance) ---
app.get('/cotacao/:ticker', async (req, res) => {
    const rawTicker = req.params.ticker.toUpperCase();
    const tickerComSufixo = `${rawTicker}.SA`;
    try {
        const quote = await yahooFinance.quote(tickerComSufixo, {
            modules: ['price', 'summaryDetail', 'assetProfile', 'quoteType']
        });
        const preco = quote?.regularMarketPrice || quote?.price?.regularMarketPrice;
        let marketTime = quote?.regularMarketTime || quote?.price?.regularMarketTime;
        const openPrice = quote?.regularMarketOpen || quote?.price?.regularMarketOpen;
        const marketChangePercent = quote?.regularMarketChangePercent || quote?.price?.regularMarketChangePercent;
        let changePercentCalculated = null;
        if (typeof preco === 'number' && typeof openPrice === 'number' && openPrice > 0) {
            changePercentCalculated = (preco - openPrice) / openPrice;
        } else if (typeof marketChangePercent === 'number') {
            changePercentCalculated = marketChangePercent;
        }
        if (preco == null || marketTime == null) {
            console.warn(`Dados incompletos para cotação de ${tickerComSufixo}: Preço=${preco}, MarketTime=${marketTime}. API Response (truncated):`, JSON.stringify(quote, null, 2).substring(0, 500) + "...");
            return res.status(404).json({ erro: `Dados de cotação (preço/horário) incompletos para ${rawTicker}.` });
        }
        const dataHora = marketTime instanceof Date ? marketTime : new Date(marketTime * 1000);
        res.json({
            ticker: rawTicker, valor: preco, data: dataHora.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
            precoMaximo: quote?.summaryDetail?.dayHigh || quote?.dayHigh,
            precoMinimo: quote?.summaryDetail?.dayLow || quote?.dayLow,
            changePercent: (changePercentCalculated !== null && !isNaN(changePercentCalculated)) ? changePercentCalculated : null,
            yahooSector: quote?.assetProfile?.sector, yahooIndustry: quote?.assetProfile?.industry, yahooAssetType: quote?.quoteType?.quoteType
        });
    } catch (error) {
        console.error(`Erro CRÍTICO ao buscar cotação para ${tickerComSufixo}:`, error.message);
        if (error.name === 'NoDataError' || error.message.includes('Not Found') || error.message.includes('404') || error.code === ' órgão' || (error.result && error.result.error && error.result.error.code === 'Not Found')) {
             return res.status(404).json({ erro: `Ticker '${rawTicker}' não encontrado ou sem dados na API.` });
        }
        res.status(500).json({ erro: `Falha interna ao buscar cotação para ${rawTicker}.` });
    }
});

// --- ROTA PARA DIVIDENDOS HISTÓRICOS (INDIVIDUAL - Yahoo Finance) ---
app.get('/api/dividends/:ticker', async (req, res) => {
    const rawTicker = req.params.ticker.toUpperCase();
    const tickerComSufixo = `${rawTicker}.SA`;
    const hoje = new Date();
    const cincoAnosAtras = new Date(); cincoAnosAtras.setFullYear(hoje.getFullYear() - 5);
    const queryOptions = {
        period1: cincoAnosAtras.toISOString().split('T')[0], period2: hoje.toISOString().split('T')[0],
        events: 'dividends', interval: '1d'
    };
    try {
        const historicalData = await yahooFinance.historical(tickerComSufixo, queryOptions);
        const dividendos = historicalData
            .filter(item => typeof item.dividends === 'number' && !isNaN(item.dividends))
            .map(item => ({ date: item.date.toISOString().split('T')[0], amount: item.dividends }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(dividendos);
    } catch (error) {
        console.error(`Erro ao buscar dividendos para ${tickerComSufixo}:`, error.message);
        if (error.name === 'NoDataError' || error.message.includes('No results') || error.message.includes('Not Found') || (error.result && error.result.error)) {
            return res.json([]);
        }
        res.status(500).json({ erro: `Falha ao buscar dividendos para ${rawTicker}.` });
    }
});

// --- ROTA ATUALIZADA: Buscar DIVIDENDOS ANUNCIADOS para 2025 para toda a carteira (USANDO FMP) ---
app.get('/api/dividendos-projetados-carteira', async (req, res) => {
    console.log("Recebida requisição para /api/dividendos-projetados-carteira (Lógica com FMP V55)");
    if (FMP_API_KEY === 'SUA_CHAVE_API_FMP_AQUI' || !FMP_API_KEY) {
        console.error("API Key da FMP não configurada no server.js");
        return res.status(500).json({ erro: "Chave da API da FMP não configurada no servidor. Por favor, adicione sua chave no arquivo server.js." });
    }

    try {
        const ativosCarteira = await Carteira.find({}, 'ticker quantidade');
        if (!ativosCarteira || ativosCarteira.length === 0) {
            return res.json({ 
                mensagem: "Nenhum ativo na carteira.",
                Janeiro: 0, Fevereiro: 0, Marco: 0, Abril: 0, Maio: 0, Junho: 0,
                Julho: 0, Agosto: 0, Setembro: 0, Outubro: 0, Novembro: 0, Dezembro: 0,
                TotalAnual: 0
            });
        }

        const meses2025 = {
            Janeiro: 0, Fevereiro: 0, Marco: 0, Abril: 0, Maio: 0, Junho: 0,
            Julho: 0, Agosto: 0, Setembro: 0, Outubro: 0, Novembro: 0, Dezembro: 0
        };
        let totalAnualCalculado = 0;
        const nomesMeses = Object.keys(meses2025);
        const anoAlvo = 2025;

        const fmpApiUrl = `https://financialmodelingprep.com/api/v3/stock_dividend_calendar?from=${anoAlvo}-01-01&to=${anoAlvo}-12-31&apikey=${FMP_API_KEY}`;
        console.log(`Buscando calendário de dividendos da FMP: ${fmpApiUrl.replace(FMP_API_KEY, "SUA_CHAVE_API")}`); // Log sem expor a chave
        
        const fmpResponse = await fetch(fmpApiUrl);
        if (!fmpResponse.ok) {
            const errorTextFMP = await fmpResponse.text();
            console.error("Erro ao buscar calendário de dividendos da FMP:", fmpResponse.status, errorTextFMP);
            throw new Error(`FMP API Error: ${fmpResponse.status}. Verifique sua chave de API e limites de uso.`);
        }
        const fmpDividendCalendar = await fmpResponse.json();
        
        if (!Array.isArray(fmpDividendCalendar)) {
            console.error("Resposta do calendário de dividendos da FMP não é um array:", fmpDividendCalendar);
            throw new Error("Formato inesperado da resposta da API FMP (calendário de dividendos).");
        }
        console.log(`Recebidos ${fmpDividendCalendar.length} eventos de dividendo da FMP para 2025.`);

        for (const ativo of ativosCarteira) {
            if (!ativo.ticker || ativo.quantidade <= 0) continue;
            
            const tickerFMP = ativo.ticker.toUpperCase(); // FMP geralmente usa o ticker sem .SA

            const dividendosDoAtivo = fmpDividendCalendar.filter(divEvent => 
                divEvent.symbol === tickerFMP &&
                divEvent.paymentDate && // Garante que a data de pagamento exista
                typeof parseFloat(divEvent.dividend) === 'number' && !isNaN(parseFloat(divEvent.dividend)) // Garante que o valor do dividendo é um número
            );

            if (dividendosDoAtivo.length > 0) {
                // console.log(`Processando ${dividendosDoAtivo.length} dividendos anunciados da FMP para ${tickerFMP}`);
                dividendosDoAtivo.forEach(divEvent => {
                    const paymentDate = new Date(divEvent.paymentDate); // FMP "paymentDate" é "YYYY-MM-DD"
                    const dividendAmount = parseFloat(divEvent.dividend);

                    if (dividendAmount > 0 && paymentDate.getFullYear() === anoAlvo) {
                        const mesIndex = paymentDate.getMonth(); // 0 = Janeiro
                        const valorDividendoTotalAtivo = dividendAmount * ativo.quantidade;
                        
                        meses2025[nomesMeses[mesIndex]] += valorDividendoTotalAtivo;
                        totalAnualCalculado += valorDividendoTotalAtivo;
                        // console.log(`  FMP ${tickerFMP}: Add ${valorDividendoTotalAtivo.toFixed(2)} a ${nomesMeses[mesIndex]} (Pag: ${divEvent.paymentDate}, Valor por ação: ${dividendAmount})`);
                    }
                });
            }
        }

        for (const mes in meses2025) {
            meses2025[mes] = parseFloat(meses2025[mes].toFixed(2));
        }
        totalAnualCalculado = parseFloat(totalAnualCalculado.toFixed(2));
        
        console.log("Projeção final de dividendos ANUNCIADOS (FMP) para 2025:", { ...meses2025, TotalAnual: totalAnualCalculado });
        res.json({ ...meses2025, TotalAnual: totalAnualCalculado });

    } catch (error) {
        console.error('Erro CRÍTICO ao buscar projeção de dividendos (FMP) da carteira:', error);
        res.status(500).json({ erro: `Falha ao calcular projeção de dividendos (FMP). ${error.message}` });
    }
});


// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log('Rotas da API disponíveis:');
    console.log(`  GET  / (redireciona para /carteira.html)`);
    console.log(`  GET  /api/carteira`);
    console.log(`  POST /api/carteira`);
    console.log(`  PUT  /api/carteira/:ticker`);
    console.log(`  DELETE /api/carteira/:ticker`);
    console.log(`  GET  /cotacao/:ticker`);
    console.log(`  GET  /api/dividends/:ticker  (usa Yahoo Finance)`);
    console.log(`  GET  /api/dividendos-projetados-carteira (usa FMP)`);
});