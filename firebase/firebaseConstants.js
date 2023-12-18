export const MASTERMODULE = {
  label: 'Masters',
  modules: {
    EMPLOYEES: { label: 'Employees', path: '../masters/employees' },
    TEACHERSMASTER: { label: 'Teachers', path: '../masters/teachers' },
    STUDENTMASTER: { label: 'Students', path: '../masters/students' },
  },
};
export const COURSESMODULE = {
  label: 'Courses',
  modules: {
    BOARDMASTER: { label: 'Boards', path: '../masters/boards' },
    COURSEMASTER: { label: 'Courses', path: '../masters/courses' },
    SUBJECTMASTER: { label: 'Subjects', path: '../masters/subjects' },
    QUESTIONS: { label: 'Questions', path: '../masters/questions' },
  },
};
export const NAVIGATIONPAGES = {
  EMPLOYEES: '../masters/employees',
  TEACHERSMASTER: '../masters/teachers',
  STUDENTMASTER: '../masters/students',
};
export const STUDENTMODULE = {
  label: 'Home',
  modules: {
    STUDENTHOME: { label: 'Home', path: '../student/home' },
    ATTEMPTEDASSESSMENTS: { label: 'Attempted Assessments', path: '../student/attempted-assessments' },
  },
};


export const EMPLOYEE_COLLECTION = 'EmployeeDetails';
export const EMPLOYEE_KEY = 'employee';
export const EMPLOYEE_UID = 'employee_uid';
export const EMPLOYEE_NAME = 'employee_name';
export const EMPLOYEE_CODE = 'employee_code';
export const EMPLOYEE_EMAILADDRESS = 'employee_emailaddress';
export const EMPLOYEE_MODULES = 'employee_modules';
export const EMPLOYEE_STATUS = 'employee_status';
export const EMPLOYEE_ISADMIN = 'employee_isadmin';
export const EMPLOYEE_ISSIGNEDUP = 'employee_issignedup';
export const EMPLOYEE_PASSWORD = 'employee_password';
export const EMPLOYEE_SESSIONDETAILS = 'employee_sessiondetails';


export const TEACHER_COLLECTION = 'TeachersDetails';
export const TEACHER_KEY = 'teacher';
export const TEACHER_UID = 'teacher_uid';
export const TEACHER_NAME = 'teacher_name';
export const TEACHER_PHONENUMBER = 'teacher_phonenumber';
export const TEACHER_EMAILADDRESS = 'teacher_emailaddress';
export const TEACHER_MODULES = 'teacher_modules';
export const TEACHER_STATUS = 'teacher_status';
export const TEACHER_ISADMIN = 'teacher_isadmin';
export const TEACHER_ISSIGNEDUP = 'teacher_issignedup';
export const TEACHER_PASSWORD = 'teacher_password';
export const TEACHER_SESSIONDETAILS = 'teacher_sessiondetails';



export const BOARD_COLLECTION = 'BoardsDetails';
export const BOARD_KEY = 'board';
export const BOARD_UID = 'board_uid';
export const BOARD_NAME = 'board_name';
export const BOARD_CODE = 'board_code';
export const BOARD_BOARD = 'board_board';
export const BOARD_FIELD = 'board_field';
export const BOARD_ACCESSUSERUIDARRAY = 'board_accessuseruidarray';
export const BOARD_KEYWORDS = 'board_keywords';
export const BOARD_STATUS = 'board_status';
export const BOARD_THUMBNAILURL = 'board_thumbnailurl';
export const BOARD_LOGS = 'board_logs';


export const COURSECOLORS = {
  "RED": "#FF8989",
  "YELLOW": "#FFD541",
  "GREEN": "#9FB670",
  "BLUE": "#5ECFFF",
}

export const COURSE_COLLECTION = 'CoursesDetails';
export const COURSE_KEY = 'course';
export const COURSE_UID = 'course_uid';
export const COURSE_NAME = 'course_name';
export const COURSE_CODE = 'course_code';
export const COURSE_BOARD = 'course_board';
export const COURSE_COLOR = 'course_color';
export const COURSE_FIELD = 'course_field';
export const COURSE_ACCESSUSERUIDARRAY = 'course_accessuseruidarray';
export const COURSE_KEYWORDS = 'course_keywords';
export const COURSE_STATUS = 'course_status';
export const COURSE_THUMBNAILURL = 'course_thumbnailurl';
export const COURSE_LOGS = 'course_logs';


export const SUBJECT_COLLECTION = 'SubjectsDetails';
export const SUBJECT_KEY = 'subject';
export const SUBJECT_UID = 'subject_uid';
export const SUBJECT_COURSE = 'subject_course';
export const SUBJECT_NAME = 'subject_name';
export const SUBJECT_CODE = 'subject_code';
export const SUBJECT_ACCESSUSERUIDARRAY = 'subject_accessuseruidarray';
export const SUBJECT_KEYWORDS = 'subject_keywords';
export const SUBJECT_STATUS = 'subject_status';
export const SUBJECT_HASASSESSMENTS = 'subject_hasassessments';
export const SUBJECT_LOGS = 'subject_logs';
export const SUBJECT_LESSONSUIDARRAY = 'subject_lessonsuidarray';
export const SUBJECT_LESSONS = 'subject_lessons';
export const SUBJECT_THUMBNAILURL = 'subject_thumbnailurl';


export const LESSON_COLLECTION = 'LessonsDetails';
export const LESSON_KEY = 'lesson';
export const LESSON_UID = 'lesson_uid';
export const LESSON_COURSE = 'lesson_course';
export const LESSON_SUBJECT = 'lesson_subject';
export const LESSON_NAME = 'lesson_name';
export const LESSON_CODE = 'lesson_code';
export const LESSON_ACCESSTYPE = 'lesson_accesstype';
export const LESSON_KEYWORDS = 'lesson_keywords';
export const LESSON_STATUS = 'lesson_status';
export const LESSON_THUMBNAILURL = 'lesson_thumbnailurl';
export const LESSON_LOGS = 'lesson_logs';
export const LESSON_CONTENT = 'lesson_content';
export const LESSON_DELETEDCONTENT = 'lesson_deletedcontent';
export const LESSON_ASSESMENTUIDARRAY = 'lesson_assesmentuidarray';


export const CONTENT_COLLECTION = 'ContentDetails';
export const CONTENT_KEY = 'content';
export const CONTENT_UID = 'content_uid';
export const CONTENT_HEADING = 'content_heading';
export const CONTENT_DESCRIPTION = 'content_description';
export const CONTENT_COURSE = 'content_course';
export const CONTENT_SUBJECT = 'content_subject';
export const CONTENT_LESSON = 'content_lesson';
export const CONTENT_STATUS = 'content_status';
export const CONTENT_LOGS = 'content_logs';
export const CONTENT_FILE = 'content_file';
export const CONTENT_ACCESSTYPE = 'content_accesstype';
export const CONTENT_ONYOUTUBE = 'content_onyoutube';



export const STUDENT_COLLECTION = 'StudentDetails';
export const STUDENT_KEY = 'student';
export const STUDENT_UID = 'student_uid';
export const STUDENT_DETAILS = 'student_details';
export const STUDENT_NAME = 'student_name';
export const STUDENT_EMAILADDRESS = 'student_emailaddress';
export const STUDENT_COURSES = 'student_courses';
export const STUDENT_STATUS = 'student_status';
export const STUDENT_ISSIGNEDUP = 'student_issignedup';

export const QUESTIONTYPENAMES = {
  "FTB": "Fill In The Blanks",
  "MTF": "Match The Following",
}
export const QUESTIONTYPE = {
  "MCQ": "MCQ",
  "FTB": "FTB",
  "MTF": "MTF",
  "OQA": "OQA",
}


export const QUESTION_COLLECTION = 'QuestionsDetails';
export const QUESTION_KEY = 'QUESTION';
export const QUESTION_UID = 'question_uid';
export const QUESTION_CODE = 'question_code';
export const QUESTION_TEXT = 'question_text';
export const QUESTION_IMAGEURLS = 'question_imageurls';
export const QUESTION_COMPLEXITY = 'question_complexity';
export const QUESTION_TYPE = 'question_type';
export const QUESTION_ONLYASSESSMENT = 'question_onlyassessment';
export const QUESTION_SUBTYPE = 'question_subtype';
export const QUESTION_LESSONSUID = 'question_lessonsuid';
export const QUESTION_OPTIONS = 'question_options';
export const QUESTION_COMPREHENSION = 'question_comprehension';
export const QUESTION_STATUS = 'question_status';
export const QUESTION_LOGS = 'question_logs';


export const ASMT_COLLECTION = 'AssessmentDetails';
export const ASMT_KEY = 'asmt';
export const ASMT_UID = 'asmt_uid';
export const ASMT_LESSON = 'asmt_lesson';
export const ASMT_SUBJECT = 'asmt_subject';
export const ASMT_COURSE = 'asmt_course';
export const ASMT_CODE = 'asmt_code';
export const ASMT_TITLE = 'asmt_title';
export const ASMT_GENERALINSTRUCTIONS = 'asmt_generalinstructions';
export const ASMT_DURATION = 'asmt_duration';
export const ASMT_ISPRACTICE = 'asmt_ispractice';
export const ASMT_HASNEGATIVEMARKING = 'asmt_hasnegativemarking';
export const ASMT_ISLIVE= 'asmt_islive';
export const ASMT_LOGS = 'asmt_logs';
export const ASMT_QUESTIONS = 'asmt_questions';
export const ASMT_TOTAL = 'asmt_total';
export const ASMT_STATUS = 'asmt_status';


export const STDASMT_STATUSTYPE = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CLOSED: "CLOSED",
}
export const STDASMT_COLLECTION = 'StudentAssessments';
export const STDASMT_KEY = 'stdasmt';
export const STDASMT_UID = 'stdasmt_uid';
export const STDASMT_ASMTUID = 'stdasmt_asmtuid';
export const STDASMT_LESSON = 'stdasmt_lesson';
export const STDASMT_SUBJECT = 'stdasmt_subject';
export const STDASMT_COURSE = 'stdasmt_course';
export const STDASMT_CODE = 'stdasmt_code';
export const STDASMT_TITLE = 'stdasmt_title';
export const STDASMT_GENERALINSTRUCTIONS = 'stdasmt_generalinstructions';
export const STDASMT_DURATION = 'stdasmt_duration';
export const STDASMT_ISPRACTICE = 'stdasmt_ispractice';
export const STDASMT_HASNEGATIVEMARKING = 'stdasmt_hasnegativemarking';
export const STDASMT_LOGS = 'stdasmt_logs';
export const STDASMT_QUESTIONS = 'stdasmt_questions';
export const STDASMT_TOTAL = 'stdasmt_total';
export const STDASMT_STATUS = 'stdasmt_status';
export const STDASMT_ATTEMPTS = 'stdasmt_attempts';
export const STDASMT_ACTIVEATTEMPTUID = 'stdasmt_activeattemptuid';
export const STDASMT_LASTATTEMPTUID = 'stdasmt_lastattemptuid';
export const STDASMT_STUDENT = 'stdasmt_student';