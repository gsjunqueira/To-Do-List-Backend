import * as erros from './tarefas-bd-erros.js'
import * as bancoDeDados from './tarefas-bd-prisma.js'

export const ErrorDataBase = erros.ErrorDataBase
export const ErroDeValidacao = erros.ErroDeValidacao
export const ErroDeOperacao = erros.ErroDeOperacao

export const createWork = bancoDeDados.createWork
export const getWorks = bancoDeDados.getWorks
export const geteWork = bancoDeDados.getWork
export const updateWork = bancoDeDados.updateWork
export const deleteWork = bancoDeDados.deleteWork
