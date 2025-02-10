import express from 'express'
import cors from 'cors'
import {readWorks, saveWorks} from './tarefas.js'
import * as bancoDeDados from './tarefas.js'
import passport from 'passport'
import {Strategy as GitHubStrategy} from 'passport-github2'
import session from 'express-session'
import configuracao from './configuracao.js'

const app = express()

app.use(cors({origin: configuracao.corsOrigin, credentials: true}))
app.use(express.json())

app.use(session({
  secret: configuracao.sessionSecret, 
  resave: false,
  saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use(new GitHubStrategy({
  clientID: configuracao.clientID,
  clientSecret: configuracao.clientSecret,
  callbackURL: configuracao.callbackURL
  },
  function(accessToken, refreshToken, profile, done) { 
    return done(null, profile)
    } 
))

app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }))

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect(configuracao.authRedirect)
  })

passport.serializeUser((user, done) => {
  done(null, {usuario: user.displayName})
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

async function validAuth(req, res, next) {
  if(req.isAuthenticated()) {
    next()
  } else {
    res.status(401).json({ erro: "Necessário autenticar pelo GitHub." })
  } 
}
app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (!err) {
      res.redirect('/')
    } else {
      next(err)
    }
  })
})

app.get('/', (req, res) => res.send(`Ola Tarefas!`))

app.get('/tarefas', validAuth, async (req, res) => {
  try {
    const tarefas = await bancoDeDados.getWorks()
    return res.json(tarefas)

  } catch {
      if (error instanceof bancoDeDados.ErrorDataBase) { 
        return res.status(404).json({ erro: error.message})
      }
      res.status(500).json({ erro: "Não foi possível obter as tarefas" })
  }
})
app.get('/tarefa/:id', validAuth, async (req, res) => {
  try {
    const tarefas = await bancoDeDados.getWork(req.params.id)
    const tarefa = tarefas.find(tarefa => tarefa.id == req.params.id)
    return res.json(tarefa)
  } catch {
    if (error instanceof bancoDeDados.ErrorDataBase) { 
      return res.status(404).json({ erro: error.message})
    }
    res.status(500).json({ erro: "Não foi possível obter a tarefa" })
  }
})

app.post('/tarefa', validAuth, async (req, res) => {
  try {
    const novatarefa = await bancoDeDados.createWork(req.body)
    
    res.status(201).json(novaTarefa)
  } catch {
    if (error instanceof bancoDeDados.ErrorDataBase) { 
      return res.status(400).json({ erro: error.message})
    }
    res.status(500).json({ erro: "Não foi possível obter a tarefa" })
  }

})

app.put('/tarefa/:id', validAuth, async (req, res) => {
  try {
    const tarefaAtualizada = await bancoDeDados.updateWork(req.params.id, req.body)
    res.json(tarefaAtualizada)
  } catch {
      if (error instanceof bancoDeDados.ErrorDataBase) { 
        const httpCode = error instanceof bancoDeDados.ErroDeValidacao ? 4040: 404
        return res.status(httpCode).json({ erro: error.message})
      }
      return res.status(500).json({ erro: "Não foi possível atualizar a tarefa" })
  }
})

app.delete('/tarefa/:id', validAuth, async (req, res) => {
  try {
    const tarefas = await readWorks()
    const index = tarefas.findIndex(tarefa => tarefa.id == req.params.id)
    if (index < 0) {
      return res.status(404).json({ erro: "A tarefa não existe." })
    }


    tarefas.splice(index, 1)
    await saveWorks(tarefas)

    return res.status(204).send()
  } catch {

      return res.status(500).json({ erro: "Não foi possível apagar a tarefa" })
  }
})

app.patch('/tarefa/:id/completa', validAuth, async (req, res) => {
  try {
    const { Descricao, completa } = req.body

    const tarefas = await readWorks()
    const index = tarefas.findIndex(tarefa => tarefa.id == req.params.id)
    if (index < 0) {
      return res.status(404).json({ erro: "A tarefa não existe." })
    }

    tarefas[index].completa = true
  
    await saveWorks(tarefas)

    return res.json(tarefas[index])
  } catch {
      return res.status(500).json({ erro: "Não foi possível completar a tarefa" })
  }
})

app.patch('/tarefa/:id/incompleta', validAuth, async (req, res) => {
  try {
    const { Descricao, completa } = req.body

    const tarefas = await readWorks()
    const index = tarefas.findIndex(tarefa => tarefa.id == req.params.id)
    if (index < 0) {
      return res.status(404).json({ erro: "A tarefa não existe." })
    }

    tarefas[index].completa = false
  
    await saveWorks(tarefas)

    return res.json(tarefas[index])
  } catch {
      return res.status(500).json({ erro: "Não foi possível tornar a tarefa incompleta" })
  }
})

function iniciar(port) {
  app.listen(port, () => {
    console.log(`Executando aplicação em http://localhost:${port}/`)
  })
}

export default {
  iniciar, 
  express: app
}
