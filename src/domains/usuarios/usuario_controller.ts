import express, { Request, Response, Router } from 'express';
import { lista2, lista1 } from '../../constats';
import { ParsedQs } from 'qs';
import { ModeloUsuario } from '../../models/models';

const router: Router = express.Router();


// Contadores globais para gerar novos IDs.

let contador_usuario = lista2.length;

const searchUser: any = (req: Request, res: Response) => {
	// Lógica para LER todos os usuários ou buscar por documento
	const query: ParsedQs = req.query;

	if (query.doc || query.id) {
		// Procurar um usuário por documento
		let encontrado = null;
		for (const user of lista2) { // Loop ineficiente para encontrar o usuário, mas é só um exemplo.
			if (user.doc === query.doc) {
				encontrado = user;
				break;
			}
			else if (user.id === parseInt(query.id as string, 10)) {
				encontrado = user;
				break;
			}
		}
		if (encontrado) {
			res.status(200).json(encontrado);
		} else {
			res.status(404).send({ erro: 'Usuário não encontrado.' });
		}
	} else if (query === null) {
		res.status(404).send({ erro: 'Lista de Usuários Vazia.' });

	} else {
		// Retornar todos os usuários
		res.status(200).json(lista2);
	}

}

const createUser: any = (req: Request, res: Response) => {
	// Lógica para CRIAR um usuário
	const { nome_completo, doc, end } = req.body;

	// Validação de campos obrigatórios
	if (!nome_completo || !doc || !end || !end.rua || !end.num || !end.cidade_id) {
		return res.status(400).send({ erro: 'Dados incompletos para o usuário.' });
	}

	// Validação de documento - verifica se já existe
	let docExiste = false;
	for (let i = 0; i < lista2.length; i++) {
		if (lista2[i].doc === doc) {
			docExiste = true;
			break;
		}
	}
	if (docExiste) {
		return res.status(409).send({ erro: 'Documento já cadastrado.' });
	}

	// Verifica se a cidade informada existe na nossa lista de cidades
	let cidadeValida = false;
	for (let i = 0; i < lista1.length; i++) {
		if (lista1[i].id === end.cidade_id) {
			cidadeValida = true;
			break;
		}
	}
	if (!cidadeValida) {
		return res.status(400).send({ erro: 'A cidade informada não existe.' });
	}

	contador_usuario += 1; // Incrementa o contador global
	const novoUsuario = {
		id: contador_usuario,
		nome_completo,
		doc,
		end,
	};
	lista2.push(novoUsuario);
	res.status(201).json(novoUsuario);

}

const findUserIndexById = (id: number): number => { return lista2.findIndex((u) => u.id === id); };

const updateUser: any = (req: Request, res: Response) => {
	// Lógica para ATUALIZAR um usuário
	const id = Number(req.params.id);
	const index = findUserIndexById(id);

	if (index === -1) {
		return res.status(404).send({ erro: 'Usuário não encontrado.' });
	}

/*	lista2[index] = {
		...lista2[index],
		nome_completo,
		end,
	};
*/
	return res.status(200).json(lista2[index]);


}
/**
 * Função para lidar com um item específico (usuário).
 * Outra função com múltiplas responsabilidades: GET, PUT e DELETE.
 */
const manipulateSpecificItem = (req: Request, res: Response) => {
	const id = parseInt(req.params.id, 10);



	// Encontrar o índice do usuário na lista para poder manipular (atualizar/deletar)
	let indice = -1;
	for (let i = 0; i < lista2.length; i++) {
		if (lista2[i].id === id) {
			indice = i;
			break;
		}
	}

	if (indice === -1) {
		return res.status(404).send({ erro: 'Usuário não encontrado.' });
	}

	if (req.method === 'PUT') {
		// Atualizar o usuário
		const { nome_completo, end } = req.body;
		if (!nome_completo || !end) {
			return res.status(400).send({ erro: 'Dados incompletos para atualização.' });
		}
		// Não permitimos mudar o documento (regra de negócio escondida aqui)
		lista2[indice].nome_completo = nome_completo;
		lista2[indice].end = end;
		return res.json(lista2[indice]);
	} else if (req.method === 'DELETE') {
		// Deletar o usuário
		lista2.splice(indice, 1);
		return res.status(204).send(); // Sem conteúdo
	}
};

// Agrupando as rotas de usuário em um único handler.
// O método .route do Express é usado aqui.
router.route('/')
	.post(createUser)
	.get(searchUser);

// Rotas para manipular um usuário específico por ID.
router.route('/id/:id')
	.get(searchUser)
	.put(manipulateSpecificItem)
	.delete(manipulateSpecificItem);

router.route('/doc/:doc')
	.get(searchUser)
	.put(manipulateSpecificItem)
	.delete(manipulateSpecificItem);

export default router;