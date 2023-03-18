import asyncHandler from "express-async-handler";
import Department from "../model/departmentModel.js";

export const addDepartment = asyncHandler(async (req, res, next) => {
  const { departmentName } = req.body;

  try {
    const department = await Department.findOne({
      departmentName: departmentName,
      companyID: req.userAuth._id,
    });
    const departments = await Department.find({ companyID: req.userAuth._id });

    // check if the department already exists
    if (department) {
      return next(new errorHandler("Department already exist", 422));
    }

    await Department.create({
      departmentName,
      companyID: req.userAuth._id,
    });

    res.status(200).send({ status: "Success", data: departments });
  } catch (error) {
    return res.status(500).send({ status: "Success", message: error.message });
  }
});

export const editDepartment = async (req, res) => {
  const { departmentName } = req.body;
  const {departmentID} = req.params;

  if (!mongoose.Types.ObjectId.isValid(departmentID)) {
    return next(new errorHandler("Invalid objectID", 404));
}


  const department = await Department.findOne({
    departmentName: departmentName,
    companyID: req.userAuth._id,
  });

  // check if the department already exists
  if (department) {
    return next(new errorHandler("Department already exist", 422));
  }

  try {
    const department = await Department.findByIdAndUpdate(departmentID,{
        $set: {
            departmentName
        }
    }, {
        new: true
    });

    res.status(200).send({status: 'Success', data: department})

  } catch (error) {
    return res.status(500).send({ status: "Success", message: error.message });
  }
};


export const deleteDepartment = async (req, res) => {
    const {departmentID} = req.params;

    if (!mongoose.Types.ObjectId.isValid(departmentID)) {
        return next(new errorHandler("Invalid objectID", 404));
    }
  
    try {
      const department = await Department.findByIdAndDelete(departmentID)
  
      res.status(200).send({status: 'Success', data: department})
      
    } catch (error) {
      return res.status(500).send({ status: "Success", message: error.message });
    }
};

export const getDepartments = async(req, res) => {
    const {companyID} = req.params;

    
    if(!companyID){
        res.status(400).send({status: 'Success', message: 'Please provide the company\'s id'})
    }
    
    if (!mongoose.Types.ObjectId.isValid(companyID)) {
        return next(new errorHandler("Invalid objectID", 404));
    }

    try{
        const departments = await Department.find({companyID: companyID})

        res.status(200).send({status: 'Success', data: departments})

    } catch (error) {
      return res.status(500).send({ status: "Success", message: error.message });
    }
}