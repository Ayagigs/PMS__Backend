import Reviews from "../model/reviewModel.js";
import Employee from "../model/EmployeeModel.js";
import Goal from "../model/GoalModel.js";
import { EReviewType } from "../enums/EReviewType.js";
import Company from "../model/companyModel.js";
import { ERatings } from "../enums/ERatings.js";
import { EReviewTime } from "../enums/EReviewTime.js";


const ratingCalculator = (score) => {
  if (finalScore >= 5) return ERatings.OUTSTANDING;
  if (finalScore >= 4) return ERatings.EXCELLENT;
  if (finalScore >= 3) return ERatings.VGOOD;
  if (finalScore >= 2) return ERatings.SATISFACTORY;
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
  const finalScore = (score + competency) / 2;

  try {
    const review = await Reviews.create({
      reviewer: req.userAuth._id,
      reviewee: employeeID,
      reviewType: EReviewType.PERFORMANCE,
      reviewTime: year,
      score,
      competency,
      date: Date.now(),
      ratings: ratingCalculator(finalScore),
      finalScore: finalScore,
      feedback
    });

    // adding the just reviewed employee to those who have already being reviewed
    reviewer.performanceReviewGiven.push(employeeID);

    employeeBeingReviewed.reviews.push(review._id)
    
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
  const finalScore = (score + competency) / 2;


  try {
    const review = await Reviews.create({
      reviewer: req.userAuth._id,
      reviewee: req.userAuth._id,
      reviewType: EReviewType.SELFAPPRAISAL,
      score,
      competency,
      date: Date.now(),
      ratings: ratingCalculator(finalScore),
      finalScore: finalScore,
      feedback
    });

    employee.reviews.push(review._id)

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

  // checking if its self appraisal or 360 appraisal
  let appraisal = "";
  if (employeeID === req.userAuth._id) appraisal = EReviewType.SELFAPPRAISAL;
  else appraisal = EReviewType["360APPRAISAL"];

  
  let score = scores.reduce((a, b) => a + b)/scores.length
  let competency = competencyScores.reduce((a, b) => a + b)/competencyScores.length

  // calculating the final score
  const finalScore = (score + competency) / 2;


  try {
    const review = await Reviews.create({
      reviewer: req.userAuth._id,
      reviewee: employeeID,
      reviewType: appraisal,
      score,
      competency,
      date: Date.now(),
      ratings: ratingCalculator(finalScore),
      finalScore: finalScore,
      feedback
    });

    // add the just reviewed employee to the array containing those he/she has reviewed
    reviewer.appraisalsGiven.push(employeeID);
    
    employeeBeingReviewed.reviews.push(review._id)

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

    // get details of employee being reviewed
    const employeeBeingReviewed = await Employee.findById(employeeID)

    const goal = await Goal.findById(goalID);

    
    let score = scores.reduce((a, b) => a + b)/scores.length
    let competency = competencyScores.reduce((a, b) => a + b)/competencyScores.length
    

    const finalScore = (score + competency) / 2;

    const review = await Reviews.create({
      reviewer: req.userAuth._id,
      reviewee: goal.owner,
      reviewType: EReviewType.GOALREVIEW,
      goal: goalID,
      score,
      competency,
      date: Date.now(),
      ratings: ratingCalculator(finalScore),
      finalScore: finalScore,
      feedback
    });

    goal.reviews.push(review._id);
    
    employeeBeingReviewed.reviews.push(review._id)

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

export const getAllReviews = async (req, res) => {
  const reviews = await Reviews.find()
    .populate("reviewer")
    .populate("goal")
    .populate("feedback");

  try {
    res.status(200).send({ status: "Success", data: reviews });
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
};

export const getMyReviews = async (req, res) => {
  const reviews = await Reviews.find({ reviewee: req.userAuth._id }).populate(
    "feedback"
  );

  try {
    res.status(200).send({ status: "Success", data: reviews });
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
};


