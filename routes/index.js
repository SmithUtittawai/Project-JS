const router = require('express').Router();
const stdModel = require('./../models/student');
const tecModel = require('./../models/teacher');
const courseModel = require('../models/course');

router.get('/sayhi', (req, res) => {
    res.json({ msg: 'Hello am router' });
});


//! Course routes
router.post('/insertCourse', (req, res) => {

    try {
        
        let data = req.body;

        if (data.course_id === '' || data.course_name === '' || data.cours_section === null) {
            throw new Error('Please fill all field');
        }

        let course = new courseModel(data);
        course.save();

        res.status(200).json({ val: course, msg: 'inserted' });

    } catch (err) { res.status(500).json({ msg: err.message }); }

});


router.get('/displayCourseStd', async (req, res) => {

    try {
        // "std_couse": [
        //     {
        //         "id": "id_subject",
        //         "sec": 1
        //     },
        //     {
        //         "id": "id_subject",
        //         "sec": 1
        //     }
        // ]

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


router.get('/displayCourseTec', (req, res) => {
    
    try {

    } catch (err) { res.status(500).json({ msg: err.message }); }

})



//! Student & Teacher routes
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



router.post('/insertTec', (req, res) => {
   
    try {
        
        let data = req.body;

        if (data.tec_name === '' || data.tec_id === '' || data.tec_pwd === '' || data.tec_course === null) {
            throw new Error('Please fill all field');
        }

        let teacher = null;
        if (typeof data === Array) {
            for (let val of data) {
                teacher = new teacher(val);
                teacher.save();
            }
        } else {
            teacher = new teacher(data);
            teacher.save();
        }

        res.status(200).json({ val: user, msg: 'inserted' });

    } catch (err) { res.status(500).json({ msg: err.message }) }

});



router.post('/login', async (req, res) => {
    try {

        let data = req.body;

        //! student login
        if (data.statusLogin === 'std') {
            
            if (data.std_id === '' || data.std_pwd === '') {
                throw new Error('Please fill all field');
            }
            
            let student = await stdModel.findOne({std_id: data.std_id, std_pwd: data.std_pwd});
                
            if (student) {
                req.session.dataUser = student;
                res.status(200).json({ val: student, msg: 'Login Success' });
            } else {
                throw new Error('Id or Password invaild');
            }
            
        //! teacher login
        }
        else if (data.statusLogin === 'tec') {

            if (data.tec_id === '' || data.tec_pwd === '') {
                throw new Error('Please fill all field');
            }

            let teacher = await tecModel.findOne({tec_id: data.tec_id, tec_pwd: data.tec_pwd});
           
            if (teacher) {
                req.session.dataUser = teacher;
                res.status(200).json({ val: teacher, msg: 'Login Success' });
            } else {
                throw new Error('Id or Password invaild');
            }
            
        } else {
            throw new Error('statusLogin is required!');
        }


    } catch (err) { res.status(500).json({ msg: err.message }) }

});



router.get('/checkUserLogin', (req, res) => {
    try {
        
        if (req.session.dataUser) {
            res.status(200).json({ val: req.session.dataUser, msg: 'Logingin'})
        } else {
            res.status(200).json({ val: null, msg: 'Not Logingin'})
        }

    } catch (err) { res.status(500).json({ msg: err.message }) }
})



module.exports = router; 