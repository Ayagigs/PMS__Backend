import Employee from "../model/EmployeeModel.js";
import Company from "../model/companyModel.js";


const isAppraisalTime = async(req, res, next) => {
    
    const employee = await Employee.findById(req.userAuth._id)
    const company = await Company.findOne({companyID: employee.companyID})
  
    
    const startDate = new Date(company.appraisalStartDate)
    const endDate = new Date(company.appraisalEndDate)
  
    
    const today = new Date();
    // today.setHours(today.getHours() + 1);
    console.log(today)
    console.log(startDate)
    console.log(endDate)

    if(today <= startDate || today >= endDate){
        res.status(200).send({status: 'Success', message: 'It is not yet time for 360 appraisal'})
    }else{
        next()
    }
}

export default isAppraisalTime