const router = require('express').Router();
const stdModel = require('./../models/student');
const tecModel = require('./../models/teacher');
const courseModel = require('../models/course');



router.get('/cancelClass/:course_id/:sec', async (req, res) => {
    
    try {

        let now = new Date();
        let findCourse = await courseModel.findOne({ course_id: req.params.course_id });
        console.log(findCourse);
        let findSec = findCourse.course_section.find(val => val.sec == parseInt(req.params.sec));
        let tmpSec = findCourse.course_section.find(val => val.sec != parseInt(req.params.sec));
        let tmpArr = [];

        try {
            
            for (let checkIn of findSec.checkTime) {
                let dateTime = new Date(checkIn.date);
                if (dateTime.getDate() === now.getDate() && dateTime.getMonth() === now.getMonth() && dateTime.getFullYear() === now.getFullYear()) {
                    checkIn.status = 0
                    break;
                }
            }
            tmpArr.push(findSec);
            tmpArr.push(tmpSec);
            let tmp_course_section = tmpArr;
            await courseModel.findOneAndUpdate({ course_id: req.params.course_id }, { course_section: tmp_course_section });

        } catch (err) { console.log(err) }

        res.status(200).json({ val: tmpArr }); 

    } catch (err) { res.status(500).json({ msg: err.message }); }

})


router.get('/createCheckIn/:course_id/:sec', async (req, res) => {

    try {

        let now = new Date();
        let checkDuplicate = await courseModel.findOne({ course_id: req.params.course_id });
        let findSec = checkDuplicate.course_section.find(val => val.sec == parseInt(req.params.sec));
        let statusCreate = true;
        let checkInOld = null

        try {
            for (let checkIn of findSec.checkTime) {
                let dateTime = new Date(checkIn.date);
                if (dateTime.getDate() === now.getDate() && dateTime.getMonth() === now.getMonth() && dateTime.getFullYear() === now.getFullYear()) {
                    
                    checkInOld = {
                        codeCheckIn: checkIn.code,
                        course_name: checkDuplicate.course_name, 
                        dateTime: findSec.time, 
                        sec: req.params.sec, 
                        checkDuplicate: checkDuplicate
                    };
                    console.log('checkInOld', checkInOld);
                    statusCreate = false;
                    break;
                }
            }
        } catch (err) { console.log(err) }

        if (statusCreate) {
            let findCourse = await courseModel.findOne({course_id: req.params.course_id});

            if (findCourse.course_section.length > 0) {

                let sec = findCourse.course_section.find(val => val.sec == parseInt(req.params.sec));
                
                if (sec) {
                    let code = Math.random().toString(36).substring(2, 8).toUpperCase();
                    
                    let checkTime = {
                        "code": code,
                        "date": new Date(),
                        "students": [],
                        "status": 1
                    }
                    
                    for (let course of findCourse.course_section) {
                        if (!course.checkTime) {
                            course.checkTime = [];
                        }
                        if (course.sec == parseInt(req.params.sec)) {
                            course.checkTime.push(checkTime);
                        }
                    }

                    await courseModel.findOneAndUpdate({course_id: req.params.course_id}, {course_section: findCourse.course_section});

                    console.log(`{ 
                        codeCheckIn: checkTime.code,
                        course_name: findCourse.course_name, 
                        dateTime: sec.time, 
                        sec: sec.sec, 
                        dataBeforeUpdate: findCourse 
                    }`,{ 
                        codeCheckIn: checkTime.code,
                        course_name: findCourse.course_name, 
                        dateTime: sec.time, 
                        sec: sec.sec, 
                        dataBeforeUpdate: findCourse 
                    },)
                    res.status(200).json({
                        val: { 
                            codeCheckIn: checkTime.code,
                            course_name: findCourse.course_name, 
                            dateTime: sec.time, 
                            sec: sec.sec, 
                            dataBeforeUpdate: findCourse 
                        },
                        msg: 'Check in created'
                    });
                
                } else {
                    throw new Error('Invalid section');
                }

            } else {
                throw new Error('Not found course!');
            }
        } else {
            res.status(200).json({ val: checkInOld, msg: 'Check in today already created!'});
        }

    } catch (err) { res.status(500).json({ msg: err.message }); }
        
});



router.get('/displayCourseTec', async (req, res) => {
    
    try {
        console.log('req.session.dataUser.tec_course', req.session.dataUser.tec_course);
        let courseTeacher = req.session.dataUser.tec_course;
        
        let tmpCourse = null;
        let findCourse = [];
        for (let courseTec of courseTeacher) {
        
            tmpCourse = await courseModel.find({ course_id: courseTec.id });
            console.log('tmpCourse', tmpCourse);
            console.log('tmpCourse.course_section', tmpCourse.course_section);

            for (let course of tmpCourse) {
                for (let section of course.course_section) {
                    if (section.sec === courseTec.sec) {
                        section.subject_ObjectID = course._id;
                        section.subject_id = course.course_id;
                        section.subject_name = course.course_name;
                        section.sec = courseTec.sec;
                        findCourse.push(section);
                    }
                }
            }

        }

        res.status(200).json({ val: findCourse, msg: 'data teacher course displayed' });


    } catch (err) { res.status(500).json({ msg: err.message }); }

})



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



module.exports = router;