import express from 'express';
import cidadeController from './domains/cidades/cidade_controller';
import usuarioController from './domains/usuarios/usuario_controller';

/**
 * Inicialização do Express e configuração do middleware para aceitar JSON.
 */
const app = express();
app.use(express.json());

app.use('/cidades', cidadeController); // Adiciona as rotas de cidades ao aplicativo
app.use('/usuarios', usuarioController); // Adiciona as rotas de usuários ao aplicativo

// ===================================================================================
// INICIALIZAÇÃO DO SERVIDOR
// ===================================================================================
const PORTA = 3000;
app.listen(PORTA, () => {
	console.log(`Servidor de exemplo rodando na porta http://localhost:${PORTA}`);
});