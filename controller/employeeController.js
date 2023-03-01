import Ceo from "../model/CeoModel.js";
import Employee from "../model/EmployeeModel.js";
import bcrypt from "bcrypt"
import generateToken from "../util/generatetoken.js";




export const employeeRegisterationController = async(req, res) => {
    const {employeeid, firstname, lastname, email, phone, department, gender, role, jobtitle} = req.body;


    try{
        const employeefound = await Employee.findById(req.userAuth);
        const companyFound = await Ceo.findById(req.userAuth);
        
        const allemployees = await Employee.find({companyregno: !companyFound ? employeefound.companyregno : companyFound.companyregno})
        
        const employeeidFound = allemployees.find((element) => element.employeeid === employeeid)
        
        const employeeFound = allemployees.find((element) => element.email === email)
        // get logged in ceo details to retreive company reg no
        
        
        if(employeeidFound) return res.json({status: "Error", message: "Employee with that id already exists"})
        else if(employeeFound) return res.json({status: "Error", message: "Employee with that email already exists" })
        
        const employee = await Employee.create({
            employeeid,
            firstname,
            lastname,
            email,
            phone,
            department,
            gender,
            role,
            jobtitle,
            companyregno: !companyFound ? employeefound.companyregno : companyFound.companyregno
        })
        
        
        res.json({
            status: "Success",
            data: employee
        })

        companyFound.employees.push(employee._id)
        
    }catch(error){
        res.json(error.message)
    }
}

export const employeeLoginController = async (req, res) => {
    const {email, password} = req.body;
    try{
        const employeeFound = await Employee.findOne({email});
        
        if(!employeeFound){
            return res.json({
                status: "Error",
                message: "Details not found"
            })
        }
        
        console.log(employeeFound.status)
        if(employeeFound.status !== "Active"){
            return res.json({
                status: "Success",
                message: "Please activate your account"
            })
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, employeeFound.password)
        
        if(!isPasswordCorrect){
            res.json({
                status: "error",
                message: "Inorrect Password"
            })
        }else{
            res.json({
                status: "Success",
                data: {
                    role: employeeFound.role,
                    token: generateToken(employeeFound._id)
                }
            })
        }
        
        
    }catch(error){
        res.json(error.message)
    }
}

export const registeringBulkEmployeeController = async(req, res) => {
    try{
        const employeefound = await Employee.findById(req.userAuth);
        const companyFound = await Ceo.findById(req.userAuth);
        
        
        csv()
        .fromFile(req.file.path)
        .then(async (jsonObj) => {
            
            var empcount = 0
            for(let i = 0; i < jsonObj.length; i++){
                
                const employees = await Employee.find({companyregno: !companyFound ? employeefound.companyregno : companyFound.companyregno})
                
                
                const employeeidFound = employees.find((element) => element.employeeid === jsonObj[i]['Employee Id'])
                
                const employeeFound = employees.find((element) => element.email === jsonObj[i]['Email'])
                
                
                
                if(employeeFound){
                    continue;
                }else if(employeeidFound){
                    continue;
                }
                
                await Employee.create({
                    employeeid: jsonObj[i]['Employee Id'],
                    firstname: jsonObj[i]['First Name'],
                    lastname: jsonObj[i]['Last Name'],
                    email: jsonObj[i]['Email'],
                    phone: jsonObj[i]['Phone Number'],
                    department: jsonObj[i]['Department'],
                    gender: jsonObj[i]['Gender'],
                    role: jsonObj[i]['Role'],
                    jobtitle: jsonObj[i]['Job Title'],
                    companyregno: companyFound.companyregno,
                    status: "Inactive"
                })
                
                empcount++
            }
            res.json({
                status: "Success",
                message: `${empcount} Employees added Successfully`
            })
        })
        
        
    }catch(error){
        res.json(error.message)
    }
}

export const getLoggedinEmployeeDetailsController = async(req, res) => {
    try{
        const employeeFound = await Employee.findById(req.userAuth);
        
        if(employeeFound){
            res.json({
                status: "Success",
                data: {employeeFound}
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

export const getSpecificEmployeeDetailsController = async(req, res) => {
    try{
        const employeeFound = await Employee.findById(req.params.id);
        
        if(employeeFound){
            res.json({
                status: "Success",
                data: {employeeFound}
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

export const passwordSetUpController = async(req, res) => {
    const {password} = req.body;
    const {employeeid} = req.params;
    
    
    try{
        const employee = await Employee.findOne({employeeid})
        
        
        if(employee.status !== "Inactive"){
            return res.json({
                status: "Success",
                message: "Account has already been activated"
            })
        }
        
        
        const salt = await bcrypt.genSalt(10);
        const passwordhash = await bcrypt.hash(password, salt)
        
        await Employee.findOneAndUpdate({employeeid}, {
            $set:{
                password: passwordhash,
                status: "Active"
            }
        },{
            new: true
        })
        
        res.json({
            status: "Success",
            message: "Account Setup Successfull"
        })
        
        
    }catch(error){
        res.json(error.message)
    }
}

export const getAllEmployeeController = async(req, res) => {
    try{
        const companyFound = await Ceo.findById(req.userAuth);
        const employeeFound = await Employee.findById(req.userAuth);
        const allemployees = await Employee.find({companyregno: !companyFound ? employeeFound.companyregno : companyFound.companyregno})
        
        res.json({
            status: "Success",
            data: allemployees
        })
        
        
    }catch(error){
        res.json(error.message)
    }
}

