import Employee from "../model/EmployeeModel.js";
import Company from "../model/companyModel.js";


const isReviewTime = async(req, res, next) => {
    
    const employee = await Employee.findById(req.userAuth._id)
    const company = await Company.findOne({companyID: employee.companyID})
  
  
    
    const today = new Date();

    if((today >= company.midYearStartDate && today <= company.midYearEndDate) || (today >= company.fullYearStartDate && today <= company.fullYearEndDate)){
        next()
    }else{
        return res.status(200).send({status: 'Success', message: 'It is not yet time for Perfomance Review'})
    }
}

export default isReviewTime