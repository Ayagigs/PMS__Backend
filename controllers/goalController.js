import Employee from "../model/EmployeeModel.js";
import Goal from "../model/GoalModel.js";
import Admin from "../model/adminModel.js";

export const addGoal = async(req, res) => {
    const {goaltitle, startdate, enddate, category, description, keyobjectives} = req.body;
    const goalOwner = await Employee.findById(req.userAuth)
    
    if (!mongoose.Types.ObjectId.isValid(req.userAuth)) {
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
            owner: goalOwner._id
        })

        res.json({
            status: "Success",
            message: "Goal Added Successfully"
        })

        goalOwner.goals.push(goal._id)

        await goalOwner.save();

        res.status(200).json({
            success: true,
            data: goal,
        });
        

    }catch(error){
        res.status(500).send({ status: "Fail", message: error.message });
    }
}

export const getEmployeeAndGoal = async(req, res) => {
    try{
        const {companyID} = req.params;
        if (!mongoose.Types.ObjectId.isValid(companyID)) {
            return next(new errorHandler("Invalid objectID", 404));
        }

        const employees = await Employee.find({companyID, role: "Staff"}).populate('goals');

        res.status(200).json({
            success: true,
            data: employees,
        });

    }catch(error){
        res.status(500).send({ status: "Fail", message: error.message });
    }
}

export const getAllGoals = async (req, res) => {
    try{
        const goals = await Goal.find({owner: req.userAuth})

        res.status(200).json({
            success: true,
            data: goals,
        });

    }catch(error){
        res.status(500).send({ status: "Fail", message: error.message });
    }
}

export const editGoal = async (req, res) => {
    const {goaltitle, startdate, enddate, category, description, keyobjectives, status, isCompleted} = req.body;
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

        res.json({
            status: "Success",
            data: editedgoal
        })

    }catch(error){
        res.status(500).send({ status: "Fail", message: error.message });
    }

}
