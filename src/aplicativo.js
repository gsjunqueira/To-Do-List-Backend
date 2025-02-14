import express from 'express'
import cors from 'cors'
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

app.get('/', (req, res) => res.send(`Hello tasks!`))

app.get('/tarefas', validAuth, async (req, res) => {
  try {
    const tarefas = await bancoDeDados.getWorks()
    return res.json(tarefas)

  } catch (error) {
      console.error(error)
      if (error instanceof bancoDeDados.ErrorDataBase) { 
        res.status(404).json({ erro: error.message})
      }
      res.status(500).json({ erro: "Não foi possível obter as tarefas" })
  }
})
app.get('/tarefa/:id', validAuth, async (req, res) => {
  try {
    const tarefas = await bancoDeDados.getWork(req.params.id)
    const tarefa = tarefas.find(tarefa => tarefa.id == req.params.id)
    return res.json(tarefa)
  } catch (error) {
      console.error(error)
      if (error instanceof bancoDeDados.ErrorDataBase) { 
        res.status(404).json({ erro: error.message})
      }
      res.status(500).json({ erro: "Não foi possível obter a tarefa" })
  }
})

app.post('/tarefa', validAuth, async (req, res) => {
  try {
    const novatarefa = await bancoDeDados.createWork(req.body)
    
    res.status(201).json(novaTarefa)
  } catch (error) {
      console.error(error)
      if (error instanceof bancoDeDados.ErrorDataBase) { 
        res.status(400).json({ erro: error.message})
      }
      res.status(500).json({ erro: "Não foi possível obter a tarefa" })
  }

})

app.put('/tarefa/:id', validAuth, async (req, res) => {
  try {
    const tarefaAtualizada = await bancoDeDados.updateWork(req.params.id, req.body)
    res.json(tarefaAtualizada)
  } catch (error) {
      console.error(error)
      if (error instanceof bancoDeDados.ErrorDataBase) { 
        const httpCode = error instanceof bancoDeDados.ErroDeValidacao ? 400: 404
        res.status(httpCode).json({ erro: error.message})
      }
      res.status(500).json({ erro: "Não foi possível atualizar a tarefa" })
  }
})

app.delete('/tarefa/:id', validAuth, async (req, res) => {
  try {

    await bancoDeDados.deleteWork(req.params.id)
    
    res.status(204).send()
    } catch (error) {
        console.error(error)
        if (error instanceof bancoDeDados.ErrorDataBase) { 
          const httpCode = error instanceof bancoDeDados.ErroDeValidacao ? 400: 404
          res.status(httpCode).json({ erro: error.message})
        }
        res.status(500).json({ erro: "Não foi possível apagar a tarefa" })
  }
})

app.patch('/tarefa/:id/completa', validAuth, async (req, res) => {
  try {
    const tarefaAtualizada = await bancoDeDados.updateWork(req.params.id, {
      completa: true  
    })
    res.json(tarefaAtualizada)
  } catch (error) {
      console.error(error)
      if (error instanceof bancoDeDados.ErrorDataBase) { 
        const httpCode = error instanceof bancoDeDados.ErroDeValidacao ? 400: 404
        res.status(httpCode).json({ erro: error.message})
      }
      res.status(500).json({ erro: "Não foi possível completar a tarefa" })
  }
})

app.patch('/tarefa/:id/incompleta', validAuth, async (req, res) => {
  try {
    const tarefaAtualizada = await bancoDeDados.updateWork(req.params.id, {
      completa: false  
    })
    res.json(tarefaAtualizada)
  } catch (error) {
      console.error(error)
      if (error instanceof bancoDeDados.ErrorDataBase) { 
        const httpCode = error instanceof bancoDeDados.ErroDeValidacao ? 400: 404
        res.status(httpCode).json({ erro: error.message})
      }
      res.status(500).json({ erro: "Não foi possível tornar a tarefa incompleta" })
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
