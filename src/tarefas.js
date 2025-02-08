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

// CRUD - Create

export async function createWork(tarefa) {}

// CRUD - Read

export async function getWorks() {
    return readWorks()
}

// CRUD - Read

export async function getWork(id) {
    const tarefas = await readWorks()
    const tarefa = tarefas.find(tarefa => tarefa.id == id)
    if (tarefa) {
        return tarefa
    } else {
        throw new Error( "Tarefa não encontrada." )
    }
}

// CRUD - Update

export async function updateWork(id, tarefa) {}

// CRUD - Delete

export async function deleteWork(id) {}
