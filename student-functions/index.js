const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
admin.initializeApp(functions.config().firebase);
const { getFunctions } = require('firebase-admin/functions');
const db = admin.firestore();
var moment = require('moment');


exports.registerStudent = functions.https.onCall(
  async (requestData, context) => {
    var batch = db.batch();

    var studentData = requestData.student;
    var password = requestData.password;

    const studentRef = db.collection('StudentDetails');
    const ticketIDsnapshot = await studentRef
      .where('student_emailaddress', '==', studentData['student_emailaddress'])
      .limit(1)
      .get();
    if (ticketIDsnapshot.empty) {
      return updateStudentData();
    } else {
      return (data = {
        status: false,
        data: '',
        message:
          'Email Address Already Exists, ' + studentData['student_emailaddress'],
      });
    }

    function updateStudentData() {
      var docref = studentRef.doc(studentData['student_uid']);
      batch.set(docref, studentData, { merge: true });

      return getAuth()
        .createUser({
          uid: studentData['student_uid'],
          email: studentData['student_emailaddress'],
          password,
          emailVerified: false,
        })
        .then((userRecord) => {
          console.log('Successfully created new user:', userRecord.uid);
          batch.commit();
          return (data = {
            status: true,
            data: '',
            message: 'OK',
          });
        })
        .catch((error) => {
          console.log('Error creating new user:', error);
          return (data = {
            status: false,
            data: '',
            message: error.message,
          });
        });



    }



  }
);


