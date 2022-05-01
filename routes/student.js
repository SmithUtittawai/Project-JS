const router = require('express').Router();
const stdModel = require('./../models/student');
const tecModel = require('./../models/teacher');
const courseModel = require('../models/course');


//! Student
router.post('/insertStd', (req, res) => {
   
    try {
        
        let data = req.body;

        if (data.std_name === '' || data.std_id === '' || data.std_pwd === '' || data.std_course === null) {
            throw new Error('Please fill all field');
        }
        let user = null;

        if (typeof data === Array) {
            for (let val of data) {
                user = new stdModel(val);
                user.save();
            }
        } else {
            user = new stdModel(data);
            user.save();
        }

        res.status(200).json({ val: user, msg: 'inserted' });

    } catch (err) { res.status(500).json({ msg: err.message }) }

});



router.get('/displayCourseStd', async (req, res) => {

    try {

        console.log('req.session.dataUser.std_course', req.session.dataUser.std_course);
        let courseStudent = req.session.dataUser.std_course;
        
        let tmpCourse = null;
        let findCourse = [];
        for (let courseStd of courseStudent) {
        
            tmpCourse = await courseModel.find({ course_id: courseStd.id });
            console.log('tmpCourse', tmpCourse);
            console.log('tmpCourse.course_section', tmpCourse.course_section);

            for (let course of tmpCourse) {
                for (let section of course.course_section) {
                    if (section.sec === courseStd.sec) {
                        section.subject_ObjectID = course._id;
                        section.subject_id = course.course_id;
                        section.subject_name = course.course_name;
                        console.log('section ', section)
                        findCourse.push(section);
                    }
                }
            }

        }

        res.status(200).json({ val: findCourse, msg: 'data student course displayed' });

    } catch (err) { res.status(500).json({ msg: err.message }); }

});


module.exports = router;