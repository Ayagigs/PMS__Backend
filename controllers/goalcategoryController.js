import GoalCategory from "../model/goalcategoryModel.js";
import asyncHandler from "express-async-handler";
import Employee from "../model/EmployeeModel.js";


export const addCategory = asyncHandler(async(req, res, next) => {
    const {categoryName} = req.body;
    const employee = await Employee.findById(req.userAuth._id)

    const category = await GoalCategory.findOne({categoryName: categoryName, companyID: employee.companyID, department: employee.department})

    const categories = await GoalCategory.find({department: employee.department, companyID: employee.companyID})

    if(!employee){
        return next(new errorHandler("Department already exist",404));
    }
    if(!category){
        return next(new errorHandler("Department already exist",404));
    }

    try{
        await GoalCategory.create({
            categoryName,
            department: employee.department,
            companyID: employee.companyID
        })

        res.status(200).send({status: 'Success', data: categories})

    }catch(error){
        res.status(500).send({status: 'Fail', message: error.message})
    }
})

export const editCategory = async (req, res) => {
    const { categoryName } = req.body;
    const { categoryID } = req.params;

    const employee = await Employee.findById(req.userAuth._id)

    if (!mongoose.Types.ObjectId.isValid(categoryID)) {
        return next(new errorHandler("Invalid objectID", 404));
    }


    const category = await GoalCategory.findOne({
        categoryName,
        companyID: employee.companyID,
        department: employee.department
    });

    // check if the department already exists
    if (category) {
        return next(new errorHandler("Department already exist", 422));
    }

    try {
        const categoryUpdate = await GoalCategory.findByIdAndUpdate(categoryID,{
            $set: {
                categoryName
            }
        }, {
            new: true
        });

        res.status(200).send({status: 'Success', data: categoryUpdate})

    } catch (error) {
        return res.status(500).send({ status: "Success", message: error.message });
    }
};


export const deleteCategory = asyncHandler( async (req, res, next) => {
    const {categoryID} = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryID)) {
        return next(new errorHandler("Invalid objectID", 404));
    }

    try {
    const category = await GoalCategory.findByIdAndDelete(categoryID)

    res.status(200).send({status: 'Success', data: category})
    
    } catch (error) {
        return res.status(500).send({ status: "Success", message: error.message });
    }
});

export const getGoalCategories = async(req, res) => {

    const employee = await Employee.findById(req.userAuth._id)

    try{
        const categories = await GoalCategory.find({companyID: employee.companyID, department: employee.department})

        res.status(200).send({status: 'Success', data: categories})

    } catch (error) {
        return res.status(500).send({ status: "Success", message: error.message });
    }
}