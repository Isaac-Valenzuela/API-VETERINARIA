import Paciente from "../models/Paciente.js"
import { sendMailToPaciente } from "../config/nodemailer.js"

const registrarPaciente = async(req,res)=>{
    // paso 1 - tomar datos del request
    const {email} = req.body

    // paso 2 - validar datos
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})

    const verificarEmailBDD = await Paciente.findOne({email})

    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})

    // paso 3 - interactuar BDD    
    const nuevoPaciente = new Paciente(req.body)

    const password = Math.random().toString(36).slice(2)
    
    nuevoPaciente.password = await nuevoPaciente.encrypPassword("vet"+password)
    
    await sendMailToPaciente(email,"vet"+password)

    nuevoPaciente.veterinario=req.veterinarioBDD._id

    await nuevoPaciente.save()

    res.status(200).json({msg:"Registro exitoso del paciente y correo enviado"})
}



const loginPaciente = (req,res)=>{
    res.send("Login del paciente")
}
const perfilPaciente = (req,res)=>{
    res.send("Perfil del paciente")
}

const listarPacientes = async (req,res)=>{
    // paso unico - solo se interactua con la bdd
    const pacientes = await Paciente.find({estado:true}).where('veterinario').equals(req.veterinarioBDD).select("-salida -createdAt -updatedAt -__v").populate('veterinario','_id nombre apellido')
    
    res.status(200).json(pacientes)
}

const detallePaciente = (req,res)=>{
    res.send("Detalle del paciente")
}
const actualizarPaciente = (req,res)=>{
    res.send("Actualizar paciente")
}
const eliminarPaciente = (req,res)=>{
    res.send("Eliminar paciente")
}

export {
	registrarPaciente, loginPaciente, perfilPaciente, listarPacientes, detallePaciente, actualizarPaciente, eliminarPaciente
}