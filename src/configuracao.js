import { promises as fs } from 'node:fs'

const arq = 'src/env.json'

async function readConfig(nome) {
    try{
        const conteudo = await fs.readFile(arq)
        const  configuracao = JSON.parse(conteudo)
        return configuracao[nome]
    } catch (error) {
        console.error(`Erro ao ler o arquivo de configuraçao em ${arq}: ${error.message}`)
        return []  
    }
    
}

export default {
    corsOrigin: await readConfig('corsOrigin'),
    sessionSecret: await readConfig('sessionSecret'),
    clientID: await readConfig('clientID'),
    clientSecret: await readConfig('clientSecret'),
    callbackURL: await readConfig('callbackURL'),
    authRedirect: await readConfig('authRedirect')
}
