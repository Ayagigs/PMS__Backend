import Ceo from "../model/CeoModel.js";
import bcrypt from "bcrypt"
import generateToken from "../util/generatetoken.js";



export const ceoRegisterationController = async(req, res) => {
    const {firstname, lastname, email, password, companyname, businesstype, address, state, country, companyregno, numofemployees, role} = req.body;


    try{
        const companyFound = await Ceo.findOne({companyregno});

        if(companyFound){
            return res.json({
                status: "Error",
                message: "Company reg number already exists"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const passwordhash = await bcrypt.hash(password, salt)

        const ceo = await Ceo.create({
            firstname,
            lastname,
            email,
            password: passwordhash,
            companyname,
            companyregno,
            businesstype,
            address,
            state,
            country,
            numofemployees,
            role
        })

        res.json({
            status: "Success",
            data: ceo
        })

    }catch(error){
        res.json(error.message)
    }
}



export const editCompanyDetailsController = async(req, res) => {
    const {companyname, businesstype, address, state, country, companyregno, numofemployees} = req.body;


    try{
        const editedCompany = await Ceo.findByIdAndUpdate(req.userAuth, {
            $set: {
                companyname,
                companyregno,
                businesstype,
                address,
                state,
                country,
                numofemployees
            }
        },{
            new: true
        })

        res.json({
            status: "Success",
            data: editedCompany
        })

    }catch(error){
        res.json(error.message)
    }
}

export const ceoLoginController = async (req, res) => {
    const {companyregno, password} = req.body;
    try{
        const companyFound = await Ceo.findOne({companyregno});

        if(!companyFound){
            return res.json({
                status: "Error",
                message: "Company details not found"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, companyFound.password)

        if(!isPasswordCorrect){
            res.json({
                status: "error",
                message: "Inorrect Password"
            })
        }else{
            res.json({
                status: "Success",
                data: {
                    role: companyFound.role,
                    token: generateToken(companyFound._id)
                }
            })
        }

    }catch(error){
        res.json(error.message)
    }
}


export const getSpecificCeoDetailsController = async(req, res) => {
    try{
        const companyFound = await Ceo.findById(req.userAuth);

        if(companyFound){
            res.json({
                status: "Success",
                data: {companyFound}
            })
        }else{
            res.json({
                status: "Success",
                message: "Please Login"
            })
        }
        

    }catch(error){
        res.json(error.message)
    }
    
}
