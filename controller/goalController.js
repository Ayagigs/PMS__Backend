// import Employee from "../model/EmployeeModel.js";
// import Goal from "../model/GoalModel.js";
// import Ceo from "../model/CeoModel.js";

// export const createGoalController = async(req, res) => {
//     const {goaltitle, startdate, enddate, category, description, keyobjectives} = req.body;
//     const goalOwner = await Employee.findById(req.userAuth)

//     try{
//         const goal = await Goal.create({
//             goaltitle,
//             startdate,
//             enddate,
//             category,
//             description,
//             keyobjectives,
//             owner: goalOwner._id
//         })

//         res.json({
//             status: "Success",
//             message: "Goal Added Successfully"
//         })

//         await goalOwner.save();

//     }catch(error){
//         res.json(error.message)
//     }
// }

// export const getAllEmployeeandTheirCurrentGoals = async(req, res) => {
//     try{
//         const companyFound = await Ceo.findById(req.userAuth)
//         const employeeFound = await Employee.findById(req.userAuth)

//         const employees = await Employee.find({companyregno: !companyFound ? employeeFound.companyregno : companyFound.companyregno, role: "Staff"});

//         const employeegoaldetails = [];

//         for(let i = 0; i < employees.length; i++){
//             const goal = await Goal.find({owner: employees[i]._id});
//             const currentGoal =

//             employeegoaldetails.push({
//                 profilephoto: employees[i].profilephoto,
//                 employeename: employees[i].firstname + " " + employees[i].lastname,
//                 currentGoal,

//             })
//         }

//         res.json({
//             status: "Success",
//             data: employeegoaldetails
//         })

//     }catch(error){
//         res.json(error.message)
//     }
// }

// export const getAllGoalsController = async (req, res) => {
//     try{
//         const goals = await Goal.find({owner: req.userAuth})

//         res.json({
//             status: "Success",
//             data: goals
//         })

//     }catch(error){
//         res.json(error.message)
//     }
// }

// export const editGoalController = async (req, res) => {
//     const {goaltitle, startdate, enddate, category, description, keyobjectives, status, isCompleted} = req.body;
//     try{
//         const editedgoal = await Goal.findByIdAndUpdate(req.params.id, {
//             $set: {
//                 goaltitle,
//                 startdate,
//                 enddate,
//                 category,
//                 description,
//                 keyobjectives,
//                 status,
//                 isCompleted
//             }
//         },{
//             new: true
//         })

//         res.json({
//             status: "Success",
//             data: editedgoal
//         })

//     }catch(error){
//         res.json(error.message)
//     }

// }
