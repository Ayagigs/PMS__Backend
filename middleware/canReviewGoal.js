import Employee from "../model/EmployeeModel.js";
import Goal from "../model/GoalModel.js";

const canReviewGoal = async(req, res, next) => {
    const {goalID} = req.params;
    const employee = await Employee.findById(req.userAuth._id)
    const goal = await Goal.findById(goalID)
    const goalOwner = await Employee.findById(goal.owner)

    if(employee.role === "Performance Manager" && employee.department !== goalOwner.department){
        return res.status(403).send({status: 'success', message: "Access Denied"})
    }

    if(goal.reviewers.includes(employee._id) || employee.role === "Performance Manager" || employee.role === "HR Manager"){
        next()
    }else{
        return res.status(403).send({status: 'success', message: "Access Denied"})
    }
}



export default canReviewGoal