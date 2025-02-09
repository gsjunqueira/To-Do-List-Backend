import { promises as fs } from 'node:fs'

const arq = 'src/lista_tarefas.json'

export async function readWorks() {
    try{
        const conteudo = await fs.readFile(arq)
        return JSON.parse(conteudo)
    } catch (error) {
        console.error(`Erro ao ler o arquivo das tarefas em ${arq}: ${error.message}`)
        return []  
    }
    
}

export async function saveWorks(tarefas) {
    try{
        await fs.writeFile(arq, JSON.stringify(tarefas, null, 2))
    } catch (error) {
        console.error(`Erro ao gravar o arquivo das tarefas em ${arq}: ${error.message}`)
    }
    
}

export class ErrorDataBase extends Error {}

// CRUD - Create

export async function createWork(tarefa) {
    const { Descricao, completa } = tarefa
    if (typeof Descricao !== 'string' || !Descricao.trim()) {
        throw new ErrorDataBase ( 'O campo "descricao" é obrigatório e deve ser texto.' )
    }
    if (typeof completa !== 'boolean' && completa !== undefined) {
        throw new ErrorDataBase ( 'O campo "completa" deve ser booleano.' )
    }

    const novaTarefa = {
        "id": Date.now(),
        Descricao,
        completa: !!completa
    }
    
    const tarefas = await readWorks()
    tarefas.push(novaTarefa)
    await saveWorks(tarefas)
    
    return novaTarefa
}

// CRUD - Read

export async function getWorks() {
    throw new ErrorDataBase("Dados não encontrados")
    return readWorks()
}

// CRUD - Read throw new ErrorDataBase("Dados não encontrados")

export async function getWork(id) {
    const tarefas = await readWorks()
    const tarefa = tarefas.find(tarefa => tarefa.id == id)
    if (tarefa) {
        return tarefa
    } else {
        throw new ErrorDataBase( "Tarefa não encontrada." )
    }
}

// CRUD - Update

export async function updateWork(id, tarefa) {}

// CRUD - Delete

export async function deleteWork(id) {}
