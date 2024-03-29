import Question from "../model/questionModel.js";
import Admin from "../model/adminModel.js";
import { EReviewType } from "../enums/EReviewType.js";

export const addQuestion = async(req, res) => {
    const {questions, options, reviewType, category} = req.body;
    const {companyID} = req.params;

    
    try{
        const questionFound = await Question.findOne({reviewType, category, companyID})
        if(questionFound){
            const question = await Question.findOneAndUpdate({companyID, reviewType, category}, {
                $set: {
                    questions
                }
            },
            {
                new: true
            })

            return res.status(200).send({status: 'Success', data: question})
        }


        const question = await Question.create({
            questions,
            options,
            reviewType,
            category,
            companyID: companyID
        })
        console.log(questions)

        res.status(200).send({status: 'Success', data: question})
        
    }catch(error){
        res.status(500).send({status: 'Fail', message: error.message})
    }
}

export const editQuestion = async(req, res, next) => {
    const {questions, options} = req.body;
    const {questionID} = req.params;
    try{
        const question = await Question.findByIdAndUpdate(questionID, {
            $set: {
                questions,
                options
            }
        },{
            new: true
        })

        res.status(200).send({status: 'Success', data: question})
        
    }catch(error){
        res.status(500).send({status: 'Success', message: error.message})
    }
}

export const deleteaQuestion = async(req, res) => {
    const {questionID, question} = req.params;
    
    try{
        const questions = await Question.findById(questionID)
        
        questions.questions = questions.questions.filter((el) => !el.text.includes(question))
        
        
        await questions.save()
        
        res.status(200).send({status: 'Success', data: questions})
    }catch(error){
        res.status(500).send({status: 'Success', message: error.message})
    }
}


export const getAllQuestion = async(req, res) => {
    const {companyID, reviewType, category} = req.params;

    try{
        const questions = await Question.findOne({companyID, reviewType, category})

        console.log(questions)
        const sortedQuestion = questions.questions.sort((a, b) => {
            return a.order - b.order;
        });
        const sortedOption = questions.options.sort((a, b) => {
            return b.value - a.value;
        });

        res.status(200).send({status: 'Success', data: {sortedQuestion, sortedOption}})

    }catch(error){
        res.status(500).send({status: 'Success', message: error.message})
    }
}

export const getCompetencyQuestion = async(req, res) => {
    const {companyID} = req.params;
    
    try{
        const questions = await Question.findOne({companyID, category: "Competency"})
    
        const sortedQuestion = questions.questions.sort((a, b) => {
            return a.order - b.order;
        });
        const sortedOption = questions.options.sort((a, b) => {
            return b.value - a.value;
        });
    
        res.status(200).send({status: 'Success', data: {sortedQuestion, sortedOption}})
    
    }catch(error){
        res.status(500).send({status: 'Success', message: error.message})
    }

}
export const updateOption  = async(req, res) => {
    const {companyID} = req.params;
    const {options} = req.body;
    
    try{
        // performance review question
        const question1 = await Question.findOne({companyID, reviewType: EReviewType.PERFORMANCE})
        const question2 = await Question.findOne({companyID, reviewType: EReviewType["360APPRAISAL"]})
        const question3 = await Question.findOne({companyID, reviewType: EReviewType.COMPETENCY})
        const question4 = await Question.findOne({companyID, reviewType: EReviewType.GOALREVIEW})
        const question5 = await Question.findOne({companyID, reviewType: EReviewType.SELFAPPRAISAL})

        if(question1){
            question1.options = options

            await question1.save()
        }
        if(question2){
            question2.options = options

            await question2.save()
        }
        if(question3){
            question3.options = options

            await question3.save()
        }
        if(question4){
            question4.options = options

            await question4.save()
        }
        if(question5){
            question5.options = options

            await question5.save()
        }
    
        res.status(200).send({status: 'Success', data: {options}})
    
    }catch(error){
        res.status(500).send({status: 'Success', message: error.message})
    }

}



