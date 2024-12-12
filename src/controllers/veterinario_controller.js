import { sendMailToUser, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import generarJWT from "../helpers/crearJWT.js"
import Veterinario from "../models/Veterinario.js"

const registro = async (req,res)=>{

    const{email, password} =  req.body

    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})

    
    const verificarEmailBDD = await Veterinario.findOne({email})

    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})


    const nuevoVeterinario = new Veterinario(req.body)

    nuevoVeterinario.password = await nuevoVeterinario.encrypPassword(password)

    const token  =  nuevoVeterinario.crearToken()

    sendMailToUser(email,token)

    await nuevoVeterinario.save()

    res.status(200).json({msg:"revisa tu correo electronico para confirmar tu cuenta"})
}


const confirmEmail = async (req,res)=>{
    // paso 1 - tomar datos del request
    const {token} = req.params
    
    // paso 2 - validar datos
    if(!(token)) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    
    const veterinarioBDD = await Veterinario.findOne({token})
    
    if(!veterinarioBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
    
    // paso 3 - interactua BDD
    veterinarioBDD.token = null
    
    veterinarioBDD.confirmEmail=true
    
    await veterinarioBDD.save()
    
    res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"}) 
}


const login = async(req,res)=>{
    // paso 1 - tomar datos del request
    const {email,password} = req.body

    // paso 2 - validar datos
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    
    const veterinarioBDD = await Veterinario.findOne({email}).select("-status -__v -token -updatedAt -createdAt")

    if(veterinarioBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"})

    if(!veterinarioBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})

    const verificarPassword = await veterinarioBDD.matchPassword(password)

    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})


    // paso 3 - interactua BDD

    const tokenJWT = generarJWT(veterinarioBDD._id,"veterinario")
    const {nombre,apellido,direccion,telefono,_id} = veterinarioBDD
    res.status(200).json({
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        email:veterinarioBDD.email,
        tokenJWT
    })
}


const recuperarPassword = async(req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const veterinarioBDD = await Veterinario.findOne({email})
    if(!veterinarioBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const token = veterinarioBDD.crearToken()
    veterinarioBDD.token=token
    await sendMailToRecoveryPassword(email,token)
    await veterinarioBDD.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"})
}


const comprobarTokenPasword = async (req,res)=>{
    if(!(req.params.token)) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    const veterinarioBDD = await Veterinario.findOne({token:req.params.token})
    if(veterinarioBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    await veterinarioBDD.save()
  
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
}


const nuevoPassword = async (req,res)=>{
    const{password,confirmpassword} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password != confirmpassword) return res.status(404).json({msg:"Lo sentimos, los passwords no coinciden"})
    const veterinarioBDD = await Veterinario.findOne({token:req.params.token})
    if(veterinarioBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    veterinarioBDD.token = null
    veterinarioBDD.password = await veterinarioBDD.encrypPassword(password)
    await veterinarioBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 
}


const perfilUsuario = (req,res)=>{
    res.send("perfil del usuario")

}

export {
    registro, confirmEmail, login, recuperarPassword, comprobarTokenPasword,nuevoPassword, perfilUsuario
}