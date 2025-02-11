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

    
    const novaTarefa = await prisma.tarefa.create({
        data: {
            Descricao,
            completa: !!completa
        }
    })

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

    const tarefaExistente = await prisma.tarefa.findUnique({where: {id}})
    
    if (!tarefaExistente) {
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

    const tarefaAlterada = prisma.tarefa.update({
        data: {
            Descricao: Descricao ?? tarefaExistente.descricao,
            completa: completa ?? tarefaExistente.completa
        },
        where: {id}
    })

    return tarefaAlterada

}

// CRUD - Delete

export async function deleteWork(id) {

    const tarefaExistente = await prisma.tarefa.findUnique({where: {id}})
    
    if (!tarefaExistente) {
        throw new ErroDeOperacao("Tarefa não encontrada.")
    }

    const tarefaApagada = prisma.tarefa.delete({
        where: {id: tarefaExistente.id}
    })

    return tarefaApagada
}
