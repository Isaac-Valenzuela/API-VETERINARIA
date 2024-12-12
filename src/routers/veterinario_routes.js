import {Router} from 'express'
import { confirmEmail, login, registro, recuperarPassword, comprobarTokenPasword, nuevoPassword, perfilUsuario, actualizarPerfil, actualizarPassword} from '../controllers/veterinario_controller.js'
import verificarAutenticacion from '../middlewares/autenticacion.js'
const router = Router()
 

//rutas publicas
router.post('/registro',registro)

router.get('/confirmar/:token', confirmEmail)

router.post('/login', login)

router.post('/recuperar-password', recuperarPassword)

router.get('/recuperar-password/:token', comprobarTokenPasword)

router.post('/nuevo-password/:token' , nuevoPassword)


// rutas privadas

router.get('/perfilvet',verificarAutenticacion, perfilUsuario)

router.put('/veterinario/actualizarpassword', verificarAutenticacion, actualizarPassword)

router.put('/veterinario/:id', verificarAutenticacion, actualizarPerfil)

export default router
