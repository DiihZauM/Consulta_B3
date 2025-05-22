// updateFIIs.js
import mongoose from 'mongoose';

// --- Configurações do Banco de Dados ---
const MONGODB_URI = 'mongodb://localhost:27017/carteira';

// --- Definição do Modelo (EXATAMENTE igual ao do server.js) ---
// É crucial que o Schema aqui seja idêntico ao do seu server.js
// para que o Mongoose saiba como interagir com a coleção.
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

// --- Lista de FIIs para atualizar ---
// Coloque aqui a lista exata dos tickers dos seus FIIs que já estão no banco de dados.
const fiisParaAtualizar = [
    'MCRE11',
    'CPTS11',
    'GGRC11',
    'BTCI11',
    'VGHF11',
    'VSHO11',
    'GARE11'
    
    
];

// --- Função para atualizar o banco de dados ---
async function updateFIIsInDatabase() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conectado ao MongoDB para atualização de FIIs!');

        let countUpdated = 0;
        let countSkipped = 0;

        for (const ticker of fiisParaAtualizar) {
            try {
                // Tenta encontrar e atualizar o ativo
                // Usa findOneAndUpdate com { new: true } para retornar o documento atualizado
                const result = await Carteira.findOneAndUpdate(
                    { ticker: ticker.toUpperCase() }, // Busca pelo ticker
                    { $set: { type: 'FII' } },         // Define o campo 'type' como 'FII'
                    { new: true }                      // Retorna o documento modificado
                );

                if (result) {
                    console.log(`FII ${ticker} atualizado para tipo: ${result.type}`);
                    countUpdated++;
                } else {
                    console.warn(`Aviso: FII ${ticker} não encontrado no banco de dados. Pulando.`);
                    countSkipped++;
                }
            } catch (error) {
                console.error(`Erro ao atualizar FII ${ticker}:`, error);
            }
        }
        console.log(`\nProcesso de atualização concluído.`);
        console.log(`Total de FIIs atualizados: ${countUpdated}`);
        console.log(`Total de FIIs não encontrados/pulados: ${countSkipped}`);

    } catch (err) {
        console.error('Erro fatal no processo de atualização:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Desconectado do MongoDB.');
        process.exit(0); // Garante que o script termine
    }
}

updateFIIsInDatabase();