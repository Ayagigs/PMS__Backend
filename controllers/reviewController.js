import Reviews from "../model/reviewModel.js";
import Employee from "../model/EmployeeModel.js";
import Goal from "../model/GoalModel.js";
import { EReviewType } from "../enums/EReviewType.js";
import Company from "../model/companyModel.js";
import { ERatings } from "../enums/ERatings.js";
import { EReviewTime } from "../enums/EReviewTime.js";
import mongoose from "mongoose";


const ratingCalculator = (score) => {
  if (score >= 5) return ERatings.OUTSTANDING;
  if (score >= 4) return ERatings.EXCELLENT;
  if (score >= 3) return ERatings.VGOOD;
  if (score >= 2) return ERatings.SATISFACTORY;
  return ERatings.UNSATISFACTORY;
}

export const addPerformanceReview = async (req, res) => {
  const { scores, competencyScores, feedback } = req.body;
  // id of employee to be reviewed
  const { employeeID } = req.params;

  if (!mongoose.Types.ObjectId.isValid(employeeID)) {
    return res.status(404).send({status: 'Fail', message: 'Invalid Object Id'})
  }

  // get detils of the person giving the review and company they belong to
  const reviewer = await Employee.findById(req.userAuth._id);
  const company = await Company.findOne({ companyID: reviewer.companyID });

  // get details of employee being reviewed
  const employeeBeingReviewed = await Employee.findById(employeeID)

  // get employees already reviewed by this user
  const employeesAlreadyReviewed = reviewer.performanceReviewGiven;

  // check if the employee about to be reviewed has been previously reviewed by this user
  if (employeesAlreadyReviewed.includes(employeeID)) {
    return res
      .status(403)
      .send({
        status: "Forbidden",
        message: "You have already reviewed this employee",
      });
  }

  if (reviewer.department !== employeeBeingReviewed.department) {
    return res
      .status(403)
      .send({
        status: "Forbidden",
        message: "You Can not review this employee",
      });
  }


  // checking if today is a mid-year of full-year so we can get the review time
  const today = new Date();
  let year = "";
  if (today > company.midYearStartDate || today < company.midYearEndDate) {
    year = EReviewTime.MIDYEAR;
  } else if (
    today > company.fullYearStartDate ||
    today < company.fullYearEndDate
  ) {
    year = EReviewTime.FULLYEAR;
  }

  // Calculating the final score gotten from the questions
  let score = scores.reduce((a, b) => a + b)/scores.length
  let competency = competencyScores.reduce((a, b) => a + b)/competencyScores.length

  // calculating the final score of the employee
  const finalScore = ((score + competency) / 2).toFixed(1);

  try {
    const review = await Reviews.create({
      reviewer: req.userAuth._id,
      reviewee: employeeID,
      reviewType: EReviewType.PERFORMANCE,
      reviewTime: year,
      score: score.toFixed(1),
      competency: competency.toFixed(1),
      date: Date.now(),
      ratings: ratingCalculator(finalScore),
      finalScore: finalScore,
      feedback
    });

    // adding the just reviewed employee to those who have already being reviewed
    reviewer.performanceReviewGiven.push(employeeID);

    employeeBeingReviewed.reviews.push(review._id)

    employeeBeingReviewed.score = (employeeBeingReviewed.score + score)/2
    employeeBeingReviewed.competency = (employeeBeingReviewed.competency + competency)/2
    employeeBeingReviewed.finalScore = (employeeBeingReviewed.competency + employeeBeingReviewed.score)/2
    employeeBeingReviewed.rating = ratingCalculator(employeeBeingReviewed.finalScore.toFixed(1))
    
    await reviewer.save();
    await employeeBeingReviewed.save()

    res.status(200).send({ status: "Success", message: review });
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
};



export const addSelfAppraisal = async (req, res) => {
  const { scores, competencyScores, feedback } = req.body;

  const employee = await Employee.findById(req.userAuth._id);

  
  let score = scores.reduce((a, b) => a + b)/scores.length
  let competency = competencyScores.reduce((a, b) => a + b)/competencyScores.length

  // calculating the final score
  const finalScore = ((score + competency) / 2).toFixed(1);


  try {
    const review = await Reviews.create({
      reviewer: req.userAuth._id,
      reviewee: req.userAuth._id,
      reviewType: EReviewType.SELFAPPRAISAL,
      score: score.toFixed(1),
      competency: competency.toFixed(1),
      date: Date.now(),
      ratings: ratingCalculator(finalScore),
      finalScore: finalScore,
      feedback
    });

    employee.reviews.push(review._id)

    employee.score = (employeeBeingReviewed.score + score)/2
    employee.competency = (employeeBeingReviewed.competency + competency)/2
    employee.finalScore = (employeeBeingReviewed.competency + employeeBeingReviewed.score)/2
    employee.rating = ratingCalculator(employeeBeingReviewed.finalScore.toFixed(1))
    employee.selfAppraised = true

    await employee.save();

    res.status(200).send({ status: "Success", message: review });
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
};


export const add360Appraisal = async (req, res) => {
  const { scores, competencyScores, feedback } = req.body;
  const { employeeID } = req.params;

  if (!mongoose.Types.ObjectId.isValid(employeeID)) {
    return res.status(404).send({status: 'Fail', message: 'Invalid Object Id'})
  }

  // Get the person reviewing an employee
  const reviewer = await Employee.findById(req.userAuth._id);

  // Get the Employees that have already been reviewed by this user
  const employeesAlreadyReviewed = reviewer.appraisalsGiven;

  // get details of employee being reviewed
  const employeeBeingReviewed = await Employee.findById(employeeID)

  // check if the employee about to be reviewed have been reviewed before by this user
  if (employeesAlreadyReviewed.includes(employeeID)) {
    return res
      .status(403)
      .send({
        status: "Forbidden",
        message: "You have already reviewed this employee",
      });
  }


  if (reviewer.department !== employeeBeingReviewed.department) {
    return res
      .status(403)
      .send({
        status: "Forbidden",
        message: "You Can not review this employee",
      });
  }


  
  let score = scores.reduce((a, b) => a + b)/scores.length
  let competency = competencyScores.reduce((a, b) => a + b)/competencyScores.length

  // calculating the final score
  const finalScore = ((score + competency) / 2).toFixed(1);


  try {
    const review = await Reviews.create({
      reviewer: req.userAuth._id,
      reviewee: employeeID,
      reviewType: EReviewType["360APPRAISAL"],
      score: score.toFixed(1),
      competency: competency.toFixed(1),
      date: Date.now(),
      ratings: ratingCalculator(finalScore),
      finalScore: finalScore,
      feedback
    });

    // add the just reviewed employee to the array containing those he/she has reviewed
    reviewer.appraisalsGiven.push(employeeID);
    
    employeeBeingReviewed.reviews.push(review._id)

    employeeBeingReviewed.score = parseFloat(employeeBeingReviewed.score + score)
    employeeBeingReviewed.competency = parseFloat(employeeBeingReviewed.competency + competency)
    employeeBeingReviewed.finalScore = (employeeBeingReviewed.competency + employeeBeingReviewed.score)/2
    employeeBeingReviewed.rating = ratingCalculator(employeeBeingReviewed.finalScore.toFixed(1))

    await reviewer.save();
    await employeeBeingReviewed.save()

    res.status(200).send({ status: "Success", message: review });
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
};



export const addGoalReview = async (req, res) => {
  try {
    const { scores, competencyScores, feedback } = req.body;
    const { goalID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(goalID)) {
      return res.status(404).send({status: 'Fail', message: 'Invalid Object Id'})
    }

    // employee adding the goal review
    const reviewer = await Employee.findById(req.userAuth._id);
    
    const goal = await Goal.findById(goalID);
    
    // get details of employee being reviewed
    const employeeBeingReviewed = await Employee.findById(goal.owner)
    if(reviewer.role !== ('Performance Manager' || 'HR Manager')){
      if (!goal.reviewers.includes(reviewer._id)  ) {
        return res
          .status(403)
          .send({
            status: "Forbidden",
            message: "You Cannn not review this goal",
          });
      }
    }

    
    let score = scores.reduce((a, b) => a + b)/scores.length
    let competency = competencyScores.reduce((a, b) => a + b)/competencyScores.length
    

    const finalScore = ((score + competency) / 2).toFixed(1);


    const review = await Reviews.create({
      reviewer: req.userAuth._id,
      reviewee: goal.owner,
      reviewType: EReviewType.GOALREVIEW,
      goal: goalID,
      score: score.toFixed(1),
      competency: competency.toFixed(1),
      date: Date.now(),
      ratings: ratingCalculator(finalScore),
      finalScore: finalScore,
      feedback
    });

    goal.reviews.push(review._id);
    
    employeeBeingReviewed.reviews.push(review._id)

    employeeBeingReviewed.score = ((employeeBeingReviewed.score + score)/2).toFixed(1)
    employeeBeingReviewed.competency = ((employeeBeingReviewed.competency + competency)/2).toFixed(1)
    employeeBeingReviewed.finalScore = (employeeBeingReviewed.competency + employeeBeingReviewed.score)/2
    employeeBeingReviewed.rating = ratingCalculator(employeeBeingReviewed.finalScore.toFixed(1))

    await employeeBeingReviewed.save()
    await goal.save();

    // remove the goal reviewed now from the list of goal you need to review
    reviewer.goalsToReview = reviewer.goalsToReview.filter(
      (user) => user.toString() !== goalID
    );

    // console.log(reviewer)

    await reviewer.save();

    res.status(200).send({ status: "Success", message: review });
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
};





export const employeesFor360Appraisal = async (req, res, next) => {
  const employee = await Employee.findById(req.userAuth._id);
  const company = await Company.findOne({ companyID: employee.companyID });

  const today = new Date();

  try {
    const employeesInDepartment = await Employee.find({
      department: employee.department,
      companyID: employee.companyID,
      status: "Active",
      _id: {$ne : req.userAuth._id}
    });
    const employeesAlreadyReviewed = employee.appraisalsGiven;

    const employeeNotReviewed = [];

    for (let i = 0; i < employeesInDepartment.length; i++) {
      // checking id the employee has already been reviewed before pushing it to the array of those not reviewed
      if (!employeesAlreadyReviewed.includes(employeesInDepartment[i]._id)) {
        employeeNotReviewed.push(employeesInDepartment[i]);
      }
    }

    // once the review period is over, clears the array containing those reviewed
    const delay = company.appraisalEndDate - today;


    setTimeout(async () => {
      await Employee.findByIdAndUpdate(
        req.userAuth._id,
        {
          $set: {
            appraisalsGiven: [],
          },
        },
        {
          new: true,
        }
      );
    }, delay);

    res.status(200).send({ status: "Success", data: employeeNotReviewed });
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
};

export const getSelfAppraisal = async (req, res, next) => {
  const employee = await Employee.findById(req.userAuth._id);
  const company = await Company.findOne({ companyID: employee.companyID });

  const today = new Date();

  try {
    const selfAppraised = employee.selfAppraised

    if(selfAppraised){
      return res.status(403).send({ status: "Success", message: "You have already appraised yourself" });
    }

    // once the review period is over, clears the array containing those reviewed
    const delay = company.appraisalEndDate - today;


    setTimeout(async () => {
      await Employee.findByIdAndUpdate(
        req.userAuth._id,
        {
          $set: {
            selfAppraised: false,
          },
        },
        {
          new: true,
        }
      );
    }, delay);

    res.status(200).send({ status: "Success", data: employeeNotReviewed });
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
};



export const employeesForPerformanceReview = async (req, res) => {
  try {
    // get details of the person giving the review and company they belong to
    const reviewer = await Employee.findById(req.userAuth._id);
    const company = await Company.findOne({ companyID: reviewer.companyID });
    const employeesInDepartment = [];

    if (reviewer.role === "Performance Manager") {
      employeesInDepartment = await Employee.find({
        department: reviewer.department,
        companyID: reviewer.companyID,
        role: "Staff",
        status: "Active",
      });
    } else {
      employeesInDepartment = await Employee.find({
        department: reviewer.department,
        companyID: reviewer.companyID,
        role: "Staff" || "Perfomance Manager",
        status: "Active",
      });
    }
    const employeesAlreadyReviewed = reviewer.performanceReviewGiven;
    const employeeNotReviewed = [];
    const today = new Date();
    // checking if it is a mid-year befoe executing the functions
    if (today >= company.midYearStartDate && today <= company.midYearEndDate) {
      let delay = company.midYearEndDate - today;

      for (let i = 0; i < employeesInDepartment.length; i++) {
        if (!employeesAlreadyReviewed.includes(employeesInDepartment[i])) {
          employeeNotReviewed.push(employeesInDepartment[i]);
        }
      }

      // once the review period is over, clears the array containing those reviewed
      setTimeout(async () => {
        await Employee.findByIdAndUpdate(
          req.userAuth._id,
          {
            $set: {
              performanceReviewGiven: [],
            },
          },
          {
            new: true,
          }
        );
      }, delay);
      res.status(200).send({ status: "Success", data: employeeNotReviewed });
    }

    // checking if it is a full year before executing the functions
    if (
      today >= company.fullYearStartDate &&
      today <= company.fullYearEndDate
    ) {
      let delay = company.fullYearEndDate - today;

      for (let i = 0; i < employeesInDepartment.length; i++) {
        if (!employeesAlreadyReviewed.includes(employeesInDepartment[i])) {
          employeeNotReviewed.push(employeesInDepartment[i]);
        }
      }

      // once the review period is over, clears the array containing those reviewed
      setTimeout(async () => {
        await Employee.findByIdAndUpdate(
          req.userAuth._id,
          {
            $set: {
              performanceReviewGiven: [],
            },
          },
          {
            new: true,
          }
        );
      }, delay);

      res.status(200).send({ status: "Success", data: employeeNotReviewed });
    }
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
};



export const employeesForGoalReview = async (req, res) => {
  const employee = await Employee.findById(req.userAuth._id).populate({ 
    path: 'goalsToReview',
    populate: {
      path: 'owner',
    } 
 });

  try {
    res.status(200).send({ status: "Success", data: employee.goalsToReview });
  } catch (error) {
    res.status(500).send({ status: "Success", message: error.message });
  }
};


export const getMyReviews = async (req, res) => {
  const reviews = await Reviews.find({ reviewee: req.userAuth._id }).populate('reviewer')

  try {
    res.status(200).send({ status: "Success", data: reviews });
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
};


export const getAllReviews = async(req, res) => {
  const {companyID} = req.params;

  try{
    const employees = await Employee.find({companyID: companyID}).populate({ 
      path: 'reviews',
      populate: {
        path: 'reviewer',
      }
    })
    
    res.status(200).send({ status: "Success", data: employees });

  }catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
}


export const performanceReviewProgress = async(req, res) => {
  const employee = await Employee.findById(req.userAuth._id)
  const id = !employee ? req.userAuth._id : employee.companyID
  const company = await Company.findOne({companyID: id})

  try{
    let pms = []
    
    const today = new Date();

    const reviews = await Reviews.find()
    let reviewsgotten = []

    // checking if it is a mid-year befoe executing the functions
    if (today >= company.midYearStartDate && today <= company.midYearEndDate && employee){
      pms = await Employee.find({role: {$ne : 'Staff'}, companyID : employee.companyID, department: employee.department})
      reviewsgotten = reviews.filter((el) => el.date >= company.midYearStartDate && el.date <= company.midYearEndDate && el.reviewTime === EReviewTime.MIDYEAR)
    }else if (today >= company.midYearStartDate && today <= company.midYearEndDate){
      pms = await Employee.find({role: {$ne : 'Staff'}, companyID : id})
      reviewsgotten = reviews.filter((el) => el.date >= company.midYearStartDate && el.date <= company.midYearEndDate && el.reviewTime === EReviewTime.MIDYEAR)
    }
    
    if (today >= company.fullYearStartDate && today <= company.fullYearEndDate && employee){
      pms = await Employee.find({role: {$ne : 'Staff'}, companyID : employee.companyID, department: employee.department})
      reviewsgotten = reviews.filter((el) => el.date >= company.fullYearStartDate && el.date <= company.fullYearEndDate && el.reviewTime === EReviewTime.FULLYEAR)
    }else if (today >= company.fullYearStartDate && today <= company.fullYearEndDate){
      pms = await Employee.find({role: {$ne : 'Staff'}, companyID : id})
      reviewsgotten = reviews.filter((el) => el.date >= company.fullYearStartDate && el.date <= company.fullYearEndDate && el.reviewTime === EReviewTime.FULLYEAR)
    }

    res.status(200).send({ status: "Success", data: {expected: pms.length, got: reviewsgotten.length} });


  }catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }

}

export const appraisalProgress = async(req, res) => {
  const employee = await Employee.findById(req.userAuth._id)
  const id = !employee ? req.userAuth._id : employee.companyID
  const company = await Company.findOne({companyID: id})

  try{
    
    let appraisalExpected = []
    const today = new Date();
    
    const reviews = await Reviews.find()
    let reviewsgotten = []
    
    // checking if it is a mid-year befoe executing the functions
    if (today >= company.appraisalStartDate && today <= company.appraisalEndDate && employee){
      appraisalExpected = await Employee.find(
        {
          companyID : employee.companyID,
          department: employee.department,
          status: "Active",
          _id: {$ne : req.userAuth._id}
      })
      reviewsgotten = reviews.filter((el) => el.date >= company.appraisalStartDate && el.date <= company.appraisalEndDate && el.reviewType == EReviewType["360APPRAISAL"])
    }else if (today >= company.appraisalStartDate && today <= company.appraisalEndDate){
      appraisalExpected = await Employee.find(
        {
          companyID : employee.companyID,
          status: "Active",
          _id: {$ne : req.userAuth._id}
      })
      reviewsgotten = reviews.filter((el) => el.date >= company.appraisalStartDate && el.date <= company.appraisalEndDate && el.reviewType == EReviewType["360APPRAISAL"])
    }

    res.status(200).send({ status: "Success", data: {expected: appraisalExpected.length, got: reviewsgotten.length} });


  }catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }

}

export const selfAppraisedProgress = async(req, res) => {
  const employee = await Employee.findById(req.userAuth._id)
  const id = !employee ? req.userAuth._id : employee.companyID
  const company = await Company.findOne({companyID: id})

  try{
    
    let appraisalExpected = 0
    const today = new Date();
    
    let reviewsgotten = 0
    
    if (today >= company.appraisalStartDate && today <= company.appraisalEndDate && employee){
      appraisalExpected = 1
      reviewsgotten = employee.selfAppraised === true ? 1 : 0
    }else if(today >= company.appraisalStartDate && today <= company.appraisalEndDate){
      appraisalExpected = await Employee.find({companyID: req.userAuth._id}).length
      reviewsgotten = await Employee.find({companyID: req.userAuth._id, selfAppraised: true}).length
    }

    res.status(200).send({ status: "Success", data: {expected: appraisalExpected, got: reviewsgotten} });


  }catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }

}