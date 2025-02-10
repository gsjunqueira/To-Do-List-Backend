import { PrismaClient } from '@prisma/client'
import { ErroDeValidacao, ErroDeOperacao } from './tarefas-bd-erros.js'

const prisma = new PrismaClient

// CRUD - Create

export async function createWork(tarefa) {
    const { Descricao, completa } = tarefa
    if (typeof Descricao !== 'string' || !Descricao.trim()) {
        throw new ErroDeValidacao ( 'O campo "descricao" é obrigatório e deve ser texto.' )
    }
    if (typeof completa !== 'boolean' && completa !== undefined) {
        throw new ErroDeValidacao ( 'O campo "completa" deve ser booleano.' )
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
    return await prisma.tarefa.findMany()
}

// CRUD - Read throw new ErrorDataBase("Dados não encontrados")

export async function getWork(id) {
    const tarefa = await prisma.tarefa.findUnique({where: {id}})

    if (tarefa) {
        return tarefa
    } else {
        throw new ErroDeOperacao( "Tarefa não encontrada." )
    }
}

// CRUD - Update

export async function updateWork(id, tarefa) {

    const { Descricao, completa } = tarefa

    const tarefas = await readWorks()
    const index = tarefas.findIndex(tarefa => tarefa.id === id)
    if (index < 0) {
        throw new ErroDeOperacao("A tarefa não encontrada.")
    }

    if ((typeof Descricao !== 'string' && Descricao !== undefined) || Descricao?.trim() === "") {
        throw new ErroDeValidacao('O campo "descricao" é obrigatório e deve ser texto.')
    }

    // if (typeof Descricao !== 'string' || Descricao !== undefined) {
    //     throw new ErroDeValidacao('O campo "descricao" é obrigatório e deve ser texto.')
    // }

    if (typeof completa !== 'boolean' && completa !== undefined) {
        throw new ErroDeValidacao('O campo "completa" deve ser booleano.')
    }
    if (Descricao !== undefined) {
        tarefas[index].Descricao = Descricao
    }
    if (completa !== undefined) {
        tarefas[index].completa = completa
    }

    await saveWorks(tarefas)

    return JSON.parse(JSON.stringify(tarefas[index]))

}

// CRUD - Delete

export async function deleteWork(id) {

    const tarefas = await readWorks()
    const index = tarefas.findIndex(tarefa => tarefa.id === id)
    if (index < 0) {
        throw new ErroDeOperacao("A tarefa não existe." )
    }


    const tarefaApagada = tarefas.splice(index, 1)[0]
    await saveWorks(tarefas)

    return tarefaApagada
}
