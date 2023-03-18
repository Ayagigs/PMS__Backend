import Employee from "../model/EmployeeModel.js";
import Goal from "../model/GoalModel.js";
import Admin from "../model/adminModel.js";
import mongoose from "mongoose";
import errorHandler from "../utils/errorHandler.js";
import asyncHandler from "express-async-handler";


export const addGoal = asyncHandler(async (req, res, next) => {
    const {goaltitle, startdate, enddate, category, description, keyobjectives} = req.body;
    const goalOwner = await Employee.findById(req.userAuth._id)
    
    if (!mongoose.Types.ObjectId.isValid(req.userAuth._id)) {
      return next(new errorHandler("Invalid objectID", 404));
    }

    if (!goalOwner) {
        return next(
          new errorHandler("Invalid or Expired token", 404)
        );
    }
    

    try{
        const goal = await Goal.create({
            goaltitle,
            startdate,
            enddate,
            category,
            description,
            keyobjectives,
            companyID: goalOwner.companyID,
            owner: goalOwner._id
        })

        goalOwner.goals.push(goal._id)
        await goalOwner.save();
        await goal.save()
        console.log(goalOwner.goals)


        res.status(200).json({
            success: true,
            data: goal,
        });
        

    }catch(error){
        res.status(500).send({ status: "Fail", message: error.message });
    }
})


export const getEmployeeAndGoal = asyncHandler(async (req, res, next) => {
    try{
        const {companyID} = req.params;
        if (!mongoose.Types.ObjectId.isValid(companyID)) {
            return next(new errorHandler("Invalid objectID", 404));
        }

        const employees = await Goal.find({companyID}).populate('owner').populate('reviews');

        res.status(200).json({
            success: true,
            data: employees,
        });

    }catch(error){
        res.status(500).send({ status: "Fail", message: error.message });
    }
})


export const getAllGoals = async (req, res) => {
    try{
        const goals = await Goal.find({owner: req.userAuth}).populate('reviews')

        res.status(200).json({
            success: true,
            data: goals,
        });

    }catch(error){
        res.status(500).send({ status: "Fail", message: error.message });
    }
}


export const editGoal = asyncHandler(async (req, res, next) => {
    const {goaltitle, startdate, enddate, category, description, keyobjectives, status, isCompleted, reviewers} = req.body;
    try{
        const editedgoal = await Goal.findByIdAndUpdate(req.params.id, {
            $set: {
                goaltitle,
                startdate,
                enddate,
                category,
                description,
                keyobjectives,
                status,
                isCompleted
            }
        },{
            new: true
        })

        
        
        for(var i = 0; i < reviewers.length; i++){
            editedgoal.reviewers.push(reviewers[i])
            await editedgoal.save()
            
            const employee = await Employee.findById(reviewers[i])
            
            employee.goalsToReview.push(editedgoal._id)
            
            await employee.save()

            console.log(employee)
         }


        res.json({
            status: "Success",
            data: editedgoal
        })

    }catch(error){
        res.status(500).send({ status: "Fail", message: error.message });
    }

})


