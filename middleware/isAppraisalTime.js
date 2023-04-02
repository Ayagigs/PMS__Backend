import Employee from "../model/EmployeeModel.js";
import Company from "../model/companyModel.js";


const isAppraisalTime = async(req, res, next) => {
    
    const employee = await Employee.findById(req.userAuth._id)
    const company = await Company.findOne({companyID: employee.companyID})
  
    
    
    const today = new Date();
    // today.setHours(today.getHours() + 1);

    if(today >= company.appraisalStartDate || today <= company.appraisalEndDate){
        next()
    }else{
        res.status(200).send({status: 'Success', message: 'It is not yet time for 360 appraisal'})
    }
}

export default isAppraisalTime