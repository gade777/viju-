import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebaseconfig';
const functions = getFunctions(app);
// TODO REMOVE THIS CONNECT FUNCTIONS
// connectFunctionsEmulator(functions, "localhost", "5001")

export const RequestLiveDate = async () => {
  const getLiveDate = httpsCallable(functions, 'getLiveDate');
  var data = getLiveDate()
    .then((result) => {
      console.log('DATE: ' + result.data);
      return result.data;
    })
    .catch((error) => {
      console.error('ERROR : ' + JSON.stringify(error));
      return (data = {
        status: false,
        data: 'na',
        message: error.message,
      });
    });

  return data;
};
export const RequestaddorUpdateEmployee = async (employeeData) => {
  const addorUpdateEmployee = httpsCallable(functions, 'addorUpdateEmployee');
  var data = addorUpdateEmployee({ employee: employeeData })
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.error('ERROR : ' + JSON.stringify(error));
      return (data = {
        status: false,
        data: [],
        message: error.message + ', ' + error.details,
      });
    });

  return data;
};


export const RequestaddorUpdateBoard = async (board, log) => {
  const addorUpdateBoard = httpsCallable(functions, 'addorUpdateBoard');
  var data = addorUpdateBoard({
    board,
    log
  })
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.error('ERROR : ' + JSON.stringify(error));
      return (data = {
        status: false,
        data: [],
        message: error.message + ', ' + error.details,
      });
    });

  return data;
};
export const RequestaddorUpdateCourse = async (course, log) => {
  const addorUpdateCourse = httpsCallable(functions, 'addorUpdateCourse');
  var data = addorUpdateCourse({
    course,
    log
  })
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.error('ERROR : ' + JSON.stringify(error));
      return (data = {
        status: false,
        data: [],
        message: error.message + ', ' + error.details,
      });
    });

  return data;
};


export const RequestaddorUpdateSubject = async (subject, log) => {
  const addorUpdateSubject = httpsCallable(functions, 'addorUpdateSubject');
  var data = addorUpdateSubject({
    subject,
    log
  })
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.error('ERROR : ' + JSON.stringify(error));
      return (data = {
        status: false,
        data: [],
        message: error.message + ', ' + error.details,
      });
    });

  return data;
};
export const RequestaddorUpdateQuestion = async (question, log) => {
  const addorUpdateQuestion = httpsCallable(functions, 'addorUpdateQuestion');
  var data = addorUpdateQuestion({
    question,
    log
  })
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.error('ERROR : ' + JSON.stringify(error));
      return (data = {
        status: false,
        data: [],
        message: error.message + ', ' + error.details,
      });
    });

  return data;
};
export const RequestaddorUpdateAssessment = async (asmt, log) => {
  const addorUpdateAssessment = httpsCallable(functions, 'addorUpdateAssessment');
  var data = addorUpdateAssessment({
    asmt,
    log
  })
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.error('ERROR : ' + JSON.stringify(error));
      return (data = {
        status: false,
        data: [],
        message: error.message + ', ' + error.details,
      });
    });

  return data;
};
export const RequestcreateStudentAssessmentAttempt = async (data) => {
  const createStudentAssessmentAttempt = httpsCallable(functions, 'createStudentAssessmentAttempt');
  var data = createStudentAssessmentAttempt(data)
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.error('ERROR : ' + JSON.stringify(error));
      return (data = {
        status: false,
        data: [],
        message: error.message + ', ' + error.details,
      });
    });

  return data;
};



export const RequestaddorUpdateLesson = async (lesson, log) => {
  const addorUpdateLesson = httpsCallable(functions, 'addorUpdateLesson');
  var data = addorUpdateLesson({
    lesson,
    log
  })
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.error('ERROR : ' + JSON.stringify(error));
      return (data = {
        status: false,
        data: [],
        message: error.message + ', ' + error.details,
      });
    });

  return data;
};

export const RequestloginCheckEmployee = async (employee_emailaddress) => {
  const loginCheckEmployee = httpsCallable(functions, 'loginCheckEmployee');
  var data = loginCheckEmployee({ employee_emailaddress })
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.error('ERROR : ' + JSON.stringify(error));
      return (data = {
        status: false,
        data: [],
        message: error.message + ', ' + error.details,
      });
    });

  return data;
};
export const RequestaddorUpdateTeacher = async (teacherData) => {
  const addorUpdateTeacher = httpsCallable(functions, 'addorUpdateteacher');
  var data = addorUpdateTeacher({ teacher: teacherData })
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.error('ERROR : ' + JSON.stringify(error));
      return (data = {
        status: false,
        data: [],
        message: error.message + ', ' + error.details,
      });
    });

  return data;
};
export const RequestloginCheckTeacher = async (teacher_emailaddress) => {
  const loginCheckTeacher = httpsCallable(functions, 'loginCheckteacher');
  var data = loginCheckTeacher({ teacher_emailaddress })
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.error('ERROR : ' + JSON.stringify(error));
      return (data = {
        status: false,
        data: [],
        message: error.message + ', ' + error.details,
      });
    });

  return data;
};


export const RequestregisterStudent = async (student, password) => {
  const registerStudent = httpsCallable(functions, 'registerStudent');
  var data = registerStudent({ student, password })
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.error('ERROR : ' + JSON.stringify(error));
      return (data = {
        status: false,
        data: [],
        message: error.message + ', ' + error.details,
      });
    });

  return data;
};