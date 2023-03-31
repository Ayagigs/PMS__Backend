import Question from "../model/questionModel.js";
import Admin from "../model/adminModel.js";

export const addQuestion = async(req, res) => {
    const {questions, options, reviewType, category} = req.body;
    const {companyID} = req.params;

    
    try{
        const questionFound = await Question.findOne({reviewType, category})
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
            companyID: req.userAuth._id
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
        const questions = await Question.find({companyID})

        for(let i = 0; i < questions.length; i++){
            questions[0].options = options

            await questions[0].save()
        }
    
        res.status(200).send({status: 'Success', data: {options}})
    
    }catch(error){
        res.status(500).send({status: 'Success', message: error.message})
    }

}



