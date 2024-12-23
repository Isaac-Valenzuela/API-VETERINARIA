import jwt from 'jsonwebtoken'
import Veterinario from '../models/Veterinario.js'

// metodo para verificar el token
const verificarAutenticacion = async (req, res, next) => {

    // verifica que exista el token


    if (!req.headers.authorization) return res.status(404).json({ msg: "Lo sentimos, debes proprocionar un token" })
    const { authorization } = req.headers
    try {
        const { id, rol } = jwt.verify(authorization.split(' ')[1], process.env.JWT_SECRET)
        if (rol==="veterinario"){
            req.veterinarioBDD = await Veterinario.findById(id).lean().select("-password")
            next()
        }
        else{
            req.pacienteBDD = await Paciente.findById(id).lean().select("-password")
            next()
        }
    } catch (error) {
        const e = new Error("Formato del token no válido")
        return res.status(404).json({ msg: e.message })
    }
}

export default verificarAutenticacion